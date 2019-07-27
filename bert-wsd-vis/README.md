### Word clustering for BERT
[Demo](https://storage.googleapis.com/bert-wsd-vis/demo/index.html?#) for [Visualizing and Measuring the Geometry of BERT
](https://arxiv.org/abs/1906.02715) by [Big Picture](https://research.google.com/bigpicture/)

In transformer models like BERT, a word's embedding is defined by its linguistic context

This demo visualizes the embeddings of the same word in different sentence contexts from (licensed under CC-BY-SA-3.0). Each point is the query word's embedding at the selected layer, projected into two dimensions using umap

For more info, see the paper: [Visualizing and Measuring the Geometry of BERT
](https://arxiv.org/abs/1906.02715). Visualization by [Big Picture](https://research.google.com/bigpicture/).

### To get the data
For each word, there is a single json file.
These json files contain the context sentence, part of speech, and umap-projected embeddings of the word various sentences (note: if the word appears multiple times in the sentence, the first instance is used.) There are 200-1000 sentences per word.

To get this data, ether:
1. Run the following, which will download the pregenerated data on google cloud to```static/jsons/<word>.json```
```
sh ./download_pregenerated_jsons.sh
```
OR:
1. Download the raw data ([Wikipedia](https://www.kaggle.com/jkkphys/english-wikipedia-articles-20170820-sqlite)) from kaggle

2. Run the following, which will generate the data in ```static/jsons/<word>.json```
```
preprocess.py
```
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
sh ./deploy.sh
```
Which will deploy it to https://storage.googleapis.com/bert-wsd-vis/demo/index.html?#

To also update the jsons with local ones, run:
```
sh ./deploy.sh --upload_jsons
```

NB: This is not an official Google product.
