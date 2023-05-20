# -*- coding: utf-8 -*-
"""
Cluster a dataset based on syntax, tokens, and embeddings.

### Imports
"""

import pandas as pd
from nltk.util import ngrams
from tqdm import tqdm
import numpy as np
import spacy
import json
from scipy.cluster import hierarchy
import matplotlib.pyplot as plt
import json
from sentence_transformers import SentenceTransformer

# Load the SPACY model.
nlp = spacy.load("en_core_web_sm")
BASE_DIR='input_data'
TAG_NAMES = ['token', 'pos', 'dep']
N_CLUSTERS_LIST = [3, 5, 8, 9, 10, 11, 12, 15, 20, 30, 50]
METRICS = ['embedding'] + TAG_NAMES
SHOW_FIGURES = False

"""### Load data"""

def get_data(path, field_name):
  with open(path) as f:
    df = pd.read_csv(f, on_bad_lines='skip')
  field_name = field_name

  # Use only synthetic data (excluding user-provided data)
  df = df.fillna('')

  if len(df) > 500:
    df = df.sample(n = 500)

  # No pandas
  data = df.to_dict(orient='records')

  # Remove \n and prompt artifacts
  for row in data:
    # row[field_name] = row[field_name].replace('\n', ' ').replace('{', '').replace('}', '')
    row[field_name] = row[field_name].replace('\n', ' ')
  return data

"""### Save POS/DEP/Token unigram, bigram, and trigrams for each datapoint."""

def extract_data(text):
  doc = nlp(text)
  text_data = []
  for token in doc:
    token_data = {
          'token':token.text,
          'pos':token.pos_,
          'dep':token.dep_,
          'headTokenIdx': token.head.i,
        }
    text_data.append(token_data)

  return text_data

def get_sequence(parsed_data, sequence_type: str):
  return [parsed[sequence_type] for parsed in parsed_data]

def get_bi_tri_grams(sequence):
  bigrams = list(ngrams(sequence=sequence, n=2))
  trigrams = list(ngrams(sequence=sequence, n=3))
  return bigrams, trigrams

def get_grams(parse_data, sequence_type: str):
  tokens = get_sequence(parse_data, sequence_type)
  token_bigrams, token_trigrams = get_bi_tri_grams(tokens)
  return {
      f'{sequence_type}_unigrams': tokens,
      f'{sequence_type}_bigrams': token_bigrams,
      f'{sequence_type}_trigrams': token_trigrams,
  }

def annotate_grammar(data, field_name):
  for i, row in tqdm(enumerate(data)):
    row['index'] = i
    synth_data_text = row[field_name]
    parse_data = extract_data(synth_data_text)

    # Get lists of uni-, bi- and tri- grams.
    token_grams = get_grams(parse_data, 'token')
    pos_grams = get_grams(parse_data, 'pos')
    dep_grams = get_grams(parse_data, 'dep')

    # Save in the data
    row['parse_data'] = parse_data
    row = {**row, **token_grams, **pos_grams, **dep_grams}
    data[i] = row
  return data

"""### Compute POS/Token/DEP based distance matrices
(2-3 minutes)
"""

def sim_function(synth_obj1, synth_obj2, tag_name: str):
  tags_1 = synth_obj1[tag_name]
  tags_2 = synth_obj2[tag_name]
  intersection = [tag for tag in tags_1 if tag in tags_2]
  intersection = list(set(intersection))
  max_count = max(len(set(tags_1)), len(set(tags_1)))
  if max_count == 0:
    return 0
  return len(intersection) / float(max_count)

def sim_function_all_grams(synth_obj1, synth_obj2, tag: str):
  sim_uni = sim_function(synth_obj1, synth_obj2, f'{tag}_unigrams')
  sim_bi = sim_function(synth_obj1, synth_obj2, f'{tag}_bigrams')
  sim_tri = sim_function(synth_obj1, synth_obj2, f'{tag}_trigrams')
  return (sim_uni + sim_bi + sim_tri)/3

