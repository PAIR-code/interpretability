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
import * as types from './types';

/**
 * Triggers the addition of a new dreaming element.
 *
 * @param {object} element - the element to be added to the visualization.
 * @return {object} the action to be dispatched for this change.
 */
export function addDreamingElement(element) {
  if (element.type === 'top_words') {
    element['iteration'] = 0;
  }
  return {type: types.ADD_DREAMING_ELEMENT, element};
}

/**
 * Triggers the update of the existing dreaming elements.
 *
 * @param {array} elements - the elements to be saved to the state.
 * @return {object} the action to be dispatched for this change.
 */
export function updateDreamingElements(elements) {
  return {type: types.UPDATE_DREAMING_ELEMENTS, elements};
}

/**
 * Triggers the removal of an existing dreaming element from the visualization.
 *
 * @param {number} index - the index of the element to be removed.
 * @return {object} the action to be dispatched for this change.
 */
export function removeDreamingElement(index) {
  return {type: types.REMOVE_DREAMING_ELEMENT, index};
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
  return {type: types.CHANGE_DREAMING_ELEMENT_ITERATION, iteration, index};
}

/**
 * Triggers the change of the dimension property for cards displayed.
 *
 * @param {object} dimensions - the new card dimensions to write to the state.
 * @return {object} the action to be dispatched for this change.
 */
export function changeCardDimensions(dimensions) {
  return {type: types.CHANGE_CARD_DIMENSIONS, dimensions};
}

/**
 * Triggers the addition of a active colors used in the visualization.
 *
 * @param {object} colors - the colors to be added to the state.
 * @return {object} the action to be dispatched for this change.
 */
export function addActiveColors(colors) {
  return {type: types.ADD_ACTIVE_COLORS, colors};
}

/**
 * Triggers the removal of active colors from the state.
 *
 * @param {number} index - the index of the colors to be removed.
 * @return {object} the action to be dispatched for this change.
 */
export function removeActiveColors(index) {
  return {type: types.REMOVE_ACTIVE_COLORS, index};
}
