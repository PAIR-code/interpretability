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
import initialState from "./initialState";
import * as types from "../actions/types";

/**
 * Reducer for updating the progress bar state.
 *
 * @param {object} state - the current application state before any change.
 * @param {object} action - the action that is issued to manipulate the state.
 * @return {object} the state after handling the action.
 */
export default function progressReducer(state = initialState.progress, action) {
  switch (action.type) {
    case types.CHANGE_PROGRESS_PAGE:
      return {
        ...state,
        page: action.page,
      };
    default:
      return state;
  }
}
