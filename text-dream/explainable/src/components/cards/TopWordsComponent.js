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
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {Grid, Paper} from '@material-ui/core';

import ExplanationHead from './heads/ExplanationHeadComponent';
import DreamHead from './heads/DreamHeadComponent';
import TopWordsHead from './heads/TopWordsHeadComponent';
import TopWordsBody from './bodies/TopWordsBodyComponent';
import SelectionHead from './heads/SelectionHeadComponent';

import * as actions from '../../actions';
import * as constants from '../../data/Constatnts';

/**
 * Providing a Card Component for the TopWords chart in different experiments.
 */
class TopWords extends React.PureComponent {
  /**
   * Rendering the chart card.
   *
   * @return {jsx} the component to be rendered.
   */
  render() {
    let iteration = this.props.topWordsIteration;
    iteration = iteration < this.props.dreamingElement.iterations.length ?
        iteration : this.props.dreamingElement.iterations.length - 1;
    const headParams = {
      'LayerID': this.props.dreamingElement.params.layer_id,
      'WordID': this.props.dreamingElement.params.word_id,
      'NeuronID': this.props.dreamingElement.params.neuron_id,
      'Activation': this.props.dreamingElement.iterations[
          iteration].activation.toFixed(4),
    };
    const target = [...this.props.dreamingElement.params.tokens];
    for (const tokenID in this.props.dreamingElement.params.tokens) {
      if (this.props.dreamingElement.word_id !== parseInt(tokenID)) {
        target[tokenID] = '';
      }
    }
    const sentenceParams = {
      headWidth: 30,
      colors: ['blue', 'black', 'black'],
      target: target,
    };
    const params = {
      tokens: this.props.dreamingElement.params.tokens,
    };
    const maxIterations = this.props.dreamingElement.iterations[
        this.props.dreamingElement.iterations.length -1].number;
    return (
      <Grid container direction='column' className='fullHeight' wrap='nowrap'>
        <ExplanationHead
          topic="Top Words"
          params={headParams}
          elementIndex={this.props.elementIndex}/>
        <DreamHead
          params={params}
          sentenceParams={sentenceParams}/>
        <TopWordsHead
          maxIterations={maxIterations}
          dreamingElement={this.props.dreamingElement}
          elementIndex={this.props.elementIndex}
          iteration={iteration}/>
        <Grid item xs>
          <Paper id='topWordsPaper' className={'dreamPaper fullHeight'}>
            <TopWordsBody
              dreamingElement={this.props.dreamingElement}
              elementIndex={this.props.elementIndex}
              iteration={iteration}/>
          </Paper>
        </Grid>
        <SelectionHead
          options={constants.numOptions}
          clickHandler={this.handleClick.bind(this)}/>
      </Grid>
    );
  }

  handleClick(index) {
    this.props.actions.changeAnnealing(index);
  }
}

TopWords.propTypes = {
  dreamingElement: PropTypes.object.isRequired,
  elementIndex: PropTypes.number.isRequired,
  topWordsIteration: PropTypes.number.isRequired,
};

/**
 * Mapping the state that this component needs to its props.
 *
 * @param {object} state - the application state from where to get needed props.
 * @param {object} ownProps - optional own properties needed to acess state.
 * @return {object} the props for this component.
 */
function mapStateToProps(state, ownProps) {
  return {
    topWordsIteration: state.topWordsIteration,
  };
}

/**
 * Mapping the actions of redux to this component.
 *
 * @param {function} dispatch - called whenever an action is to be dispatched.
 * @return {object} all the actions bound to this component.
 */
function mapDispatchToProps(dispatch) {
  return {actions: bindActionCreators(actions, dispatch)};
}

export default connect(mapStateToProps, mapDispatchToProps)(TopWords);
