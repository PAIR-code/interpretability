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

import {Grid, Typography, Paper} from '@material-ui/core';

import * as actions from '../../../actions';

/**
 * Providing a Header Component for any Card.
 */
class ExplanationHead extends React.Component {
  /**
   * Renders the general header.
   *
   * @return {jsx} the header to be rendered.
   */
  render() {
    let keys = Object.keys(this.props.params);
    const filteredParams = {};
    for (const key of keys) {
      if (this.props.params[key] !== null) {
        filteredParams[key] = this.props.params[key];
      }
    }
    keys = Object.keys(filteredParams);
    return (
      <Grid item>
        <Paper className='headingPaper' style={{backgroundColor: '#DDDDDD'}}
          square>
          <Grid container direction='row' spacing={0} alignItems="center">
            <Grid item xs>
              <Grid container direction='row' spacing={1} alignItems="center"
                style={{marginTop: '10px'}}>
                <Grid item>
                  <Typography variant="body1" color="inherit">
                    {this.props.topic}
                  </Typography>
                </Grid>
                {keys.map((key, index) =>
                  <Grid item key={index}>
                    <Typography variant="caption" color="inherit">
                      {key}: {this.props.params[key]}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    );
  }
}

ExplanationHead.propTypes = {
  topic: PropTypes.string.isRequired,
  params: PropTypes.object.isRequired,
  elementIndex: PropTypes.number.isRequired,
  actions: PropTypes.object.isRequired,
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

export default connect(null, mapDispatchToProps)(ExplanationHead);
