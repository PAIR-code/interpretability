"""Used for DeepDream Experiments with BERT."""
from absl import app
import torch
from google3.learning.deepmind.xmanager2.client import google as xm  # pylint: disable=unused-import
from google3.learning.vis.bert_dream.helpers import activation_helper
from google3.learning.vis.bert_dream.helpers import attention_mask_helper
from google3.learning.vis.bert_dream.helpers import embeddings_helper
from google3.learning.vis.bert_dream.helpers import folder_helper
from google3.learning.vis.bert_dream.helpers import inference_helper
from google3.learning.vis.bert_dream.helpers import one_hots_helper
from google3.learning.vis.bert_dream.helpers import output_helper
from google3.learning.vis.bert_dream.helpers import setup_helper
from google3.learning.vis.bert_dream.helpers import tokenization_helper
from google3.pyglib import flags

# Command Line Arguments
FLAGS = flags.FLAGS
flags.DEFINE_string('sentence', u'i hate kickshaws',
                    'the sentence to start with')
flags.DEFINE_string('sentence2', u'', 'an optional sencond sentence')
flags.DEFINE_string('output_dir', None,
                    'the output directory where the results will be'
                    'written.')
flags.DEFINE_string('model_config', 'bert-base-uncased', 'The name of the model'
                    'configuration to load')
flags.DEFINE_integer('num_iterations', 3000, 'number of optimization steps')
flags.DEFINE_integer('layer_id', 5, 'layer to optimize activation for')
flags.DEFINE_integer('word_id', 2, 'word to optimize activation for')
flags.DEFINE_integer('neuron_id', 414, 'neuron to optimize activation for')
flags.DEFINE_integer('dream_start', 1, 'first token that is to be changed in'
                     'the sentence')
flags.DEFINE_integer('dream_end', 0, 'first token that is to be changed in the'
                     'sentence')
flags.DEFINE_integer('warmup', 200, 'how long before the temperature of the'
                     'softmax gets adjusted')
flags.DEFINE_float('start_temp', 2.0, 'start-temperature of the softmax')
flags.DEFINE_float('end_temp', 0.1, 'end-temperature of the softmax')
flags.DEFINE_float('anneal', 0.9995, 'annealing factor for the temperature')
flags.DEFINE_float('learning_rate', 0.1, 'learning rate of the optimizer')
flags.DEFINE_bool('normalize', True, 'normalize the activation over other'
                  'activations')
flags.DEFINE_bool('gumbel', False, 'use gumbel noise with the softmax')
flags.DEFINE_bool('write_top_k', True, 'write top words for each iteration')
flags.DEFINE_integer('k', 10, 'number of top ranked words to store for each'
                     'iteration')
flags.DEFINE_integer('embedding_analysis', 0, 'frequency in which the embedding'
                     'is analyzed')
flags.DEFINE_integer('metrics_frequency', 250, 'frequency in which results are'
                     'saved')


