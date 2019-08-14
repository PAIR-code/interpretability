import * as types from './types';

export function addDreamingElement(element) {
  if (element.type === 'top_words') {
    element['iteration'] = 0;
  }
  return {type: types.ADD_DREAMING_ELEMENT, element};
}

export function updateDreamingElements(elements) {
  return {type: types.UPDATE_DREAMING_ELEMENTS, elements};
}

export function removeDreamingElement(index) {
  return {type: types.REMOVE_DREAMING_ELEMENT, index};
}

export function changeDreamingElementIteration(iteration, index) {
  return {type: types.CHANGE_DREAMING_ELEMENT_ITERATION, iteration, index};
}
