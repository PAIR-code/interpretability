/**
 * Get the params needed for rendering a dream sentence.
 *
 * @param {object} results - the results of the dreaming experiment.
 * @param {object} params - the parameters for the experiment.
 * @return {object} the parameters needed to render the dream sentence.
 */
export function getDreamSentenceParams(results, params) {
  const iterations = results.iterations;
  const itWidth = 8 * (iterations[
      iterations.length - 1].number.toString().length + 1);
  const headWidth = itWidth + 24;
  const sentenceColors = ['black', 'black', 'blue'];
  const target = [...params.tokens];
  for (const i in target) {
    if (params.dream_start <= i && params.dream_end >= i) {
      target[i] = '';
    }
  }
  return {
    'itWidth': itWidth,
    'headWidth': headWidth,
    'colors': sentenceColors,
    'target': target,
    'original': [...params.tokens],
  };
}

/**
 * Get the params needed for rendering a resembling sentence.
 *
 * @param {object} results - the results of the resembling experiment.
 * @param {object} params - the parameters for the experiment.
 * @return {object} the parameters needed to render the resembling sentence.
 */
export function getResembleSentenceParams(results, params) {
  const iterations = results.iterations;
  const itWidth = 8 * (iterations[
      iterations.length - 1].number.toString().length + 1);
  const headWidth = itWidth + 24;
  const sentenceColors = ['green', 'black', 'red'];
  const target = [...params.tokens];
  for (const i in target) {
    if (params.dream_start > i || params.dream_end < i) {
      target[i] = '';
    }
  }
  return {
    'itWidth': itWidth,
    'headWidth': headWidth,
    'colors': sentenceColors,
    'target': target,
    'original': [...params.tokens],
  };
}

/**
 * Get the params needed for rendering a shifted resembling sentence.
 *
 * @param {object} results - the results of the shifted resembling experiment.
 * @param {object} params - the parameters for the experiment.
 * @return {object} the parameters needed to render the shifted resembling
 * sentence.
 */
export function getShiftSentenceParams(results, params) {
  const iterations = results.iterations;
  const itWidth = 8 * (iterations[
      iterations.length - 1].number.toString().length + 1);
  const headWidth = itWidth + 24;
  const sentenceColors = ['green', 'black', 'red'];
  const target = [...params.tokens];
  const changedSentence = [...params.tokens];
  for (const i in target) {
    if (params.shift_start >= i && params.shift_end <= i) {
      target[i] = params.target;
      changedSentence[i] = params.target;
    } else {
      target[i] = '';
    }
  }
  return {
    'itWidth': itWidth,
    'headWidth': headWidth,
    'colors': sentenceColors,
    'target': target,
    'changedSentence': changedSentence,
    'original': [...params.tokens],
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
  let bestSentence = magnitudes[0].results.iterations[
      magnitudes[0].results.iterations.length - 1].sentence;
  let bestScore = 0;
  for (const mag of magnitudes) {
    let score = 0;
    for (const word in changedSentence) {
      if (mag.results.iterations[mag.results.iterations.length - 1].tokens[
          word] === changedSentence[word]) {
        score = score + 1;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestSentence = mag.results.iterations[
          mag.results.iterations.length - 1].tokens;
    }
  }
  return bestSentence;
}
