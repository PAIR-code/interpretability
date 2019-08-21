"""Launch a XManager job for deep dreaming with BERT."""
import datetime
import os
from absl import flags
from google3.learning.deepmind.python import app
import google3.learning.deepmind.xmanager as xm
from google3.learning.deepmind.xmanager import hyper

FLAGS = flags.FLAGS
flags.DEFINE_string('output_dir', None, 'Where to save the results to.')
flags.DEFINE_string('sentence', None, 'Which sentence to start with dreaming')
flags.DEFINE_integer('layer_id', 1, 'Last token to be changed.')
flags.DEFINE_integer('word_id', 1, 'Last token to be changed.')
flags.DEFINE_integer('neuron_id', 1, 'Last token to be changed.')
flags.DEFINE_integer('num_iterations', 10000, 'number of optimization steps')
flags.DEFINE_integer('dream_start', 2, 'first token that is to be changed in'
                     'the sentence')
flags.DEFINE_integer('dream_end', 0, 'first token that is to be changed in the'
                     'sentence')
flags.DEFINE_integer('warmup', 200, 'how long before the temperature of the'
                     'softmax gets adjusted')
flags.DEFINE_float('start_temp', 2.0, 'start-temperature of the softmax')
flags.DEFINE_float('end_temp', 0.1, 'end-temperature of the softmax')
flags.DEFINE_float('anneal', 0.9995, 'annealing factor for the temperature')
flags.DEFINE_float('learning_rate', 0.1, 'learning rate of the optimizer')
flags.DEFINE_integer('metrics_frequency', 250, 'frequency in which results are'
                     'saved')


def main(_):
  # Key experiment details.
  description = xm.ExperimentDescription('Dream')

  requirements = xm.Requirements(
      cpu=4,
      gpu=1,
      ram=4*xm.GiB,
      tmp_ram_fs_size=4*xm.GiB)
  runtime = xm.Borg(requirements=requirements)

  now = datetime.datetime.now()
  now = str(now).replace(' ', '_')

  # Define an exploration consisting of executables and parameters.
  executable = xm.BuildTarget(
      '//learning/vis/bert_dream/dream:dream',
      runtime=runtime,
      build_flags=['--config=pytorch'],
      platform=xm.Platform.GPU,
      args={
          'output_dir': os.path.join(FLAGS.output_dir, now),
          'model_config': 'bert-base-uncased-cns',
          'sentence': FLAGS.sentence,
          'dream_start': FLAGS.dream_start,
          'dream_end': FLAGS.dream_end,
          'layer_id': FLAGS.layer_id,
          'word_id': FLAGS.word_id,
          'neuron_id': FLAGS.neuron_id,
          'num_iterations': FLAGS.num_iterations,
          'warmup': FLAGS.warmup,
          'start_temp': FLAGS.start_temp,
          'end_temp': FLAGS.end_temp,
          'anneal': FLAGS.anneal,
          'learning_rate': FLAGS.learning_rate,
          'metrics_frequency': FLAGS.metrics_frequency
      })
  parameters = hyper.product([
  ])
  exploration = xm.ParameterSweep(executable, parameters)
  # Launch experiment on Borg.
  xm.launch_experiment(description, exploration)

if __name__ == '__main__':
  flags.mark_flag_as_required('sentence')
  flags.mark_flag_as_required('output_dir')
  app.run()
