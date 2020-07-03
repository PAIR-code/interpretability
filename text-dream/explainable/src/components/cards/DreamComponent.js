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

import {Grid, Paper} from '@material-ui/core';

import DreamBody from './bodies/DreamBodyComponent';
import DreamHead from './heads/DreamHeadComponent';
import ExplanationHead from './heads/ExplanationHeadComponent';
import SelectionHead from './heads/SelectionHeadComponent';

import * as sentences from '../../sentences';
import * as actions from '../../actions';

/**
 * Provides the Dream Card Component.
 */
class Dream extends React.PureComponent {
  /**
   * Renders the Dream Card.
   *
   * @return {jsx} the dream card to be rendered
   */
  render() {
    const sentenceParams = sentences.getDreamSentenceParams(
        this.props.results, this.props.params);
    const headParams = {
      'LayerID': this.props.params.layer_id,
      'WordID': this.props.params.word_id,
      'NeuronID': this.props.params.neuron_id,
    };
    return (
      <Grid container direction='column' className='fullHeight' wrap='nowrap'>
        <ExplanationHead
          topic="Dream"
          params={headParams}
          elementIndex={this.props.elementIndex}/>
        <DreamHead
          params={this.props.params}
          sentenceParams={sentenceParams}/>
        <div className='overflow'>
          <Paper className={'dreamPaper'}>
            <DreamBody
              results={this.props.results}
              params={this.props.params}
              sentenceParams={sentenceParams}/>
          </Paper>
        </div>
        <SelectionHead
          options={5}
          clickHandler={this.handleClick.bind(this)}/>
      </Grid>
    );
  }

  handleClick(index) {
    this.props.actions.changeDream(index);
  }
}

Dream.propTypes = {
  params: PropTypes.object.isRequired,
  results: PropTypes.object.isRequired,
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

export default connect(null, mapDispatchToProps)(Dream);
