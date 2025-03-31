"""Perform attention mass analysis and attention intervention.
"""

import argparse
import os
from collections import defaultdict
import gc

# Scienfitic packages
import numpy as np
import pandas as pd
import torch
torch.set_grad_enabled(False)

from utils import prompt_to_tokens, ModelAndTokenizer

from functools import partial

from transformer_lens import HookedTransformer
import transformer_lens.utils as utils


from tqdm import tqdm
tqdm.pandas()


def configure_run(args):
  """Given run args, return model and config file to define the run.
  """
  # Load ModelAndTokenizer object
  mt = ModelAndTokenizer(
      args.model_name,
      low_cpu_mem_usage=True,
      torch_dtype=torch.float16,
      device=args.device
      )

  # Establish I/O
  os.makedirs(os.path.join("..", "results", args.model_name, args.dataset),
            exist_ok=True)
  inpath = os.path.join("..", "data")
  outpath = os.path.join("..", "results", args.model_name, args.dataset)

  # Model-Specific Metadata
  if args.model_name == "Llama-2-13b-chat-hf":
    yes_logit = 3869
    no_logit = 1939
    num_layers = 40
    hooked_name = "meta-llama/Llama-2-13b-chat-hf"
    index_prefix = "llama_"
  elif args.model_name == "gemma-2-9b-it":
    yes_logit = 6287
    no_logit = 1307
    num_layers = 42
    hooked_name = "google/gemma-2-9b-it"
    index_prefix = "gemma_"
  elif args.model_name == "gemma-2-2b-it":
    yes_logit = 6287
    no_logit = 1307
    num_layers = 26
    hooked_name = "google/gemma-2-2b-it"
    index_prefix = "gemma_"
  else:
    raise ValueError(
        "model_name must be one of [Llama-2-13b-chat-hf, gemma-2-9b-it, gemma-2-2b-it]"
        )
  # Dataset-Specific Metadata
  # If using Gemma 2b, load in Gemma 9b file because it's tokenized the same
  if args.dataset == "polysemous":
    config = {
        "interleaved_file": os.path.join(
            inpath,
            "_".join(
                [args.dataset, "interleaved", str(args.n_distractors) + ".csv"]
            )
            ),
        "entity_name": "word",
        "entity_indices": "word_indices",
        "yes_logit": yes_logit,
        "no_logit": no_logit,
        "outfile": os.path.join(outpath, args.out_prefix),
        "num_layers": num_layers,
        "intervention_range": args.intervention_range,
        "model_name": hooked_name,
        "device": args.device,
        "start_layer": args.start_layer,
        "ablate_type": args.ablate_type,
        "edit_type": args.edit_type,
        "index_prefix": index_prefix,
        "cue_index": args.cue_idx,
    }
  elif args.dataset == "gender":
    config = {
        "interleaved_file": os.path.join(
            inpath,
            "_".join(
                [args.dataset, "interleaved", str(args.n_distractors) + ".csv"]
            )
            ),
        "entity_name": "profession",
        "entity_indices": "profession_indices",
        "yes_logit": yes_logit,
        "no_logit": no_logit,
        "outfile": os.path.join(outpath, args.out_prefix),
        "num_layers": num_layers,
        "intervention_range": args.intervention_range,
        "model_name": hooked_name,
        "device": args.device,
        "start_layer": args.start_layer,
        "ablate_type": args.ablate_type,
        "edit_type": args.edit_type,
        "index_prefix": index_prefix,
        "cue_index": args.cue_idx,
    }
  elif args.dataset == "factual":
    config = {
        "interleaved_file": os.path.join(
            inpath,
            "_".join(
                [args.dataset, "interleaved", str(args.n_distractors) + ".csv"]
            )
            ),
        "entity_name": "country",
        "entity_indices": "country_indices",
        "yes_logit": yes_logit,
        "no_logit": no_logit,
        "outfile": os.path.join(outpath, args.out_prefix),
        "num_layers": num_layers,
        "intervention_range": args.intervention_range,
        "model_name": hooked_name,
        "device": args.device,
        "start_layer": args.start_layer,
        "ablate_type": args.ablate_type,
        "edit_type": args.edit_type,
        "index_prefix": index_prefix,
        "cue_index": args.cue_idx,
    }
  else:
    raise ValueError("dataset must be one of [polysemous, gender, factual]")

  return mt, config

# Helper function
def tokens_str_to_list(tokens_str):
  token_list = tokens_str[1:-1].split(",")
  token_list = [int(token) for token in token_list]
  return token_list


