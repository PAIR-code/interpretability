import React from 'react';
import PropTypes from 'prop-types';

import {Grid, Paper} from '@material-ui/core';

import ReconstructHead from '../heads/ReconstructHeadComponent';
import ReconstructBody from '../bodies/ReconstructBodyComponent';
import ExplanationHead from '../heads/ExplanationHeadComponent';

import * as sentences from '../../sentences';

/**
 * Provides a Card Component for reconstruct results.
 */
class Reconstruct extends React.PureComponent {
  /**
   * Render the component with the reuslts.
   *
   * @return {jsx} the component to be rendered.
   */
  render() {
    const sentenceParams = sentences.getReconstructSentenceParams(
        this.props.results, this.props.params);
    const headParams = {
      'LayerID': this.props.params.layer_id,
      'WordID': this.props.params.word_id,
      'NeuronID': this.props.params.neuron_id,
    };
    return (
      <Grid container direction='column' className='fullHeight' wrap='nowrap'>
        <ExplanationHead
          topic="Reconstruct"
          params={headParams}
          elementIndex={this.props.elementIndex}/>
        <ReconstructHead
          results={this.props.results}
          params={this.props.params}
          sentenceParams={sentenceParams}/>
        <div className='overflow'>
          <Paper className={'dreamPaper'}>
            <ReconstructBody
              results={this.props.results}
              params={this.props.params}
              sentenceParams={sentenceParams}/>
          </Paper>
        </div>
      </Grid>
    );
  }
}

Reconstruct.propTypes = {
  results: PropTypes.object.isRequired,
  params: PropTypes.object.isRequired,
  elementIndex: PropTypes.number.isRequired,
};

export default Reconstruct;