def deep_dream(data, results, params, device, tokenizer, embedding_map, model):
  """Iteratively modifying the embedding using gradient descent.

  Args:
    data: Holds the top-k values.
    results: Holds the results of the run.
    params: Holds the parameters of the run.
    device: The device to store the variables on.
    tokenizer: The tokenizer to transform the input.
    embedding_map: Holding all token embeddings.
    model: The model that should dream.
  """
  # An embedding for the tokens is obtained
  tokens = tokenization_helper.tokenize_input_sentence(
      tokenizer, FLAGS.sentence, FLAGS.sentence2)
  tokens_tensor, segments_tensor = tokenization_helper.tensors_from_tokens(
      tokenizer, tokens, device)
  _, pos_embeddings, sentence_embeddings = embeddings_helper.get_embeddings(
      tokens_tensor, segments_tensor, model)
  # Correct the end of the dream if necessary
  if FLAGS.dream_end == 0:
    FLAGS.dream_end = len(tokens) - 2
  # Write the parameters to a file
  output_helper.get_params(params, FLAGS, tokens,
                           embedding_ana=FLAGS.embedding_analysis)
  # Get the smooth one-hot vector that is to be optimized, split into static and
  # modifiable parts
  before, modify, after = one_hots_helper.get_one_hots(
      tokens_tensor.data.cpu().numpy(), FLAGS.dream_start, FLAGS.dream_end,
      device)
  # Obtain the default attention mask to be able to run the model
  attention_mask = attention_mask_helper.get_attention_mask(tokens_tensor)
  # The optimizer used to modify the input embedding
  optimizer = torch.optim.Adam([modify], lr=FLAGS.learning_rate)
  # Init temperature for Gumbel
  temperature = torch.tensor(FLAGS.start_temp, device=device,
                             requires_grad=False)

  # Obtain the properties of the initial embedding
  one_hots_sm = one_hots_helper.softmax_one_hots(modify, temperature,
                                                 FLAGS.gumbel)
  max_values, tokens_ids = one_hots_helper.get_tokens_from_one_hots(
      torch.cat([before, one_hots_sm, after], dim=1))
  numpy_max_values = max_values.data.cpu().numpy()
  ids = tokens_ids.data.cpu().numpy()[0]
  tokens = tokenizer.convert_ids_to_tokens(ids)
  ids_activation = activation_helper.get_ids_activation(
      ids, pos_embeddings, sentence_embeddings, attention_mask,
      FLAGS.dream_start, FLAGS.dream_end, FLAGS.word_id, FLAGS.neuron_id,
      FLAGS.layer_id, FLAGS.normalize, embedding_map, model, device,
      average=True)
  output_helper.init_results(results)

  # Optimize the embedding for i iterations and update the properties to
  # evaluate the result in each step
  for i in range(FLAGS.num_iterations):
    max_vals, tokens_ids, activation, emb_tok, emb_act = optimizer_step(
        optimizer, before, modify, after, pos_embeddings, sentence_embeddings,
        attention_mask, temperature, i, data, tokenizer, embedding_map, model,
        device)
    # Write the properties of the last step
    if (i % FLAGS.metrics_frequency) == 0:
      output_helper.get_metrics(
          tokens, i, temperature, numpy_max_values, results,
          activation=activation, ids_activation=ids_activation,
          emb_tokens=emb_tok, emb_activation=emb_act,
          emb_ana=FLAGS.embedding_analysis, iterations=FLAGS.num_iterations)
    # Set the numpy max values
    numpy_max_values = max_vals.data.cpu().numpy()
    # Obtain the activation property for the id-array that would result from the
    # optimization
    ids = tokens_ids.data.cpu().numpy()[0]
    tokens = tokenizer.convert_ids_to_tokens(ids)
    # Calculate the activation using the highest scoring words
    ids_activation = activation_helper.get_ids_activation(
        ids, pos_embeddings, sentence_embeddings, attention_mask,
        FLAGS.dream_start, FLAGS.dream_end, FLAGS.word_id, FLAGS.neuron_id,
        FLAGS.layer_id, FLAGS.normalize, embedding_map, model, device,
        average=True)
    # Check if the temperature needs to decrease
    if i > FLAGS.warmup:
      temperature = torch.clamp(temperature * FLAGS.anneal, FLAGS.end_temp)
  # Calculate the final activation just as before, but without backprop
  if (FLAGS.num_iterations % FLAGS.metrics_frequency) == 0:
    with torch.no_grad():
      one_hots_sm = one_hots_helper.softmax_one_hots(modify, temperature,
                                                     FLAGS.gumbel)
      fused_one_hots = torch.cat([before, one_hots_sm, after], dim=1)
      if FLAGS.write_top_k:
        output_helper.get_top_ks(
            fused_one_hots, FLAGS.k, FLAGS.num_iterations, data,
            FLAGS.dream_start, FLAGS.dream_end, tokenizer,
            activation=activation)
      layer_activations = inference_helper.run_inference(
          before, one_hots_sm, after, pos_embeddings, sentence_embeddings,
          attention_mask, embedding_map, model)
      activation = activation_helper.get_activation(
          layer_activations, FLAGS.word_id, FLAGS.neuron_id, FLAGS.layer_id,
          FLAGS.normalize)
      emb_tok, emb_act = embeddings_helper.analyze_current_embedding(
          fused_one_hots, embedding_map, FLAGS.dream_start, FLAGS.dream_end,
          device, pos_embeddings, sentence_embeddings, attention_mask, model,
          FLAGS.word_id, FLAGS.neuron_id, FLAGS.layer_id, FLAGS.normalize,
          tokenizer)
      output_helper.get_metrics(
          tokens, FLAGS.num_iterations, temperature,
          numpy_max_values, results, activation=activation,
          ids_activation=ids_activation, emb_tokens=emb_tok,
          emb_activation=emb_act, emb_ana=FLAGS.embedding_analysis,
          iterations=FLAGS.num_iterations)


