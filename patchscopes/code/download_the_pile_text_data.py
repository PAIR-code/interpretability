import argparse

import datasets
import pandas as pd
from datasets import load_dataset

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--output_path", default='./the_pile_deduplicated', type=str, help="Specify the output path.")
    parser.add_argument("--num_samples", default=200000, type=int, help="Specify the number of the pile text samples.")

    args = parser.parse_args()
    dataset = load_dataset("EleutherAI/the_pile_deduplicated", streaming=True, split="train")
    data_lst = list(dataset.take(args.num_samples))
    partial_dataset = datasets.Dataset.from_pandas(pd.DataFrame(data=data_lst))
    partial_dataset.save_to_disk(args.output_path)
