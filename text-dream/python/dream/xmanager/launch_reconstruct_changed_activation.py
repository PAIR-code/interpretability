"""Launch a XManager job for reconstruction the activations of a sentence."""
import datetime
import os
from absl import flags
from google3.learning.deepmind.python import app
import google3.learning.deepmind.xmanager as xm
from google3.learning.deepmind.xmanager import hyper

FLAGS = flags.FLAGS
flags.DEFINE_string('output_dir', None, 'Where to save the results to.')
flags.DEFINE_string('change_activation_dir', None, 'Where to find the file'
                    'containing the changed activation.')
flags.DEFINE_string('change_activation_file', None, 'Which file to load for the'
                    'changed activation.')
flags.DEFINE_string('sentence', None, 'Which sentence to get the original'
                    'activation from.')
flags.DEFINE_string('target', None, 'Target of the shifted activation.')
flags.DEFINE_string('quota_user', None, 'which user to allocate the'
                    'resources from.')
flags.DEFINE_integer('num_iterations', 6000, 'How many iterations to optimize'
                     'for.')


def main(_):
  # Key experiment details.
  description = xm.ExperimentDescription('Reconstruct Changed Activations')

  requirements = xm.Requirements(
      cpu=4,
      gpu=1,
      ram=4*xm.GiB,
      tmp_ram_fs_size=4*xm.GiB)
  runtime = xm.Borg(
      requirements=requirements
  )

  now = datetime.datetime.now()
  now = str(now).replace(' ', '_')

  # Define an exploration consisting of executables and parameters.
  executable = xm.BuildTarget(
      '//learning/vis/bert_dream/dream:reconstruct_changed_activation',
      runtime=runtime,
      build_flags=['--config=pytorch'],
      platform=xm.Platform.GPU,
      args={
          'gfs_user': FLAGS.quota_user,
          'output_dir': os.path.join(FLAGS.output_dir, now),
          'model_config': 'bert-base-uncased-cns',
          'change_activation_dir': FLAGS.change_activation_dir,
          'change_activation_file': FLAGS.change_activation_file,
          'num_iterations': FLAGS.num_iterations,
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
  flags.mark_flag_as_required('change_activation_dir')
  flags.mark_flag_as_required('change_activation_file')
  flags.mark_flag_as_required('target')
  app.run()
