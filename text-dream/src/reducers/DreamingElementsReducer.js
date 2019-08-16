import initialState from './initialState';
import * as types from '../actions/types';

/**
 * Reducer for handling dreaming elements in the state.
 *
 * @param {object} state - the current application state before any change.
 * @param {object} action - the action that is issued to manipulate the state.
 * @return {object} the state after handling the actiton.
 */
export default function dreamingElementsReducer(
    state = initialState.dreamingElements, action) {
  switch (action.type) {
    case types.ADD_DREAMING_ELEMENT:
      return state.concat(action.element);
    case types.UPDATE_DREAMING_ELEMENTS:
      return action.elements;
    case types.REMOVE_DREAMING_ELEMENT: {
      const removedElementState = [...state];
      removedElementState.splice(action.index, 1);
      return removedElementState;
    }
    case types.CHANGE_DREAMING_ELEMENT_ITERATION: {
      const newState = state.map((element, i) => i === action.index ? {
        ...element, iteration: action.iteration,
      } : element);
      return newState;
    }
    default:
      return state;
  }
}
