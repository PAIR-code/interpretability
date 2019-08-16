/**
 * Converts iteration results to glyph parameters.
 *
 * @param {array} iterations - the iterations that are to be converted.
 * @return {object} the glyph params obtained from the iterations.
 */
export function iterationsToGlyphsParams(iterations) {
  const glyphsParams = {};
  if (Object.prototype.hasOwnProperty.call(iterations[0], 'temperature')) {
    iterationsToTypeParams(glyphsParams, iterations, 'temperature');
    glyphsParams['temperature'].color = '#3f51b5';
  }
  if (Object.prototype.hasOwnProperty.call(iterations[0], 'loss')) {
    iterationsToTypeParams(glyphsParams, iterations, 'loss');
    glyphsParams['loss'].color = '#795548';
  }
  if (Object.prototype.hasOwnProperty.call(iterations[0], 'ids_loss')) {
    iterationsToTypeParams(glyphsParams, iterations, 'ids_loss');
    glyphsParams['ids_loss'].color = '#9c27b0';
  }
  if (Object.prototype.hasOwnProperty.call(iterations[0], 'activation')) {
    iterationsToTypeParams(glyphsParams, iterations, 'activation');
    glyphsParams['activation'].color = '#795548';
  }
  if (Object.prototype.hasOwnProperty.call(iterations[0], 'ids_activation')) {
    iterationsToTypeParams(glyphsParams, iterations, 'ids_activation');
    glyphsParams['ids_activation'].color = '#9c27b0';
  }
  return glyphsParams;
}

/**
 * Convert iterations to typed params and store them in glyphParams.
 *
 * @param {object} glyphsParams - the glyph parameters that hold all the results
 * for the conversion of iterations.
 * @param {array} iterations - the iterations for which to convert the params.
 * @param {string} type - the type of the param to be converted.
 */
function iterationsToTypeParams(glyphsParams, iterations, type) {
  glyphsParams[type] = {
    iterations: [],
    extremes: {max: 0, min: 0},
  };
  for (const iteration of iterations) {
    glyphsParams[type].iterations.push(iteration[type]);
    if (glyphsParams[type].extremes.max < iteration[type]) {
      glyphsParams[type].extremes.max = iteration[type];
    }
  }
}

/**
 * Converts magnitude results to glyph parameters.
 *
 * @param {array} magnitudes - the magnitudes that are to be converted.
 * @return {object} the glyph params obtained from the iterations.
 */
export function magnitudesToGlyphsParams(magnitudes) {
  const glyphsParams = {};
  const firstIteration = magnitudes[0].results.iterations[0];
  if (Object.prototype.hasOwnProperty.call(firstIteration, 'loss')) {
    magnitudesToTypeParams(glyphsParams, magnitudes, 'loss');
    glyphsParams['loss'].color = '#795548';
  }
  if (Object.prototype.hasOwnProperty.call(firstIteration, 'ids_loss')) {
    magnitudesToTypeParams(glyphsParams, magnitudes, 'ids_loss');
    glyphsParams['ids_loss'].color = '#9c27b0';
  }
  return glyphsParams;
}

/**
 * Convert magnitudes to typed params and store them in glyphParams.
 *
 * @param {object} glyphsParams - the glyph parameters that hold all the results
 * for the conversion of iterations.
 * @param {array} magnitudes - the magnitudes for which to convert the params.
 * @param {string} type - the type of the param to be converted.
 */
function magnitudesToTypeParams(glyphsParams, magnitudes, type) {
  glyphsParams[type] = {
    magnitudes: [],
    extremes: {max: 0, min: 0},
  };
  for (const magnitude of magnitudes) {
    const lastIteration = magnitude.results.iterations[
        magnitude.results.iterations.length - 1];
    glyphsParams[type].magnitudes.push(lastIteration[type]);
    for (const iteration of magnitude.results.iterations) {
      if (glyphsParams[type].extremes.max < iteration[type]) {
        glyphsParams[type].extremes.max = iteration[type];
      }
    }
  }
}
