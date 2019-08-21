"""Train a linear classifier on the activations of BERT."""
from __future__ import absolute_import
from __future__ import division
from __future__ import google_type_annotations
from __future__ import print_function

import json
import os
import time
from absl import app
from absl import flags
import numpy as np
import torch
import torch.utils.data
from google3.learning.deepmind.xmanager2.client import google as xm  # pylint: disable=unused-import
from google3.learning.vis.bert_dream.helpers import folder_helper
from google3.pyglib import gfile
from google3.sstable.python import sstable

FLAGS = flags.FLAGS
flags.DEFINE_string('output_dir', None,
                    'the output directory where the results will be written')
flags.DEFINE_string('train_dir', None, 'where to get the training data')
flags.DEFINE_integer('num_epochs', 1, 'number of optimization steps')
flags.DEFINE_integer('layer_id', 5, 'layer to optimize activation for')
flags.DEFINE_integer('batch_size', 32, 'batch size used for training')
flags.DEFINE_integer('random_seed', 42, 'random dataset shuffle seed')
flags.DEFINE_string('concept1', 'he', 'first concept to classify between')
flags.DEFINE_string('concept2', 'she', 'second concept to classify between')
flags.DEFINE_float('learning_rate', 0.1, 'learning rate of the optimizer')
flags.DEFINE_float('val_split', 0.1, 'train/validation split')
flags.DEFINE_bool('verbose', True, 'print the training progess')
flags.DEFINE_bool('mae', True, 'use mean absolute error, otherwise uses mean'
                  'squared error')
flags.DEFINE_bool('adam', True, 'use adam instead of sgd')
flags.DEFINE_bool('sigmoid', True, 'use adam instead of sgd')
flags.DEFINE_bool('sstable', False, 'use sstable instead of individual files')


def write_params(parent_dir):
  """Write the parameters of this run to the output directory.

  Args:
    parent_dir: The directory to save the new file to.
  """
  params_file = gfile.Open(os.path.join(parent_dir, 'params.json'), 'w')
  params = {
      'num_epochs': FLAGS.num_epochs,
      'layer_id': FLAGS.layer_id,
      'concept1': FLAGS.concept1,
      'concept2': FLAGS.concept2,
      'learning_rate': FLAGS.learning_rate,
      'train_dir': FLAGS.train_dir,
      'mae': FLAGS.mae,
      'val_split': FLAGS.val_split,
      'random_seed': FLAGS.random_seed,
      'adam': FLAGS.adam
  }
  json.dump(params, params_file)
  params_file.close()


def write_iteration(parent_dir, y, y_truth, loss):
  """Write the results of the current iteration to a file.

  Args:
    parent_dir: The directory to save the new file to.
    y: The classification result.
    y_truth: Ground truth for the classification.
    loss: The loss of the current run.
  """
  iteration_file = gfile.Open(os.path.join(parent_dir, 'training.txt'), 'a')
  iteration_file.write('Y: {}'.format(y.data.cpu().numpy()))
  iteration_file.write('\n')
  iteration_file.write('Y_Truth: {}'.format(y_truth.data.cpu().numpy()))
  iteration_file.write('\n')
  iteration_file.write('Loss: {}'.format(loss.item()))
  iteration_file.write('\n')
  iteration_file.write('\n')


def write_epoch(parent_dir, accuracy, epoch):
  """Write the results of the current iteration to a file.

  Args:
    parent_dir: The directory to save the new file to.
    accuracy: The accuracy for this epoch on the test data.
    epoch: The current epoch number.
  """
  iteration_file = gfile.Open(os.path.join(parent_dir, 'epochs.txt'), 'a')
  epoch_result = 'Epoch {}, Accuracy {}'.format(epoch, accuracy)
  iteration_file.write(epoch_result)
  if FLAGS.verbose:
    print(epoch_result)
  iteration_file.write('\n')


