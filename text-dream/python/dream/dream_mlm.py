# Copyright 2018 Google LLC. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
# ==============================================================================

"""Maximally activate the prediction of a masked token."""
from absl import app
from absl import flags
import torch
import sys
sys.path.insert(1, 'helpers')
import attention_mask_helper
import embeddings_helper
import folder_helper
import inference_helper
import one_hots_helper
import output_helper
import setup_helper
import tokenization_helper

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
flags.DEFINE_integer('num_iterations', 1000, 'number of optimization steps')
flags.DEFINE_integer('maximize_word', 2, 'word to maximize the prediction'
                     'probability for')
flags.DEFINE_integer('maximize_id', 3124, 'token id to maximize the prediction'
                     'probability for')
flags.DEFINE_integer('dream_before_start', 1, 'index of the start of all'
                     'changed words before the word to be maximized for')
flags.DEFINE_integer('dream_before_end', 1, 'index of the end of all'
                     'changed words before the word to be maximized for')
flags.DEFINE_integer('dream_after_start', 3, 'index of the start of all'
                     'changed words after the word to be maximized for')
flags.DEFINE_integer('dream_after_end', 5, 'index of the end of all'
                     'changed words after the word to be maximized for')
flags.DEFINE_integer('warmup', 200, 'how long before the temperature of the'
                     'softmax gets adjusted')
flags.DEFINE_float('start_temp', 2.0, 'start-temperature of the softmax')
flags.DEFINE_float('end_temp', 0.1, 'end-temperature of the softmax')
flags.DEFINE_float('anneal', 0.9995, 'annealing factor for the temperature')
flags.DEFINE_float('learning_rate', 0.1, 'learning rate of the optimizer')
flags.DEFINE_bool('normalize', True, 'normalize the activation over other'
                  'activations')
flags.DEFINE_bool('gumbel', False, 'use gumbel noise with the softmax')
flags.DEFINE_integer('metrics_frequency', 250, 'frequency in which results are'
                     'saved')


def get_prediction(prediction_scores, maximize_word, maximize_id, normalize):
  """Get the prediction for the current input.

  Args:
    prediction_scores: The scores that the model has output.
    maximize_word: The word id for which the activation should be maximized.
    maximize_id: The token id that we wish to be maximized for.
    normalize: Whether to normalize the prediction value to sum to one.

  Returns:
    prediction_score: Current prediction score for said word/token combination.
  """
  if normalize:
    return torch.nn.functional.softmax(
        prediction_scores[0][maximize_word], -1)[maximize_id]
  else:
    return prediction_scores[0][maximize_word][maximize_id]


def get_ids_prediction(ids, pos_embeddings, sentence_embeddings,
                       attention_mask, maximize_word, maximize_id, normalize,
                       embedding_map, model, device, cbs, cbe, cas, cae):
  """Get the prediction score for an id-sequence.

  Args:
    ids: The ids to get the activations for.
    pos_embeddings: Positional embeddings to run inference with.
    sentence_embeddings: Sentence embeddings to run inference with.
    attention_mask: Attention mask used during inference.
    maximize_word: Word for the activation to be fetched of.
    maximize_id: Id of the activation to be maximized for.
    normalize: Whether to normalize the activations.
    embedding_map: The embedding map used to get embeddings from one-hots.
    model: Model to run inference on.
    device: Where to place new variables.
    cbs: The index of the start of the changeable part before maximize_word.
    cbe: The index of the end of the changeable part before maximize_word.
    cas: The index of the start of the changeable part after maximize_word.
    cae: The index of the end of the changeable part after maximize_word.

  Returns:
    prediction_score: The requested prediction score for the activation.
  """
  # Get a one_hot token for these ids
  before, change1, max_part, change2, after = one_hots_helper.get_one_hots_mlm(
      ids, cbs, cbe, cas, cae, device)
  # Do not apply a gradient to this model run
  with torch.no_grad():
    one_hots = torch.cat([before, change1, max_part, change2, after], dim=1)
    prediction_scores = inference_helper.run_inference_mlm(
        one_hots, pos_embeddings, sentence_embeddings, attention_mask,
        embedding_map, model)
    return get_prediction(prediction_scores, maximize_word, maximize_id,
                          normalize)


