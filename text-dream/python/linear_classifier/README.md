# Linear Classifier for BERT Activations

This repository contains functions to train and experiment with linear
classifiers on BERT activations for concepts.
All of the commands assume that they are executed from within the folder
`python`.

## Requirements

- torch
- pytorch_pretrained_bert
- absl_py

You can install them all by simply issuing: `pip3 install -r
linear_classifier/requirements.txt`

## Train

The `train` binary can be used to train a linear probe to distinguish
activations for two concepts.

Example: `python3 linear_classifier/train.py -output_dir ~/Downloads
-train_dir ~/Downloads/data`

## Export Masked Activations

`export_activations_masked` is used as a preprocessing step. Here, the
activations of MASK tokens for given sentences are exported and sorted into
concepts.

Example: `python3 linear_classifier/export_activations_masked.py
-output_dir ~/Downloads/moved -input_file ~/Downloads/train.balanced.jsonl
-concepts_name gender`

## Classification

With `classify_token`, a trained classifier can be used to classify a token in
a sentence.

Example: `python3 linear_classifier/classify_token.py
-trained_variables_dir ~/Downloads/classifiers/MAE
-sentence "max was a programmer" --layer_id 2`

## Export Token Activation

One can also fetch the activation for a single token in a given sentence using
`export_token_activation`.

Exammple: `python3 linear_classifier/export_token_activation.py
-sentence "he was a programmer" -output_dir ~/Downloads/moved`
