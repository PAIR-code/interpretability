# Text Dream

This visualization tool is designed to analyze processes similar to
`DeepDream` for text.
The goal of this tool is to, through visualization, be able to reason about and
explain the output of such processes.
This is especially useful if the dreaming process did not turn out to be as
successful as expected.
It has been used to analyze BERT, but is not limited to any text
model.
We also used this in combination with the
[Softmax Trick](https://www.aclweb.org/anthology/W18-5437),
which seems to work for deep dreaming on text.
Our visualization can display some parameters that are special to this approach,
it is, however, also possible to use them with other approaches.
By providing `json` files, one can upload results of such processes
and analyze them in their browser.
For using this with your own data, see [Data](#data).

## Usage

To use this application, you need to use npm to install its dependencies.
In the root folder of this repository, issue:

```
npm install
```

To then start it, simply use:

```
npm start
```

We provide some example data ready for you to be used.
It can be found in the folder `example_data`.

## Components

The application is build as multiple modules, which can be viewed in isolation
or combined for a more in-depth analysis of the dreaming process.
This also makes it relatively easy to add new modules to the visualization.

### Dreaming

We show these processes with their results, alongside all the iterations that
have been written to the results file.
This makes it possible to follow the dreaming process.
We also optionally plot the current activation, and for usage with the softmax
trick, the activation for only the top tokens and the temperature.
Color coding of the tokens shows you which part of the sequence is to be changed
by the dreaming process.

### Top Words

When using the softmax trick, it is also interesting to see how the
token-distribution after applying the softmax function looks like.
In this visualization, users can inspect how this distribution evolves over the
training process.
We found that the softmax trick can lead to the model first taking a highly
activating linear combination of tokens, but later fails to swap in tokens that
are actually more highly activating when only a single token is allowed.

### Similar Embeddings

To debug dreaming processes, it is also interesting to look at similar
embeddings to one that you know is highly activating.
Sometimes, models are so specific, that surrounding tokens in embedding space
actually dont also activate the same neurons.
This makes the optimization process hard, as using gradient decent in this space
is harder in this case.

### Token Search

To support detecting higly activating tokens for debugging dreaming processes,
it can be very helpful to check what tokens are actually highly activating.
This visualization shows these tokens alongside their activation values.
Another application of this is to see if neurons are actually only looking for a
few, very specific tokens.

### Resembling Activation

It can also be interesting to see, if, and how, the model is able to use deep
dreaming to resemble activation values.
Here, one would get the activation value for a specific sentence, and try to
use deep dream to recreate this sentence.
We noticed that, for BERT, this is easier for earlier layers, while in later
ones, the model seemed to swap some words for contextually similar ones.
Another interesting aspect of this was, that one can use this to reason about
which words the model finds more important, and which one tend to get swapped
out.

### Resembling Changed Activation

One can also experiment with changing the activation of single tokens to another
target activation.
This can be interesting, as the model sometimes changes not only the tokens for
which activations have been changed, but also some related ones.

## Data

The following describes the data format that each of these components expects.
All the data should be saved as `.json` files.

### Dreaming

```
{
  "type": "dream",
  "params": {
    "layer_id": number, optional: id of the layer to dream for,
    "word_id":  number, optional: id of the word to dream for,
    "neuron_id": number, optional: id of the neuron to dream for,
    "dream_start": number: id of the first token to be changed,
    "dream_end": number: id of the last token to be changed,
    "tokens": string array: the tokens to be used to start with,
  },
  "results": {
    "iterations": [
      {
        "number": number: current iteration number,
        "tokens": string array: the most likely tokens in this iteration,
        "temperature": number, optional: the temperature with softmax trick,
        "activation": number, optional: current activation for the embedding,
        "ids_activation": number, optional: current activation for most likely tokens,
      },
      ...
    ],
  },
}
```

### Top Words

```
{
  "type": "top_words",
  "params": {
    "layer_id": number, optional: id of the layer to dream for,
    "word_id":  number, optional: id of the word to dream for,
    "neuron_id": number, optional: id of the neuron to dream for,
  },
  "results": {
    "iterations": [
      {
        "number": number: current iteration number,
        "tokens": string array: the most likely tokens in this iteration,
        "scores": number array: the scores of the top tokens for this iteration,
      },
      ...
    ],
  },
}
```

### Similar Embeddings

```
{
  "type": "similar_embeddings",
  "layer_id": number, optional: id of the layer to dream for,
  "word_id":  number, optional: id of the word to dream for,
  "neuron_id": number, optional: id of the neuron to dream for,
  "change_word": number: id of the word to find similar embeddings for,
  "tokens": string array: the most likely tokens in this iteration,
  "tops": [
    {
      "token": string: the similar token,
      "activation": number: the activation if we were to swap in this token,
      "distance": number: the embedding distance for this token,
    },
    ...
  ],
}
```

### Token Search

```
{
  "type": "token_search",
  "layer_id": number, optional: id of the layer to dream for,
  "word_id":  number, optional: id of the word to dream for,
  "neuron_id": number, optional: id of the neuron to dream for,
  "change_word": number: id of the word to find similar embeddings for,
  "tokens": string array: the most likely tokens in this iteration,
  "tops": [
    {
      "token": string: the token with a high activation,
      "activation": number: the activation if we were to swap in this token,
    },
    ...
  ],
}
```

### Resembling Activation

```
{
  "type": "resemble",
  "params": {
    "layer_id": number, optional: id of the layer to dream for,
    "word_id":  number, optional: id of the word to dream for,
    "neuron_id": number, optional: id of the neuron to dream for,
    "dream_start": number: id of the first token to be changed,
    "dream_end": number: id of the last token to be changed,
    "tokens": string array: the target tokens to be resembled,
  },
  "results": {
    "iterations": [
      {
        "number": number: current iteration number,
        "tokens": string array: the most likely tokens in this iteration,
        "temperature": number, optional: the temperature with softmax trick,
        "loss": number, optional: current loss for the embedding,
        "ids_loss": number, optional: current loss for most likely tokens,
      },
      ...
    ],
  },
}
```

### Resembling Changed Activation

```
{
  "type": "resemble",
  "params": {
    "layer_id": number, optional: id of the layer to dream for,
    "word_id":  number, optional: id of the word to dream for,
    "neuron_id": number, optional: id of the neuron to dream for,
    "dream_start": number: id of the first token to be changed,
    "dream_end": number: id of the last token to be changed,
    "shift_start": number: id of the first token activation to be changed,
    "shift_end": number: id of the last token activation to be changed,
    "magnitude": number: how much the target activation is to be changed,
    "tokens": string array: the target tokens to be resembled,
    "target": string: what token the changed activation should optimally be,
  },
  "results": {
    "iterations": [
      {
        "number": number: current iteration number,
        "tokens": string array: the most likely tokens in this iteration,
        "temperature": number, optional: the temperature with softmax trick,
        "loss": number, optional: current loss for the embedding,
        "ids_loss": number, optional: current loss for most likely tokens,
      },
      ...
    ],
  },
}
```

### Wrapping Magnitudes

It is also possible to display muliple magnitudes for
**Resemble Changed Activation** in a list.
To do this, simply wrap those results in:

```
{
  "type": "magnitues",
  "magnitudes": [
    ...
  ]
}
```

### Wrapping Layers

**Dream**, **Resemble Activation**, **Resemble Changed Activation**, and
**Magnitudes** can all be wrapped and displayed in a layer
list.
To do this, simply wrap those results in:

```
{
  "type": "layers",
  "layers": [
    ...
  ]
}
```
