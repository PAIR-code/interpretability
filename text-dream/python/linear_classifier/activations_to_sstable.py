"""Converts exported activations to SSTables."""
from __future__ import absolute_import
from __future__ import division
from __future__ import google_type_annotations
from __future__ import print_function

import os
from absl import app
from absl import flags
import numpy as np
from google3.learning.deepmind.xmanager2.client import google as xm  # pylint: disable=unused-import
from google3.learning.vis.bert_dream.helpers import folder_helper
from google3.pyglib import gfile
from google3.sstable.python import sstable

FLAGS = flags.FLAGS
flags.DEFINE_string('data_dir', None, 'where to get the data')
flags.DEFINE_string('concept', None, 'name of the concept to be parsed')
flags.DEFINE_string('layer_id', None, 'id of the layer to be parsed')


def write_to_table(paths):
  """Write the embeddings of the provided paths to a sstable.

  Args:
    paths: Paths for all saved embeddings for this table.
  """
  output_dir = os.path.join(FLAGS.data_dir, 'sstables')
  folder_helper.make_folder_if_not_exists(output_dir)
  folder_helper.make_folder_if_not_exists(os.path.join(output_dir,
                                                       FLAGS.concept))
  with sstable.Builder(
      os.path.join(output_dir, FLAGS.concept, str(FLAGS.layer_id))) as builder:
    for path in paths:
      path = path.decode('utf-8')
      embeddings_file = gfile.Open(os.path.join(FLAGS.data_dir, FLAGS.concept,
                                                str(FLAGS.layer_id), path), 'r')
      np_item = np.load(embeddings_file)
      str_item = ''
      for item in np_item:
        str_item = str_item + str(item) + ','
      str_item = str_item[:-1]  # Remove the final comma after combining items
      builder.Add(path, str_item)


def get_data_paths():
  paths = gfile.ListDir(os.path.join(FLAGS.data_dir, FLAGS.concept,
                                     str(FLAGS.layer_id)))
  print('Found {} examples.'.format(len(paths)))
  return paths


def main(_):
  paths = get_data_paths()
  write_to_table(paths)

if __name__ == '__main__':
  app.run(main)
