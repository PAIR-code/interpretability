"""Launch a XManager job for reconstruction the activations of a sentence."""
import datetime
import os
from absl import flags
from google3.learning.deepmind.python import app
import google3.learning.deepmind.xmanager as xm
from google3.learning.deepmind.xmanager import hyper

FLAGS = flags.FLAGS
flags.DEFINE_string('output_dir', None, 'Where to save the results to.')
flags.DEFINE_string('sentence', None, 'Which file to load for the'
                    'shift of the activation.')


def main(_):
  # Key experiment details.
  description = xm.ExperimentDescription('Reconstruct Activations')

  requirements = xm.Requirements(
      cpu=4,
      gpu=1,
      ram=4*xm.GiB,
      tmp_ram_fs_size=4*xm.GiB)
  runtime = xm.Borg(
      # cell='is',
      requirements=requirements
  )

  now = datetime.datetime.now()
  now = str(now).replace(' ', '_')

  # Define an exploration consisting of executables and parameters.
  executable = xm.BuildTarget(
      '//learning/vis/bert_dream/dream:reconstruct_activation',
      runtime=runtime,
      build_flags=['--config=pytorch'],
      platform=xm.Platform.GPU,
      args={
          'output_dir': os.path.join(FLAGS.output_dir, now),
          'model_config': 'bert-base-uncased-cns',
          'sentence': FLAGS.sentence,
      })
  parameters = hyper.product([
      hyper.sweep('layer_id',
                  hyper.discrete([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])),
  ])
  exploration = xm.ParameterSweep(executable, parameters)
  # Launch experiment on Borg.
  xm.launch_experiment(description, exploration)

if __name__ == '__main__':
  flags.mark_flag_as_required('sentence')
  flags.mark_flag_as_required('output_dir')
  app.run()