class Data(torch.utils.data.Dataset):
  """Represents the training dataset for the concept embedding classifier."""

  def __init__(self):
    start_setup = time.time()
    if FLAGS.sstable:
      self.init_with_sstables()
    else:
      self.init_with_files()
    print('Setup Time: {}'.format(time.time() - start_setup))

  def __len__(self):
    return len(self.concept_classes)

  def __getitem__(self, index):
    get_start = time.time()
    if FLAGS.sstable:
      np_item = np.fromstring(self.items[index], sep=',')
    else:
      # Get the file from the path that this dataset refers to for a concept
      embeddings_file = gfile.Open(self.items[index], 'r')
      np_item = np.load(embeddings_file)
    # Convert the training elements to tensors
    torch_item = torch.tensor(np_item, dtype=torch.float)
    torch_class = torch.tensor(self.concept_classes[index])
    get_time = time.time() - get_start
    return torch_item, torch_class, get_time

  def init_with_files(self):
    # Get all files belonging to concept 1
    paths_concept1 = gfile.ListDir(
        os.path.join(FLAGS.train_dir, FLAGS.concept1, str(FLAGS.layer_id)))
    paths_concept1 = [os.path.join(
        FLAGS.train_dir, FLAGS.concept1, str(FLAGS.layer_id),
        x) for x in paths_concept1]
    # Get all files belonging to concept 2
    paths_concept2 = gfile.ListDir(
        os.path.join(FLAGS.train_dir, FLAGS.concept2, str(FLAGS.layer_id)))
    paths_concept2 = [os.path.join(
        FLAGS.train_dir, FLAGS.concept2, str(FLAGS.layer_id),
        x) for x in paths_concept2]
    self.setup_classes_and_items(paths_concept1, paths_concept2)

  def init_with_sstables(self):
    path_concept1 = os.path.join(FLAGS.train_dir, FLAGS.concept1,
                                 str(FLAGS.layer_id))
    table_concept1 = sstable.SSTable(path_concept1)
    concept_1_items = []
    for _, v in table_concept1.iteritems():
      concept_1_items.append(v)
    path_concept2 = os.path.join(FLAGS.train_dir, FLAGS.concept2,
                                 str(FLAGS.layer_id))
    table_concept2 = sstable.SSTable(path_concept2)
    concept_2_items = []
    for _, v in table_concept2.iteritems():
      concept_2_items.append(v)
    self.setup_classes_and_items(concept_1_items, concept_2_items)

  def setup_classes_and_items(self, concept_1_items, concept_2_items):
    # Set up the classes belonging to the concepts
    concept1_classes = np.zeros(len(concept_1_items))
    concept2_classes = np.ones(len(concept_2_items))
    print('Found {} examples for concept "{}".'.format(len(concept_1_items),
                                                       FLAGS.concept1))
    print('Found {} examples for concept "{}".'.format(len(concept_2_items),
                                                       FLAGS.concept2))
    # Store the paths to the concepts files and the classes in this data object
    self.items = concept_1_items + concept_2_items
    self.concept_classes = np.concatenate((concept1_classes, concept2_classes),
                                          axis=0)


