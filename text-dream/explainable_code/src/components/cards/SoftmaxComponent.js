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

import {Grid, TextField, Slider} from '@material-ui/core';

import * as actions from '../../actions';

/**
 * Providing a Card Component for the TopWords chart in different experiments.
 */
class Softmax extends React.PureComponent {
  /**
   * Calculating the softmax of an array with a temperature.
   *
   * @param {array} arr the array to be softmaxed
   * @param {float} temp the temperature to be applied
   * @return {array} softmaxed and tempered array
   */
  softmaxTemp(arr, temp) {
    const C = Math.max(...arr);
    const d = arr.map((y) => Math.exp((y / temp) - C)).reduce((a, b) => a + b);
    return arr.map((value, index) => {
      const result = Math.exp((value / temp) - C) / d;
      return Math.round((result + Number.EPSILON) * 100) / 100;
    });
  }

  /**
   * Handling a change of the slider value.
   *
   * @param {object} e the event of the change
   * @param {number} val the new slider value
   */
  handleChange = (e, val) => {
    const softmaxStatus = JSON.parse(JSON.stringify(this.props.softmaxStatus));
    softmaxStatus.temperature = val;
    this.props.actions.changeSoftmaxStatus(softmaxStatus);
  };

  /**
   * Rendering the chart card.
   *
   * @return {jsx} the component to be rendered.
   */
  render() {
    const softmaxed = this.softmaxTemp(this.props.softmaxStatus.values, 1.0);
    const tempered = this.softmaxTemp(this.props.softmaxStatus.values,
        this.props.softmaxStatus.temperature);
    return (
      <Grid container direction='column' spacing={2}>
        <Grid item container justify='center' spacing={2}>
          <Grid item xs={2}>
          Temperature:
          </Grid>
          <Grid item xs>
            <Slider step={0.1} min={0.01} max={2}
              value={this.props.softmaxStatus.temperature}
              valueLabelDisplay="on" onChange={this.handleChange}/>
          </Grid>
        </Grid>
        <Grid item container justify='center' spacing={2}>
          <Grid item xs={2}>
            Word Score:
          </Grid>
          { this.props.softmaxStatus.values.map((status, index) => {
            return <Grid item xs={2} key={index}>
              <TextField label={this.props.softmaxStatus.labels[index]}
                value={status} onChange={(e) => {
                  const softmaxStatus = JSON.parse(JSON.stringify(
                      this.props.softmaxStatus));
                  const newValue = isNaN(parseFloat(e.target.value)) ? 0.0 :
                      parseFloat(e.target.value);
                  softmaxStatus.values[index] = newValue;
                  this.props.actions.changeSoftmaxStatus(softmaxStatus);
                }}/>
            </Grid>;
          })}
        </Grid>
        <Grid item container justify='center' spacing={2}>
          <Grid item xs={2}>
            Softmax Score:
          </Grid>
          { softmaxed.map((status, index) => {
            return <Grid item xs={2} key={index}>
              {status}
            </Grid>;
          })}
        </Grid>
        <Grid item container justify='center' spacing={2}>
          <Grid item xs={2}>
            With Temp.:
          </Grid>
          { tempered.map((status, index) => {
            return <Grid item xs={2} key={index}>
              {status}
            </Grid>;
          })}
        </Grid>
      </Grid>
    );
  }
}

Softmax.propTypes = {
  softmaxStatus: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
};

/**
 * Mapping the state that this component needs to its props.
 *
 * @param {object} state - the application state from where to get needed props.
 * @param {object} ownProps - optional own properties needed to acess state.
 * @return {object} the props for this component.
 */
function mapStateToProps(state, ownProps) {
  return {
    softmaxStatus: state.softmaxStatus,
  };
}

/**
 * Mapping the actions of redux to this component.
 *
 * @param {function} dispatch - called whenever an action is to be dispatched.
 * @return {object} all the actions bound to this component.
 */
function mapDispatchToProps(dispatch) {
  return {actions: bindActionCreators(actions, dispatch)};
}

export default connect(mapStateToProps, mapDispatchToProps)(Softmax);
