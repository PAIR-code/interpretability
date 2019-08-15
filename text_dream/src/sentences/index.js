export function truncate(text, length, end) {
  if (isNaN(length))
    length = 10;
  if (end === undefined)
    end = "...";
  if (text.length <= length || text.length - end.length <= length) {
    return text;
  } else {
    return String(text).substring(0, length - end.length) + end;
  }
};

export function getDreamSentenceParams(results, params) {
  var iterations = results.iterations;
  var itWidth = 8 * (iterations[
      iterations.length - 1].number.toString().length + 1);
  var headWidth = itWidth + 24;
  var sentenceColors = ['black', 'black', 'blue']
  var target = [...params.tokens];
  for (var i in target) {
      if (params.dream_start <= i && params.dream_end >= i) {
        target[i] = '';
      }
  }
  return {
    'itWidth': itWidth,
    'headWidth': headWidth,
    'colors': sentenceColors,
    'target': target,
    'original': [...params.tokens]
  }
}

export function getResembleSentenceParams(results, params) {
  var iterations = results.iterations;
  var itWidth = 8 * (iterations[
      iterations.length - 1].number.toString().length + 1);
  var headWidth = itWidth + 24;
  var sentenceColors = ['green', 'black', 'red']
  var target = [...params.tokens];
  for (var i in target) {
    if (params.dream_start > i || params.dream_end < i) {
      target[i] = '';
    }
  }
  return {
    'itWidth': itWidth,
    'headWidth': headWidth,
    'colors': sentenceColors,
    'target': target,
    'original': [...params.tokens]
  }
}

export function getShiftSentenceParams(results, params) {
  var iterations = results.iterations;
  var itWidth = 8 * (iterations[
      iterations.length - 1].number.toString().length + 1);
  var headWidth = itWidth + 24;
  var sentenceColors = ['green', 'black', 'red']
  var target = [...params.tokens];
  var changedSentence = [...params.tokens];
  for (var i in target) {
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
    'original': [...params.tokens]
  }
}

export function getClosestResult(changed_sentence, magnitudes) {
  var best_sentence = magnitudes[0].results.iterations[
      magnitudes[0].results.iterations.length - 1].sentence;
  var best_score = 0;
  for (var mag of magnitudes) {
    var score = 0;
    for (var word in changed_sentence) {
      if (mag.results.iterations[mag.results.iterations.length - 1].tokens[
          word] === changed_sentence[word]) {
        score = score + 1;
      }
    }
    if (score > best_score) {
      best_score = score;
      best_sentence = mag.results.iterations[
          mag.results.iterations.length - 1].tokens
    }
  }
  return best_sentence;
}
