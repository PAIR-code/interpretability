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

import {Grid, Paper} from '@material-ui/core';

import DreamHead from './heads/DreamHeadComponent';
import ExplanationHead from './heads/ExplanationHeadComponent';
import TokenSearchBody from './bodies/TokenSearchBodyComponent';

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