def train_classifier(train_data, device, parent_dir):
  """Train a classifier to distinguish activations between two concepts.

  Args:
    train_data: The Data object for obtaining the training data.
    device: On which device to train the classifier on.
    parent_dir: The directory to write training results to.
  """
  # Creating data indices for training and validation splits:
  dataset_size = len(train_data)
  indices = list(range(dataset_size))
  split = int(np.floor(FLAGS.val_split * dataset_size))
  np.random.seed(FLAGS.random_seed)
  np.random.shuffle(indices)
  train_indices, val_indices = indices[split:], indices[:split]

  # Creating PT data samplers and loaders:
  train_sampler = torch.utils.data.sampler.SubsetRandomSampler(train_indices)
  valid_sampler = torch.utils.data.sampler.SubsetRandomSampler(val_indices)

  train_loader = torch.utils.data.DataLoader(train_data,
                                             batch_size=FLAGS.batch_size,
                                             sampler=train_sampler)
  validation_loader = torch.utils.data.DataLoader(train_data,
                                                  batch_size=FLAGS.batch_size,
                                                  sampler=valid_sampler)

  # Model setup for this linear classifier
  train_item, _, _ = train_data.__getitem__(0)
  weights = torch.zeros((train_item.shape[0], 1), device=device,
                        requires_grad=True)
  if FLAGS.adam:
    optimizer = torch.optim.Adam([weights], lr=FLAGS.learning_rate)
  else:
    optimizer = torch.optim.SGD([weights], lr=FLAGS.learning_rate)
  # Evaluation Parameters
  it_times = []
  ep_times = []
  get_times = []
  # Training loop (num_epochs * num_training_elements)
  for epoch in range(FLAGS.num_epochs):
    ep_start = time.time()
    # Training
    for x, y_truth, get_time in train_loader:
      get_times.append(np.average(get_time.data.cpu().numpy()))
      it_start = time.time()
      x, y_truth = x.to(device), y_truth.to(device)
      optimizer.zero_grad()
      y = x.matmul(weights)
      if FLAGS.sigmoid:
        y = torch.nn.functional.sigmoid(y)
      y = y.reshape(-1)
      if FLAGS.mae:
        loss = torch.mean(torch.abs(y - y_truth))
      else:
        loss = torch.mean(torch.pow(y - y_truth, 2))
      # Write iteration stats to file if preferred
      if FLAGS.verbose:
        write_iteration(parent_dir, y, y_truth, loss)
      loss.backward()
      optimizer.step()
      it_times.append(time.time() - it_start)
    ep_times.append(time.time() - ep_start)
    # Validation
    with torch.no_grad():
      acc_value = 0
      num_acc = 0
      for x, y_truth, get_time in validation_loader:
        x, y_truth = x.to(device), y_truth.to(device)
        y = x.matmul(weights)
        if FLAGS.sigmoid:
          y = torch.nn.functional.sigmoid(y)
        y = y.reshape(-1)
        y = torch.where(y > 0.5, torch.ones_like(y), torch.zeros_like(y))
        acc = y - y_truth
        num_acc = num_acc + acc.shape[0]
        acc = torch.sum(torch.abs(acc))
        acc_value = acc_value + acc.item()
    accuracy = 1.0 - (acc_value / num_acc)
    write_epoch(parent_dir, accuracy, epoch)
    # Write the final classification vector
    weights_file = gfile.Open(os.path.join(parent_dir, 'final_weights.np'), 'w')
    np.save(weights_file, weights.data.cpu().numpy())
  print('Iteration Time: {}'.format(np.average(it_times)))
  print('Item Time: {}'.format(np.average(get_times)))
  print('Epoch Time: {}'.format(np.average(ep_times)))


def main(_):
  # Setup a directory to write the results to
  folder_helper.make_folder_if_not_exists(FLAGS.output_dir)
  loss_string = 'MSE'
  if FLAGS.mae:
    loss_string = 'MAE'
  parent_dir = os.path.join(FLAGS.output_dir, loss_string)
  folder_helper.make_folder_if_not_exists(parent_dir)
  parent_dir = os.path.join(parent_dir, str(FLAGS.layer_id))
  folder_helper.make_folder_if_not_exists(parent_dir)
  write_params(parent_dir)
  # Get the device to work with
  device = torch.device('cuda:0' if torch.cuda.is_available() else 'cpu')
  # Initialize the training data
  dataset = Data()
  # Start the training process
  train_classifier(dataset, device, parent_dir)

if __name__ == '__main__':
  flags.mark_flag_as_required('output_dir')
  flags.mark_flag_as_required('train_dir')
  app.run(main)