def deep_dream(results, params, device, tokenizer, embedding_map, model):
  """Deep dream to maximally activate the class probability for a token.

  Args:
    results: Holds the results of the run.
    params: Holds the parameters of the run.
    device: The device to store the variables on.
    tokenizer: The tokenizer to transform the input.
    embedding_map: Holding all token embeddings.
    model: The model that should dream.
  """
  # An embedding for the tokens is obtained
  tokens = tokenization_helper.tokenize_input_sentence(
      tokenizer, FLAGS.sentence, FLAGS.sentence2,
      mask_word=FLAGS.maximize_word)
  tokens_tensor, segments_tensor = tokenization_helper.tensors_from_tokens(
      tokenizer, tokens, device)
  _, pos_embeddings, sentence_embeddings = embeddings_helper.get_embeddings(
      tokens_tensor, segments_tensor, model.bert)
  # Write the parameters to a file
  output_helper.get_params_mlm(params, FLAGS, tokens)
  # Get the smooth one-hot vector that is to be optimized, split into static and
  # modifiable parts
  before, change1, max_part, change2, after = one_hots_helper.get_one_hots_mlm(
      tokens_tensor.data.cpu().numpy(), FLAGS.dream_before_start,
      FLAGS.dream_before_end, FLAGS.dream_after_start, FLAGS.dream_after_end,
      device)
  # Obtain the default attention mask to be able to run the model
  attention_mask = attention_mask_helper.get_attention_mask(tokens_tensor)
  # The optimizer used to modify the input embedding
  optimizer = torch.optim.Adam([change1, change2], lr=FLAGS.learning_rate)
  # Init temperature for Gumbel
  temperature = torch.tensor(FLAGS.start_temp, device=device,
                             requires_grad=False)

  # Obtain the properties of the initial embedding
  one_hots_sm_1 = one_hots_helper.softmax_one_hots(change1, temperature,
                                                   FLAGS.gumbel)
  one_hots_sm_2 = one_hots_helper.softmax_one_hots(change2, temperature,
                                                   FLAGS.gumbel)
  max_values, tokens_ids = one_hots_helper.get_tokens_from_one_hots(
      torch.cat([before, one_hots_sm_1, max_part, one_hots_sm_2, after], dim=1))
  numpy_max_values = max_values.data.cpu().numpy()
  ids = tokens_ids.data.cpu().numpy()[0]
  tokens = tokenizer.convert_ids_to_tokens(ids)
  ids_prediction = get_ids_prediction(
      ids, pos_embeddings, sentence_embeddings, attention_mask,
      FLAGS.maximize_word, FLAGS.maximize_id, FLAGS.normalize, embedding_map,
      model, device, FLAGS.dream_before_start, FLAGS.dream_before_end,
      FLAGS.dream_after_start, FLAGS.dream_after_end)
  output_helper.init_results(results)

  # Optimize the embedding for i iterations and update the properties to
  # evaluate the result in each step
  for i in range(FLAGS.num_iterations):
    max_vals, tokens_ids, prediction = optimizer_step(
        optimizer, before, change1, max_part, change2, after, pos_embeddings,
        sentence_embeddings, attention_mask, temperature, embedding_map, model)
    # Write the properties of the last step
    if (i % FLAGS.metrics_frequency) == 0:
      output_helper.get_metrics_mlm(
          tokens, prediction, ids_prediction, i, temperature, numpy_max_values,
          results)
    # Set the numpy max values
    numpy_max_values = max_vals.data.cpu().numpy()
    # Obtain the activation property for the id-array that would result from the
    # optimization
    ids = tokens_ids.data.cpu().numpy()[0]
    tokens = tokenizer.convert_ids_to_tokens(ids)
    # Calculate the activation using the highest scoring words
    ids_prediction = get_ids_prediction(
        ids, pos_embeddings, sentence_embeddings, attention_mask,
        FLAGS.maximize_word, FLAGS.maximize_id, FLAGS.normalize, embedding_map,
        model, device, FLAGS.dream_before_start, FLAGS.dream_before_end,
        FLAGS.dream_after_start, FLAGS.dream_after_end)
    # Check if the temperature needs to decrease
    if i > FLAGS.warmup:
      temperature = torch.clamp(temperature * FLAGS.anneal, FLAGS.end_temp)

  # Calculate the final activation just as before, but without backprop
  if (FLAGS.num_iterations % FLAGS.metrics_frequency) == 0:
    with torch.no_grad():
      one_hots_sm_1 = one_hots_helper.softmax_one_hots(change1, temperature,
                                                       FLAGS.gumbel)
      one_hots_sm_2 = one_hots_helper.softmax_one_hots(change2, temperature,
                                                       FLAGS.gumbel)

      fused = torch.cat([before, one_hots_sm_1, max_part, one_hots_sm_2, after],
                        dim=1)
      prediction_score = inference_helper.run_inference_mlm(
          fused, pos_embeddings, sentence_embeddings, attention_mask,
          embedding_map, model)
      prediction = get_prediction(prediction_score, FLAGS.maximize_word,
                                  FLAGS.maximize_id, FLAGS.normalize)
      output_helper.get_metrics_mlm(
          tokens, prediction, ids_prediction, FLAGS.num_iterations, temperature,
          numpy_max_values, results)


