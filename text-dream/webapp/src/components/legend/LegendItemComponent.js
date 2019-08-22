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
import * as React from 'react';
import PropTypes from 'prop-types';

import {Typography} from '@material-ui/core';

import {getColor} from '../../colors';

/**
 * Providing a Legend to resolve the color scheme.
 */
class LegendItem extends React.Component {
  /**
   * Renders the legend component to resolve the used colors.
   *
   * @return {jsx} the legend to be rendered.
   */
  render() {
    return (
      <div className='legend' style={{paddingRight: '15px'}}>
        <svg width={10} height={10} id='glyphsSVG' style={{marginRight: '5px'}}>
          <rect width="10" height="10" fill={getColor(this.props.color)} />
        </svg>
        <Typography variant="body2" color="inherit">
          {this.props.color}
        </Typography>
      </div>
    );
  }
}

// Controls state of the Application
LegendItem.propTypes = {
  color: PropTypes.string.isRequired,
};

export default LegendItem;
