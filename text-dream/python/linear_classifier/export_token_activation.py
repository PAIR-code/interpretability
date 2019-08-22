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

"""Export the embedding of a token for each layer given a sentence."""
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
flags.DEFINE_string('sentence', None,
                    'the sentence to export the token embedding for')
flags.DEFINE_string('output_dir', None,
                    'the output directory where the results will be'
                    'written.')
flags.DEFINE_integer('word_id', 1, 'word embedding to export')
flags.DEFINE_string('model_config', 'bert-base-uncased', 'name of the model'
                    'configuration to load')


def main(_):
  tokenizer, bert_model, device = setup_helper.setup_bert_vanilla(
      FLAGS.model_config)
  folder_helper.make_layer_folders(FLAGS.output_dir, bert_model)
  tokens = tokenization_helper.tokenize_input_sentence(
      tokenizer, FLAGS.sentence, '')
  tokens_tensor, segments_tensor = tokenization_helper.tensors_from_tokens(
      tokenizer, tokens, device)
  layers_act = inference_helper.run_inference_vanilla(tokens_tensor,
                                                      segments_tensor,
                                                      bert_model)
  embeddings_helper.write_embedding(layers_act, FLAGS.word_id, tokens,
                                    FLAGS.output_dir)

if __name__ == '__main__':
  flags.mark_flag_as_required('sentence')
  flags.mark_flag_as_required('output_dir')
  app.run(main)
