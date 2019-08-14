
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
import * as d3 from 'd3';

import {commonWords} from './commonWords';
import {Label, Point, SentData} from './index';
import {POS, POSTag, SimplePOS} from './pos';

export function letterColor(word: string) {
  const alphabet = [
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
    'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'
  ];
  const posIdx = alphabet.indexOf(word[0]);
  const percentageOffset = .9;
  return d3.interpolateInferno((posIdx / alphabet.length) * percentageOffset);
}

/**
 * Get the set of pos tags (and descriptions) that are currently shown.
 */
export function getUsedPoses(data): POSTag[] {
  const posTags = new Set();
  data.forEach(
      (d: SentData) =>
          posTags.add(SimplePOS.find(posObj => posObj.tag == d.pos)));
  return Array.from(posTags);
}

export function fullPOSToSimplePOS(pos: string) {
  const posTag = POS.find(posObj => posObj.tag == pos);
  return SimplePOS.find(posObj => posTag.dispPos == posObj.tag).tag;
}
/**
 * Given a string, return the words in that string (stripped.)
 */
export function labelToWordsSet(
    label: string, word: string, removeSingleWords = true) {
  const labelStripped = label.replace(/[^\w\s]|_/g, '').replace(/\s+/g, ' ');
  let words = labelStripped.split(' ');

  // Also add compounds that are the previous word + the query word (and next).
  const idx = words.indexOf(word);
  if ((idx > 0) && !commonWords.includes(words[idx - 1])) {
    const prevWord = `${words[idx - 1]} ${word}`;
    words.push(prevWord);
  }
  if ((idx < words.length - 1) && !commonWords.includes(words[idx + 1])) {
    const nextWord = `${word} ${words[idx + 1]}`;
    words.push(nextWord);
  }
  // Take out those words being alone.
  if (removeSingleWords) {
    words.splice(idx + 1, 1)
    words.splice(idx - 1, 1)
  }

  const replaceRegex = (regex: RegExp, replacementString: string) => {
    for (let i = 0; i < words.length; i++) {
      if (regex.test(words[i])) {
        words[i] = replacementString;
      }
    }
  };

  replaceRegex(/^\d{4}$/, '[years]');
  replaceRegex(/^\d*$/, '[numbers]');
  replaceRegex(/^\d*[th|rd|st]$/, '[numericals]');

  words = words.filter(word => !commonWords.includes(word));
  return Array.from(new Set(words));
}

export function getAllWordsInLabels(
    data: Point[], word: string): {[word: string]: number[]} {
  // Add the overall labels.
  // Allwords maps a word to a list of coordinates of all the places it lies
  // in.
  const allWords: {[word: string]: number[]} = {};
  data.forEach((d: any) => {
    const words = labelToWordsSet(d.sentenceLabel, word);
    words.forEach((word: string) => {
      if (word !== 'constructor') {
        if (!(word in allWords)) {
          allWords[word] = [];
        }
        if (!(d.coords in allWords[word])) {
          allWords[word].push(d.coords);
        }
      }
    });
  });
  return allWords;
}

export function fontSize(d: Label) {
  return Math.min(Math.sqrt(d.count) * 10, 50);
}

export function dist(pt0: number[], pt1: number[]) {
  if (pt1[1] == pt0[1]) {
    return pt1[0] - pt0[0];
  }
  const x = pt1[0] - pt0[0];
  const y = pt1[1] - pt0[1];
  return Math.hypot(x, y);
}

/**
 * Load
 * @param url
 * @param successCallback
 * @param errorMesage
 */
export async function loadJson(url: string, errorMesage: string) {
  // TODO(ereif): load these directly from cns/x20 rather than locally.
  const headers = new Headers({mode: 'cors', credentials: 'include'});
  const res = await d3.json(url, {method: 'GET', headers}).catch((err) => {
    alert(errorMesage);
  });
  return res;
}

export function boldifyWord(text: string, word: string) {
  const labelStripped = text.replace(/[^\w\s]|_/g, '').replace(/\s+/g, ' ');
  const words = labelStripped.split(' ');
  const wordIdx = words.indexOf(word);
  if (wordIdx > -1) {
    const firstHalf = words.slice(0, wordIdx).join(' ');
    const secondhalf = words.slice(wordIdx + 1).join(' ');
    return firstHalf + ' <span class="word">' + word + '</span> ' + secondhalf;
  }
  return text;
}

export function boldifyWords(
    text: string, word: string, currLabelWord?: string) {
  if (!currLabelWord) {
    return boldifyWord(text, word);
  }
  if (currLabelWord.includes(word)) {
    return boldifyWord(text, currLabelWord);
  }

  // TODO(ereif): this is messy and repeated, clean up.
  const labelStripped = text.replace(/[^\w\s]|_/g, '').replace(/\s+/g, ' ');
  const words = labelStripped.split(' ');
  const wordIdx = words.indexOf(word);
  const firstHalf = words.slice(0, wordIdx).join(' ');
  const secondhalf = words.slice(wordIdx + 1).join(' ');

  return boldifyWord(firstHalf, currLabelWord) + ' <span class="word">' + word +
      '</span> ' + boldifyWord(secondhalf, currLabelWord);
}


/**
 * Given a collection of datapoint 2d locations, center these onscreen.
 * @param data points to be centered.
 */
export function centerFrame(
    data: number[][][], width: number, height: number, offset: number) {
  const margin = 40;
  const centerx = d3.scaleLinear().range([margin + offset, width - margin * 5]);
  const centery = d3.scaleLinear().range([margin, height - margin]);

  for (let layer = 0; layer < 12; layer++) {
    const dataLayer = data[layer];
    const transposedEmb = transpose(dataLayer);
    const xs = transposedEmb[0];
    const ys = transposedEmb[1];

    const minX = parseFloat(d3.min(xs));
    const maxX = parseFloat(d3.max(xs));
    const minY = parseFloat(d3.min(ys));
    const maxY = parseFloat(d3.max(ys));
    centerx.domain([minX, maxX]);
    centery.domain([minY, maxY]);

    dataLayer.forEach((point: number[]) => {
      point[0] = centerx(point[0]);
      point[1] = centery(point[1]);
    })
  }
  return data;
}

/**
 * Transpose a 2D array.
 */
export function transpose(array: any[]) {
  return array[0].map((_: any, i: number) => array.map(row => row[i]));
}


/**
 * Get the URL word parameter.
 */
export function getURLWord() {
  // D3.json adds the subsearch hash to the url; this is a workaround.
  const urlParams = new URLSearchParams(window.location.hash.substring(1));
  return urlParams.get('word');
}

/**
 * Set the URL word parameter.
 */
export function setURLWord(word: string) {
  const urlParams = new URLSearchParams(window.location.search);
  urlParams.set('word', word);
  window.history.replaceState({}, '', `${location.pathname}?#${urlParams}`);
}

export function isMobile() {
  return screen.width <= 590;
}
