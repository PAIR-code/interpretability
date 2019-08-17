import React from 'react';
import PropTypes from 'prop-types';

import {Grid, Paper} from '@material-ui/core';

import DreamHead from '../heads/DreamHeadComponent';
import ExplanationHead from '../heads/ExplanationHeadComponent';
import TokenSearchBody from '../bodies/TokenSearchBodyComponent';

/**
 * Provides a Card Component for rendering a chart with similar embedding
 * activations.
 */
class TokenSearch extends React.PureComponent {
  /**
   * Render the chart with similar embedding activations.
   *
   * @return {jsx} the component to be rendered.
   */
  render() {
    const headParams = {
      'LayerID': this.props.dreamingElement.layer_id,
      'WordID': this.props.dreamingElement.word_id,
      'NeuronID': this.props.dreamingElement.neuron_id,
    };
    const target = [...this.props.dreamingElement.tokens];
    for (const tokenID in this.props.dreamingElement.tokens) {
      if (this.props.dreamingElement.change_word !== parseInt(tokenID)) {
        target[tokenID] = '';
      }
    }
    const sentenceParams = {
      headWidth: 30,
      colors: ['blue', 'black', 'black'],
      target: target,
    };
    const params = {
      tokens: this.props.dreamingElement.tokens,
    };
    return (
      <Grid container direction='column' className='fullHeight' wrap='nowrap'>
        <ExplanationHead
          topic="Token Search"
          params={headParams}
          elementIndex={this.props.elementIndex}/>
        <DreamHead
          params={params}
          sentenceParams={sentenceParams}/>
        <Grid item xs>
          <Paper id='topWordsPaper' className={'dreamPaper fullHeight'}>
            <TokenSearchBody
              dreamingElement={this.props.dreamingElement}
              elementIndex={this.props.elementIndex}/>
          </Paper>
        </Grid>
      </Grid>
    );
  }
}


TokenSearch.propTypes = {
  dreamingElement: PropTypes.object.isRequired,
  elementIndex: PropTypes.number.isRequired,
};

export default TokenSearch;
