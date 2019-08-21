"""Launch XManager job to export activations of all MASK tokens per layer."""
from absl import flags
from google3.learning.deepmind.python import app
import google3.learning.deepmind.xmanager as xm
from google3.learning.deepmind.xmanager import hyper

FLAGS = flags.FLAGS
flags.DEFINE_string('output_dir', None, 'where to save the results to')
flags.DEFINE_string('input_file', None, 'where to get the sentences from')
flags.DEFINE_string('quota_user', 'big_picture', 'which user to allocate the'
                    'resources from')
flags.DEFINE_string('concepts_name', 'gender', 'what kind of concept to'
                    'export for')
flags.DEFINE_string('model_config', 'bert-base-uncased-cns', 'which model'
                    'type to load')


def main(_):
  # Key experiment details.
  description = xm.ExperimentDescription('Export Activations Masked')

  requirements = xm.Requirements(
      cpu=4,
      gpu=1,
      ram=4*xm.GiB,
      tmp_ram_fs_size=4*xm.GiB)
  runtime = xm.Borg(requirements=requirements)
  # Define an exploration consisting of executables and parameters.
  executable = xm.BuildTarget(
      '//learning/vis/bert_dream/linear_classifier:export_activations_masked',
      runtime=runtime,
      build_flags=['--config=pytorch'],
      platform=xm.Platform.GPU,
      args={
          'gfs_user': FLAGS.quota_user,
          'output_dir': FLAGS.output_dir,
          'input_file': FLAGS.input_file,
          'concepts_name': FLAGS.concepts_name,
          'model_config': FLAGS.model_config,
      })
  parameters = hyper.product([])
  exploration = xm.ParameterSweep(executable, parameters)
  # Launch experiment on Borg.
  xm.launch_experiment(description, exploration)

if __name__ == '__main__':
  flags.mark_flag_as_required('output_dir')
  flags.mark_flag_as_required('input_file')
  app.run()
