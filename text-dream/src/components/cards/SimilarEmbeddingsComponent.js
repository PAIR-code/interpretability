import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {bindActionCreators} from 'redux';

import {Grid, Paper} from '@material-ui/core';

import DreamHead from '../heads/DreamHeadComponent';
import ExplanationHead from '../heads/ExplanationHeadComponent';
import SimilarEmbeddingsBodyComponent from
  '../bodies/SimilarEmbeddingsBodyComponent';

import * as actions from '../../actions';

/**
 * Provides a Card Component for rendering a chart with similar embedding
 * activations.
 */
class SimilarEmbeddings extends React.PureComponent {
  /**
   * Render the chart with similar embedding activations.
   *
   * @return {jsx} the component to be rendered.
   */
  render() {
    console.log(this.props.dreamingElement);
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
          topic="Similar Embeddings"
          params={headParams}
          elementIndex={this.props.elementIndex}/>
        <DreamHead
          params={params}
          sentenceParams={sentenceParams}/>
        <Grid item xs>
          <Paper id='topWordsPaper' className={'dreamPaper fullHeight'}>
            <SimilarEmbeddingsBodyComponent
              dreamingElement={this.props.dreamingElement}
              elementIndex={this.props.elementIndex}/>
          </Paper>
        </Grid>
      </Grid>
    );
  }
}

SimilarEmbeddings.propTypes = {
  dreamingElement: PropTypes.object.isRequired,
  elementIndex: PropTypes.number.isRequired,
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

export default connect(null, mapDispatchToProps)(SimilarEmbeddings);
