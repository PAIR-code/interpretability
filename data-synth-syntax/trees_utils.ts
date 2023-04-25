
/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */

/**
 * @fileoverview Util methods and data for tree vis.
 */

import * as d3 from 'd3';

export const POS = {
  'NOUN': 'noun, e.g. girl, cat, tree, air, beauty',
  'ADP': 'adposition, e.g. in, to, during',
  'ADV': 'adverb, e.g. very, tomorrow, down, where, there',
  'ADJ': 'adjective, e.g. big, old, green, incomprehensible, first',
  'AUX': 'auxiliary, e.g. is, has (done), will (do), should (do)',
  'CONJ': 'conjunction, e.g. and, or, but',
  'CCONJ': 'coordinating conjunction, e.g. and, or, but',
  'DET': 'determiner, e.g. a, an, the',
  'INTJ': 'interjection, e.g. psst, ouch, bravo, hello',
  'NUM': 'numeral, e.g. 1, 2017, one, seventy-seven, IV, MMXIV',
  'PART': 'particle, e.g. ’s, not,',
  'PRON': 'pronoun, e.g I, you, he, she, myself, themselves, somebody',
  'PROPN': 'proper noun, e.g. Mary, John, London, NATO, HBO',
  'PUNCT': 'punctuation, e.g. ., (, ), ?',
  'SCONJ': 'subordinating conjunction, e.g. if, while, that',
  'SYM': 'symbol, e.g. $, %, §, ©, +, −, ×, ÷, =, :), 😝',
  'VERB': 'verb, e.g. run, runs, running, eat, ate, eating',
  'X': 'other, e.g. sfpksdpsxmsa',
  'SPACE': 'space, e.g. '
};

export const DEP = {
  'CC': 'coordinating conjunction',
  'CCOMP': 'clausal complement',
  'COMPOUND': 'compound',
  'CONJ': 'conjunct',
  'CSUBJ': 'clausal subject',
  'CSUBJPASS': 'clausal subject (passive)',
  'DATIVE': 'dative',
  'DEP': 'unclassified dependent',
  'DET': 'determiner',
  'DOBJ': 'direct object',
  'EXPL': 'expletive',
  'INTJ': 'interjection',
  'MARK': 'marker',
  'META': 'meta modifier',
  'NEG': 'negation modifier',
  'NMOD': 'modifier of nominal',
  'NPADVMOD': 'noun phrase as adverbial modifier',
  'NSUBJ': 'nominal subject',
  'NSUBJPASS': 'nominal subject (passive)',
  'NUMMOD': 'numeric modifier',
  'OPRD': 'object predicate',
  'PARATAXIS': 'parataxis',
  'PCOMP': 'complement of preposition',
  'POBJ': 'object of preposition',
  'POSS': 'possession modifier',
  'PRECONJ': 'pre-correlative conjunction',
  'PREDET': 'None',
  'PREP': 'prepositional modifier',
  'PRT': 'particle',
  'PUNC': 'punctuation',
  'QUANTMOD': 'modifier of quantifier',
  'RELCL': 'relative clause modifier',
  'SCOMP': 'open clausal complement'
};

console.log(d3);
export const COLOR_POS = d3.scaleOrdinal(d3.schemeSet3);
COLOR_POS.domain(Object.keys(POS));

export const COLOR_DEP = d3.scaleOrdinal(d3.schemeSet1);
COLOR_DEP.domain(Object.keys(DEP));
