import React from 'react';

import DreamHead from '../components/heads/DreamHeadComponent';
import DreamBody from '../components/bodies/DreamBodyComponent';
import ResembleHead from '../components/heads/ResembleHeadComponent';
import ResembleBody from '../components/bodies/ResembleBodyComponent';
import ShiftedResemblingHead from
  '../components/heads/ShiftedResemblingHeadComponent';
import MagnitudesBody from '../components/bodies/MagnitudesBodyComponent';
import ShiftedResemblingBody from
  '../components/bodies/ShiftedResemblingBodyComponent';

import {
  getDreamSentenceParams,
  getResembleSentenceParams,
  getShiftSentenceParams,
  getClosestResult} from '../sentences';

/**
 * Get the properties to be rendered for a dream layers card.
 *
 * @param {array} layers - the layers to be included in the card.
 * @return {object} the properties to be rendered for this card.
 */
export function getDreamProps(layers) {
  layers.sort(function(a, b) {
    return a.params.layer_id - b.params.layer_id;
  });
  const bodies = [];
  const sentences = [];
  const layerIDs = [];
  const sentenceParams = getDreamSentenceParams(
      layers[0].results, layers[0].params);
  const head = <DreamHead
    params={layers[0].params}
    sentenceParams={sentenceParams}/>;
  const topic = 'Dream';
  const headParams = {
    'WordID': layers[0].params.word_id,
    'NeuronID': layers[0].params.neuron_id,
  };
  for (const layer of layers) {
    layerIDs.push(layer.params.layer_id);
    bodies.push(
        <DreamBody
          results={layer.results}
          params={layer.params}
          sentenceParams={sentenceParams}/>
    );
    sentences.push(layer.results.iterations[
        layer.results.iterations.length - 1].tokens);
  }
  const props = {
    'head': head,
    'sentences': sentences,
    'layerIDs': layerIDs,
    'topic': topic,
    'sentenceParams': sentenceParams,
    'headParams': headParams,
    'bodies': bodies,
  };
  return props;
}

/**
 * Get the properties to be rendered for a resembling layers card.
 *
 * @param {array} layers - the layers to be included in the card.
 * @return {object} the properties to be rendered for this card.
 */
export function getResembleProps(layers) {
  layers.sort(function(a, b) {
    return a.params.layer_id - b.params.layer_id;
  });
  const bodies = [];
  const sentences = [];
  const layerIDs = [];
  const sentenceParams = getResembleSentenceParams(
      layers[0].results, layers[0].params);
  const head = <ResembleHead
    results={layers[0].results}
    params={layers[0].params}
    sentenceParams={sentenceParams}/>;
  const topic = 'Resemble';
  const headParams = {
    'WordID': layers[0].params.word_id,
    'NeuronID': layers[0].params.neuron_id,
  };
  for (const layer of layers) {
    layerIDs.push(layer.params.layer_id);
    bodies.push(
        <ResembleBody
          results={layer.results}
          params={layer.params}
          sentenceParams={sentenceParams}/>
    );
    sentences.push(layer.results.iterations[
        layer.results.iterations.length - 1].tokens);
  }
  const props = {
    'head': head,
    'sentences': sentences,
    'layerIDs': layerIDs,
    'topic': topic,
    'sentenceParams': sentenceParams,
    'headParams': headParams,
    'bodies': bodies,
  };
  return props;
}

/**
 * Get the properties to be rendered for a magnitudes layers card.
 *
 * @param {array} layers - the layers to be included in the card.
 * @return {object} the properties to be rendered for this card.
 */
export function getMagnitudesLayerProps(layers) {
  layers.sort(function(a, b) {
    return a.magnitudes[0].params.layer_id - b.magnitudes[0].params.layer_id;
  });
  const bodies = [];
  const sentences = [];
  const layerIDs = [];
  const sentenceParams = getShiftSentenceParams(
      layers[0].magnitudes[0].results, layers[0].magnitudes[0].params);
  sentenceParams.headWidth = sentenceParams.headWidth - 10;
  const headParams = {
    'WordID': layers[0].magnitudes[0].params.word_id,
    'NeuronID': layers[0].magnitudes[0].params.neuron_id,
  };
  const topic = 'Shift';
  const head = <ShiftedResemblingHead
    params={layers[0].magnitudes[0].params}
    sentenceParams={sentenceParams}/>;
  for (const layer of layers) {
    layerIDs.push(layer.magnitudes[0].params.layer_id);
    bodies.push(
        <MagnitudesBody
          magnitudes={layer.magnitudes}
          sentenceParams={sentenceParams}/>
    );
    sentences.push(getClosestResult(sentenceParams.changedSentence,
        layer.magnitudes));
  }
  const props = {
    'head': head,
    'sentences': sentences,
    'layerIDs': layerIDs,
    'topic': topic,
    'sentenceParams': sentenceParams,
    'headParams': headParams,
    'bodies': bodies,
  };
  return props;
}

/**
 * Get the properties to be rendered for a shifted resembling magnitudes card.
 *
 * @param {array} magnitudes - the magnitudes to be included in the card.
 * @return {object} the properties to be rendered for this card.
 */
export function getMagnitudesProps(magnitudes) {
  magnitudes.sort(function(a, b) {
    return a.params.shift_magnitude - b.params.shift_magnitude;
  });
  const bodies = [];
  const sentences = [];
  const magnitudeValues = [];
  const sentenceParams = getShiftSentenceParams(
      magnitudes[0].results, magnitudes[0].params);
  const headParams = {
    'LayerID': magnitudes[0].params.layer_id,
    'WordID': magnitudes[0].params.word_id,
    'NeuronID': magnitudes[0].params.neuron_id,
  };
  const topic = 'Shift';
  const head = <ShiftedResemblingHead
    params={magnitudes[0].params}
    sentenceParams={sentenceParams}/>;
  for (const magnitude of magnitudes) {
    magnitudeValues.push(magnitude.params.shift_magnitude);
    bodies.push(
        <ShiftedResemblingBody
          results={magnitude.results}
          params={magnitude.params}
          sentenceParams={sentenceParams}/>
    );
    sentences.push(magnitude.results.iterations[
        magnitude.results.iterations.length - 1].tokens);
  }
  const props = {
    'head': head,
    'sentences': sentences,
    'magnitudeValues': magnitudeValues,
    'topic': topic,
    'sentenceParams': sentenceParams,
    'headParams': headParams,
    'bodies': bodies,
  };
  return props;
}
