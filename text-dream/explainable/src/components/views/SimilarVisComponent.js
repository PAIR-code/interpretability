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
import {Link} from 'react-router-dom';

import NavigateBefore from '@material-ui/icons/NavigateBefore';
import NavigateNext from '@material-ui/icons/NavigateNext';
import {Grid, Button} from '@material-ui/core';

import {getCard} from '../../cardprocessing';
import data from '../../data/similar_words.json';
import * as actions from '../../actions';

/**
 * The Main Component holding all the cards of the visualization.
 */
class SimilarVis extends React.Component {
  /**
   * Updating the page progress.
   */
  componentDidMount() {
    this.props.actions.changeProgressPage(7);
    const cardElement = document.getElementById('cardItem');
    if (cardElement != null) {
      this.props.actions.changeCardDimensions({
        'width': cardElement.getBoundingClientRect().width,
        'height': cardElement.getBoundingClientRect().height,
      });
    }
  }

  /**
   * Renders the main component containing all the cards.
   *
   * @return {jsx} the component to be rendered.
   */
  render() {
    const wordsCard = getCard(data, 0);
    return (
      <Grid container alignItems='center' spacing={2} className='fullHeight'>
        <Grid item xs container direction='column' alignItems='center'
          spacing={2}>
          <Grid item className='explanationItem'>
            <h1>
              Activations for Similar Words
            </h1>
            <p className='normalText'>
              Another possible reason this method doesn't always lead to the
              desired results is that the optimization problem is hard. A reason
              for this could be that the model's neurons are highly specialized
              on certain tokens, while all the tokens around it might not
              activate the neuron as much. To explore this possibility, we
              developed another visualization that allows us to look at
              activations for tokens that are close to the token we know highly
              activates the neuron. In Figure 5, you can see an example of this
              visualization. We see that words that are close in the
              high-dimensional embedding to the word "for", which we know
              produces a high activation, do not also activate the neuron that
              much. This could be an indication that some neurons are so
              specialized, that it gets extremely hard to find optima using
              gradient descent, and might indeed be another reason for why these
              dreaming approaches sometimes fail to produce the expected
              results.
            </p>
          </Grid>
          <Grid item container direction='row' justify='center' spacing={2}>
            <Grid item>
              <Link to='/topvis'>
                <Button variant='contained' color='secondary'
                  endIcon={<NavigateBefore/>}>
                  Back
                </Button>
              </Link>
            </Grid>
            <Grid item>
              <Link to='/reconstructvis'>
                <Button variant='contained' color='secondary'
                  endIcon={<NavigateNext/>}>
                  Next
                </Button>
              </Link>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs className='fullHeight' id='cardItem'>
          {wordsCard}
        </Grid>
      </Grid>
    );
  }
}

SimilarVis.propTypes = {
  actions: PropTypes.object.isRequired,
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
    softmaxStatus: state.softmaxStatus,
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

export default connect(mapStateToProps, mapDispatchToProps)(SimilarVis);
