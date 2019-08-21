"""Handles all functionality related to embeddings."""
import os
import numpy as np
import torch
import activation_helper
import embeddings_config


class EmbeddingMap(object):
  """Holds and handles embeddings for all tokens."""

  def __init__(self, device, model):
    # Initialize an empty embedding map
    self.embedding_map_dict = []
    # Obtain a word embedding for each token in the vicabulary
    for i in range(embeddings_config.NUM_EMBEDDED_TOKENS):
      tokens_tensor = torch.tensor([[i]], device=device, requires_grad=False)
      self.embedding_map_dict.append(
          model.embeddings.word_embeddings(tokens_tensor)[0][0])
    # We want this to be a leaf node that has nothing to backprop to.
    # This improves backprop speed by a lot! Thus, detach.
    self.embedding_map = torch.stack(
        self.embedding_map_dict).clone().detach().requires_grad_(False)
    self.mean_distance = torch.mean(torch.norm(self.embedding_map, dim=1))


# Get the closest embedding to a embedding vector
def get_closest_embedding(embedding, embedding_map, cosine=False, top_k=100,
                          furthest=False):
  """Get the closest embeddings to a given embedding.

  Args:
    embedding: The embedding to search other close embeddings for.
    embedding_map: Contains all embeddings.
    cosine: Whether to use cosine similarity.
    top_k: How many of the top similar embeddings to get.
    furthest: Whether to instead of the closest embedding, get the furthest.

  Returns:
    topk: Top candidates for closest activations.
  """
  reshaped_embedding = embedding.repeat(embeddings_config.NUM_EMBEDDED_TOKENS,
                                        1)
  if cosine:
    pairwise = torch.cosine_similarity(embedding_map.embedding_map,
                                       reshaped_embedding)
    return torch.topk(pairwise, top_k, largest=furthest)
  else:
    pairwise = torch.pairwise_distance(embedding_map.embedding_map,
                                       reshaped_embedding)
    return torch.topk(pairwise, top_k, largest=furthest)


def get_closest_embeddings(embeddings, embedding_map, cosine=False):
  """Get the closest embeddings for the current word representations.

  Args:
    embeddings: The current token embeddings.
    embedding_map: The embedding map to lookup similar embeddings from.
    cosine: Whether to use cosine similarity.

  Returns:
    embedding_ids: Ids for realistic embeddigns similar to current embeddings.
    distances: The distances of these embeddings to the actual embedding.
  """
  # Placeholders for tokens and distances to the actual embedding
  embedding_ids = []
  distances = []
  # Do this for each word individually
  for i in range(embeddings.size()[1]):
    # Get the  token and distance for the current word, and append them to the
    # list of tokens and distances
    distance, embedding = get_closest_embedding(embeddings[0][i], embedding_map,
                                                cosine=cosine, top_k=1)
    embedding_ids.append(embedding[0].item())
    distances.append(distance[0].item())
  return embedding_ids, distances


def analyze_current_embedding(fused_one_hots, embedding_map, modify_start,
                              modify_end, device, position_embeddings,
                              sentence_embeddings, attention_mask, model,
                              word_id, neuron_id, layer_id, normalize,
                              tokenizer, cosine=False):
  """Analyze the activation and closest tokens of the current embedding.

  Args:
    fused_one_hots: The one hots tensor representing all current tokens.
    embedding_map: The embedding map holding all embeddings.
    modify_start: The start index of the modifyable content.
    modify_end: The end index of the modifyable content.
    device: The device on which to store the variables.
    position_embeddings: The positional embeddings of the tokens.
    sentence_embeddings: Sentence embedding for the sequence.
    attention_mask: The attention mask used for inference.
    model: The model used for inference runs.
    word_id: The id of the word to get activations for.
    neuron_id: The id of the neuron to get activations for.
    layer_id: The id of the layer to get activationd for.
    normalize: Whether to normalize the activations.
    tokenizer: The tokenizer used to convert between ids and tokens.
    cosine: Whether to use cosine similarity for finding similar embeddings.

  Returns:
    tokens: The tokens for the closest embedding.
    activation: The activation of this snapped embedding.
  """
  # Get the word embedding from the smooth one_hots vector
  words_embeddings = torch.matmul(fused_one_hots, embedding_map.embedding_map)
  indices, _ = get_closest_embeddings(words_embeddings, embedding_map,
                                      cosine=cosine)
  # Get the activation
  activation = activation_helper.get_ids_activation(
      np.asarray(indices), position_embeddings, sentence_embeddings,
      attention_mask, modify_start, modify_end, word_id, neuron_id, layer_id,
      normalize, embedding_map, model, device)
  tokens = tokenizer.convert_ids_to_tokens(indices)
  return tokens, activation


def get_embeddings(tokens_tensor, segments_tensor, model):
  """Obtain embeddigs for word, position, and sequence.

  adapted from:
  https://github.com/huggingface/pytorch-pretrained-BERT/blob/
  2a329c61868b20faee115a78bdcaf660ff74cf41/pytorch_pretrained_bert/
  modeling.py#L264-L277)

  Args:
    tokens_tensor: Tokens for which to get the tokens embedding.
    segments_tensor: Used to generate the segments embedding.
    model: The model used for inference.

  Returns:
    words_embeddings: Word embeddings for the given tokens.
    position_embeddings: Positional embeddings for the tokens.
    sentence embeddings: Sentence embeddings for the tokens.
  """
  seq_length = tokens_tensor.size(1)
  position_ids = torch.arange(seq_length, dtype=torch.long,
                              device=tokens_tensor.device)
  position_ids = position_ids.unsqueeze(0).expand_as(tokens_tensor)
  if segments_tensor is None:
    segments_tensor = torch.zeros_like(tokens_tensor)
  # Get the three token types (words, positions, and sentences individually)
  words_embeddings = model.embeddings.word_embeddings(tokens_tensor)
  position_embeddings = model.embeddings.position_embeddings(position_ids)
  sentence_embeddings = model.embeddings.token_type_embeddings(segments_tensor)
  return words_embeddings, position_embeddings, sentence_embeddings


def write_embedding(layers_act, emb_pos, tokens, folder):
  """Write the activations for the specified token per layer to a folder.

  Args:
    layers_act: The activations of each layer in BERT.
    emb_pos: The position of the written embedding in the sentence.
    tokens: The tokens in the currently inspected sentence.
    folder: Where to write the activations to.
  """
  sent = u'_'.join(tokens)
  for layer in range(layers_act.shape[1]):
    file_name = str(emb_pos) + u'_V_' + str(len(tokens)) + u'_' + sent + u'.np'
    file_name = file_name.replace('[', '')
    file_name = file_name.replace(']', '')
    file_name = file_name.replace('/', '')
    path = os.path.join(folder, str(layer), file_name)
    try:
      activation_file = open(path, 'wb')
      np.save(activation_file,
              layers_act[0][layer][emb_pos].data.cpu().numpy())
    except:
      print('Path invalid: {}'.format(path.encode('utf8')))
