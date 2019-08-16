import React from 'react';
import PropTypes from 'prop-types';

import {Grid, ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails,
  Typography} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import ResemblingSentence from '../resembling/ResemblingSentence';
import ExplanationHead from '../heads/ExplanationHeadComponent';
import ShiftedResemblingHead from '../heads/ShiftedResemblingHeadComponent';

import * as sentences from '../../sentences';
import {getMagnitudesProps} from '../../cardcontentprocessing';

/**
 * Provides a Card Component that Renders multiple Magnitues.
 */
class Magnitudes extends React.Component {
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
          topic="Shifted Resemble"
          params={headParams}
          elementIndex={this.props.elementIndex}/>
        <ShiftedResemblingHead
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
                    <ResemblingSentence
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
