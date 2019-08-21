"""Classify a single token in a sentence using a trained classifier."""
from __future__ import absolute_import
from __future__ import division
from __future__ import print_function

from absl import app
import torch
from google3.learning.vis.bert_dream.helpers import classifier_helper
from google3.learning.vis.bert_dream.helpers import inference_helper
from google3.learning.vis.bert_dream.helpers import setup_helper
from google3.learning.vis.bert_dream.helpers import tokenization_helper
from google3.pyglib import flags

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
  y = torch.nn.functional.sigmoid(y)
  print('Prediction: {}'.format(y.item()))


def main(_):
  tokenizer, model, device = setup_helper.setup_bert_vanilla(
      FLAGS.model_config)
  # Start the run
  classify_token(device, tokenizer, model)

if __name__ == '__main__':
  flags.mark_flag_as_required('trained_variables_dir')
  app.run(main)
