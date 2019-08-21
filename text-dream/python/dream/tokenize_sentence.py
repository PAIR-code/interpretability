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
