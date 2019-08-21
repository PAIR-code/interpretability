"""Searches the token that max. activates a sent/lay/neuron/word combination."""
import json
import os
from absl import app
from absl import flags
from pytorch_pretrained_bert import modeling
from pytorch_pretrained_bert import tokenization
import torch
import sys
sys.path.insert(1, 'helpers')
import activation_helper
import embeddings_config
import tokenization_helper

# Command Line Arguments
FLAGS = flags.FLAGS
flags.DEFINE_string('sentence', u'i hate kickshaws',
                    'the sentence to start with')
flags.DEFINE_string('output_dir', None,
                    'the output directory where the results will be'
                    'written.')
flags.DEFINE_integer('layer_id', 5, 'layer to optimize activation for')
flags.DEFINE_integer('word_id', 2, 'word to optimize activation for')
flags.DEFINE_integer('neuron_id', 414, 'neuron to optimize activation for')
flags.DEFINE_integer('change_word', 2, 'the word to be replaced')
flags.DEFINE_integer('top_k', 100, 'how many embeddings to look at')


def write_best_tokens(ids, activations, tokenizer, tokens):
  """Write a file that contains the results of this run.

  Args:
    ids: The closest tokens that have been found.
    activations: The activations that these tokens produced.
    tokenizer: The tokenizer to convert the closest parameter to real tokens.
    tokens: The tokens of the input sentence.
  """
  results = {
      'type': 'token_search',
      'sentence': FLAGS.sentence,
      'layer_id': FLAGS.layer_id,
      'neuron_id': FLAGS.neuron_id,
      'word_id': FLAGS.word_id,
      'change_word': FLAGS.change_word,
      'tokens': tokens,
      'tops': [],
  }
  tokens = tokenizer.convert_ids_to_tokens(ids.data.cpu().numpy())
  for i in range(len(tokens)):
    results['tops'].append({
        'token': tokens[i],
        'activation': activations[i].item(),
    })
  results_path = os.path.join(FLAGS.output_dir,
                              'top_tokens_in_{}_{}.json'.format(
                                  FLAGS.sentence, FLAGS.change_word))
  results_file = open(results_path, 'w')
  json.dump(results, results_file)


def run_inference(tokens_tensor, segments_tensor, model):
  """Run inference on the model.

  Args:
    tokens_tensor: The tokens to infer the activation from.
    segments_tensor: Segments of the sequence to retrieve the activation for.
    model: The model to run inference on.

  Returns:
    activation: Activation of the model given the parameters.
  """
  with torch.no_grad():
    layers_act, _ = model(tokens_tensor, segments_tensor)
    layers_act = torch.stack(layers_act).permute(1, 0, 2, 3)
  return activation_helper.get_activation(
      layers_act, FLAGS.word_id, FLAGS.neuron_id, FLAGS.layer_id, True)


def try_tokens(tokenizer, device, model):
  """Try all possible tokens for one word.

  Args:
    tokenizer: Tokenizer to convert the input.
    device: Where variables will be stored.
    model: The model to run inference on.

  Returns:
    top_k: Top activations and indices for this setting.
  """
  # An embedding for the tokens is obtained
  tokens = tokenization_helper.tokenize_input_sentence(
      tokenizer, FLAGS.sentence, '')
  tokens_tensor, segments_tensor = tokenization_helper.tensors_from_tokens(
      tokenizer, tokens, device)
  idx_array = tokens_tensor.data.cpu().numpy()
  activations = []
  for i in range(embeddings_config.NUM_EMBEDDED_TOKENS):
    idx_array[0][FLAGS.change_word] = i
    tensor = torch.tensor(idx_array)
    if device.type == 'cuda':
      tensor = tensor.to(device)
    activation = run_inference(tensor, segments_tensor, model)
    activations.append(activation)
  activations_tensor = torch.stack(activations)
  token_activations, ids = torch.topk(activations_tensor, FLAGS.top_k)
  write_best_tokens(ids, token_activations, tokenizer, tokens)


def main(_):
  # Load pre-trained model tokenizer (vocabulary)
  tokenizer = tokenization.BertTokenizer.from_pretrained('bert-base-uncased')
  # Load pre-trained model (weights)
  model = modeling.BertModel.from_pretrained('bert-base-uncased')
  _ = model.eval()
  # Load pre-trained model (weights)
  # Set up the device in use
  device = torch.device('cuda:0' if torch.cuda.is_available() else 'cpu')
  model = model.to(device)
  try_tokens(tokenizer, device, model)

if __name__ == '__main__':
  flags.mark_flag_as_required('output_dir')
  app.run(main)
