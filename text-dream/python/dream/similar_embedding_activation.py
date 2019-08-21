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

"""Check the activation for embeddings similar to the one of the token."""
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
import embeddings_helper
import inference_helper
import one_hots_helper
import tokenization_helper

# Command Line Arguments
FLAGS = flags.FLAGS
flags.DEFINE_string('sentence', u'i hate kickshaws',
                    'the sentence to start with')
flags.DEFINE_string('output_dir', None,
                    'the output directory where the results will be'
                    'written.')
flags.DEFINE_string('model_config', 'bert-base-uncased', 'The name of the model'
                    'configuration to load')
flags.DEFINE_integer('num_iterations', 1000, 'number of optimization steps')
flags.DEFINE_integer('layer_id', None, 'layer to optimize activation for')
flags.DEFINE_integer('word_id', None, 'word to optimize activation for')
flags.DEFINE_integer('neuron_id', None, 'neuron to optimize activation for')
flags.DEFINE_integer('change_word', None, 'token to be changed to similar'
                     'embeddings')
flags.DEFINE_integer('top_k', 100, 'how many embeddings to look at')
flags.DEFINE_bool('cosine', False, 'use consine similarity instead of p2')


def write_closest_activations(closest, distances, activations, tokenizer,
                              tokens, furthest):
  """Write a file that contains the results of this run.

  Args:
    closest: The closest tokens that have been found.
    distances: Distances to the initial token for the closest embeddings.
    activations: The activations that these tokens produced.
    tokenizer: The tokenizer to convert the closest parameter to real tokens.
    tokens: The tokens of the input sentence.
    furthest: The distance for the furthest embedding, for normalization.
  """
  results = {
      'type': 'similar_embeddings',
      'sentence': FLAGS.sentence,
      'layer_id': FLAGS.layer_id,
      'neuron_id': FLAGS.neuron_id,
      'word_id': FLAGS.word_id,
      'change_word': FLAGS.change_word,
      'cosine': FLAGS.cosine,
      'tokens': tokens,
      'tops': [],
      'furthest': furthest.item()
  }
  closest_tokens = tokenizer.convert_ids_to_tokens(closest.data.cpu().numpy())
  for i in range(len(closest)):
    results['tops'].append({
        'token': closest_tokens[i],
        'activation': activations[i],
        'distance': distances[i].item()
    })
  results_path = os.path.join(FLAGS.output_dir,
                              'closest_to_{}_{}.json'.format(FLAGS.sentence,
                                                             FLAGS.change_word))
  results_file = open(results_path, 'w')
  json.dump(results, results_file)


def try_similar_embeddings(tokenizer, model, device):
  """Get the activation values for similar embeddings to a given embedding.

  Args:
    tokenizer: Tokenizer used to tokenize the input sentence.
    model: Model to retrieve the activation from.
    device: Device on which the variables are stored.

  Returns:
    closest: Closest tokens to the one that has been passed to modify.
    activations: Activations of these close tokens.
  """
  embedding_map = embeddings_helper.EmbeddingMap(device, model)
  tokens = tokenization_helper.tokenize_input_sentence(
      tokenizer, FLAGS.sentence, '')
  idx_tensor, segments_tensor = tokenization_helper.tensors_from_tokens(
      tokenizer, tokens, device)
  _, modify, _ = one_hots_helper.get_one_hots(
      idx_tensor.data.cpu().numpy(), FLAGS.change_word, FLAGS.change_word,
      device, grad=False)
  modify_embedding = torch.matmul(modify, embedding_map.embedding_map)
  distances, closest = embeddings_helper.get_closest_embedding(
      modify_embedding[0], embedding_map, cosine=FLAGS.cosine,
      top_k=FLAGS.top_k)
  furthest, _ = embeddings_helper.get_closest_embedding(
      modify_embedding[0], embedding_map, cosine=FLAGS.cosine,
      top_k=1, furthest=True)
  idx_array = idx_tensor.data.cpu().numpy()
  activations = []
  for i in range(len(closest)):
    idx_array[0][FLAGS.change_word] = closest[i]
    tensor = torch.tensor(idx_array)
    if device.type == 'cuda':
      tensor = tensor.to(device)
    layers_act = inference_helper.run_inference_vanilla(tensor, segments_tensor,
                                                        model)
    activation = activation_helper.get_activation(
        layers_act, FLAGS.word_id, FLAGS.neuron_id, FLAGS.layer_id, True)
    activations.append(activation.item())
  return closest, distances, activations, tokens, furthest


def main(_):
  # Load pre-trained model tokenizer (vocabulary)
  tokenizer = tokenization.BertTokenizer.from_pretrained(FLAGS.model_config)
  # Load pre-trained model (weights)
  model = modeling.BertModel.from_pretrained(FLAGS.model_config)
  _ = model.eval()
  # Load pre-trained model (weights)
  # Set up the device in use
  device = torch.device('cuda:0' if torch.cuda.is_available() else 'cpu')
  print('device: ', device)
  model = model.to(device)
  closest, distances, activations, tokens, furthest = try_similar_embeddings(
      tokenizer, model, device)
  write_closest_activations(closest, distances, activations, tokenizer, tokens,
                            furthest)

if __name__ == '__main__':
  flags.mark_flag_as_required('output_dir')
  app.run(main)
