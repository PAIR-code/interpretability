# Linear Classifier for BERT Activations

This repository contains functions to train and experiment with linear
classifiers on BERT activations for concepts.

## Train

The `train` binary can be used to train a linear probe to distinguish
activations for two concepts.

Example: `blaze run --config=pytorch
learning/vis/bert_dream/linear_classifier:train --
--output_dir ~/Downloads/tmp --sstable --train_dir ~/Downloads/tmp/sstables`

## Export Masked Activations

`export_activations_masked` is used as a preprocessing step. Here, the
activations of MASK tokens for given sentences are exported and sorted into
concepts.

Example: `blaze run --config=pytorch
learning/vis/bert_dream/linear_classifier:export_activations_masked --
--output_dir ~/Downloads/tmp --input_file ~/Downloads/tmp/train.balanced.jsonl
--concepts_name gender`

## SSTables

Using `activations_to_sstable`, one can convert the exported activations to
an sstable, which speeds up the training by a lot.

Example: `blaze run --config=pytorch
learning/vis/bert_dream/linear_classifier:activations_to_sstable --
--data_dir ~/Downloads/tmp/activations`

## Classification

With `classify_token`, a trained classifier can be used to classify a token in
a sentence.

Example: `blaze run learning/vis/bert_dream/linear_classifier:classify_token --
--trained_variables_dir ~/Downloads/tmp/classifiers/
--sentence "max was a programmer" --layer_id 2`

## Export Token Activation

One can also fetch the activation for a single token in a given sentence using
`export_token_activation`.

Exammple: `blaze run
learning/vis/bert_dream/linear_classifier:export_token_activation --
--sentence "he was a programmer" --output_dir ~/Downloads/tmp`
