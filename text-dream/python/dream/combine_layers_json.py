"""Combines the results of multiple layers into one JSON file."""
import json
import os
from absl import app
from absl import flags
from google3.pyglib import gfile

# Command Line Arguments
FLAGS = flags.FLAGS
flags.DEFINE_string('results_dir', None,
                    'where to find the reconstruction results')


def main(_):
  layer_dirs = gfile.ListDir(FLAGS.results_dir)
  layers = {
      'layers': [],
      'type': 'layers'
  }
  for layer_dir in layer_dirs:
    layer_path = os.path.join(FLAGS.results_dir, layer_dir, 'results.json')
    with gfile.Open(layer_path, 'r') as layer_file:
      results = layer_file.read()
      json_results = json.loads(results)
      layers['layers'].append(json_results)
  results_path = os.path.join(FLAGS.results_dir, 'layer_results.json')
  results_file = gfile.Open(results_path, 'w')
  json.dump(layers, results_file)
  results_file.close()

if __name__ == '__main__':
  flags.mark_flag_as_required('results_dir')
  app.run(main)

