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
  description: string;
  dispPos?: string;
}

export const POS: POSTag[] =
    [
      {
        'tag': 'CC',
        'description': 'conjunction, coordinating',
        'dispPos': 'CC'
      },
      {'tag': 'CD', 'description': 'numeral, cardinal', 'dispPos': 'OT'},
      {'tag': 'DT', 'description': 'determiner', 'dispPos': 'CC'},
      {'tag': 'EX', 'description': 'existential there', 'dispPos': 'OT'},
      {'tag': 'FW', 'description': 'foreign word', 'dispPos': 'OT'},
      {
        'tag': 'IN',
        'description': 'preposition or conjunction, subordinating',
        'dispPos': 'CC'
      },
      {
        'tag': 'JJ',
        'description': 'adjective or numeral, ordinal',
        'dispPos': 'JJ'
      },
      {'tag': 'JJR', 'description': 'adjective, comparative', 'dispPos': 'JJ'},
      {'tag': 'JJS', 'description': 'adjective, superlative', 'dispPos': 'JJ'},
      {'tag': 'LS', 'description': 'list item marker', 'dispPos': 'OT'},
      {'tag': 'MD', 'description': 'modal auxiliary', 'dispPos': 'RB'},
      {
        'tag': 'NN',
        'description': 'noun, common, singular or mass',
        'dispPos': 'NN'
      },
      {'tag': 'NNP', 'description': 'noun, proper, singular', 'dispPos': 'NN'},
      {'tag': 'NNPS', 'description': 'noun, proper, plural', 'dispPos': 'NN'},
      {'tag': 'NNS', 'description': 'noun, common, plural', 'dispPos': 'NN'},
      {'tag': 'PDT', 'description': 'pre-determiner', 'dispPos': 'DT'},
      {'tag': 'POS', 'description': 'genitive marker', 'dispPos': 'OT'},
      {'tag': 'PRP', 'description': 'pronoun, personal', 'dispPos': 'PR'},
      {'tag': 'PRP$', 'description': 'pronoun, possessive', 'dispPos': 'PR'},
      {'tag': 'RB', 'description': 'adverb', 'dispPos': 'RB'},
      {'tag': 'RBR', 'description': 'adverb, comparative', 'dispPos': 'RB'},
      {'tag': 'RBS', 'description': 'adverb, superlative', 'dispPos': 'RB'},
      {'tag': 'RP', 'description': 'particle', 'dispPos': 'OT'},
      {'tag': 'SYM', 'description': 'symbol', 'dispPos': 'OT'},
      {
        'tag': 'TO',
        'description': '\'to\' as preposition or infinitive marker',
        'dispPos': 'CC'

      },
      {'tag': 'UH', 'description': 'interjection', 'dispPos': 'OT'},
      {'tag': 'VB', 'description': 'verb, base form', 'dispPos': 'VB'},
      {'tag': 'VBD', 'description': 'verb, past tense', 'dispPos': 'VB'},
      {
        'tag': 'VBG',
        'description': 'verb, present participle or gerund',
        'dispPos': 'VB'
      },
      {'tag': 'VBN', 'description': 'verb, past participle', 'dispPos': 'VB'},
      {
        'tag': 'VBP',
        'description': 'verb, present tense, not 3rd person singular',
        'dispPos': 'VB'

      },
      {'tag': 'VBZ', 'description': 'verb, present tense', 'dispPos': 'VB'},
      {'tag': 'WDT', 'description': 'WH-determiner', 'dispPos': 'DT'},
      {'tag': 'WP', 'description': 'WH-pronoun', 'dispPos': 'PR'},
      {'tag': 'WP$', 'description': 'WH-pronoun, possessive', 'dispPos': 'PR'},
      {'tag': 'WRB', 'description': 'Wh-adverb', 'dispPos': 'RB'}
    ]


    export const SimplePOS: POSTag[] = [
      {'tag': 'DT', 'description': 'Determiner'},
      {'tag': 'JJ', 'description': 'Adjective'},
      {'tag': 'NN', 'description': 'Noun'},
      {'tag': 'CC', 'description': 'Preposition or conjunction'},
      {'tag': 'VB', 'description': 'Verb'},
      {'tag': 'PR', 'description': 'Pronoun'},
      {'tag': 'RB', 'description': 'Adverb'},
      {'tag': 'OT', 'description': 'Other'},
    ]
