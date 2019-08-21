"""Launch the training process for linear classifiers via XManager on BORG."""
from absl import flags
from google3.learning.deepmind.python import app
import google3.learning.deepmind.xmanager as xm
from google3.learning.deepmind.xmanager import hyper

FLAGS = flags.FLAGS
flags.DEFINE_string('data_dir', None, 'where to get the embedding results from')
flags.DEFINE_string('quota_user', 'big_picture', 'which user to allocate the'
                    'resources from.')
flags.DEFINE_string('cell', 'is', 'which cell to run the job on')


def main(_):
  # Key experiment details.
  description = xm.ExperimentDescription('Embeddings to SSTable')

  requirements = xm.Requirements(
      cpu=4,
      ram=4*xm.GiB,
      tmp_ram_fs_size=4*xm.GiB)
  runtime = xm.Borg(cell='is', requirements=requirements)

  # Define an exploration consisting of executables and parameters.
  executable = xm.BuildTarget(
      '//learning/vis/bert_dream/linear_classifier:activations_to_sstable',
      runtime=runtime,
      platform=xm.Platform.CPU,
      args={
          'gfs_user': FLAGS.quota_user,
          'data_dir': FLAGS.data_dir
      })
  parameters = hyper.product([
      hyper.sweep('layer_id', hyper.discrete(range(0, 12))),
      hyper.sweep('concept', hyper.categorical(['she', 'he']))
  ])
  exploration = xm.ParameterSweep(executable, parameters)
  # Launch experiment on Borg.
  xm.launch_experiment(description, exploration)

if __name__ == '__main__':
  flags.mark_flag_as_required('data_dir')
  app.run()
