export function iterationsToGlyphsParams(iterations) {
  var glyphsParams = {};
  if (iterations[0].hasOwnProperty('temperature')) {
    iterationsToTypeParams(glyphsParams, iterations, 'temperature');
    glyphsParams['temperature'].color = '#3f51b5';
  }
  if (iterations[0].hasOwnProperty('loss')) {
    iterationsToTypeParams(glyphsParams, iterations, 'loss');
    glyphsParams['loss'].color = '#795548';
  }
  if (iterations[0].hasOwnProperty('ids_loss')) {
    iterationsToTypeParams(glyphsParams, iterations, 'ids_loss');
    glyphsParams['ids_loss'].color = '#9c27b0';
  }
  if (iterations[0].hasOwnProperty('activation')) {
    iterationsToTypeParams(glyphsParams, iterations, 'activation');
    glyphsParams['activation'].color = '#795548';
  }
  if (iterations[0].hasOwnProperty('ids_activation')) {
    iterationsToTypeParams(glyphsParams, iterations, 'ids_activation');
    glyphsParams['ids_activation'].color = '#9c27b0';
  }
  return glyphsParams;
}

function iterationsToTypeParams(glyphsParams, iterations, type) {
  glyphsParams[type] = {
    iterations: [],
    extremes: {max: 0, min: 0}
  }
  for (var iteration of iterations) {
    glyphsParams[type].iterations.push(iteration[type]);
    if (glyphsParams[type].extremes.max < iteration[type]) {
      glyphsParams[type].extremes.max = iteration[type];
    }
  }
}

export function magnitudesToGlyphsParams(magnitudes) {
  var glyphsParams = {};
  if (magnitudes[0].results.iterations[0].hasOwnProperty('loss')) {
    magnitudesToTypeParams(glyphsParams, magnitudes, 'loss');
    glyphsParams['loss'].color = '#795548';
  }
  if (magnitudes[0].results.iterations[0].hasOwnProperty('ids_loss')) {
    magnitudesToTypeParams(glyphsParams, magnitudes, 'ids_loss');
    glyphsParams['ids_loss'].color = '#9c27b0';
  }
  return glyphsParams;
}

function magnitudesToTypeParams(glyphsParams, magnitudes, type) {
  glyphsParams[type] = {
    magnitudes: [],
    extremes: {max: 0, min: 0}
  }
  for (var magnitude of magnitudes) {
    var lastIteration = magnitude.results.iterations[
        magnitude.results.iterations.length - 1]
    glyphsParams[type].magnitudes.push(lastIteration[type]);
    for (var iteration of magnitude.results.iterations) {
      if (glyphsParams[type].extremes.max < iteration[type]) {
        glyphsParams[type].extremes.max = iteration[type];
      }
    }
  }
}