def get_distance_matrix(data, tag_name):
  n = len(data)
  sim = np.identity(n) # diagonal with ones (100 percent similarity)
  for i in range(n):
    for j in range(n):
      sim[i][j] = sim_function_all_grams(data[i], data[j], tag_name)

  sim_normal_distance = 1 - sim
  return sim_normal_distance

def get_distance_matrics(data):
  all_distance_matrices = {}
  for tag_name in tqdm(TAG_NAMES):
    all_distance_matrices[tag_name] = get_distance_matrix(data, tag_name)
  return all_distance_matrices

"""### Get embedding-based similarity
(5-10 minutes)
"""

def get_t5_embeddings(text_content: str) -> np.ndarray:
  """Return embeddings from the T5 sentence encoder model."""


def get_embedding_matrix(data, field_name):
  model = SentenceTransformer('sentence-transformers/sentence-t5-base')
  text_contents = [row[field_name] for row in data]
  all_embeddings = model.encode(text_contents, show_progress_bar=True)
  norm = np.linalg.norm(all_embeddings)
  emb_similarities = np.dot(all_embeddings,all_embeddings.T)/norm/norm
  emb_distances = 1 - emb_similarities
  return emb_distances

"""### Clustering
Across all similarity types, for a variety of numbers of clusters
"""

def add_cluster_data(data, all_distance_matrices, field_name):
  # Initialize each row's cluster ids.
  for row in data:
    row['cluster_ids'] = {}
    for similarity_type in METRICS:
      row['cluster_ids'][similarity_type] = {}

  for similarity_type in METRICS:
    print('getting linkages for ', similarity_type)
    distance_matrix = all_distance_matrices[similarity_type]
    linkage_tree = hierarchy.linkage(distance_matrix, 'ward')

    for k in tqdm(N_CLUSTERS_LIST):
      cluster_labels = hierarchy.fcluster(linkage_tree, k, criterion='maxclust')
      for instance_index, cluster_id in enumerate(cluster_labels):
        data[instance_index]['cluster_ids'][similarity_type][k] = int(cluster_id)

    add_sort_idxs(data, linkage_tree, field_name, similarity_type)

  return data

"""### Add order indices"""

def add_sort_idxs(data, linkage_tree, field_name, metric):
  dendrogram_data = hierarchy.dendrogram(
      linkage_tree,
      orientation='right',
      labels=[row[field_name][:50] for row in data],
  )
  for row in data:
    if not 'order_index' in row:
      row['order_index'] = {}
    row['order_index'][metric] = -1

  for leaf_index, instance_index in enumerate(dendrogram_data['leaves']):
    data[instance_index]['order_index'][metric] = leaf_index

  return data

"""### Sequential pattern mining (extract frequent substrings with gaps allowed)
e.g., given [a b c d e] and [a c f e]: [a c e] is the most frequent substring
"""



# Algorithm adapted from
# https://gist.github.com/chuanconggao/4df9c1b06fa7f3ed854d5d96e2ae499f
# Adaptation includes to consider POS tag associated
from collections import defaultdict

def frequent_rec_modified(patt, mdb, db, results, minsup):
    if len(patt) >= 6: return
    results.append((len(mdb), patt))

    occurs = defaultdict(list)
    for (i, startpos, subpos) in mdb:
        seq = db[i]
        for j in range(startpos + 1, len(seq)):
            for k in range(len(seq[j])):
                l = occurs[seq[j][k]]
                # exclude if two consecurative patterns are both pos
                if (len(l) == 0 or l[-1][0] != i) and not (seq[j][k].startswith('pos:') and seq[startpos][subpos].startswith('pos:')):
                    l.append((i, j, k))

    for (c, newmdb) in occurs.items():
        if len(newmdb) >= minsup:
            frequent_rec_modified(patt + [c], newmdb, db, results, minsup)

    return results

