"""Handles activations for a given model result."""
import torch
from google3.learning.vis.bert_dream.helpers import inference_helper
from google3.learning.vis.bert_dream.helpers import one_hots_helper


def get_activation(activations, word_id, neuron_id, layer_id, normalize,
                   sample=0):
  """Get the average activation value for a parametrization.

  Args:
    activations: The embedding values for all layers of the model.
    word_id: The index of the word for which to get the activation for.
    neuron_id: The index of the neuron for which to get the activation for.
    layer_id: The index of the layer for which to get the activation for.
    normalize: Whether to normalize the activation across all others.
    sample: Which sample to used in batched settings.

  Returns:
    activation: The activation that has been requested.
  """
  lid, wid, nid = null_index_check(layer_id, word_id, neuron_id)
  sample_activations = activations[sample]  # Activations for one batch element
  if wid is None:  # Activation activations for the whole sentence
    activations = torch.mean(sample_activations, dim=1)  # Mean across all words
    if nid is None:  # Activation for the whole layer
      activations = torch.mean(activations, dim=1)  # Mean across all neurons
      activation = activations[lid]  # Select layer
    else:  # Activation for a specific neuron
      activation = activations[lid][nid]  # Select layer and neuron
    # Normalization to relate the activation to other layers/neurons
    # for the whole sentence
    if normalize:
      activation = activation / torch.norm(sample_activations)
  else:  # Activation for a specific Word
    if nid is None:  # Activation for the whole layer
      activations = torch.mean(sample_activations, dim=2)  # Mean across neurons
      activation = activations[lid][wid]  # Select word and layer
    else:  # Activation for only one neuron
      activation = sample_activations[lid][wid][nid]  # Sel. word, layer, neuron
    # Normalization to relate the activation to other layers/neurons
    # for that word
    if normalize:
      activation = activation / torch.norm(sample_activations[:, wid, :])
  return activation


def get_activations(activations, word_id, neuron_id, layer_id, sample=0):
  """Get the activations from a inference result.

  Args:
    activations: The inference result for all layers across batches.
    word_id: The word for which to fetch the activation.
    neuron_id: The neuron for which to fetch the activation.
    layer_id: The layer for which to fetch the activation.
    sample: Which training sample to look at for batched training.

  Returns:
    activations: Activations for the current iteration.
  """
  lid, wid, nid = null_index_check(layer_id, word_id, neuron_id)
  activations = activations[sample]
  if word_id is None:  # Activations for the whole sentence
    if neuron_id is None:  # Activations for the whole layer
      activations = activations[lid]
    else:  # Activations for all words in one layer for one neuron
      activations = activations[lid, :, nid]
  else:
    if neuron_id is None:  # Activations for one word and layer
      activations = activations[lid][wid]
    else:  # Activations for one layer, word, and neuron
      activations = activations[lid][wid][nid]
  return activations


def get_ids_activation(ids, pos_embeddings, sentence_embeddings,
                       att_mask, modify_start, modify_end, word_id,
                       neuron_id, layer_id, normalize, embedding_map, model,
                       device, average=False):
  """Get the activations for an id-sequence.

  Args:
    ids: The ids to get the activations for.
    pos_embeddings: Positional embeddings to run inference with.
    sentence_embeddings: Sentence embeddings to run inference with.
    att_mask: Attention mask used during inference.
    modify_start: The start id of the modyfiable sequence.
    modify_end: The end id of the modyfiable sequence.
    word_id: The word to get the activations for.
    neuron_id: The neuron to get the activations for.
    layer_id: The layer to get the activations for.
    normalize: Whether to normalize the activations.
    embedding_map: The embedding map used to get embeddings from one-hots.
    model: Model to run inference on.
    device: Where to place new variables.
    average: Whether to the resulting activation to an average value.

  Returns:
    activations: Activations for the id sequence.
  """
  # Get a one_hot token for these ids
  before, within, after = one_hots_helper.get_one_hots(ids, modify_start,
                                                       modify_end, device)
  # Do not apply a gradient to this model run
  with torch.no_grad():
    layer_activations = inference_helper.run_inference(
        before, within, after, pos_embeddings, sentence_embeddings, att_mask,
        embedding_map, model)
  if average:
    activation = get_activation(layer_activations, word_id, neuron_id, layer_id,
                                normalize)
  else:
    activation = get_activations(layer_activations, word_id, neuron_id,
                                 layer_id)
  return activation


def null_index_check(layer_id, word_id, neuron_id):
  """Checks if some of the indices should be nulled.

  Args:
    layer_id: The index for the layer.
    word_id: The index for the word.
    neuron_id: The index for the neuron.

  Returns:
    lid: Checked layer id.
    wid: Checked word id.
    nid: Checked neuron id.
  """
  lid = layer_id if layer_id != -1 else None
  wid = word_id if word_id != -1 else None
  nid = neuron_id if neuron_id != -1 else None
  return lid, wid, nid
