"""Generate interpretations of hidden states of key entities.
"""

import argparse
import gc
import os

# Scienfitic packages
import numpy as np
import pandas as pd
import torch
import gc
torch.set_grad_enabled(False)

# Utilities
from utils import (
  ModelAndTokenizer,
  patch_over_layers,
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
    index_prefix = "llama_"
  elif args.model_name == "gemma-2-9b-it":
    num_layers = 42
    index_prefix = "gemma_"
  elif args.model_name == "gemma-2-2b-it":
    num_layers = 26
    index_prefix = "gemma_"
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
        "entity_indices": "word_indices",
        "correct_verbalization": "sense_verbalization",
        "incorrect_verbalization": "wrong_sense_verbalization",
        "outfile": os.path.join(outpath, args.out_prefix),
        "target_layer": args.target_layer,
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
        "correct_verbalization": "gender_verbalization",
        "incorrect_verbalization": "wrong_gender_verbalization",
        "outfile": os.path.join(outpath, args.out_prefix),
        "target_layer": args.target_layer,
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
        "correct_verbalization": "counterfactual_capital_verbalization",
        "incorrect_verbalization": "capital_verbalization",
        "outfile": os.path.join(outpath, args.out_prefix),
        "target_layer": args.target_layer,
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

  # Only extracting entity representation.
  # Prompts in group only differ by question, which occurs after the entity
  for _, group in grouped_data:
    if np.all(group["row_correct"]):
      success_data.append(group.iloc[0])
    else:
      failure_data.append(group.iloc[0])

  return success_data, failure_data


def generate_interpretations(dataset, outfile, mt, config):
  """Use interpretation prompts to interpret intermediate representations.

  Args:
    dataset: Success or failure dataset
    outfile: Filename for writing geneerations
    mt: ModelAndTokenizer object
    config: Run configuation
  """

  # Define prompt for generation
  interpretation_prompt = "Tell me about X X X"

  target_layer = config["target_layer"]

  generations_results = {
      "prompt_idx": [],
      "source_layer": [],
      "correct_verbalization": [],
      "incorrect_verbalization": [],
      "generation": []
  }

  # Iterate over all rows, generating interpretations of the key entity
  # over layers
  for idx, row in enumerate(dataset):

    # Track progress
    idx += 1
    if idx % 25 == 0:
      print(f"{idx}/{len(dataset)}")
      gc.collect()


    # Generate interpretations of tokens over all layers
    source_acts = extract_source_prompt_acts_for_pos(
            mt,
            row["prompt"],
            tokens_str_to_list(
                row[config["index_prefix"] + config["entity_indices"]])[-1],
            range(config["num_layers"])
    )


    for source_layer in range(0, config["num_layers"], 2):
      reset_all(mt)
      target_layers = [target_layer]

      # Extract representation from interleaved_prompt
      source = [
          source_acts[source_layer]
          ]
      model_output = "Sure! In this context, the word refers to"

      # Patch representation into interpretation prompt, generate
      generation = patch_over_layers(
          mt,
          source,
          interpretation_prompt,
          target_position=[7, 8, 9], # This works for both tokenizers
          target_layers=target_layers,
          model_output=model_output,
          max_length=15
          )
      # Store generations and metadata for autoscorer
      generations_results["prompt_idx"].append(idx)
      generations_results["source_layer"].append(source_layer)
      generations_results["correct_verbalization"].append(row[
          config["correct_verbalization"]
          ])
      generations_results["incorrect_verbalization"].append(row[
          config["incorrect_verbalization"]
          ])
      generations_results["generation"].append(generation)
      
    # Free GPU memory
    del source_acts
    del source

  # Save output
  pd.DataFrame.from_dict(generations_results).to_csv(outfile)


def main(args) -> None:
  mt, config = configure_run(args)
  success_data, failure_data = filter_prompts_by_success(config)
  generate_interpretations(
      success_data,
      config["outfile"] + "_success.csv",
      mt,
      config
      )
  generate_interpretations(
      failure_data,
      config["outfile"] + "_failure.csv",
      mt,
      config
      )
  cue_q_data = pd.read_csv(config["cue_q_file"])
  cue_q_data = [tup[1] for tup in cue_q_data.iterrows()]
  generate_interpretations(
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
      '--out_prefix', type=str, default='generations', required=False
  )
  parser.add_argument(
      '--target_layer', type=int, default=3, required=False
  )
  
  parser.add_argument(
      '--n_distractors', type=int, default=3, required=False
  )
  parser.add_argument(
      '--cue_idx', type=int
  )
  args = parser.parse_args()
  main(args)
