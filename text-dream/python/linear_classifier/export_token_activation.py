"""Export the embedding of a token for each layer given a sentence."""
from absl import app
from absl import flags
from google3.learning.deepmind.xmanager2.client import google as xm  # pylint: disable=unused-import
from google3.learning.vis.bert_dream.helpers import embeddings_helper
from google3.learning.vis.bert_dream.helpers import folder_helper
from google3.learning.vis.bert_dream.helpers import inference_helper
from google3.learning.vis.bert_dream.helpers import setup_helper
from google3.learning.vis.bert_dream.helpers import tokenization_helper

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
