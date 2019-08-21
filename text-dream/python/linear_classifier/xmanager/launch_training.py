"""Launch the training process for linear classifiers via XManager on BORG."""
import datetime
import os
from absl import flags
from google3.learning.deepmind.python import app
import google3.learning.deepmind.xmanager as xm
from google3.learning.deepmind.xmanager import hyper

FLAGS = flags.FLAGS
flags.DEFINE_string('output_dir', None, 'where to save the results to')
flags.DEFINE_string('train_dir', None, 'where to get the training data')
flags.DEFINE_string('quota_user', 'big_picture', 'which user to allocate the'
                    'resources from')
flags.DEFINE_string('cell', 'is', 'which cell to run the job on')
flags.DEFINE_float('learning_rate', 0.1, 'learning rate of the optimizer')
flags.DEFINE_integer('num_epochs', 10, 'number of optimization steps')
flags.DEFINE_integer('batch_size', 128, 'batch size for training data')
flags.DEFINE_bool('sstable', False, 'whether to user sstabbles for training')


def main(_):
  # Key experiment details.
  description = xm.ExperimentDescription('Linear Activation Classifier')

  requirements = xm.Requirements(
      cpu=4,
      gpu=1,
      ram=4*xm.GiB,
      tmp_ram_fs_size=4*xm.GiB)
  runtime = xm.Borg(cell=FLAGS.cell, requirements=requirements)

  now = datetime.datetime.now()

  # Define an exploration consisting of executables and parameters.
  executable = xm.BuildTarget(
      '//learning/vis/bert_dream/linear_classifier:train',
      runtime=runtime,
      build_flags=['--config=pytorch'],
      platform=xm.Platform.GPU,
      args={
          'gfs_user': FLAGS.quota_user,
          'output_dir': os.path.join(FLAGS.output_dir, str(now)),
          'train_dir': FLAGS.train_dir,
          'learning_rate': FLAGS.learning_rate,
          'num_epochs': FLAGS.num_epochs,
          'batch_size': FLAGS.batch_size,
          'sstable': FLAGS.sstable,
      })
  parameters = hyper.product([
      hyper.sweep('layer_id', hyper.discrete(range(0, 12))),
  ])
  exploration = xm.ParameterSweep(executable, parameters)
  # Launch experiment on Borg.
  xm.launch_experiment(description, exploration)

if __name__ == '__main__':
  flags.mark_flag_as_required('output_dir')
  flags.mark_flag_as_required('train_dir')
  app.run()
