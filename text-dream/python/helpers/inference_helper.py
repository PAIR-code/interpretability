"""Run inference on the BERT model provided."""
import torch


def run_inference(before, within, after, position_embeddings,
                  sentence_embeddings, attention_mask, embedding_map, model):
  """Run inference on a given one hot embedding split into three parts.

  Args:
    before: Tensor containing all the one_hot values before the changed part.
    within: The changed one_hot part of the sentence.
    after: Tensor containing all the one_hot values after the changed part.
    position_embeddings: Positional embeddings used by BERT.
    sentence_embeddings: Sentence embeddings used by BERT.
    attention_mask: Used by BERT for inference.
    embedding_map: Containing all the token embeddings for BERT.
    model: BERT model to run inference on.

  Returns:
    layers: The layer activations of the model.
  """
  one_hots = torch.cat([before, within, after], dim=1)
  # Get the word embedding from the smooth one_hots vector
  words_embeddings = torch.matmul(one_hots, embedding_map.embedding_map)
  # Assemble the actual embedding
  embeddings = words_embeddings + position_embeddings + sentence_embeddings
  embeddings = model.embeddings.LayerNorm(embeddings)
  # Get the prediction by the model
  head_mask = [None, None, None, None, None, None, None, None, None, None, None,
               None]
  layers = model.encoder(embeddings, attention_mask, head_mask=head_mask)
  # Reorder to get more intuitive ordering of batches, layers, words, neurons
  layers = torch.stack(layers).permute(1, 0, 2, 3)
  return layers


def run_inference_vanilla(tokens_tensor, segments_tensor, model):
  """Run inference on the model.

  Args:
    tokens_tensor: The tokens to infer the activation from.
    segments_tensor: Segments of the sequence to retrieve the activation for.
    model: The model to run inference on.

  Returns:
    layers_act: Activation of the model given the parameters.
  """
  with torch.no_grad():
    layers_act, _ = model(tokens_tensor, segments_tensor)
    # Reorder to get more intuitive ordering of batches, layers, words, neurons
    layers_act = torch.stack(layers_act).permute(1, 0, 2, 3)
  return layers_act


def run_inference_mlm(one_hots, position_embeddings, sentence_embeddings,
                      attention_mask, embedding_map, model):
  """Run inference on BERT.

  Args:
    one_hots: Tensor containing the one_hots used for the inference.
    position_embeddings: Positional embeddings used by BERT.
    sentence_embeddings: Sentence embeddings used by BERT.
    attention_mask: Used by BERT for inference.
    embedding_map: Containing all the token embeddings for BERT.
    model: BERT model to run inference on.

  Returns:
    prediction_scores: The prediction scores of the model.
  """
  # Get the word embedding from the smooth one_hots vector
  words_embeddings = torch.matmul(one_hots, embedding_map.embedding_map)
  # Assemble the actual embedding
  embeddings = words_embeddings + position_embeddings + sentence_embeddings
  embeddings = model.bert.embeddings.LayerNorm(embeddings)
  # Get the prediction by the model
  head_mask = [None, None, None, None, None, None, None, None, None, None, None,
               None]
  layers = model.bert.encoder(embeddings, attention_mask, head_mask=head_mask)
  encoded_layers = layers[-1]
  prediction_scores = model.cls(encoded_layers)
  return prediction_scores
