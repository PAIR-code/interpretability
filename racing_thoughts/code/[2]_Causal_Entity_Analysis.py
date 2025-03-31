"""Assess whether model failures in the presence of distractors can be 
attributed to the contextualization of one key entity token.
"""

import argparse
import os

# Scienfitic packages
import numpy as np
import pandas as pd
import torch
import gc

# Utilities
from utils import (
  ModelAndTokenizer,
  patch_logit_diff_over_layers,
  reset_all,
  extract_source_prompt_acts_for_pos,
)

from wrappers import BlockOutputWrapper

from tqdm import tqdm
from collections import defaultdict

tqdm.pandas()
torch.set_grad_enabled(False)


def configure_run(args):
  """Given run args, return model and config file to define the run.
  """

  # Define and load ModelAndTokenizer
  mt = ModelAndTokenizer(
      args.model_name,
      low_cpu_mem_usage=True,
      torch_dtype=torch.float16,
      device=args.device
      )

  # Wrap it with patching functionality
  for i, layer in enumerate(mt.model.model.layers):
    mt.model.model.layers[i] = BlockOutputWrapper(
        layer, mt.model.lm_head, mt.model.model.norm
    )

  # Establish I/O
  os.makedirs(os.path.join("..", "results", args.model_name, args.dataset), 
            exist_ok=True)
  inpath = os.path.join("..", "data")
  outpath = os.path.join("..", "results", args.model_name, args.dataset)

  # Model-Specific metadata
  if args.model_name == "Llama-2-13b-chat-hf":
    yes_logit = 3869
    no_logit = 1939
    num_layers = 40
    index_prefix = "llama_"
  elif args.model_name == "gemma-2-9b-it":
    yes_logit = 6287
    no_logit = 1307
    num_layers = 42
    index_prefix = "gemma_"
  elif args.model_name == "gemma-2-2b-it":
    yes_logit = 6287
    no_logit = 1307
    num_layers = 26
    index_prefix = "gemma_"
  else:
    raise ValueError(
        "model_name must be one of [Llama-2-13b-chat-hf, gemma-2-9b-it, gemma-2-2b-it]"
        )

  # Dataset-Specific metadata
  # If using Gemma 2b, load in Gemma 9b file because it's tokenized the same
  if args.dataset == "polysemous":
    config = {
        "cue_q_file": os.path.join(
            inpath,
            "_".join(
                [args.dataset, "cue_q.csv"]
            )
            ),
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
        "yes_meaning": "yes_sense",
        "outfile": os.path.join(outpath, args.out_prefix),
        "start_target": args.start_target,
        "num_layers": num_layers,
        "index_prefix": index_prefix,
        "cue_index": args.cue_idx,
    }
  elif args.dataset == "gender":
    config = {
        "cue_q_file": os.path.join(
            inpath,
            "_".join(
                [args.dataset, "cue_q.csv"]
            )
            ),
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
        "yes_meaning": "yes_gender",
        "outfile": os.path.join(outpath, args.out_prefix),
        "start_target": args.start_target,
        "num_layers": num_layers,
        "index_prefix": index_prefix,
        "cue_index": args.cue_idx,
    }
  elif args.dataset == "factual":
    config = {
        "cue_q_file": os.path.join(
            inpath,
            "_".join(
                [args.dataset, "cue_q.csv"]
            )
            ),
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
        "yes_meaning": "true_or_false",
        "outfile": os.path.join(outpath, args.out_prefix),
        "start_target": args.start_target,
        "num_layers": num_layers,
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


def patch_entity(mt, config):
  """Run intervention patching cue+q entity into interleaved context.

  Args:
    mt: ModelAndTokenizer object
    config: Run configuation
  """

  # Read in data
  cue_q_data = pd.read_csv(config["cue_q_file"])
  interleaved_data = pd.read_csv(config["interleaved_file"])
  interleaved_data = interleaved_data[interleaved_data["interleaved_idx"] == config["cue_index"]]

  results = {
      "position": [],
      "accuracy": []
  }

  accuracy_by_position = defaultdict(list)

  # Group data by cue and distractor context -- model must get both "yes" and
  # "no" questions correct in order to establish proper contextualization
  grouped_data = interleaved_data.groupby([
      config["entity_name"],
      "cue",
      "interleaved_idx",
      "sample_idx"
      ])

  total_groups = len(grouped_data)
  curr_idx = 0

  # Iterate through context groups
  for _, group in grouped_data:
    # Track progress
    curr_idx += 1
    if curr_idx % 20 == 0:
      print(f"{curr_idx}/{total_groups}")
      gc.collect()

    # Generate Intervention Data
    # Step 1: Find appropriate Cue+Q prompt
    curr_word = group.iloc[0][config["entity_name"]]
    curr_cue = group.iloc[0]["cue"]

    # These conditions return a true and false prompt, but it doesn't matter
    # because the question occurs after the entity, and we are patching in the
    # entity.
    cue_prompt = cue_q_data[(cue_q_data[config["entity_name"]] == curr_word) &\
                            (cue_q_data["cue"] == curr_cue)].iloc[0]["prompt"]

    # DESIGN DECISION: Just patch the final token in the entity.
    cue_token_idxs = cue_q_data[
        (cue_q_data[config["entity_name"]] == curr_word) &\
                            (cue_q_data["cue"] == curr_cue)].iloc[0][
                                config["index_prefix"] + config["entity_indices"]
                                ]
    cue_token_idx = tokens_str_to_list(cue_token_idxs)[-1]

    source_prompt = cue_prompt
    source_idx = cue_token_idx

    reset_all(mt)
    source_acts = extract_source_prompt_acts_for_pos(
        mt,
        source_prompt,
        source_idx,
        range(config["num_layers"]),
    )

    successful_intervention = False

    # Patch from a given target layer through the end of the model, see if
    # this provides the corrrect answer to both "yes" and "no" questions
    for target_layer in range(0, int(config["num_layers"]/2), 2):
      target_layers = [target_layer]
      correct = []

      # Ensure that the intervention succeeds for both questions
      for row_idx in range(len(group)):
        row = group.iloc[row_idx]

        idxs = row[config["index_prefix"] + config["entity_indices"]]
        idxs = tokens_str_to_list(idxs)[-1]

        reset_all(mt)

        # Extract representation from source layer in source prompt
        source = [source_acts[target_layer] for target_layer in target_layers]
        model_output = " "

        # Patch Representations into target layer in distractor prompt,
        # get Yes - No Logit Diff
        logit_diff = patch_logit_diff_over_layers(
            mt, 
            source, row["prompt"],
            target_position=[idxs],
            target_layers=target_layers,
            model_output=model_output,
            logit1=config["yes_logit"],
            logit2=config["no_logit"]
        )

        # Record accuracy
        if logit_diff > 0 and row["label"] == True:
          correct.append(True)
        elif logit_diff < 0 and row["label"] == False:
          correct.append(True)
        else:
          correct.append(False)

      # Record whether the intervention worked, if so, no need to iterate
      # through remaining layers
      if correct[0] and correct[1]:
        successful_intervention = True
        break

    # If one intervention succceeded, append 1, else append 0
    if successful_intervention:
      accuracy_by_position[group.iloc[0]["interleaved_idx"]].append(1)
    else:
      accuracy_by_position[group.iloc[0]["interleaved_idx"]].append(0)

    # Free GPU memory
    del source_acts
    del source

  # Summarize results and write to a file
  assert len(accuracy_by_position[config["cue_index"]]) == total_groups
  for position in accuracy_by_position.keys():
    results["position"].append(position)
    results["accuracy"].append(np.mean(accuracy_by_position[position]))

  pd.DataFrame.from_dict(results).to_csv(
      config["outfile"] + "_analysis.csv"
      )

def main(args) -> None:
  mt, config = configure_run(args)
  patch_entity(mt, config)

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
      '--out_prefix', type=str, default='causal_entity', required=False
  )
  parser.add_argument(
      '--start_target', type=int, default=2, required=False
  )
  
  parser.add_argument(
      '--n_distractors', type=int, default=3, required=False
  )
  parser.add_argument(
      '--cue_idx', type=int
  )
  args = parser.parse_args()
  main(args)
