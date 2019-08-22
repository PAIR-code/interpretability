# Copyright 2018 Google LLC. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
# ==============================================================================

"""Handles the folder setup related functions."""
import datetime
import os


def make_folder_if_not_exists(folder_path):
  """Create a folder if it does not already exist.

  Args:
    folder_path: The path to the folder to create.
  """
  if not os.path.isdir(folder_path):
    os.mkdir(folder_path)


def make_timestamp_directory(base_path, prefix=''):
  """Make a directory named after the current timestamp at a given path.

  Args:
    base_path: The path to place the directory at.
    prefix: Optional prefix to pack before the directory timestamp.

  Returns:
    path: The path of the newly created directory.
  """
  now = datetime.datetime.now()
  now = str(now).replace(' ', '_')
  now = prefix + now
  path = os.path.join(base_path, now)
  make_folder_if_not_exists(path)
  return path


def make_layer_folders(parent_dir, bert_model):
  """Create a folder for each layer in the network.

  Args:
    parent_dir: The directory where these folders will be placed.
    bert_model: The model to obtain the layer number from.
  """
  for layer in range(len(bert_model.encoder.layer)):
    layer_folder = os.path.join(parent_dir, str(layer))
    make_folder_if_not_exists(layer_folder)


def make_concept_layer_folders(concept_folders, bert_model):
  """Create a folder for each layer in the network per concept.

  Args:
    concept_folders: The concept folders that all need these layer folders.
    bert_model: The model to obtain the layer number from.
  """
  for concept in concept_folders:
    make_layer_folders(concept, bert_model)


def make_concept_directories(concepts, inference_file, output_dir,
                             concepts_name):
  """Creates a directory for each concept to be investigated.

  Args:
    concepts: The concepts to create folders for.
    inference_file: The filename that this concepts are from.
    output_dir: Where to place the concept folders.
    concepts_name: The name that describes the concepts to be distinguished.

  Returns:
    target_folder: The folder that these concept folders were created in.
    concept_folders: The locations of the concept folders themselves.
  """
  filename = os.path.basename(inference_file)
  filename = os.path.splitext(filename)[0]
  target_folder = os.path.join(output_dir, filename)
  make_folder_if_not_exists(target_folder)
  target_folder = os.path.join(target_folder, 'concepts')
  make_folder_if_not_exists(target_folder)
  target_folder = os.path.join(target_folder, concepts_name)
  make_folder_if_not_exists(target_folder)
  concept_folders = []
  for concept in concepts:
    concept_foler = os.path.join(target_folder, concept)
    make_folder_if_not_exists(concept_foler)
    concept_folders.append(concept_foler)
  return target_folder, concept_folders
