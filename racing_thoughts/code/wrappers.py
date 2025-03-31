"""Wrappers for patching.
"""
import torch

class AttnWrapper(torch.nn.Module):
  def __init__(self, attn):
    super().__init__()
    self.attn = attn
    self.activations = None

  def forward(self, *args, **kwargs):
    output = self.attn(*args, **kwargs)
    self.activations = output[0]
    return output


class BlockOutputWrapper(torch.nn.Module):
  def __init__(self, block, unembed_matrix, norm):
    super().__init__()
    self.block = block
    self.unembed_matrix = unembed_matrix
    self.norm = norm

    self.block.self_attn = AttnWrapper(self.block.self_attn)
    self.post_attention_layernorm = self.block.post_attention_layernorm

    self.attn_out_unembedded = None
    self.intermediate_resid_unembedded = None
    self.mlp_out_unembedded = None
    self.block_out_unembedded = None

    self.activations = None
    self.add_activations = None

    self.patch_activations = None
    self.patch_activations_pos = None
    self.has_patched = False

    self.save_internal_decodings = False

    self.only_add_to_first_token = False
    self.is_first_token = True

  def should_perturb_activations(self):
    if self.add_activations is None:
      return False
    if self.only_add_to_first_token:
      return self.is_first_token
    return True

  def should_patch_activations(self):
    if self.patch_activations is None or self.has_patched:
      return False
    return True

  def forward(self, *args, **kwargs):
    output = self.block(*args, **kwargs)
    self.activations = output[0] # [batch, toks, hidden_dim]
    if self.should_perturb_activations():
      if self.add_activations_positions is not None:
        # Add add_activations to specific tokens
        for pos in self.add_activations_positions:
          output[0][0][pos] += self.add_activations
      else:
        # Add add_activations to every token
        output = (output[0] + self.add_activations,) + output[1:]
        self.is_first_token = False

    if self.should_patch_activations():
      for pos in self.patch_activations_pos:
        output[0][0][pos] = self.patch_activations
      
      # Editing this and simply running reset_all() after every patch
      # When running the generate function in the newer versions of
      # transformers, leaving this flag means that most of the generations 
      # do not include the patched representation,

      #self.has_patched = True

    if not self.save_internal_decodings:
      return output

    # Whole block unembedded
    self.block_output_unembedded = self.unembed_matrix(self.norm(output[0]))

    # Self-attention unembedded
    attn_output = self.block.self_attn.activations
    self.attn_out_unembedded = self.unembed_matrix(self.norm(attn_output))

    # Intermediate residual unembedded
    attn_output += args[0]
    self.intermediate_resid_unembedded = self.unembed_matrix(self.norm(attn_output))

    # MLP unembedded
    mlp_output = self.block.mlp(self.post_attention_layernorm(attn_output))
    self.mlp_out_unembedded = self.unembed_matrix(self.norm(mlp_output))

    return output

  def add(self, activations, token_positions=None):
    self.add_activations = activations
    self.add_activations_positions = token_positions

  def patch(self, patch_activations, patch_activations_pos):
    self.patch_activations = patch_activations
    self.patch_activations_pos = patch_activations_pos

  def reset(self):
    self.add_activations = None
    self.add_activations_positions = None

    self.patch_activations = None
    self.patch_activations_pos = None
    self.activations = None
    self.block.self_attn.activations = None
    self.is_first_token = True
    self.has_patched = False