def optimizer_step(optimizer, before, change1, max_part, change2, after,
                   pos_embeddings, sentence_embeddings, attention_mask,
                   temperature, embedding_map, model):
  """Optimize the sentence towards the target activation.

  Args:
    optimizer: The optimizer to be used.
    before: The tensor for everything before the modifyable content.
    change1: Modifyable content before the word to be maximized for.
    max_part: The static tensor around the word to be maximized for.
    change2: Modifyable content after the word to be maximized for.
    after: The tensor for everything after the modifiable content.
    pos_embeddings: The positional embeddings used for inference.
    sentence_embeddings: The sentence embeddings for inference.
    attention_mask: The attention mask used for inference.
    temperature: The temperature used for making the softmax spike.
    embedding_map: Holding all the token embeddings for BERT.
    model: Model to run inference on.

  Returns:
    max_values: The maximal values for the current token representations.
    token_ids: The token ids of the current representation.
    prediction: The current prediction score of the word to be maximized.
  """
  # Reset the gradient
  optimizer.zero_grad()
  # Softmax over the one-hots
  one_hots_sm_1 = one_hots_helper.softmax_one_hots(change1, temperature,
                                                   FLAGS.gumbel)
  one_hots_sm_2 = one_hots_helper.softmax_one_hots(change2, temperature,
                                                   FLAGS.gumbel)
  fused_one_hots = torch.cat([before, one_hots_sm_1, max_part, one_hots_sm_2,
                              after], dim=1)
  # Get the prediction
  prediction_score = inference_helper.run_inference_mlm(
      fused_one_hots, pos_embeddings, sentence_embeddings, attention_mask,
      embedding_map, model)
  prediction = get_prediction(prediction_score, FLAGS.maximize_word,
                              FLAGS.maximize_id, FLAGS.normalize)
  # Calculate the loss as an inverse activation of the layer to be optimised for
  # (adam wants to minimize this value, we want to maximize it)
  loss = -prediction
  # Backpropagate the loss
  loss.backward(retain_graph=True)
  # Optimize the word vector based on that lossone_hotsone_hots
  optimizer.step()
  # Get the actual tokens and distances to the embedding for this modified
  # embedding
  one_hots_sm_1 = one_hots_helper.softmax_one_hots(change1, temperature,
                                                   FLAGS.gumbel)
  one_hots_sm_2 = one_hots_helper.softmax_one_hots(change2, temperature,
                                                   FLAGS.gumbel)
  fused_one_hots = torch.cat([before, one_hots_sm_1, max_part, one_hots_sm_2,
                              after], dim=1)
  max_values, token_ids = one_hots_helper.get_tokens_from_one_hots(
      fused_one_hots)
  return max_values, token_ids, prediction


def get_dream(device, tokenizer, embedding_map, model, base_path):
  """Obtain a dream from the modle given the parameters passed by the user.

  Args:
    device: The device to use for training the model.
    tokenizer: Used to convert between sentences, tokens, and ids.
    embedding_map: Map containing all the pretrained embeddings of the model.
    model: BERT model used for the dreaming process.
    base_path: Location of where to write the results.
  """
  results = {}
  params = {}
  # Actually do the optimization
  deep_dream(results, params, device, tokenizer, embedding_map, model)
  output_helper.write_results(base_path, results, params, 'dream_mlm')


# Main function for setting everything up and starting optimization
def main(_):
  # Set up everything needed for dreaming
  tokenizer, model, device, embedding_map = setup_helper.setup_bert_mlm(
      FLAGS.model_config)
  # Make a directory for the current run
  folder_helper.make_folder_if_not_exists(FLAGS.output_dir)
  path = folder_helper.make_timestamp_directory(FLAGS.output_dir,
                                                prefix='dream_mlm')
  # Start the run
  get_dream(device, tokenizer, embedding_map, model, path)


if __name__ == '__main__':
  flags.mark_flag_as_required('output_dir')
  app.run(main)
