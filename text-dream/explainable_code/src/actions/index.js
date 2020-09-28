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
import * as types from "./types";
import { elementTypes } from "../cardprocessing";
import DreamApi from "../api/DreamApi";

/**
 * Triggers the addition of a new dreaming element.
 *
 * @param {object} element - the element to be added to the visualization.
 * @return {object} the action to be dispatched for this change.
 */
export function addDreamingElement(element) {
  if (element.type === elementTypes.top_words) {
    element["iteration"] = 0;
  }
  return { type: types.ADD_DREAMING_ELEMENT, element };
}

/**
 * Triggers the update of the existing dreaming elements.
 *
 * @param {array} elements - the elements to be saved to the state.
 * @return {object} the action to be dispatched for this change.
 */
export function updateDreamingElements(elements) {
  return { type: types.UPDATE_DREAMING_ELEMENTS, elements };
}

/**
 * Triggers the removal of an existing dreaming element from the visualization.
 *
 * @param {number} index - the index of the element to be removed.
 * @return {object} the action to be dispatched for this change.
 */
export function removeDreamingElement(index) {
  return { type: types.REMOVE_DREAMING_ELEMENT, index };
}

/**
 * Triggers the change of the iteration parameter for an existing dreaming
 * element.
 *
 * @param {number} iteration - the new iteration number for the element.
 * @param {number} index - the index of the element to be changed.
 * @return {object} the action to be dispatched for this change.
 */
export function changeDreamingElementIteration(iteration, index) {
  return { type: types.CHANGE_DREAMING_ELEMENT_ITERATION, iteration, index };
}

/**
 * Triggers the change of the dimension property for cards displayed.
 *
 * @param {object} dimensions - the new card dimensions to write to the state.
 * @return {object} the action to be dispatched for this change.
 */
export function changeCardDimensions(dimensions) {
  return { type: types.CHANGE_CARD_DIMENSIONS, dimensions };
}

/**
 * Triggers the change of the softmax status.
 *
 * @param {array} status - the new status for the softmax trick vis.
 * @return {object} the action to be dispatched for this change.
 */
export function changeSoftmaxStatus(status) {
  return { type: types.CHANGE_SOFTMAX_STATUS, status };
}

/**
 * Triggers the change of the progress bar.
 *
 * @param {number} page - the new status for the progress bar.
 * @return {object} the action to be dispatched for this change.
 */
export function changeProgressPage(page) {
  return { type: types.CHANGE_PROGRESS_PAGE, page };
}

/**
 * Triggers the change of the progress bar.
 *
 * @param {number} iteration - the new iteration in the top words component.
 * @return {object} the action to be dispatched for this change.
 */
export function changeTopWordsIteration(iteration) {
  return { type: types.CHANGE_TOP_WORDS_ITERATION, iteration };
}

/**
 * Changes the id of the currently selected experiment.
 *
 * @param {number} id the id for the experiment to be selected.
 * @return {object} the action to be dispatched for this change.
 */
export function changeDreamID(id) {
  return { type: types.CHANGE_DREAM_ID, id };
}

/**
 * Signals that changing the dream experiment was successful.
 *
 * @param {object} results the new experiment details.
 * @return {object} the action to be dispatched for this change.
 */
export function changeDreamSuccess(results) {
  return { type: types.LOAD_DREAM_SUCCESS, results };
}

/**
 * Loads a dream experiment.
 *
 * @param {number} id the number of the experiment to be loaded.
 * @return {object} the action to be dispatched for this change.
 */
export function loadDream(id) {
  return function (dispatch) {
    return DreamApi.getDreamJSON(id).then((results) => {
      dispatch(changeDreamSuccess(results));
    });
  };
}

/**
 * Changes the dream experiment by changing the id & loading the new experiment.
 *
 * @param {number} id the number of the experiment to be loaded.
 * @return {object} the action to be dispatched for this change.
 */
export function changeDream(id) {
  return function (dispatch) {
    return DreamApi.getDreamJSON(id).then((results) => {
      dispatch(changeDreamID(id));
      dispatch(changeDreamSuccess(results));
    });
  };
}

/**
 * Signals that changing the anneal experiment was successful.
 *
 * @param {object} results the new experiment details.
 * @return {object} the action to be dispatched for this change.
 */
export function changeAnnealingSuccess(results) {
  return { type: types.LOAD_ANNEALING_SUCCESS, results };
}

/**
 * Loads an anneal experiment.
 *
 * @param {number} id the number of the experiment to be loaded.
 * @return {object} the action to be dispatched for this change.
 */
export function loadAnnealing(id) {
  return function (dispatch) {
    return DreamApi.getAnnealingJSON(id).then((results) => {
      dispatch(changeAnnealingSuccess(results));
    });
  };
}

/**
 * Changes the anneal exp. by changing the id & loading the new exp.
 *
 * @param {number} id the number of the experiment to be loaded.
 * @return {object} the action to be dispatched for this change.
 */
