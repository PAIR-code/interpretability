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
