import React from 'react';
import PropTypes from 'prop-types';

import {Grid, Paper} from '@material-ui/core';

import ExplanationHead from '../heads/ExplanationHeadComponent';
import ShiftedResemblingHead from '../heads/ShiftedResemblingHeadComponent';
import ShiftedResemblingBody from '../bodies/ShiftedResemblingBodyComponent';

import * as sentences from '../../sentences';

/**
 * Provides a Card Component to display shifted resembling results.
 */
class ShiftedResembling extends React.PureComponent {
  /**
   * Render the results of the shifted resembling run.
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
          topic="Shifted Resemble"
          params={headParams}
          elementIndex={this.props.elementIndex}/>
        <ShiftedResemblingHead
          params={this.props.params}
          sentenceParams={sentenceParams}/>
        <div className='overflow'>
          <Paper className={'dreamPaper'}>
            <ShiftedResemblingBody
              params={this.props.params}
              results={this.props.results}
              sentenceParams={sentenceParams}/>
          </Paper>
        </div>
      </Grid>
    );
  }
}

ShiftedResembling.propTypes = {
  results: PropTypes.object.isRequired,
  params: PropTypes.object.isRequired,
  elementIndex: PropTypes.number.isRequired,
};

export default ShiftedResembling;