export function changeAnnealing(id) {
  return function (dispatch) {
    return DreamApi.getAnnealingJSON(id).then((results) => {
      dispatch(changeDreamID(id));
      dispatch(changeAnnealingSuccess(results));
    });
  };
}

/**
 * Signals that changing the top words experiment was successful.
 *
 * @param {object} results the new experiment details.
 * @return {object} the action to be dispatched for this change.
 */
export function changeTopWordsSuccess(results) {
  return { type: types.LOAD_TOP_WORDS_SUCCESS, results };
}

/**
 * Loads a top words experiment.
 *
 * @param {number} id the number of the experiment to be loaded.
 * @return {object} the action to be dispatched for this change.
 */
export function loadTopWords(id) {
  return function (dispatch) {
    return DreamApi.getTopWordsJSON(id).then((results) => {
      dispatch(changeTopWordsSuccess(results));
    });
  };
}

/**
 * Changes the top words exp. by changing the id & loading the new exp.
 *
 * @param {number} id the number of the experiment to be loaded.
 * @return {object} the action to be dispatched for this change.
 */
export function changeTopWords(id) {
  return function (dispatch) {
    return DreamApi.getTopWordsJSON(id).then((results) => {
      dispatch(changeDreamID(id));
      dispatch(changeTopWordsSuccess(results));
    });
  };
}

/**
 * Signals that changing the sim. words experiment was successful.
 *
 * @param {object} results the new experiment details.
 * @return {object} the action to be dispatched for this change.
 */
export function changeSimilarWordsSuccess(results) {
  return { type: types.LOAD_SIMILAR_WORDS_SUCCESS, results };
}

/**
 * Loads a sim words experiment.
 *
 * @param {number} id the number of the experiment to be loaded.
 * @return {object} the action to be dispatched for this change.
 */
export function loadSimilarWords(id) {
  return function (dispatch) {
    return DreamApi.getSimilarWordsJSON(id).then((results) => {
      dispatch(changeSimilarWordsSuccess(results));
    });
  };
}

/**
 * Changes the sim words exp. by changing the id & loading the new exp.
 *
 * @param {number} id the number of the experiment to be loaded.
 * @return {object} the action to be dispatched for this change.
 */
export function changeSimilarWords(id) {
  return function (dispatch) {
    return DreamApi.getSimilarWordsJSON(id).then((results) => {
      dispatch(changeDreamID(id));
      dispatch(changeSimilarWordsSuccess(results));
    });
  };
}

/**
 * Signals that changing the reconstruction experiment was successful.
 *
 * @param {object} results the new experiment details.
 * @return {object} the action to be dispatched for this change.
 */
export function changeReconstructionSuccess(results) {
  return { type: types.LOAD_RECONSTRUCTION_SUCCESS, results };
}

/**
 * Loads a reconstruction experiment.
 *
 * @param {number} id the number of the experiment to be loaded.
 * @return {object} the action to be dispatched for this change.
 */
export function loadReconstruction(id) {
  return function (dispatch) {
    return DreamApi.getReconstructionJSON(id).then((results) => {
      dispatch(changeReconstructionSuccess(results));
    });
  };
}

/**
 * Changes the reconstruction exp. by changing the id & loading the new exp.
 *
 * @param {number} id the number of the experiment to be loaded.
 * @return {object} the action to be dispatched for this change.
 */
export function changeReconstruction(id) {
  return function (dispatch) {
    return DreamApi.getReconstructionJSON(id).then((results) => {
      dispatch(changeDreamID(id));
      dispatch(changeReconstructionSuccess(results));
    });
  };
}

/**
 * Signals that changing the shift reconstruction experiment was successful.
 *
 * @param {object} results the new experiment details.
 * @return {object} the action to be dispatched for this change.
 */
export function changeShiftedReconstructionSuccess(results) {
  return { type: types.LOAD_SHIFTED_RECONSTRUCTION_SUCCESS, results };
}

/**
 * Loads a shift reconstruction experiment.
 *
 * @param {number} id the number of the experiment to be loaded.
 * @return {object} the action to be dispatched for this change.
 */
export function loadShiftedReconstruction(id) {
  return function (dispatch) {
    return DreamApi.getShiftedReconstructionJSON(id).then((results) => {
      dispatch(changeShiftedReconstructionSuccess(results));
    });
  };
}

/**
 * Changes the shift rec. exp. by changing the id & loading the new exp.
 *
 * @param {number} id the number of the experiment to be loaded.
 * @return {object} the action to be dispatched for this change.
 */
export function changeShiftedReconstruction(id) {
  return function (dispatch) {
    return DreamApi.getShiftedReconstructionJSON(id).then((results) => {
      dispatch(changeDreamID(id));
      dispatch(changeShiftedReconstructionSuccess(results));
    });
  };
}
