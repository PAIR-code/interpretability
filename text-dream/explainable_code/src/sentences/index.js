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
 * Get the params needed for rendering a dream sentence.
 *
 * @param {object} results - the results of the dreaming experiment.
 * @param {object} params - the parameters for the experiment.
 * @return {object} the parameters needed to render the dream sentence.
 */
export function getDreamSentenceParams(results, params) {
  const iterations = results.iterations;
  const itWidth =
    8 * (iterations[iterations.length - 1].number.toString().length + 1);
  const headWidth = itWidth + 24;
  const sentenceColors = ["black", "black", "blue"];
  const target = [...params.tokens];
  for (const i in target) {
    if (params.dream_start <= i && params.dream_end >= i) {
      target[i] = "";
    }
  }
  return {
    itWidth: itWidth,
    headWidth: headWidth,
    colors: sentenceColors,
    target: target,
    original: [...params.tokens],
  };
}

/**
 * Get the params needed for rendering a reconstruct sentence.
 *
 * @param {object} results - the results of the reconstruct experiment.
 * @param {object} params - the parameters for the experiment.
 * @return {object} the parameters needed to render the reconstruct sentence.
 */
export function getReconstructSentenceParams(results, params) {
  const iterations = results.iterations;
  const itWidth =
    8 * (iterations[iterations.length - 1].number.toString().length + 1);
  const headWidth = itWidth + 24;
  const sentenceColors = ["green", "black", "red"];
  const target = [...params.tokens];
  for (const i in target) {
    if (params.dream_start > i || params.dream_end < i) {
      target[i] = "";
    }
  }
  return {
    itWidth: itWidth,
    headWidth: headWidth,
    colors: sentenceColors,
    target: target,
    original: [...params.tokens],
  };
}

/**
 * Get the params needed for rendering a shifted reconstruct sentence.
 *
 * @param {object} results - the results of the shifted reconstruct experiment.
 * @param {object} params - the parameters for the experiment.
 * @return {object} the parameters needed to render the shifted reconstruct
 * sentence.
 */
export function getShiftSentenceParams(results, params) {
  const iterations = results.iterations;
  const itWidth =
    8 * (iterations[iterations.length - 1].number.toString().length + 1);
  const headWidth = itWidth + 24;
  const sentenceColors = ["green", "black", "red"];
  const target = [...params.tokens];
  const changedSentence = [...params.tokens];
  for (const i in target) {
    if (params.shift_start >= i && params.shift_end <= i) {
      target[i] = params.target;
      changedSentence[i] = params.target;
    } else {
      target[i] = "";
    }
  }
  return {
    itWidth: itWidth,
    headWidth: headWidth,
    colors: sentenceColors,
    target: target,
    changedSentence: changedSentence,
    original: [...params.tokens],
  };
}

/**
 * Used for getting the result of multiple magnitudes that comes closest to the
 * target.
 *
 * @param {array} changedSentence - the sentence target with some tokens
 * changed.
 * @param {array} magnitudes - the results for all the different magnitudes.
 * @return {array} the sentence that gets closest to the target.
 */
export function getClosestResult(changedSentence, magnitudes) {
  let bestSentence =
    magnitudes[0].results.iterations[
      magnitudes[0].results.iterations.length - 1
    ].sentence;
  let bestScore = 0;
  for (const mag of magnitudes) {
    let score = 0;
    for (const word in changedSentence) {
      if (
        mag.results.iterations[mag.results.iterations.length - 1].tokens[
          word
        ] === changedSentence[word]
      ) {
        score = score + 1;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestSentence =
        mag.results.iterations[mag.results.iterations.length - 1].tokens;
    }
  }
  return bestSentence;
}
