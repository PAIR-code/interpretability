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

"""Used to tokenize a sentence."""
from absl import app
from absl import flags
from pytorch_pretrained_bert import tokenization
import sys
sys.path.insert(1, 'helpers')
import tokenization_helper

# Command Line Arguments
FLAGS = flags.FLAGS
flags.DEFINE_string('sentence', u'i hate kickshaws',
                    'the sentence to be tokenized')
flags.DEFINE_string('sentence2', u'',
                    'the optional second sentence')


def main(_):
  # Load pre-trained model tokenizer (vocabulary)
  tokenizer = tokenization.BertTokenizer.from_pretrained('bert-base-uncased')
  # Print the tokenized sentence
  tokens = tokenization_helper.tokenize_input_sentence(
      tokenizer, FLAGS.sentence, FLAGS.sentence2)
  print(tokens)
  print(tokenizer.convert_tokens_to_ids(tokens))

if __name__ == '__main__':
  app.run(main)
