import initialState from './initialState';
import * as types from '../actions/types';

/**
 * Reducer for updating the dimensions of displayed cards.
 *
 * @param {object} state - the current application state before any change.
 * @param {object} action - the action that is issued to manipulate the state.
 * @return {object} the state after handling the actiton.
 */
export default function cardDimensionsReducer(
    state = initialState.cardDimensions, action) {
  switch (action.type) {
    case types.CHANGE_CARD_DIMENSIONS:
      return action.dimensions;
    default:
      return state;
  }
}

