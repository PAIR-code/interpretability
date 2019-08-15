import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {bindActionCreators} from 'redux';

import { Grid, Paper } from '@material-ui/core';

import DreamHead from '../heads/DreamHeadComponent';
import ExplanationHead from '../heads/ExplanationHeadComponent';

import * as actions from '../../actions'
import SimilarEmbeddingsBodyComponent from '../bodies/SimilarEmbeddingsBodyComponent';

// Main component of the Application that displays all content dependant on the Controls State
class SimilarEmbeddings extends React.Component {
  render() {
    var headParams = {
      'LayerID': this.props.dreamingElement.layer_id,
      'WordID': this.props.dreamingElement.word_id,
      'NeuronID': this.props.dreamingElement.neuron_id,
      'ChangeID': this.props.dreamingElement.change_word
    }
    var target = [...this.props.dreamingElement.tokens];
    for (var tokenID in this.props.dreamingElement.tokens) {
      if (this.props.dreamingElement.change_word !== parseInt(tokenID)) {
        target[tokenID] = '';
      }
    }
    var sentenceParams = {
      headWidth: 30,
      colors: ['blue', 'black', 'black'],
      target: target
    }
    var params = {
      tokens: this.props.dreamingElement.tokens
    }
    return (
      <Grid container direction='column' className='fullHeight' wrap='nowrap'>
        <ExplanationHead
            topic="Top Words"
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
  elementIndex: PropTypes.number.isRequired
}

function mapStateToProps(state, ownProps) {
  return {
  };
}

// Mapping the Actions called for SVG manipulation to the Props of this Class
function mapDispatchToProps(dispatch) {
  return {actions: bindActionCreators(actions, dispatch)}
}

export default connect(mapStateToProps, mapDispatchToProps)(SimilarEmbeddings);