def score_patterns(results, number_of_sentences, is_print=False):
  results_with_scores = []

  # longest sentences (# tokens)
  max_len = max([len(r[1]) for r in results]) if len(results) > 0 else 1

  for r in results:
    # heuristics to find the most informative ones
    score = 0.0
    if len(r[1]) > 0:
      # good when many sentences have this pattern
      score += 0.5 * float(r[0] / number_of_sentences)
      # good when the size of pattern is long
      # good when the pattern includes more actual token (than pos)
      score += 0.25 * float(len(r[1]) / max_len)
      score += 0.25 * float(sum([t.startswith("t:") for t in r[1]]) / max_len)
      # Filter out less informative cases:
      # only when a pattern appears more than 1 time
      # at least one actual token (not all are POS)
      # more actual tokens than POS
      if r[0] > 1 and \
        sum([t.startswith("t:") for t in r[1]]) >= 1 and \
        sum([t.startswith("t:") for t in r[1]]) >= sum([t.startswith("pos:") for t in r[1]]):
        results_with_scores.append((score, r))

  # sort by score
  sorted_results = sorted(results_with_scores, key=lambda x: x[0], reverse=True)

  # just to print
  if is_print:
    for r_with_score in sorted_results[:10]:
      r = r_with_score[1]
      # if len(r[1]) > 0 and len(r[1]) >= 2 and r[0] > 1 and sum([t.startswith("t:") for t in r[1]]) >= 1 and sum([t.startswith("pos:") for t in r[1]]) <= 2:
      print(r_with_score)

  return sorted_results[:10]

# test
test_sentences = [
    [['t:my', 'pos:A'], ['t:name', 'pos:B'], ['t:is', 'pos:C'], ['t:john', 'pos:B']],
    [['t:my', 'pos:A'], ['t:name', 'pos:B'], ['t:is', 'pos:C'], ['t:arvind', 'pos:B']],
    [['t:your', 'pos:A'], ['t:name', 'pos:B'], ['t:is', 'pos:C'], ['t:susan', 'pos:B']],
    [['t:john', 'pos:B'], ['t:and', 'pos:E'], ['t:susan', 'pos:C'], ['t:know', 'pos:C'], ['t:me', 'pos:A']]
]
minsup = 2
test_results = []
mdb = [(i, -1, -1) for i in range(len(test_sentences))]

test_results = frequent_rec_modified([], mdb, test_sentences, test_results, minsup)
l_ = score_patterns(test_results, len(test_sentences), True)



def get_export_freq_seq(data):
  export_freq_seq = {}
  for similarity_type in METRICS:
    freq_seq = {}
    data.sort(key=lambda x: x['order_index'][similarity_type])

    for k in N_CLUSTERS_LIST:

      freq_seq[k] = {}
      cluster_ids = range(1, k+1)
      for cluster_id in cluster_ids:

        tokenized_data = [
            [
              ['t:' + token['token'] + '#pos:' + token['pos'], 'pos:' + token['pos']]
              for token in row['parse_data']
            ]
            for row in data if row['cluster_ids'][similarity_type][k] == cluster_id]

        # print(cluster_id, len(tokenized_data))
        minsup = len(tokenized_data) * 0.3

        results = []
        mdb = [(i, -1, -1) for i in range(len(tokenized_data))]
        if len(tokenized_data) >= 3:
          results = frequent_rec_modified([], mdb, tokenized_data, results, minsup)

        sorted_results = score_patterns(results, len(tokenized_data), False)
        # store only the most informative one
        if len(sorted_results) > 0:
          # print(sorted_results[0])
          freq_seq[k][cluster_id] = {"top_sequence": {"tokens": sorted_results[0][1][1], "count": sorted_results[0][1][0]}}
        else:
          freq_seq[k][cluster_id] = {"top_sequence": {}}

    export_freq_seq[similarity_type] = freq_seq
  return export_freq_seq

