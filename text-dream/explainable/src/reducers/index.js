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
// Import all Reducers
import {combineReducers} from 'redux';
import cardDimensions from './CardDimensionsReducer';
import softmaxStatus from './SoftmaxReducer';
import progress from './ProgressReducer';
import topWordsIteration from './TopWordsIterationReducer';
import dreamID from './DreamIDReducer';
import dreamVisJSON from './DreamJSONReducer';
import annealingVisJSON from './AnnealingJSONReducer';
import topWordsVisJSON from './TopWordsJSONReducer';
import similarVisJSON from './SimilarWordsJSONReducer';
import reconstructVisJSON from './ReconstructionJSONReducer';
import shiftVisJSON from './ShiftJSONReducer';

// Combine all Reducers
export default combineReducers({
  cardDimensions,
  softmaxStatus,
  progress,
  topWordsIteration,
  dreamID,
  dreamVisJSON,
  annealingVisJSON,
  topWordsVisJSON,
  similarVisJSON,
  reconstructVisJSON,
  shiftVisJSON,
});
