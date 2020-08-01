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

import {Grid, Paper} from '@material-ui/core';

import ExplanationHead from './heads/ExplanationHeadComponent';
import ShiftedReconstructHead from './heads/ShiftedReconstructHeadComponent';
import ShiftedReconstructBody from
  './bodies/ShiftedReconstructBodyComponent';

import * as sentences from '../../sentences';

/**
 * Provides a Card Component to display shifted Reconstruct results.
 */
class ShiftedReconstruct extends React.PureComponent {
  /**
   * Render the results of the shifted Reconstruct run.
   *
   * @return {jsx} the component to be rendered.
   */
  render() {
    const sentenceParams = sentences.getShiftSentenceParams(this.props.results,
        this.props.params);
    const headParams = {
      'LayerID': this.props.params.layer_id,
      'WordID': this.props.params.word_id,
      'NeuronID': this.props.params.neuron_id,
      'Magnitude': this.props.params.shift_magnitude,
    };
    return (
      <Grid container direction='column' className='fullHeight' wrap='nowrap'>
        <ExplanationHead
          topic="Shifted Reconstruct"
          params={headParams}
          elementIndex={this.props.elementIndex}/>
        <ShiftedReconstructHead
          params={this.props.params}
          sentenceParams={sentenceParams}/>
        <div className='overflow'>
          <Paper className={'dreamPaper'}>
            <ShiftedReconstructBody
              params={this.props.params}
              results={this.props.results}
              sentenceParams={sentenceParams}/>
          </Paper>
        </div>
      </Grid>
    );
  }
}

ShiftedReconstruct.propTypes = {
  results: PropTypes.object.isRequired,
  params: PropTypes.object.isRequired,
  elementIndex: PropTypes.number.isRequired,
};

export default ShiftedReconstruct;
