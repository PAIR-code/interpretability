import initialState from './initialState';
import * as types from '../actions/types';

/**
 * Reducer for updating the dimensions of displayed cards.
 *
 * @param {object} state - the current application state before any change.
 * @param {object} action - the action that is issued to manipulate the state.
 * @return {object} the state after handling the actiton.
 */
export default function activeColorsReducer(
    state = initialState.activeColors, action) {
  switch (action.type) {
    case types.ADD_ACTIVE_COLORS:
      return state.concat([action.colors]);
    case types.REMOVE_ACTIVE_COLORS: {
      const removedColorsState = [...state];
      removedColorsState.splice(action.index, 1);
      return removedColorsState;
    }
    default:
      return state;
  }
}
