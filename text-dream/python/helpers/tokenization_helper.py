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

"""Used to tokenize sentences correctly."""
import torch


def tokenize_input_sentence(tokenizer, sentence, sentence2, mask_word=-1):
  """Tokenize the input sentence and return tokenized tensors.

  Args:
    tokenizer: The tokenizer to be used for the conversion.
    sentence: The sentence to be tokenized.
    sentence2: The optional second part of the sentence.
    mask_word: Optional index to be replaced with the MASK token.

  Returns:
    tokens: The tokens obtained from the sentence.
  """
  # Set up the sentence structure if it has not been tokenized yet
  if not sentence.startswith(u'[CLS]'):
    sentence = u'[CLS] ' + sentence + u' [SEP]'
    if sentence2:
      sentence = sentence + ' ' + sentence2 + u' [SEP]'
  # Tokenized input
  tokens = tokenizer.tokenize(sentence)
  if mask_word > -1:  # Replace a token with MASK
    tokens[mask_word] = '[MASK]'
  return tokens


def tensors_from_tokens(tokenizer, tokens, device):
  """Obtain tokens and segments tensors from token ids.

  Args:
    tokenizer: Tokenizer to be used for the conversion to ids.
    tokens: Tokens to be converted and served as a tensor.
    device: The device to hold the tensors in memory.

  Returns:
    tokens_tensor: Tensor holding the token representation of the sentence.
    segments_tensor: Tensor holding the segment representation of the sentence.
  """
  # Convert token to vocabulary indices
  indexed_tokens = tokenizer.convert_tokens_to_ids(tokens)
  # Define sentence A and B indices associated to 1st and 2nd sentences
  sep_idxs = [-1] + [i for i, v in enumerate(tokens) if v == '[SEP]']
  segments_ids = []
  for i in range(len(sep_idxs) - 1):
    segments_ids += [i] * (sep_idxs[i+1] - sep_idxs[i])
  # Convert inputs to PyTorch tensors and make them accessible to CUDA
  tokens_tensor = torch.tensor([indexed_tokens], device=device)
  segments_tensor = torch.tensor([segments_ids], device=device)
  return tokens_tensor, segments_tensor