def attention_mass_analysis(mt, config):
  """Analyze how much attention mass is located on key entity over layers.

  Args:
    mt: ModelAndTokenizer object
    config: Run Config
  """

  # Read in data, establish results dictionary
  layer2mass = defaultdict(list)
  interleaved_data = pd.read_csv(config["interleaved_file"])
  interleaved_data = interleaved_data[interleaved_data["interleaved_idx"] == config["cue_index"]]

  # Iterate through interleaved data
  for i, row in interleaved_data.iterrows():
    inputs = prompt_to_tokens(mt.tokenizer, row["prompt"]).to(mt.model.device)
    entity_idx = tokens_str_to_list(row[config["index_prefix"] + config["entity_indices"]])[-1]

    # Return attention scores per token
    with torch.no_grad():
      attentions = mt.model(inputs, output_attentions=True).attentions

    # Record average attention mass from question tokens to key entity for
    # each layer.
    for layer in range(config["num_layers"]):
      summed_attention_mass = 0
      summed_heads = attentions[layer][0].sum(0)
      seq_length = len(summed_heads)

      # Average attention mass over all ensuing tokens
      divisor = len(range(entity_idx + 1, seq_length))
      for reading_position in range(entity_idx + 1, seq_length):
        summed_attention_mass += summed_heads[reading_position][entity_idx]

      layer2mass[layer].append(summed_attention_mass.cpu() / divisor)

  # Record average mass, write to output file
  for layer in range(config["num_layers"]):
    layer2mass[layer] = np.mean(layer2mass[layer])

  results = {"layer": [], "mass": []}
  for layer in layer2mass:
    results["layer"].append(layer)
    results["mass"].append(layer2mass[layer])

  pd.DataFrame.from_dict(results).to_csv(config["outfile"] + "_mass.csv")


# Function to zero the attention paid to a token
def zero_attention_pattern(
    attention_patterns, hook, ablate_positions, write_pos,
):

  for ablate_pos in ablate_positions:
    attention_patterns[:, :, write_pos, ablate_pos] = (
        0 * attention_patterns[:, :, write_pos, ablate_pos]
    )

  # renormalize
  attention_patterns[:, :, write_pos] =\
  attention_patterns[:, :, write_pos] / torch.sum(
      attention_patterns[:, :, write_pos], dim=-1
      ).unsqueeze(2)
  return attention_patterns

# Turn a huggingface model into a hooked transformer object
def hook_model(mt, config):

  tokenizer = mt.tokenizer
  model = mt.model
  model.to("cpu")

  hooked_model = HookedTransformer.from_pretrained(
      config["model_name"],
      hf_model=model,
      device=config["device"],
      fold_ln=False,
      center_writing_weights=False,
      center_unembed=False,
      tokenizer=tokenizer,
      dtype=torch.float16,
  )

  return hooked_model


def get_intervened_logit_diffs(
    hooked_model,
    tokenizer,
    prompt,
    positions_to_intervene,
    positions_to_edit,
    layers,
    logit1=None,
    logit2=None,
    model_output=None,
    system_prompt=None,
):
  """Establish forward hooks to zero attention, return logit diff.

  Args:
    hooked_model: HookedTransformer object
    tokenizer: Tokenizer
    prompt: Prompt to calculate logit diff on
    positions_to_intervene: Which tokens to zero
    positions_to_edit: Which tokens have edited attention maps
    layers: Layers over which to intervene
    logit1: "yes" logit
    logit2: "no" logit
    model_output: condition model
    system_prompt: system prompt

  Returns: Logit diff

  """

  tokens = prompt_to_tokens(tokenizer, prompt, model_output, system_prompt).to(
      hooked_model.cfg.device
  )

  # Establish hook functions for each ablation token position
  hook_fns = []
  for pos in positions_to_edit:
    hook_fns.append(
        partial(
            zero_attention_pattern,
            ablate_positions=positions_to_intervene,
            write_pos=pos,
        )
    )

  # Assign these hook functions as forward hooks in HookedTransformer object
  fwd_hooks = []
  for layer in layers:
    for i in range(len(hook_fns)):
      fwd_hooks.append(
          (utils.get_act_name("pattern", layer, "attn"), hook_fns[i])
      )

  output = hooked_model.run_with_hooks(
      tokens,
      fwd_hooks=fwd_hooks,
      return_type="logits",
  )

  return output[:, -1, logit1] - output[:, -1, logit2]


