import React from 'react';
import PropTypes from 'prop-types';

import { Grid, Paper } from '@material-ui/core';

import ResembleHead from '../heads/ResembleHeadComponent';
import ResembleBody from '../bodies/ResembleBodyComponent';
import ExplanationHead from '../heads/ExplanationHeadComponent';

import * as sentences from '../../sentences';

class Resemble extends React.Component {
  render() {
    var sentenceParams = sentences.getResembleSentenceParams(
              this.props.results, this.props.params);
    var headParams = {
      'LayerID': this.props.params.layer_id,
      'WordID': this.props.params.word_id,
      'NeuronID': this.props.params.neuron_id
    }
    return (
      <Grid container direction='column' className='fullHeight' wrap='nowrap'>
        <ExplanationHead
            topic="Resemble"
            params={headParams}
            elementIndex={this.props.elementIndex}/>
        <ResembleHead
            results={this.props.results}
            params={this.props.params}
            sentenceParams={sentenceParams}/>
        <div className='overflow'>
          <Paper className={'dreamPaper'}>
            <ResembleBody
                results={this.props.results}
                params={this.props.params}
                sentenceParams={sentenceParams}/>
          </Paper>
        </div>
      </Grid>
    );
  }
}

Resemble.propTypes = {
  results: PropTypes.object.isRequired,
  params: PropTypes.object.isRequired,
  elementIndex: PropTypes.number.isRequired
}

export default Resemble;