"""### Save"""

gram_names = ['token_unigrams', 'token_bigrams', 'token_trigrams', 'pos_unigrams', 'pos_bigrams', 'pos_trigrams', 'dep_unigrams', 'dep_bigrams', 'dep_trigrams']
def sanitize_copy(row):
  return {k: row[k] for k in set(list(row.keys())) - set(gram_names)}

def save(data, export_freq_seq, name):
  path = f'static/data/{name}.json'
  with open(path, 'w') as f:
    json.dump({"data": data, "clusters": export_freq_seq}, f, indent='\t')

"""### Similarity between different similarity metrics"""

# Dataset_name corresponds to the csv of data in BASE_DIR, and the end result
# will be downloaded as <dataset_name>.json
# field_name must be a field within the csv.
def run(dataset_name, field_name):
  print()
  print()
  print('=========== RUNNING ANALYSIS FOR ' + dataset_name)

  # Load data
  print()
  print('=========== LOADING (step 1/8)')
  csv_path = f'{BASE_DIR}/{dataset_name}.csv'
  data = get_data(csv_path, field_name)

  # Annotate with POS, DEP, etc
  print()
  print('=========== ANNOTATING (step 2/8)')
  data = annotate_grammar(data, field_name)

  # Get similarity matrics, including embedding similarity
  print()
  print('=========== CALCULATING DISTANCE MATRICES (step 3/8)')
  all_distance_matrices = get_distance_matrics(data)
  print()
  print('=========== CALCULATING EMBEDDINGS (step 4/8)')
  all_distance_matrices['embedding'] = get_embedding_matrix(data, field_name)

  # Add the cluster data
  print()
  print('=========== CLUSTERING (step 5/8)')
  data = add_cluster_data(data, all_distance_matrices, field_name)

  # Get summary
  print()
  print('=========== GETTING FREQUENCIES (step 7/8)')
  export_freq_seq = get_export_freq_seq(data)
  data = [sanitize_copy(row) for row in data]

  print()
  print('=========== SAVING (step 8/8)')
  save(data, export_freq_seq, dataset_name)
  if SHOW_FIGURES:
    show_norms(all_distance_matrices, dataset_name)

def show_norms(all_distance_matrices, title):
  norms = []
  for i, metric_a in enumerate(METRICS):
    norms.append([])
    for j, metric_b in enumerate(METRICS):
      diff = all_distance_matrices[metric_a] - all_distance_matrices[metric_b]
      norm = np.linalg.norm(diff)
      norms[i].append(norm)
  plot_norms(norms, METRICS, title)

def plot_norms(norms, labels, title):
  plt.figure(figsize=(2.5, 2.5))
  im = plt.imshow(norms, aspect='auto')
  ax = plt.gca()

  # Show all ticks and label them with the respective list entries
  pretty_labels = ['Emb', 'Token', 'POS', 'DEP']
  ax.set_xticks(np.arange(len(labels)), labels=pretty_labels)
  ax.set_yticks(np.arange(len(labels)), labels=pretty_labels)

  # Loop over data dimensions and create text annotations.
  for i in range(len(labels)):
    for j in range(len(labels)):
      text = ax.text(j, i, int(norms[i][j]), ha="center", va="center", color="w")

  # ax.set_title("Norms Between \n Similarity Metrics",  fontsize=15)
  ax.set_title(title, fontsize=15)
  plt.show()

# These are tuples of <dataset_name>, <field_name>.
# Dataset_name corresponds to the csv of data in BASE_DIR, and the end result
# will be downloaded as <dataset_name>.json
# field_name must be a field within the csv.
all_data = [
    ('music_new', 'query'),
    ('dialog', 'col1'),
  ]

data = {}
for dataset_name, field in all_data:
  data[dataset_name] = run(dataset_name, field)