def attention_intervention(mt, config):
  """Intervene to zero attention from key entity to distractors.

  Args:
    mt: ModelAndTokenizer object
    config: Run Configuration
  """

  # Create a hooked model from the ModelAndTokenizer object
  model = hook_model(mt, config)

  # Read data and establish results dictionary
  interleaved_data = pd.read_csv(config["interleaved_file"])
  interleaved_data = interleaved_data[interleaved_data["interleaved_idx"] == config["cue_index"]]

  results = {
      "layer": [],
      "position": [],
      "accuracy": []
  }
  layer2accuracies = {}

  # Group data by cue and distractor context -- model must get both "yes" and
  # "no" questions correct in order to establish proper contextualization
  grouped_data = interleaved_data.groupby([
      config["entity_name"],
      "cue",
      "interleaved_idx",
      "sample_idx"
      ])

  total_groups = len(grouped_data)

  # Iterate over intervention windows, should see high performance in beginning,
  # then less and less benefit.
  for start_layer in range(
      config["start_layer"],
      config["num_layers"],
      config["intervention_range"]
      ):

    curr_idx = 0
    layer2accuracies[start_layer] = defaultdict(list)

    # Iterate over groups of questions
    for _, group in grouped_data:

      # Track progress
      curr_idx += 1
      if curr_idx % 20 == 0:
        print(f"{curr_idx}/{total_groups}")
        gc.collect()

      correct = []

      # Ensure that the intervention succeeds for both questions
      for row_idx in range(len(group)):
        row = group.iloc[row_idx]

        if config["ablate_type"] == "cue":
          ablate_indices = row[config["index_prefix"] + "cue_indices"]
          ablate_indices = tokens_str_to_list(ablate_indices)
        elif config["ablate_type"] == "distractor":
          ablate_indices = row[config["index_prefix"] + "distractor_indices"]
          ablate_indices = tokens_str_to_list(ablate_indices)
        elif config["ablate_type"] == "entity":
          ablate_indices = row[config[config["index_prefix"] + "entity_indices"]]
          ablate_indices = tokens_str_to_list(ablate_indices)
        else:
          raise ValueError("ablate_type must be one of [cue, distractor]")

        if config["edit_type"] == "all":
          # Edit all tokens that you're not ablating
          edit_indices = set(
              list(
                  range(prompt_to_tokens(mt.tokenizer, row["prompt"]).shape[1])
                  )
          )
          edit_indices = edit_indices - set(ablate_indices)
          edit_indices = list(edit_indices)
        elif config["edit_type"] == "question":
          # Edit all tokens after the entity
          prompt_len = prompt_to_tokens(mt.tokenizer, row["prompt"]).shape[1]
          entity = row[config["index_prefix"] + config["entity_indices"]]
          entity_idx = tokens_str_to_list(entity)[-1]
          edit_indices = list(range(entity_idx + 1, prompt_len))
        else:
          # Edit just the last token in the entity
          edit_indices = row[config["index_prefix"] + config["entity_indices"]]
          edit_indices = [tokens_str_to_list(edit_indices)[-1]]

        logit_diff = get_intervened_logit_diffs(
            model,
            mt.tokenizer,
            row["prompt"],
            ablate_indices,
            edit_indices,
            range(start_layer, min(config["num_layers"],
                                   start_layer + config["intervention_range"])),
            model_output=' ',
            logit1=config["yes_logit"],
            logit2=config["no_logit"],
            )

        # Record whether the intervention succeeded
        if logit_diff > 0 and row["label"] == True:
          correct.append(True)
        elif logit_diff < 0 and row["label"] == False:
          correct.append(True)
        else:
          correct.append(False)

      if correct[0] and correct[1]:
        layer2accuracies[start_layer][
            group.iloc[0]["interleaved_idx"]
            ].append(1)
      else:
        layer2accuracies[start_layer][
            group.iloc[0]["interleaved_idx"]
            ].append(0)

  # Record and write results
  for layer in layer2accuracies:
    for position in layer2accuracies[layer]:
      results["layer"].append(layer)
      results["position"].append(position)
      results["accuracy"].append(np.mean(layer2accuracies[layer][position]))

  pd.DataFrame.from_dict(results).to_csv(
      config["outfile"] + "_" + config["ablate_type"] + "_" + config["edit_type"] + "_intervention.csv"
      )

def main(args) -> None:
  mt, config = configure_run(args)
  if args.mass:
    attention_mass_analysis(mt, config)
  attention_intervention(mt, config)

if __name__ == "__main__":
  parser = argparse.ArgumentParser()
  parser.add_argument(
      '--model_name', type=str, default='Llama-2-13b-chat-hf', required=False
  )
  
  parser.add_argument(
      '--dataset', type=str, default='polysemous', required=False
  )
  
  parser.add_argument(
      '--device', type=str, default='cuda:0', required=False
  )
  
  parser.add_argument(
      '--out_prefix', type=str, default='attention_analysis', required=False
  )
  
  parser.add_argument(
      '--intervention_range', type=int, default=5, required=False
  )
  
  parser.add_argument(
      '--start_layer', type=int, default=0, required=False
  )
  
  parser.add_argument(
      '--ablate_type', type=str, default="cue", required=False
  )
  
  parser.add_argument(
      '--edit_type', type=str, default="all", required=False
  )
  parser.add_argument(
      '--mass', type=bool, default=False, required=False
  )

  parser.add_argument(
      '--n_distractors', type=int, default=3, required=False
  )
  parser.add_argument(
      '--cue_idx', type=int
  )
  args = parser.parse_args()
  main(args)
