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

"""Classify a single token in a sentence using a trained classifier."""
from absl import app
from absl import flags
import torch
import sys
sys.path.insert(1, 'helpers')
import classifier_helper
import inference_helper
import setup_helper
import tokenization_helper

# Command Line Arguments
FLAGS = flags.FLAGS
flags.DEFINE_string('sentence', u'he was a doctor',
                    'the sentence to start with')
flags.DEFINE_string('trained_variables_dir', None, 'the location where the'
                    'classifier variables are stored')
flags.DEFINE_string('model_config', 'bert-base-uncased', 'the name of the model'
                    'configuration to load')
flags.DEFINE_integer('layer_id', 6, 'layer to optimize activation for')
flags.DEFINE_integer('word_id', 1, 'word to feed into the classification head')


def classify_token(device, tokenizer, model):
  """Classifies a token using a trained classifier on top of BERT.

  Args:
    device: Where to do the calculations and store variables.
    tokenizer: Converts the input sentence into tokens.
    model: Used to retrieve the activations from.
  """
  tokens = tokenization_helper.tokenize_input_sentence(tokenizer,
                                                       FLAGS.sentence, '')
  tokens_tensor, segments_tensor = tokenization_helper.tensors_from_tokens(
      tokenizer, tokens, device)
  layers_act = inference_helper.run_inference_vanilla(tokens_tensor,
                                                      segments_tensor, model)
  token_act = layers_act[0][FLAGS.layer_id][FLAGS.word_id]
  classification_head = classifier_helper.get_classification_head(
      device, FLAGS.layer_id, FLAGS.trained_variables_dir)
  y = token_act.matmul(classification_head)
  y = torch.sigmoid(y)
  print('Prediction: {}'.format(y.item()))


def main(_):
  tokenizer, model, device = setup_helper.setup_bert_vanilla(
      FLAGS.model_config)
  # Start the run
  classify_token(device, tokenizer, model)

if __name__ == '__main__':
  flags.mark_flag_as_required('trained_variables_dir')
  app.run(main)
