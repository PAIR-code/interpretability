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

"""Combines the results of multiple shift magnitudes into one JSON file."""
import json
import os
from absl import app
from absl import flags

# Command Line Arguments
FLAGS = flags.FLAGS
flags.DEFINE_string('results_dir', None,
                    'where to find the shifted reconstruction results')
flags.DEFINE_bool('per_layer', False, 'whether to do this assembling for'
                  'multiple layers')


def combine_magnitudes(parent_dir):
  """Combine the results of different magnitudes in one file.

  Args:
    parent_dir: The directory from which to start with this combination.
  """
  magnitude_dirs = os.listdir(parent_dir)
  magnitudes = {
      'magnitudes': [],
      'type': 'magnitudes'
  }
  for magnitude_dir in magnitude_dirs:
    magnitude_path = os.path.join(parent_dir, magnitude_dir, 'results.json')
    with open(magnitude_path, 'r') as magnitude_file:
      results = magnitude_file.read()
      json_results = json.loads(results)
      magnitudes['magnitudes'].append(json_results)
  results_path = os.path.join(parent_dir, 'results.json')
  results_file = open(results_path, 'w')
  json.dump(magnitudes, results_file)
  results_file.close()


def combine_per_layer():
  layer_dirs = os.listdir(FLAGS.results_dir)
  for layer_dir in layer_dirs:
    layer_path = os.path.join(FLAGS.results_dir, layer_dir)
    combine_magnitudes(layer_path)


def main(_):
  if FLAGS.per_layer:
    combine_per_layer()
  else:
    combine_magnitudes(FLAGS.results_dir)

if __name__ == '__main__':
  flags.mark_flag_as_required('results_dir')
  app.run(main)
