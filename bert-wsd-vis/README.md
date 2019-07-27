### Word clustering for BERT
[Demo](http://go/bert-wsd-vis) for [paper](go/bert-vis-paper) by [Big Picture](go/big-picture)

In transformer models like BERT, a word's embedding is defined by its linguistic context

This demo visualizes the embeddings of the same word in different sentence contexts from (licensed under CC-BY-SA-3.0). Each point is the query word's embedding at the selected layer, projected into two dimensions using umap

For more info, see [go/bert-vis-paper](go/bert-vis-paper). Visualization by [go/big-picture](go/big-picture).

### To get the data

1. Use pregenerated data on [X20](https://x20.corp.google.com/users/er/ereif/BERT/wsd/static/jsons)

OR

1. Download the data ([Wikipedia](https://www.kaggle.com/jkkphys/english-wikipedia-articles-20170820-sqlite)) from kaggle

2. run
```
preprocess.py
```
, which will generate one json per word in ```
static/jsons/<word>.json```


These json files contain the context sentence, part of speech, and umap-projected embeddings of the word each sentence (note: if the word appears multiple times in the sentence, the first instance is used.) There are 100-200 sentences per word.

### To run the demo

1. Install dependencies:
```
yarn
```

2. Watch the demo for changes with a local server:
```
yarn watch
```
The demo can then be accessed at http://localhost:1234/

### To deploy
```
./deploy.sh
```
Which will deploy it to https://storage.googleapis.com/bert-wsd-vis/demo/index.html?#

To also update the jsons with local ones, run:
```
./deploy.sh --upload_jsons
```

NB: This is not an official Google product.
