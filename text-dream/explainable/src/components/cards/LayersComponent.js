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

import {Grid, ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails,
  Typography} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import ReconstructSentence from '../reconstruct/ReconstructSentence';
import ExplanationHead from './heads/ExplanationHeadComponent';
import SelectionHead from './heads/SelectionHeadComponent';

import {getDreamProps, getReconstructProps,
  getMagnitudesLayerProps} from '../../cardcontentprocessing';
import {getCardColors} from '../../colors';
import * as actions from '../../actions';
import * as constants from '../../data/Constants';

/**
 * Provides a Card Component to render multiple Layers.
 */
class Layers extends React.PureComponent {
  /**
   * Called after the component mounted to one-time add the colors this card
   * needs.
   */
  componentDidMount() {
    const cardType = this.props.layers[0].type;
    const colors = cardType === 'magnitudes' ?
        getCardColors('layerMagnitudes') : getCardColors(cardType);
    this.props.actions.addActiveColors(colors);
  }

  /**
   * Renders all the layers of this Card.
   *
   * @return {jsx} the card with the layers to be rendered
   */
  render() {
    let props;
    switch (this.props.layers[0].type) {
      case 'dream':
        props = getDreamProps(this.props.layers);
        break;
      case 'reconstruct':
        props = getReconstructProps(this.props.layers);
        break;
      case 'magnitudes':
        props = getMagnitudesLayerProps(this.props.layers);
        break;
      default:
        break;
    }
    props.sentenceParams.headWidth = props.sentenceParams.headWidth + 14;
    return (
      <Grid container direction='column' className='fullHeight' wrap='nowrap'
        justify='center'>
        <ExplanationHead
          topic={props.topic}
          params={props.headParams}
          elementIndex={this.props.elementIndex}/>
        {props.head}
        <div className='overflow bottomMargin'>
          {props.bodies.map((body, index) =>
            <ExpansionPanel key={index}>
              <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                <Grid container direction='row' spacing={1} alignItems="center"
                  wrap='nowrap'>
                  <Grid item style={{width: props.sentenceParams.headWidth}}>
                    <Typography variant="body1" color="inherit">
                      {props.layerIDs[index]}
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
        <SelectionHead
          options={constants.numOptions}
          clickHandler={this.handleClick.bind(this)}/>
      </Grid>
    );
  }

  /**
   * Handles the selection of a different dreaming experiment.
   *
   * @param {number} index The index of the selected item.
   */
  handleClick(index) {
    switch (this.props.layers[0].type) {
      case 'dream':
        this.props.actions.changeDream(index);
        break;
      case 'reconstruct':
        this.props.actions.changeReconstruction(index);
        break;
      case 'magnitudes':
        this.props.actions.changeShiftedReconstruction(index);
        break;
      default:
        break;
    }
  }
}

Layers.propTypes = {
  layers: PropTypes.array.isRequired,
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

export default connect(null, mapDispatchToProps)(Layers);
