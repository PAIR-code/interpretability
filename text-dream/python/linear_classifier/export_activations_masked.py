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

"""Exports activations for all MASK tokens to CNS."""
import json
from absl import app
from absl import flags
import sys
sys.path.insert(1, 'helpers')
import embeddings_helper
import folder_helper
import inference_helper
import setup_helper
import tokenization_helper

FLAGS = flags.FLAGS
flags.DEFINE_string('output_dir', None,
                    'the output directory where the results will be written')
flags.DEFINE_string('input_file', None, 'where to get the inference data')
flags.DEFINE_string('concepts_name', None, 'type of concepts we are testing')
flags.DEFINE_string('model_config', 'bert-base-uncased', 'name of the model'
                    'configuration to load')


def get_concepts_and_data_from_file():
  """Get the concepts and the sentences from a file."""
  input_file = open(FLAGS.input_file, 'r')
  concepts = []
  data = []
  line = input_file.readline()
  while line:
    line = json.loads(line)
    if line['targets'][0]['label'] not in concepts:
      concepts.append(line['targets'][0]['label'])
    data.append(line)
    line = input_file.readline()
  return concepts, data


def main(_):
  concepts, data = get_concepts_and_data_from_file()
  _, concept_folders = folder_helper.make_concept_directories(
      concepts, FLAGS.input_file, FLAGS.output_dir, FLAGS.concepts_name)
  tokenizer, bert_model, device = setup_helper.setup_bert_vanilla(
      FLAGS.model_config)
  folder_helper.make_concept_layer_folders(concept_folders, bert_model)
  for data_point in data:
    tokens = tokenization_helper.tokenize_input_sentence(
        tokenizer, data_point['text'], '')
    tokens_tensor, segments_tensor = tokenization_helper.tensors_from_tokens(
        tokenizer, tokens, device)
    layers_act = inference_helper.run_inference_vanilla(tokens_tensor,
                                                        segments_tensor,
                                                        bert_model)
    current_folder = concept_folders[concepts.index(
        data_point['targets'][0]['label'])]
    # Get the index at which the mask token is
    mask_index = tokens.index(u'[MASK]')
    embeddings_helper.write_embedding(layers_act, mask_index, tokens,
                                      current_folder)

if __name__ == '__main__':
  flags.mark_flag_as_required('output_dir')
  flags.mark_flag_as_required('input_file')
  flags.mark_flag_as_required('concepts_name')
  app.run(main)
