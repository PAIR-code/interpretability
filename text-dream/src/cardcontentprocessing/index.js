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
import React from 'react';

import DreamHead from '../components/heads/DreamHeadComponent';
import DreamBody from '../components/bodies/DreamBodyComponent';
import ReconstructHead from '../components/heads/ReconstructHeadComponent';
import ReconstructBody from '../components/bodies/ReconstructBodyComponent';
import ShiftedReconstructHead from
  '../components/heads/ShiftedReconstructHeadComponent';
import MagnitudesBody from '../components/bodies/MagnitudesBodyComponent';
import ShiftedReconstructBody from
  '../components/bodies/ShiftedReconstructBodyComponent';

import {
  getDreamSentenceParams,
  getReconstructSentenceParams,
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
 * Get the properties to be rendered for a reconstruct layers card.
 *
 * @param {array} layers - the layers to be included in the card.
 * @return {object} the properties to be rendered for this card.
 */
export function getReconstructProps(layers) {
  layers.sort(function(a, b) {
    return a.params.layer_id - b.params.layer_id;
  });
  const bodies = [];
  const sentences = [];
  const layerIDs = [];
  const sentenceParams = getReconstructSentenceParams(
      layers[0].results, layers[0].params);
  const head = <ReconstructHead
    results={layers[0].results}
    params={layers[0].params}
    sentenceParams={sentenceParams}/>;
  const topic = 'Reconstruct';
  const headParams = {
    'WordID': layers[0].params.word_id,
    'NeuronID': layers[0].params.neuron_id,
  };
  for (const layer of layers) {
    layerIDs.push(layer.params.layer_id);
    bodies.push(
        <ReconstructBody
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
  const head = <ShiftedReconstructHead
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
 * Get the properties to be rendered for a shifted Reconstruct magnitudes
 * card.
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
  const head = <ShiftedReconstructHead
    params={magnitudes[0].params}
    sentenceParams={sentenceParams}/>;
  for (const magnitude of magnitudes) {
    magnitudeValues.push(magnitude.params.shift_magnitude);
    bodies.push(
        <ShiftedReconstructBody
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
