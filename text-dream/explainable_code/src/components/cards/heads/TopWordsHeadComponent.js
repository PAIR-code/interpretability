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
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {bindActionCreators} from 'redux';

import {Grid, Typography, Tooltip, Paper, Slider} from '@material-ui/core';

import Input from '@material-ui/core/Input';

import * as actions from '../../../actions';

/**
 * Providing a header for TopWords experiments.
 */
class TopWordsHead extends React.Component {
  /**
   * Handles changes of the iteration slider.
   *
   * @param {object} event - the event that triggers this call.
   * @param {number} newValue - the changed slider value.
   */
  handleSliderChange = (event, newValue) => {
    this.props.actions.changeTopWordsIteration(newValue);
  };

  /**
   * Handles changes of the value in the input box for the iterations.
   *
   * @param {object} event - the event that triggers this call.
   */
  handleInputChange = (event) => {
    const newValue =
      event.target.value === '' ? '' : Number(event.target.value);
    this.props.actions.changeTopWordsIteration(newValue);
  };

  /**
   * Renders the head component for top words with controls for iterations.
   *
   * @return {jsx} the component to be rendered.
   */
  render() {
    // Check if the current iteration value is valid
    const iteration = this.props.iteration;
    return (
      <Grid item>
        <Paper className='subHeadingPaper'
          style={{backgroundColor: '#DDDDDD'}} square>
          <Grid container direction='row' spacing={1} alignItems="center">
            <Tooltip title="Input Sentence" placement="top">
              <Grid item style={{paddingRight: 10}}>
                <Typography variant="body1" color="inherit">
                  Iteration:
                </Typography>
              </Grid>
            </Tooltip>
            <Grid item xs>
              <Slider
                value={iteration}
                onChange={this.handleSliderChange}
                max={this.props.maxIterations}
                aria-labelledby="input-slider"
              />
            </Grid>
            <Grid item style={{paddingLeft: 10}}>
              <Input
                value={iteration}
                margin="dense"
                onChange={this.handleInputChange}
                inputProps={{
                  'step': 1,
                  'min': 0,
                  'max': this.props.maxIterations,
                  'type': 'number',
                  'aria-labelledby': 'input-slider',
                }}
                className='inputElement'
              />
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    );
  }
}

TopWordsHead.propTypes = {
  maxIterations: PropTypes.number.isRequired,
  dreamingElement: PropTypes.object.isRequired,
  elementIndex: PropTypes.number.isRequired,
  actions: PropTypes.object.isRequired,
  iteration: PropTypes.number.isRequired,
};

/**
 * Mapping the actions of redux to this component.
 *
 * @param {function} dispatch - called whenever an action is to be dispatched.
 * @return {object} all the actions bound to this component.
 */
function mapDispatchToProps(dispatch) {
  return {actions: bindActionCreators(actions, dispatch)};
}

export default connect(null, mapDispatchToProps)(TopWordsHead);
