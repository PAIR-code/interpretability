# DeepDream With BERT

This repository contains functions to conduct deepdream experiments with BERT.


## Dream

The `dream` binary can be used to do classic deepdream experiments with BERT.
To be able to backpropagate right to the input tokens, we use a method with a
smooth one-hot encoded input vector.
This vector is fed through a softmax layer.
To force this vector to get close to real tokens, we use temperature annealing.

Example: `blaze run --config=pytorch learning/vis/bert_dream/dream:dream --
--output_dir ~/Downloads/tmp --sentence "i hate kickshaws ." --layer_id 5
--neuron_id 414 --word_id 2 --end_change 2 --start_change 2 --num_iterations 2`

## Reconstruct

We also experimented with reconstruction activations we fetched from the network
using deepdream. Here we start from random text and try to dream back to the
specified activation. One can specify to get the activation across an entire
layer, which will yield the best results, or only fetch the activation of one
word or a single neuron.

### Activation

One of these experiments is the `reconstruct_activation` binary. It is the
classic application of this concept, where we try to reconstruct a sentence that
originally caused an activation.

Example: `blaze run --config=pytorch learning/vis/bert_dream/dream:dream --
--output_dir ~/Downloads/tmp --sentence "i hate kickshaws ." --layer_id 5
--neuron_id 414 --word_id 2 --end_change 2 --start_change 2 --num_iterations 2`

### Changed Activation

The activation to be reconstructed can be changed by assigning a different value
to a part of it using `reconstruct_changed_activation`.

Example: `blaze run --config=pytorch
learning/vis/bert_dream/dream:reconstruct_changed_activation -- --output_dir
~/Downloads/tmp --num_iterations 2 --change_activation_dir
/cns/is-d/home/abauerle/language/bert/exported_token_activations
--change_activation_file
1_V_9_CLS_he_was_playing_baseball_with_her_friends_SEP.np --sentence "she was
playing baseball with her friends" --target he`

### Shifted Activation

One can also change the activation to be reconstructed by applying a
transormation to it. This can be done with `reconstruct_shifted_activation`.

Example: `blaze run --config=pytorch
learning/vis/bert_dream/dream:reconstruct_shifted_activation -- --output_dir
~/Downloads/tmp --num_iterations 2 --shift_vector ~/Downloads/MAE --sentence "he
is a doctor" --shift_start 1 --shift_end 1 --target she`

### Dream MLM

`dream_mlm` can be used to maximize a prediction probability though deep dream.

Example: `blaze run --config=pytorch learning/vis/bert_dream/dream:dream_mlm --
--output_dir ~/Downloads/tmp --num_iterations 2`


## Other Non-Dreaming Experiments

### Similar Embeddings

With `similar_embedding_activation`, one can retrieve embeddings similar to a
given one, and see how the activation value changes for these.
This is executed so that one word is replaced by this embedding and the
activation value is monitored.

Example: `blaze run --config=pytorch
learning/vis/bert_dream/dream:similar_embedding_activation --
--output_dir ~/Downloads/tmp --sentence "i hate kickshaws ." --layer_id 5
--neuron_id 414 --word_id 2 --change_word 2`

### MLM

One can also use classic MLM predictions with this repo with `mlm`.
Here, top-predictions for masked tokens will be output.

Example: `blaze run --config=pytorch learning/vis/bert_dream/dream:mlm --
--sentence "i hate kickshaws ." --mask_word 1`

### Token Search

To test dream results, it is also possible to brute-force search the token space
for the highest activations when replacing one of the tokens. This can be done
with `token_search`.

Example: `blaze run --config=pytorch
learning/vis/bert_dream/dream:token_search -- --output_dir ~/Downloads/tmp
--sentence "songs of innocence" --layer_id 9 --neuron_id 414 --word_id 0
--change_word 1`

### Tokenize Sentence

The small script `tokenize_sentence` can be used to check how a sentence would
get tokenized.

Example: `blaze run learning/vis/bert_dream/dream:tokenize_sentence --
--sentence "she played softball with her friends"`


## Combining Results

To be able to visualize results mor intuitively, there are two scripts to
combine results.

### Combine Layer Results

`combine_layers_json` can be used to fuse results of multiple layers into one
results file. To do this, all the individual layer results have to be in
subfolders of one common folder with only these subfolders.

Example: `blaze run learning/vis/bert_dream_dream:combine_layers_json --
--results_dir ~/Downloads/tmp`

### Combine Layer Results

`combine_magnitudes_json` can be used to fuse results of multiple magnitudes
into one results file. This can be done for one layer or, if multiple layer
subfolders exist in one folder, for each of these layers. Again, all the
individual magnitude results have to be in subfolders of one common folder
with only these subfolders.

Example: `blaze run learning/vis/bert_dream/dream:combine_magnitudes_json --
--results_dir ~/Downloads/tmp --per_layer`


## XManager

Most of the scripts can also be used with XManager.
When the build fails, careully check the error message.
It can happen that the build simply times out, for which case the solution is to
just restart the build.