def optimizer_step(optimizer, before, modify, after, pos_embeddings,
                   sentence_embeddings, attention_mask, temperature, iteration,
                   data, tokenizer, embedding_map, model, device):
  """Make a step along the gradient of the optimizer.

  Args:
    optimizer: The optimizer that is used for gradient decent.
    before: Embeddings of everything up to the modifyable content.
    modify: Embeddings of the modifyable content.
    after: Embeddings of everything after the modifyable content.
    pos_embeddings: Positional embeddings of the current sequence.
    sentence_embeddings: Sentence embeddings of the current sequence.
    attention_mask: Attention mask to be used with the current sequence.
    temperature: Current temperature of the softmax function.
    iteration: Current iteration of the optimization.
    data: Top-k data to be written after optimization.
    tokenizer: Converts between tokens and their ids.
    embedding_map: Holding the embeddings for each token.
    model: The model to be used with this optimization.
    device: Where to store the variables.

  Returns:
    max_values: The values of the tokens with the highest softmax value.
    token_ids: The ids of the tokens with the highest softmax value.
    activation: The activation of the current input representation.
    emb_tokens: The tokens of the closest embedding representing real tokens.
    emb_activation: Activation for closest embedding representing real tokens.
  """
  # Reset the gradient
  optimizer.zero_grad()
  # Softmax over the one-hots
  one_hots_sm = one_hots_helper.softmax_one_hots(modify, temperature,
                                                 FLAGS.gumbel)
  fused_one_hots = torch.cat([before, one_hots_sm, after], dim=1)
  # Check if the embedding analysis is to be done
  emb_tokens = None
  emb_activation = None
  if FLAGS.embedding_analysis != 0:
    if iteration % FLAGS.embedding_analysis == 0:
      tok, act = embeddings_helper.analyze_current_embedding(
          fused_one_hots, embedding_map, FLAGS.dream_start, FLAGS.dream_end,
          device, pos_embeddings, sentence_embeddings, attention_mask, model,
          FLAGS.word_id, FLAGS.neuron_id, FLAGS.layer_id, FLAGS.normalize,
          tokenizer)
      emb_tokens = tok
      emb_activation = act
  # Get the activation
  layer_activations = inference_helper.run_inference(
      before, one_hots_sm, after, pos_embeddings, sentence_embeddings,
      attention_mask, embedding_map, model)
  activation = activation_helper.get_activation(
      layer_activations, FLAGS.word_id, FLAGS.neuron_id, FLAGS.layer_id,
      FLAGS.normalize)
  # Check if top_k should be written
  if FLAGS.write_top_k:
    output_helper.get_top_ks(
        fused_one_hots, FLAGS.k, iteration, data, FLAGS.dream_start,
        FLAGS.dream_end, tokenizer, activation=activation)
  # Calculate the loss as an inverse activation of the layer to be optimised for
  # (adam wants to minimize this value, we want to maximize it)
  loss = -activation
  # Backpropagate the loss
  loss.backward(retain_graph=True)
  # Optimize the word vector based on that loss
  optimizer.step()
  # Get the actual tokens and distances to the embedding for this modified
  # embedding
  one_hots_sm = one_hots_helper.softmax_one_hots(modify, temperature,
                                                 FLAGS.gumbel)
  fused_one_hots = torch.cat([before, one_hots_sm, after], dim=1)
  max_values, token_ids = one_hots_helper.get_tokens_from_one_hots(
      fused_one_hots)
  return max_values, token_ids, activation, emb_tokens, emb_activation


def get_dream(device, tokenizer, embedding_map, model, base_path):
  """Obtain a dream from the modle given the parameters passed by the user.

  Args:
    device: The device to use for training the model.
    tokenizer: Used to convert between sentences, tokens, and ids.
    embedding_map: Map containing all the pretrained embeddings of the model.
    model: BERT model used for the dreaming process.
    base_path: Location of where to write the results.
  """
  data = []
  results = {}
  params = {}
  # Actually do the optimization
  deep_dream(data, results, params, device, tokenizer, embedding_map, model)
  # If the top k file is to be written, write it
  if FLAGS.write_top_k:
    output_helper.write_top_ks(base_path, data, FLAGS.dream_start, params)
  output_helper.write_results(base_path, results, params, 'dream')


def main(_):
  # Set up everything needed for dreaming
  tokenizer, model, device, embedding_map = setup_helper.setup_uncased(
      FLAGS.model_config)
  # Make a directory for the current run
  folder_helper.make_folder_if_not_exists(FLAGS.output_dir)
  path = folder_helper.make_timestamp_directory(FLAGS.output_dir,
                                                prefix='dream')
  # Start the run
  get_dream(device, tokenizer, embedding_map, model, path)

if __name__ == '__main__':
  flags.mark_flag_as_required('output_dir')
  app.run(main)
