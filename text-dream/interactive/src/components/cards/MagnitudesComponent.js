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

import {Grid, ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails,
  Typography} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import ReconstructSentence from '../reconstruct/ReconstructSentence';
import ExplanationHead from './heads/ExplanationHeadComponent';
import ShiftedReconstructHead from
  './heads/ShiftedReconstructHeadComponent';

import * as sentences from '../../sentences';
import {getMagnitudesProps} from '../../cardcontentprocessing';

/**
 * Provides a Card Component that Renders multiple Magnitues.
 */
class Magnitudes extends React.PureComponent {
  /**
   * Renders all the magnitudes for this card.
   *
   * @return {jsx} the card to be rendered, containing all the magnitudes
   */
  render() {
    const headParams = {
      'LayerID': this.props.magnitudes[0].params.layer_id,
      'WordID': this.props.magnitudes[0].params.word_id,
      'NeuronID': this.props.magnitudes[0].params.neuron_id,
    };
    const sentenceParams = sentences.getShiftSentenceParams(
        this.props.magnitudes[0].results,
        this.props.magnitudes[0].params);
    const props = getMagnitudesProps(this.props.magnitudes);
    return (
      <Grid container direction='column' className='fullHeight' wrap='nowrap'>
        <ExplanationHead
          topic="Shifted Reconstruct"
          params={headParams}
          elementIndex={this.props.elementIndex}/>
        <ShiftedReconstructHead
          params={this.props.magnitudes[0].params}
          sentenceParams={sentenceParams}/>
        <div className='overflow'>
          {props.bodies.map((body, index) =>
            <ExpansionPanel key={index}>
              <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                <Grid container direction='row' spacing={1} alignItems="center">
                  <Grid item style={{width: props.sentenceParams.headWidth}}>
                    <Typography variant="body1" color="inherit">
                      {props.magnitudeValues[index]}
                    </Typography>
                  </Grid>
                  <Grid item>
                    <ReconstructSentence
                      sentence={props.sentences[index]}
                      target={props.sentenceParams.target}
                      original={props.sentenceParams.original}
                      colors={props.sentenceParams.colors}/>
                  </Grid>
                </Grid>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>
                {body}
              </ExpansionPanelDetails>
            </ExpansionPanel>
          )}
        </div>
      </Grid>
    );
  }
}

Magnitudes.propTypes = {
  magnitudes: PropTypes.array.isRequired,
  elementIndex: PropTypes.number.isRequired,
};

export default Magnitudes;
