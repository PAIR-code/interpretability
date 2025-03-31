"""Compute the model's accuracy at answering questions for all datasets.
"""

import argparse
import os
from collections import defaultdict

# Scienfitic packages
import numpy as np
import pandas as pd
import torch
torch.set_grad_enabled(False)

# Utilities
from utils import (
  ModelAndTokenizer,
  get_logit_difference,
)

from tqdm import tqdm
tqdm.pandas()


def configure_run(args):
  """Given run args, return model and config file to define the run.
  """

  # Load the model
  mt = ModelAndTokenizer(
      args.model_name,
      low_cpu_mem_usage=True,
      torch_dtype=torch.float16,
      device=args.device
      )

  # Instantiate I/O
  os.makedirs(os.path.join("..", "results", args.model_name, args.dataset),
            exist_ok=True)
  inpath = os.path.join("..", "data")
  outpath = os.path.join("..", "results", args.model_name, args.dataset)

  # Model-specific metadata
  if args.model_name == "Llama-2-13b-chat-hf":
    yes_logit = 3869
    no_logit = 1939
  elif args.model_name == "gemma-2-9b-it":
    yes_logit = 6287
    no_logit = 1307
  elif args.model_name == "gemma-2-2b-it":
    yes_logit = 6287
    no_logit = 1307
  else:
    raise ValueError(
        "model_name must be one of [Llama-2-13b-chat-hf, gemma-2-9b-it, gemma-2-2b-it]"
        )
  # Dataset-specific metadata
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
        "yes_logit": yes_logit,
        "no_logit": no_logit,
        "yes_meaning": "yes_sense",
        "outfile": os.path.join(outpath, args.out_prefix),
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
        "yes_logit": yes_logit,
        "no_logit": no_logit,
        "yes_meaning": "yes_gender",
        "outfile": os.path.join(outpath, args.out_prefix),
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
        "yes_logit": yes_logit,
        "no_logit": no_logit,
        "yes_meaning": "true_or_false",
        "outfile": os.path.join(outpath, args.out_prefix),
    }
  else:
    raise ValueError("dataset must be one of [polysemous, gender, factual]")

  return mt, config

def cue_q_evaluation(mt, config):
  """Run evaluation on cue+q data. Ideally should return perfect accuracy.

  Args:
    mt: ModelAndTokenizer object
    config: Run Config
  """
  data = pd.read_csv(config["cue_q_file"])

  grouped_data = data.groupby(
      [
          config["entity_name"],
          "cue",
      ]
      )
  results = {
      "accuracy": [],
  }

  correct_count = 0
  total = 0

  # Iterate through groups
  for _, group in grouped_data:
    
    # Iterate through cue groups
    correct = True
    for row_idx in range(len(group)):

      row = group.iloc[row_idx]

      # Get Yes - No Logit Difference
      logit_diff = get_logit_difference(
          mt,
          row["prompt"],
          model_output=' ',
          logit1=config["yes_logit"],
          logit2=config["no_logit"]
          )

      # Record whether the model gets the full group of questions correct
      if logit_diff > 0 and row["label"] == True:
        pass
      elif logit_diff < 0 and row["label"] == False:
        pass
      else:
        correct = False # For group analysis
    if correct:
      correct_count += 1
    total += 1

  results["accuracy"].append(correct_count/total)

  # Write output file
  pd.DataFrame.from_dict(results).to_csv(config["outfile"] + "_cue_q.csv")


def interleaved_evaluation(mt, config):
  """Assess model performance in the presence of distractors.
  
  Args:
    mt: ModelAndTokenizer object
    config: Run Config
  """
  data = pd.read_csv(config["interleaved_file"])

  results = {
      "position": [],
      "accuracy": []
  }

  accuracy_by_position = defaultdict(list)

  # Iterate over groups of questions, as model must get both "yes" and "no"
  # questions correct in order to demonstrate proper contextualization
  grouped_data = data.groupby(
      [
          config["entity_name"],
          "cue",
          "interleaved_idx",
          "sample_idx"
      ]
      )

  total_groups = len(grouped_data)
  curr_idx = 0

  row_indices = []
  row_correct = []

  # Iterate through groups
  for _, group in grouped_data:

    # Track progress
    curr_idx += 1
    if curr_idx % 100 == 0:
      print(f"{curr_idx}/{total_groups}")

    # Iterate through cue groups
    correct = True
    for row_idx in range(len(group)):

      row = group.iloc[row_idx]
      row_indices.append(row.name)

      # Get Yes - No Logit Difference
      logit_diff = get_logit_difference(
          mt,
          row["prompt"],
          model_output=' ',
          logit1=config["yes_logit"],
          logit2=config["no_logit"]
          )

      # Record whether the model gets each individual row correct,
      # as well as whether the full group of questions is correct
      if logit_diff > 0 and row["label"] == True:
        row_correct.append(True) # For stimulus-level analysis

      elif logit_diff < 0 and row["label"] == False:
        row_correct.append(True) # For stimulus-level analysis
      else:
        correct = False # For group analysis
        row_correct.append(False) # For stimulus-level analysis

    # Record accuracy as a function of where the cue is interleaved within
    # the distractors
    if correct:
      accuracy_by_position[group.iloc[0]["interleaved_idx"]].append(1)
    else:
      accuracy_by_position[group.iloc[0]["interleaved_idx"]].append(0)

  # Record aggregated results
  for position in accuracy_by_position.keys():
    results["position"].append(position)
    results["accuracy"].append(np.mean(accuracy_by_position[position]))

  # Output results
  pd.DataFrame.from_dict(results).to_csv(config["outfile"] + "_interleaved.csv")

  # Append per-row results to the CSV for open-ended analysis
  row_correct = [acc for _, acc in sorted(zip(row_indices, row_correct))]
  data["row_correct"] = row_correct
  data.to_csv(config["interleaved_file"])


def main(args) -> None:
  mt, config = configure_run(args)
  cue_q_evaluation(mt, config)
  interleaved_evaluation(mt, config)

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
      '--out_prefix', type=str, default='behavioral', required=False
  )
  parser.add_argument(
      '--n_distractors', type=int, default=3, required=False
  )
  args = parser.parse_args()
  main(args)
  
  # To save results from xcloud to gbucket
  # XCLOUD
  # gsutil -m rsync -r /workdir/results gs://patchscopes/workdir/main/racing_thoughts
  # To cloudtop
  # gsutil -m cp -R gs://patchscopes/workdir/main/racing_thoughts /usr/local/google/home/mlepori/racing_thoughts
