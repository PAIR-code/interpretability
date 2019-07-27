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

/** Part of speech tags and descriptions, from http://www.nltk.org/*/
export interface POSTag {
  tag: string;
  description: string
}

export const POS: POSTag[] = [
  {'tag': 'CC', 'description': 'conjunction, coordinating'},
  {'tag': 'CD', 'description': 'numeral, cardinal'},
  {'tag': 'DT', 'description': 'determiner'},
  {'tag': 'EX', 'description': 'existential there'},
  {'tag': 'FW', 'description': 'foreign word'},
  {'tag': 'IN', 'description': 'preposition or conjunction, subordinating'},
  {'tag': 'JJ', 'description': 'adjective or numeral, ordinal'},
  {'tag': 'JJR', 'description': 'adjective, comparative'},
  {'tag': 'JJS', 'description': 'adjective, superlative'},
  {'tag': 'LS', 'description': 'list item marker'},
  {'tag': 'MD', 'description': 'modal auxiliary'},
  {'tag': 'NN', 'description': 'noun, common, singular or mass'},
  {'tag': 'NNP', 'description': 'noun, proper, singular'},
  {'tag': 'NNPS', 'description': 'noun, proper, plural'},
  {'tag': 'NNS', 'description': 'noun, common, plural'},
  {'tag': 'PDT', 'description': 'pre-determiner'},
  {'tag': 'POS', 'description': 'genitive marker'},
  {'tag': 'PRP', 'description': 'pronoun, personal'},
  {'tag': 'PRP$', 'description': 'pronoun, possessive'},
  {'tag': 'RB', 'description': 'adverb'},
  {'tag': 'RBR', 'description': 'adverb, comparative'},
  {'tag': 'RBS', 'description': 'adverb, superlative'},
  {'tag': 'RP', 'description': 'particle'},
  {'tag': 'SYM', 'description': 'symbol'},
  {'tag': 'TO', 'description': '\'to\' as preposition or infinitive marker'},
  {'tag': 'UH', 'description': 'interjection'},
  {'tag': 'VB', 'description': 'verb, base form'},
  {'tag': 'VBD', 'description': 'verb, past tense'},
  {'tag': 'VBG', 'description': 'verb, present participle or gerund'},
  {'tag': 'VBN', 'description': 'verb, past participle'},
  {'tag': 'VBP', 'description': 'verb, present tense, not 3rd person singular'},
  {'tag': 'VBZ', 'description': 'verb, present tense,'},
  {'tag': 'WDT', 'description': 'WH-determiner'},
  {'tag': 'WP', 'description': 'WH-pronoun'},
  {'tag': 'WP$', 'description': 'WH-pronoun, possessive'},
  {'tag': 'WRB', 'description': 'Wh-adverb'}
]
