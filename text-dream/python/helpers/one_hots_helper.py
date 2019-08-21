"""Provides functions related to one-hot handling and conversion of tokens."""
import numpy as np
import torch
from google3.learning.vis.bert_dream.helpers import embeddings_config


def get_one_hots(indices, modify_start, modify_end, device, grad=True):
  """Get one-hot vectors for each relevant part of the input.

  Args:
    indices: The indices that should be hot.
    modify_start: The start index of words that are to be modified.
    modify_end: The end index of words that are to be modified.
    device: Where to store the newly created variables.
    grad: Does the modifyable part require a gradient?

  Returns:
    before: One-hot tensor for anything before the word to be changed.
    change: One-hot tensor for the word to be changed.
    after: One-hot tensor for anything after the word to be changed.
  """
  # Numpy array of zeros with correct shape
  one_hot_numpy = np.zeros((1, indices.size,
                            embeddings_config.NUM_EMBEDDED_TOKENS))
  # Set the word representative to one
  one_hot_numpy[0, np.arange(indices.size), indices] = 1
  # Convert the numpy array to a tensor
  before = torch.tensor(one_hot_numpy[[0], 0:modify_start], device=device,
                        dtype=torch.float, requires_grad=False)
  change = torch.tensor([one_hot_numpy[0, modify_start:modify_end+1, :]],
                        device=device, dtype=torch.float, requires_grad=grad)
  after = torch.tensor(one_hot_numpy[[0], (modify_end+1):], device=device,
                       dtype=torch.float, requires_grad=False)
  return before, change, after


# Return the tokens that correspond to the
# maximally activated element in the one-hot tensor
def get_tokens_from_one_hots(one_hots):
  return torch.max(one_hots, 2)


# Force the word vector to be capped at one and sum to one
def softmax_one_hots(one_hots, temperature, gumbel=True):
  if gumbel:
    gumbel_noise = -torch.log(
        -torch.log(torch.rand_like(one_hots, requires_grad=False)))
    return torch.nn.functional.softmax((torch.log(
        torch.clamp_min(one_hots, 1e-10)) + gumbel_noise) / temperature, -1)
  else:
    return torch.nn.functional.softmax(one_hots / temperature, -1)


def get_one_hots_mlm(indices, cbs, cbe, cas, cae, device, grad=True):
  """Get the one_hot vectors that are used for inference and optimization.

  Args:
    indices: The indices array to get the one_hots from.
    cbs: The index of the start of the changeable part before maximize_word.
    cbe: The index of the end of the changeable part before maximize_word.
    cas: The index of the start of the changeable part after maximize_word.
    cae: The index of the end of the changeable part after maximize_word.
    device: The device to store new tensors on.
    grad: Whether the changeable parts should be differentiable.

  Returns:
    before: Everything that can't be changed before the maximize_word.
    change1: Everything that can be changed before the maximize_word.
    max_part: Everything that can't be changed around the maximize_word.
    change2: Everything that can be changed after the maximize_word.
    after: Everything that can't be changed after the maximize_word.
  """
  # Numpy array of zeros with correct shape
  one_hot_numpy = np.zeros((1, indices.size,
                            embeddings_config.NUM_EMBEDDED_TOKENS))
  # Set the word representative to one
  one_hot_numpy[0, np.arange(indices.size), indices] = 1
  # Convert the numpy array to a tensor
  before = torch.tensor(one_hot_numpy[[0], 0:cbs], device=device,
                        dtype=torch.float, requires_grad=False)
  max_part = torch.tensor(one_hot_numpy[[0], (cbe+1):cas], device=device,
                          dtype=torch.float, requires_grad=False)
  after = torch.tensor(one_hot_numpy[[0], (cae+1):], device=device,
                       dtype=torch.float, requires_grad=False)
  if grad:
    change1 = torch.tensor(one_hot_numpy[[0], cbs:(cbe+1)], device=device,
                           dtype=torch.float, requires_grad=True)
    change2 = torch.tensor(one_hot_numpy[[0], cas:(cae+1)], device=device,
                           dtype=torch.float, requires_grad=True)
  else:
    change1 = torch.tensor(one_hot_numpy[[0], cbs:(cbe+1)], device=device,
                           dtype=torch.float, requires_grad=False)
    change2 = torch.tensor(one_hot_numpy[[0], cas:(cae+1)], device=device,
                           dtype=torch.float, requires_grad=False)
  return before, change1, max_part, change2, after
