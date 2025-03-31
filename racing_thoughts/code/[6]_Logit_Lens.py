"""Logit lens analysis for decisions over layers
"""

import argparse
import os
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

  # Model-Specific Metadata
  if args.model_name == "Llama-2-13b-chat-hf":
    num_layers = 40
    yes_logit = 3869
    no_logit = 1939
  elif args.model_name == "gemma-2-9b-it":
    yes_logit = 6287
    no_logit = 1307
    num_layers = 42
  elif args.model_name == "gemma-2-2b-it":
    yes_logit = 6287
    no_logit = 1307
    num_layers = 26
  else:
    raise ValueError(
        "model_name must be one of [Llama-2-13b-chat-hf, gemma-2-9b-it, gemma-2-2b-it]"
        )
  # Define I/O
  os.makedirs(os.path.join("..", "results", args.model_name, args.dataset),
            exist_ok=True)
  inpath = os.path.join("..", "data")
  outpath = os.path.join("..", "results", args.model_name, args.dataset)

  # Dataset-Specific Metadata
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
        "correct_verbalization": "sense_verbalization",
        "incorrect_verbalization": "wrong_sense_verbalization",
        "outfile": os.path.join(outpath, args.out_prefix),
        "num_layers": num_layers,
        "yes_logit": yes_logit,
        "no_logit": no_logit,
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
        "correct_verbalization": "gender_verbalization",
        "incorrect_verbalization": "wrong_gender_verbalization",
        "outfile": os.path.join(outpath, args.out_prefix),
        "num_layers": num_layers,
        "yes_logit": yes_logit,
        "no_logit": no_logit,
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
        "correct_verbalization": "counterfactual_capital_verbalization",
        "incorrect_verbalization": "capital_verbalization",
        "outfile": os.path.join(outpath, args.out_prefix),
        "num_layers": num_layers,
        "yes_logit": yes_logit,
        "no_logit": no_logit,
        "cue_index": args.cue_idx,
    }
  else:
    raise ValueError("dataset must be one of [polysemous, gender, factual]")

  return mt, config

def filter_prompts_by_success(config):
  """Filter interleaved prompts by success.

  Args:
    config: Run Config

  Returns: Split interleaved data into rows that the model gets correct vs.
          incorrect

  """

  # Load data
  interleaved_data = pd.read_csv(config["interleaved_file"])
  interleaved_data = interleaved_data[interleaved_data["interleaved_idx"] == config["cue_index"]]
  grouped_data = interleaved_data.groupby([
      config["entity_name"],
      "cue",
      "interleaved_idx",
      "sample_idx"])

  success_data = []
  failure_data = []

  for _, group in grouped_data:
    if group["row_correct"].iloc[0]:
      success_data.append(group.iloc[0])
    else:
      failure_data.append(group.iloc[0])

    if group["row_correct"].iloc[1]:
      success_data.append(group.iloc[1])
    else:
      failure_data.append(group.iloc[1])

  return success_data, failure_data


def logit_lens(dataset, outfile, mt, config):
  """Implement logit lens using patchscopes to get yes-no logit diffs.

  Args:
    dataset: Success or failure dataset
    outfile: Filename for writing geneerations
    mt: ModelAndTokenizer object
    config: Run configuation
  """

  # Always patch into the end of the model for logit lens
  target_layer = config["num_layers"] - 1

  results = {
      "prompt_idx": [],
      "source_layer": [],
      "logit_diffs": [],
      "label": [],
  }

  # Iterate over all rows, performing logit lens
  for idx, row in enumerate(dataset):

    # Track progress
    idx += 1
    if idx % 25 == 0:
      print(f"{idx}/{len(dataset)}")
      gc.collect()


    # Run logit lens on the final token of prompt for all layers
    reset_all(mt)
    source_acts = extract_source_prompt_acts_for_pos(
            mt,
            row["prompt"],
            [-1],
            range(config["num_layers"])
    )


    for source_layer in range(0, config["num_layers"]):
      reset_all(mt)
      target_layers = [target_layer]

      # Extract representation from interleaved_prompt
      source = [
          source_acts[source_layer]
          ]

      # Patch Representations into final layer, get Yes - No Logit Diff
      logit_diff = patch_logit_diff_over_layers(
          mt,
          source, row["prompt"],
          target_position=[-1],
          target_layers=target_layers,
          model_output="",
          logit1=config["yes_logit"],
          logit2=config["no_logit"]
      )

      # Store generations and metadata for autoscorer
      results["prompt_idx"].append(idx)
      results["source_layer"].append(source_layer)
      results["logit_diffs"].append(logit_diff.cpu())
      results["label"].append(row["label"])

    # Free GPU memory
    del source_acts
    del source

  # Save output
  pd.DataFrame.from_dict(results).to_csv(outfile)


def main(args) -> None:
  mt, config = configure_run(args)
  success_data, failure_data = filter_prompts_by_success(config)
  logit_lens(
      success_data,
      config["outfile"] + "_success.csv",
      mt,
      config
      )
  logit_lens(
      failure_data,
      config["outfile"] + "_failure.csv",
      mt,
      config
      )
  cue_q_data = pd.read_csv(config["cue_q_file"])
  cue_q_data = [tup[1] for tup in cue_q_data.iterrows()]
  logit_lens(
      cue_q_data,
      config["outfile"] + "_cue_q.csv",
      mt,
      config
      )


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
      '--out_prefix', type=str, default='logit_lens', required=False
  )
  parser.add_argument(
      '--n_distractors', type=int, default=3, required=False
  )
  parser.add_argument(
      '--cue_idx', type=int
  )
  args = parser.parse_args()
  main(args)
