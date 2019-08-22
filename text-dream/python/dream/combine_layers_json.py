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

"""Combines the results of multiple layers into one JSON file."""
import json
import os
from absl import app
from absl import flags

# Command Line Arguments
FLAGS = flags.FLAGS
flags.DEFINE_string('results_dir', None,
                    'where to find the reconstruction results')


def main(_):
  layer_dirs = os.listdir(FLAGS.results_dir)
  layers = {
      'layers': [],
      'type': 'layers'
  }
  for layer_dir in layer_dirs:
    layer_path = os.path.join(FLAGS.results_dir, layer_dir, 'results.json')
    with open(layer_path, 'r') as layer_file:
      results = layer_file.read()
      json_results = json.loads(results)
      layers['layers'].append(json_results)
  results_path = os.path.join(FLAGS.results_dir, 'layer_results.json')
  results_file = open(results_path, 'w')
  json.dump(layers, results_file)
  results_file.close()

if __name__ == '__main__':
  flags.mark_flag_as_required('results_dir')
  app.run(main)

