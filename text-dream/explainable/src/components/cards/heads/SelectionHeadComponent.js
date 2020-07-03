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
import React from 'react';
import PropTypes from 'prop-types';

import {Grid, Button} from '@material-ui/core';

/**
 * Providing a run Selection Component for any Card.
 */
class SelectionHead extends React.Component {
  /**
   * Renders the general header.
   *
   * @return {jsx} the header to be rendered.
   */
  render() {
    let buttons = [];
    for (let i = 0; i < this.props.options; i++) {
      buttons.push(
        <Grid item key={i}>
          <Button variant='contained' color='secondary' className='runButton'
            onClick={() => this.props.clickHandler(i+1)}>
            {i+1}
          </Button>
        </Grid>
      )
    }
    return (
      <Grid item className='selectionHead'>
        <Grid container direction='row' spacing={2} alignItems="center"
          justify='center'>
          {buttons.map((button) => 
            button
          )}
        </Grid>
      </Grid>
    );
  }
}

SelectionHead.propTypes = {
  options: PropTypes.number.isRequired,
  clickHandler: PropTypes.func.isRequired,
};

export default SelectionHead;
