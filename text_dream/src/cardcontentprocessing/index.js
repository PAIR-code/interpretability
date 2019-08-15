import React from 'react';

import DreamHead from '../components/heads/DreamHeadComponent';
import DreamBody from '../components/bodies/DreamBodyComponent';
import ResembleHead from '../components/heads/ResembleHeadComponent';
import ResembleBody from '../components/bodies/ResembleBodyComponent';

import { getDreamSentenceParams,
    getResembleSentenceParams,
    getShiftSentenceParams,
    getClosestResult} from '../sentences';
import ShiftedResemblingHead from '../components/heads/ShiftedResemblingHeadComponent';
import MagnitudesBody from '../components/bodies/MagnitudesBodyComponent';
import ShiftedResemblingBody from '../components/bodies/ShiftedResemblingBodyComponent';

export function getDreamProps(layers) {
  layers.sort(function(a, b) {
    return a.params.layer_id - b.params.layer_id;
  })
  var bodies = [];
  var sentences = [];
  var layerIDs = [];
  var sentenceParams = getDreamSentenceParams(
      layers[0].results, layers[0].params);
  var head = <DreamHead
      params={layers[0].params}
      sentenceParams={sentenceParams}/>;
  var topic = 'Dream'
  var headParams = {
      'WordID': layers[0].params.word_id,
      'NeuronID': layers[0].params.neuron_id
  }
  for (var layer of layers) {
    layerIDs.push(layer.params.layer_id)
    bodies.push(
      <DreamBody
          results={layer.results}
          params={layer.params}
          sentenceParams={sentenceParams}/>
    );
    sentences.push(layer.results.iterations[
        layer.results.iterations.length - 1].tokens)
  }
  var props = {
      'head': head,
      'sentences': sentences,
      'layerIDs': layerIDs,
      'topic': topic,
      'sentenceParams': sentenceParams,
      'headParams': headParams,
      'bodies': bodies
  }
  return props;
}

export function getResembleProps(layers) {
  layers.sort(function(a, b) {
    return a.params.layer_id - b.params.layer_id;
  })
  var bodies = [];
  var sentences = [];
  var layerIDs = [];
  var sentenceParams = getResembleSentenceParams(
      layers[0].results, layers[0].params);
  var head = <ResembleHead
      results={layers[0].results}
      params={layers[0].params}
      sentenceParams={sentenceParams}/>;
  var topic = 'Resemble'
  var headParams = {
      'WordID': layers[0].params.word_id,
      'NeuronID': layers[0].params.neuron_id
  }
  for (var layer of layers) {
    layerIDs.push(layer.params.layer_id)
    bodies.push(
      <ResembleBody
          results={layer.results}
          params={layer.params}
          sentenceParams={sentenceParams}/>
    );
    sentences.push(layer.results.iterations[
        layer.results.iterations.length - 1].tokens)
  }
  var props = {
      'head': head,
      'sentences': sentences,
      'layerIDs': layerIDs,
      'topic': topic,
      'sentenceParams': sentenceParams,
      'headParams': headParams,
      'bodies': bodies
  }
  return props;
}

export function getMagnitudesLayerProps(layers) {
  layers.sort(function(a, b) {
    return a.magnitudes[0].params.layer_id - b.magnitudes[0].params.layer_id;
  })
  var bodies = [];
  var sentences = [];
  var layerIDs = [];
  var sentenceParams = getShiftSentenceParams(
    layers[0].magnitudes[0].results, layers[0].magnitudes[0].params);
  sentenceParams.headWidth = sentenceParams.headWidth - 10;
  var headParams = {
      'WordID': layers[0].magnitudes[0].params.word_id,
      'NeuronID': layers[0].magnitudes[0].params.neuron_id
  };
  var topic = 'Shift';
  var head = <ShiftedResemblingHead
      params={layers[0].magnitudes[0].params}
      sentenceParams={sentenceParams}/>
  for (var layer of layers) {
    layerIDs.push(layer.magnitudes[0].params.layer_id)
    bodies.push(
      <MagnitudesBody
          magnitudes={layer.magnitudes}
          sentenceParams={sentenceParams}/>
    );
    sentences.push(getClosestResult(sentenceParams.changedSentence,
        layer.magnitudes));
  }
  var props = {
      'head': head,
      'sentences': sentences,
      'layerIDs': layerIDs,
      'topic': topic,
      'sentenceParams': sentenceParams,
      'headParams': headParams,
      'bodies': bodies
  }
  return props;
}

export function getMagnitudesProps(magnitudes) {
  magnitudes.sort(function(a, b) {
    return a.params.shift_magnitude - b.params.shift_magnitude;
  })
  var bodies = [];
  var sentences = [];
  var magnitudeValues = [];
  var sentenceParams = getShiftSentenceParams(
    magnitudes[0].results, magnitudes[0].params);
  var headParams = {
      'LayerID': magnitudes[0].params.layer_id,
      'WordID': magnitudes[0].params.word_id,
      'NeuronID': magnitudes[0].params.neuron_id
  };
  var topic = 'Shift';
  var head = <ShiftedResemblingHead
      params={magnitudes[0].params}
      sentenceParams={sentenceParams}/>
  for (var magnitude of magnitudes) {
    magnitudeValues.push(magnitude.params.shift_magnitude)
    bodies.push(
      <ShiftedResemblingBody
          results={magnitude.results}
          params={magnitude.params}
          sentenceParams={sentenceParams}/>
    );
    sentences.push(magnitude.results.iterations[
        magnitude.results.iterations.length - 1].tokens)
  }
  var props = {
      'head': head,
      'sentences': sentences,
      'magnitudeValues': magnitudeValues,
      'topic': topic,
      'sentenceParams': sentenceParams,
      'headParams': headParams,
      'bodies': bodies
  }
  return props;
}
