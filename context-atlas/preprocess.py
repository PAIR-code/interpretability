
# Copyright 2018 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
# ==============================================================================

"""Preprocessing the data."""

from __future__ import absolute_import
from __future__ import division
from __future__ import print_function

import os
import torch
from pytorch_pretrained_bert import BertTokenizer, BertModel, BertForMaskedLM
import sqlite3 as sql
import re
import numpy as np
import umap
import json
from tqdm import tqdm
import nltk


DB_PATH = './enwiki-20170820.db'
nltk.download('averaged_perceptron_tagger')
nltk.download('punkt')

def neighbors(word, sentences):
  """Get the info and (umap-projected) embeddings about a word."""
  # Get part of speech of this word.
  sent_data = get_poses(word, sentences)

  # Get embeddings.
  points = get_embeddings(word.lower(), sentences)

  # Use UMAP to project down to 3 dimnsions.
  points_transformed = project_umap(points)

  return {'labels': sent_data, 'data': points_transformed}

def project_umap(points):
  """Project the words (by layer) into 3 dimensions using umap."""
  points_transformed = []
  for layer in points:
    transformed = umap.UMAP().fit_transform(layer).tolist()
    points_transformed.append(transformed)
  return points_transformed

def get_embeddings(word, sentences):
  """Get the embedding for a word in each sentence."""
  # Tokenized input
  layers = range(-12, 0)
  points = [[] for layer in layers]
  print('Getting embeddings for %d sentences '%len(sentences))
  for sentence in sentences:
    sentence = '[CLS] ' + sentence + ' [SEP]'
    tokenized_text = tokenizer.tokenize(sentence)

    # Convert token to vocabulary indices
    indexed_tokens = tokenizer.convert_tokens_to_ids(tokenized_text)

    # Define sentence A and B indices associated to 1st and 2nd sentences (see paper)
    # should give you something like [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1]
    sep_idxs = [-1] + [i for i, v in enumerate(tokenized_text) if v == '[SEP]']
    segments_ids = []
    for i in range(len(sep_idxs) - 1):
      segments_ids += [i] * (sep_idxs[i+1] - sep_idxs[i])

    # Convert inputs to PyTorch tensors
    tokens_tensor = torch.tensor([indexed_tokens])
    segments_tensors = torch.tensor([segments_ids])

    tokens_tensor = tokens_tensor.to(device)
    segments_tensors = segments_tensors.to(device)

    # Predict hidden states features for each layer
    with torch.no_grad():
      encoded_layers, _ = model(tokens_tensor, segments_tensors)
      encoded_layers = [l.cpu() for l in encoded_layers]

    # We have a hidden states for each of the 12 layers in model bert-base-uncased
    encoded_layers = [l.numpy() for l in encoded_layers]
    try:
      word_idx = tokenized_text.index(word)
    # If the word is made up of multiple tokens, just use the first one of the tokens that make it up.
    except:
      for i, token in enumerate(tokenized_text):
        if token == word[:len(token)]:
          word_idx = i

    # Reconfigure to have an array of layer: embeddings
    for l in layers:
      sentence_embedding = encoded_layers[l][0][word_idx]
      points[l].append(sentence_embedding)

  points = np.asarray(points)
  return points

def tokenize_sentences(text):
  """Simple tokenizer."""
  print('starting tokenization')

  text = re.sub('\n', ' ', text)
  sentences = re.split('(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=\.|\?)\s', text)

  # Filter out too long sentences.
  sentences = [t for t in sentences if len(t) < 150]

  return sentences


def get_query(select, db=DB_PATH):
  """Executes a select statement and returns results and column/field names."""
  with sql.connect(db) as conn:
    c = conn.cursor()
    c.execute(select)
    col_names = [str(name[0]).lower() for name in c.description]
  return c.fetchall(), col_names


def get_sentences():
  """Returns a bunch of sentences from wikipedia"""
  print('Selecting sentences from wikipedia...')

  select = 'select * from articles limit 5000000'
  docs, _ = get_query(select)
  docs = [doc[3] for doc in docs]
  doc = ' '.join(docs)
  print('Number of articles selected: %d'%len(docs))

  sentences = tokenize_sentences(doc)
  print('Total number of sentences: %d'%len(sentences))
  np.random.shuffle(sentences)
  return sentences



def get_poses(word, sentences):
  """Get the part of speech tag for the given word in a list of sentences."""
  sent_data = []
  for sent in sentences:
    text = nltk.word_tokenize(sent)
    pos = nltk.pos_tag(text)
    try:
      word_idx = text.index(word)
      pos_tag = pos[word_idx][1]
    except:
      pos_tag = 'X'
    sent_data.append({
      'sentence': sent,
      'pos': pos_tag
    })

  return sent_data


if __name__ == '__main__':

  device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
  print("device : ", device)

  # Load pre-trained model tokenizer (vocabulary)
  tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
  # Load pre-trained model (weights)
  model = BertModel.from_pretrained('bert-base-uncased')
  model.eval()
  model = model.to(device)

  # Get selection of sentences from wikipedia.
  with open('static/words.json') as f:
    words = json.load(f)

  sentences = get_sentences()

  for word in tqdm(words):
    # Filter out sentences that don't have the word.
    sentences_w_word = [t for t in sentences if ' ' + word + ' ' in t]

    # Take at most 200 sentences.
    sentences_w_word = sentences_w_word[:1000]

    # And don't show anything if there are less than 100 sentences.
    if (len(sentences_w_word) > 100):
      print('starting process for word : %s'%word)
      locs_and_data = neighbors(word, sentences_w_word)
      with open('static/jsons/%s.json'%word, 'w') as outfile:
        json.dump(locs_and_data, outfile)

  # Store an updated json with the filtered words.
  filtered_words = []
  for word in os.listdir('static/jsons'):
    word = word.split('.')[0]
    filtered_words.append(word)

  with open('static/filtered_words.json', 'w') as outfile:
    json.dump(filtered_words, outfile)
  print(filtered_words)
