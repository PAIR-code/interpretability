"""TODO: mlepori - DO NOT SUBMIT without one-line documentation for [5]_Backpatching_Intervention.

TODO: mlepori - DO NOT SUBMIT without a detailed description of [5]_Backpatching_Intervention.
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

# Utilities
from utils import (
  ModelAndTokenizer,
  patch_logit_diff_over_layers,
  reset_all,
  extract_source_prompt_acts_for_pos,
)

from wrappers import BlockOutputWrapper

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

  # Model-Specific Metadata
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
        "index_prefix": index_prefix,
        "freeze": args.freeze,
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
        "index_prefix": index_prefix,
        "freeze": args.freeze,
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
        "index_prefix": index_prefix,
        "freeze": args.freeze,
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
  """Perform backpatching intervention.
  
  Args:
    mt: ModelAndTokenizer object
    config: Run Configuration
  """

  # Read in data, establish results dictionary
  interleaved_data = pd.read_csv(config["interleaved_file"])
  interleaved_data = interleaved_data[interleaved_data["interleaved_idx"] == config["cue_index"]]

  results = {
      "position": [],
      "accuracy": [],
      "frozen_acc": [],
      "avg_target": [],
      "std_target": [],
      "avg_source": [],
      "std_source": [],
  }
  

  accuracy_by_position = defaultdict(list)
  source_by_position = defaultdict(list)
  target_by_position = defaultdict(list)
  frozen_accuracy_by_position = defaultdict(list)

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

  # Iterate through cue groups
  for _, group in grouped_data:

    # Track progress
    curr_idx += 1
    if curr_idx % 20 == 0:
      print(f"{curr_idx}/{total_groups}")
      gc.collect()

    # Entity is before question, so can extract reps from either entry in group
    source_prompt = group.iloc[0]["prompt"]
    entity_idx = tokens_str_to_list(group.iloc[0][config["index_prefix"] + config["entity_indices"]])[-1]

    reset_all(mt)
    source_acts = extract_source_prompt_acts_for_pos(
        mt,
        source_prompt,
        entity_idx,
        range(config["num_layers"]),
    )

    # Iterate through target and extraction layers
    successful_intervention = False
    successful_frozen_intervention = False
    for target_layer in range(0, int(config["num_layers"]/2), 2):
      for extraction_layer in range(int(config["num_layers"]/2), config["num_layers"], 2):

        correct = []

        # Ensure that the backpatching intervention works for both questions
        for row_idx in range(len(group)):
          row = group.iloc[row_idx]

          idxs = row[config["index_prefix"] +  config["entity_indices"]]
          idxs = tokens_str_to_list(idxs)[-1]

          reset_all(mt)
          
          if config["freeze"]:
            target_layers = list(range(target_layer, extraction_layer+1))
            source = [source_acts[extraction_layer]] * len(target_layers)
          else:
            target_layers = [target_layer]
            source = [source_acts[extraction_layer]]

          model_output = " "

          # Patch Representations into earlier layers, get Yes - No Logit Diff
          logit_diff = patch_logit_diff_over_layers(
              mt,
              source, row["prompt"],
              target_position=[idxs],
              target_layers=target_layers,
              model_output=model_output,
              logit1=config["yes_logit"],
              logit2=config["no_logit"]
          )

          # Assess intervention success
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
          source_by_position[group.iloc[0]["interleaved_idx"]].append(extraction_layer)
          target_by_position[group.iloc[0]["interleaved_idx"]].append(target_layer)
    
        if successful_intervention:
          # See whether Frozen backpatching works in these same layers
          frozen_correct = []

          for row_idx in range(len(group)):
            row = group.iloc[row_idx]

            idxs = row[config["index_prefix"] +  config["entity_indices"]]
            idxs = tokens_str_to_list(idxs)[-1]

            reset_all(mt)
            model_output = " "
            target_layers = list(range(target_layer, extraction_layer+1))
            source = [source_acts[extraction_layer]] * len(target_layers)
            
            # Patch Representations into earlier layers, get Yes - No Logit Diff
            logit_diff = patch_logit_diff_over_layers(
                mt,
                source, row["prompt"],
                target_position=[idxs],
                target_layers=target_layers,
                model_output=model_output,
                logit1=config["yes_logit"],
                logit2=config["no_logit"]
            )

            # Assess intervention success
            if logit_diff > 0 and row["label"] == True:
              frozen_correct.append(True)
            elif logit_diff < 0 and row["label"] == False:
              frozen_correct.append(True)
            else:
              frozen_correct.append(False)
              
          if frozen_correct[0] and frozen_correct[1]:
            successful_frozen_intervention = True
            
        if successful_intervention:
          break

      if successful_intervention:
        break

    # Record results
    if successful_intervention:
      accuracy_by_position[group.iloc[0]["interleaved_idx"]].append(1)
    else:
      accuracy_by_position[group.iloc[0]["interleaved_idx"]].append(0)

    if successful_frozen_intervention:
      frozen_accuracy_by_position[group.iloc[0]["interleaved_idx"]].append(1)
    else:
      frozen_accuracy_by_position[group.iloc[0]["interleaved_idx"]].append(0)
  
    # Free GPU
    del source
    del source_acts
    
  # Summarize results and write to a file
  assert len(accuracy_by_position[config["cue_index"]]) == total_groups
  assert len(frozen_accuracy_by_position[config["cue_index"]]) == total_groups
  assert len(source_by_position[config["cue_index"]]) == np.sum(accuracy_by_position[config["cue_index"]])

  for position in accuracy_by_position.keys():
    results["position"].append(position)
    results["accuracy"].append(np.mean(accuracy_by_position[position]))
    results["frozen_acc"].append(np.mean(frozen_accuracy_by_position[position]))
    results["avg_target"].append(np.mean(target_by_position[position]))
    results["std_target"].append(np.std(target_by_position[position]))
    results["avg_source"].append(np.mean(source_by_position[position]))
    results["std_source"].append(np.std(source_by_position[position]))

  if config["freeze"]:
    outfile = config["outfile"] + "_frozen.csv"
  else:
    outfile = config["outfile"] + ".csv"
  pd.DataFrame.from_dict(results).to_csv(
      outfile
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
      '--out_prefix', type=str, default='backpatching', required=False
  )
  parser.add_argument(
      '--n_distractors', type=int, default=3, required=False
  )
  parser.add_argument(
      '--freeze', type=bool, default=False, required=False
  )
  parser.add_argument(
      '--cue_idx', type=int
  )
  args = parser.parse_args()
  main(args)
