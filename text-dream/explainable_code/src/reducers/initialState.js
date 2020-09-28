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
// Set the initial State of the Application
export default {
  cardDimensions: {
    width: 10,
    height: 10,
  },
  softmaxStatus: {
    values: [2.2, 0.8, 1.4, 1.0, 0.1],
    labels: ["Dog", "Cat", "Monkey", "Car", "Truck"],
    temperature: 1.0,
  },
  progress: {
    page: 1,
    of: 10,
  },
  topWordsIteration: 0,
  dreamVisJSON: {},
  dreamID: 1,
  annealingVisJSON: {},
  topWordsVisJSON: {},
  similarVisJSON: {},
  reconstructVisJSON: {},
  shiftVisJSON: {},
};
