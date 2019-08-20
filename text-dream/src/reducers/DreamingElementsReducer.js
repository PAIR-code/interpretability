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
