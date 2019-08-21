"""Handles common code used in linear classification contexts."""
import os
import numpy as np
import torch


def get_classification_head(device, layer_id, trained_variables_dir):
  shift_path = os.path.join(trained_variables_dir, str(layer_id),
                            'final_weights.np')
  shift_file = open(shift_path, 'rb')
  shift = np.load(shift_file)
  shift_tensor = torch.tensor(shift, requires_grad=False)
  shift_tensor = shift_tensor.to(device)
  return shift_tensor
