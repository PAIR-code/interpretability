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
import {red, green, blue, orange, grey} from '@material-ui/core/colors';

const colors = {
  'activation': green[500],
  'ids_activation': green[200],
  'loss': red[500],
  'ids_loss': red[300],
  'temperature': blue[500],
  'distance': grey[500],
  'softmax': orange[500],
};

/**
 * Used throughout the application to get the color for a specific type.
 *
 * @param {string} type - the type of the visualization to get the color for.
 * @param {number} shade - the shade version of the desired color.
 * @return {object} the color code for the requested color type.
 */
export function getColor(type) {
  return colors[type];
}
