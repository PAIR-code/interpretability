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

"""Used to retrieve a attention mask for the provided input."""
import torch


def get_attention_mask(input_ids):
  """Get the default attention mask.

  Args:
    input_ids: Ids representing the input tokens, used for the mask length.

  Returns:
    extended_attention_mask: The attention mask to be used with the model.
  """
  attention_mask = torch.ones_like(input_ids)
  # We create a 3D attention mask from a 2D tensor mask.
  # Sizes are [batch_size, 1, 1, to_seq_length]
  # So we can broadcast to [batch_size, num_heads, from_seq_length,
  # to_seq_length]
  extended_attention_mask = attention_mask.unsqueeze(1).unsqueeze(2)
  extended_attention_mask = extended_attention_mask.to(dtype=torch.float)
  # Since attention_mask is 1.0 for positions we want to attend and 0.0 for
  # masked positions, this operation will create a tensor which is 0.0 for
  # positions we want to attend and -10000.0 for masked positions.
  # Since we are adding it to the raw scores before the softmax, this is
  # effectively the same as removing these entirely.
  extended_attention_mask = (1.0 - extended_attention_mask) * -10000.0
  return extended_attention_mask
