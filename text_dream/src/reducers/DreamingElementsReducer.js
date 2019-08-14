import initialState from './initialState';
import * as types from '../actions/types';

export default function dreamingElementsReducer(
    state = initialState.dreamingElements, action) {
  switch(action.type) {
    case types.ADD_DREAMING_ELEMENT:
      return state.concat(action.element);
    case types.UPDATE_DREAMING_ELEMENTS:
      return action.elements;
    case types.REMOVE_DREAMING_ELEMENT:
      let removedElementState = [...state];
      removedElementState.splice(action.index, 1);
      return removedElementState;
    case types.CHANGE_DREAMING_ELEMENT_ITERATION:
      var newState = state.map((element, i) => i === action.index ? {
        ...element, iteration: action.iteration
      } : element)
      return newState;
    default:
      return state;
  }
}
