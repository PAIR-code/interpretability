"""Computes the top predictions for a masked token using pretrained BERT."""
from absl import app
from absl import flags
from pytorch_pretrained_bert import modeling
from pytorch_pretrained_bert import tokenization
import torch
import sys
sys.path.insert(1, 'helpers')
import tokenization_helper

# Command Line Arguments
FLAGS = flags.FLAGS
flags.DEFINE_string('sentence', u'i hate kickshaws',
                    'the sentence to start with')
flags.DEFINE_string('model_config', 'bert-base-uncased', 'The name of the model'
                    'configuration to load')
flags.DEFINE_integer('mask_word', 1, 'word to predict')
flags.DEFINE_integer('top_k', 10, 'how many predictions to output')
flags.DEFINE_bool('normalize', True, 'normalize the activation over other'
                  'activations')


def predict_masked_token(tokenizer, model, device):
  """Predict the tokens for a masked position.

  Args:
    tokenizer: Pretrained BERT tokenizer to convert the input.
    model: The model to use for prediction.
    device: Where new tensors are stored.
  """
  tokens = tokenization_helper.tokenize_input_sentence(
      tokenizer, FLAGS.sentence, '', mask_word=FLAGS.mask_word)
  tokens_tensor, segments_tensor = tokenization_helper.tensors_from_tokens(
      tokenizer, tokens, device)
  # Predict all tokens
  with torch.no_grad():
    predictions = model(tokens_tensor, segments_tensor)
  predicted_index = predictions[0, FLAGS.mask_word]
  if FLAGS.normalize:
    predicted_index = torch.nn.functional.softmax(predicted_index, -1)
  values, indices = torch.topk(predicted_index, FLAGS.top_k)
  predicted_tokens = tokenizer.convert_ids_to_tokens(
      indices.data.cpu().numpy())
  print('Indices: {}'.format(indices.data.cpu().numpy()))
  print('Values:  {}'.format(values.data.cpu().numpy()))
  print('Tokens:  {}'.format(predicted_tokens))


def main(_):
  # Load pre-trained model tokenizer (vocabulary)
  tokenizer = tokenization.BertTokenizer.from_pretrained(FLAGS.model_config)
  # Load pre-trained model (weights)
  model = modeling.BertForMaskedLM.from_pretrained(FLAGS.model_config)
  model.eval()
  # Set up the device in use
  device = torch.device('cuda:0' if torch.cuda.is_available() else 'cpu')
  model = model.to(device)
  predict_masked_token(tokenizer, model, device)


if __name__ == '__main__':
  app.run(main)
