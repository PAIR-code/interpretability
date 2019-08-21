"""Used for optimization steps during dreaming."""
import torch
import torch.nn.functional as F
from google3.learning.vis.bert_dream.helpers import activation_helper
from google3.learning.vis.bert_dream.helpers import inference_helper
from google3.learning.vis.bert_dream.helpers import one_hots_helper
from google3.learning.vis.bert_dream.helpers import output_helper


def step_towards_activation(optimizer, before, modify, after, pos_embeddings,
                            sentence_embeddings, att_mask, temperature,
                            iteration, gumbel, write_top_k, k_value, data,
                            word_id, neuron_id, layer_id, modify_start,
                            modify_end, tokenizer, embedding_map, model,
                            target_activation):
  """Optimize the sentence towards the target activation.

  Args:
    optimizer: The optimizer to be used.
    before: The tensor for everything before the modifyable content.
    modify: The tensor of the modifyable content.
    after: The tensor for everything after the modifiable content.
    pos_embeddings: The positional embeddings used for inference.
    sentence_embeddings: The sentence embeddings for inference.
    att_mask: The attention mask used for inference.
    temperature: The temperature used for making the softmax spike.
    iteration: Current iteration number of the optimization process.
    gumbel: Whether to use gumbel noise.
    write_top_k: Whether to write the top-rated tokens per iteration.
    k_value: How many tokens to write to top_k.
    data: Placeholder for the top_k data.
    word_id: Word to get the activation for.
    neuron_id: Neuron to get the activation for.
    layer_id: Layer to get the activation for.
    modify_start: The start index of the modifiable content.
    modify_end: The end index of the modifyable content.
    tokenizer: Used for converting between tokens and ids.
    embedding_map: Holding all the token embeddings for BERT.
    model: Model to run inference on.
    target_activation: The activation we are aiming towards.

  Returns:
    max_values: The maximal values for the current token representations.
    token_ids: The token ids of the current representation.
    loss: The current loss towards the target activation.
  """
  # Reset the gradient
  optimizer.zero_grad()
  # Softmax over the one-hots
  one_hots_sm = one_hots_helper.softmax_one_hots(modify, temperature, gumbel)
  fused_one_hots = torch.cat([before, one_hots_sm, after], dim=1)
  # Check if top_k should be written
  if write_top_k:
    output_helper.write_top_ks(fused_one_hots, k_value, iteration, data,
                               modify_start, modify_end, tokenizer)
  # Get the activation
  layer_activations = inference_helper.run_inference(
      before, one_hots_sm, after, pos_embeddings, sentence_embeddings, att_mask,
      embedding_map, model)
  activation = activation_helper.get_activations(layer_activations, word_id,
                                                 neuron_id, layer_id)
  # Calculate the loss as an inverse activation of the layer to be optimised for
  # (adam wants to minimize the training loss, we want to maximize the
  # activation)
  loss = F.mse_loss(activation, target_activation)
  # Backpropagate the loss
  loss.backward(retain_graph=True)
  # Optimize the word vector based on that loss
  optimizer.step()
  # Get the actual tokens and distances to the embedding for this modified
  # embedding
  one_hots_sm = one_hots_helper.softmax_one_hots(modify, temperature, gumbel)
  fused_one_hots = torch.cat([before, one_hots_sm, after], dim=1)
  max_values, token_ids = one_hots_helper.get_tokens_from_one_hots(
      fused_one_hots)
  return max_values, token_ids, loss
