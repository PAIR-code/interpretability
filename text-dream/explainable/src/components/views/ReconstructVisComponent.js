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

import NavigateNext from '@material-ui/icons/NavigateNext';
import NavigateBefore from '@material-ui/icons/NavigateBefore';
import {Grid, Button} from '@material-ui/core';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import {getCard} from '../../cardprocessing';
import data from '../../data/reconstruct.json';
import * as actions from '../../actions';

/**
 * The Main Component holding all the cards of the visualization.
 */
class ReconstructVis extends React.Component {
  /**
   * Updating the page progress.
   */
  componentDidMount() {
    this.props.actions.changeProgressPage(8);
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
              Reconstructing known Activations
            </h1>
            <p className='normalText'>
              To test the general applicability of this approach in a simpler
              setting, we tried to reconstruct activations instead of maximizing
              them. For this experiment, we fed a sentence into the network,
              saved the activation for a specific layer, and then tried to get
              back to this initial sentence using Deep Dream.
            </p>
            <ExpansionPanel>
              <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}
                classes={{expanded: 'expandedPanel'}}>
                    Experiment Details
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>
                <p className='smallText'>
                  Instead of looking for single neurons, we reconstructed the
                  activation for the entire layer. As an initial input for the
                  optimization problem, we used a random input sentence with the
                  same length as the target sentence. We then used the same
                  technique of changing the input to the network through
                  gradient descent. This time, the optimization target was to
                  minimize the difference between our saved activation and the
                  input to the network. We used the same sentence for every
                  layer, to see how this unfolds in different stages of the
                  network.
                </p>
              </ExpansionPanelDetails>
            </ExpansionPanel>
            <p className='normalText'>
              The results of this experiment can be seen in Figure 5.
              Surprisingly, these experiments seem to work comparably well. Even
              more interesting: this indicates not only that our approach has no
              major conceptual flaws, but reveals additional insight into the
              workings of BERT.
            </p>
            <p className='normalText'>
              One such insight is that it seems to be easier to completely
              reconstruct the activation for earlier layers. Layers that take on
              later processing steps are consistently harder to reconstruct.
              Another interesting analysis is too look at which words get
              replaced in each of the layers. While some words cannot be
              reconstructed relatively early, which indicates that they might
              not be as important, others are replaced by conceptually similar
              words, which hints at how the model is able to reason about
              language. Other, seemingly important words are consistently
              reconstructed across all layers.
            </p>
            <ExpansionPanel>
              <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}
                classes={{expanded: 'expandedPanel'}}>
                    Detailed Results
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>
                <p className='smallText'>
                  We can see that connections such as the word "for", commas,
                  and the word "and" seem to get replaced with seemingly random
                  words relatively early. As these words are not really
                  important to understand the general meaning of the sentence,
                  them being less important for the reconstruction of activation
                  results seems just natural. Other words, such as "duties",
                  "include", and "sites" are replaced by conceptually similar
                  words, such as "interests", "reflect", and "venues" in some of
                  the layers. These replacements could sometimes even be
                  considered drop-in replacements that preserve the overall
                  meaning of the sentence. This is in line with the general
                  assumption that such models first look for fine-grained
                  structures and details in the input, before moving to the
                  recognition of more general concepts. Interestingly, some
                  words are consistently reconstructed across all layers. It
                  seems like these words are especially important for the
                  network to understand the sentence. This indicates that for
                  some tokens, the exact representation is of great importance
                  for understanding the sentence, while others can be replaced
                  without as much loss of information.
                </p>
              </ExpansionPanelDetails>
            </ExpansionPanel>
            <p className='normalText'>
              All in all, this experiment provided more insight than we
              initially expected, which led us to build on this and try
              something similar.
            </p>
          </Grid>
          <Grid item container direction='row' justify='center' spacing={2}>
            <Grid item>
              <Link to='/similarvis'>
                <Button variant='contained' color='secondary'
                  endIcon={<NavigateBefore/>}>
                  Back
                </Button>
              </Link>
            </Grid>
            <Grid item>
              <Link to='/shiftvis'>
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

ReconstructVis.propTypes = {
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

export default connect(mapStateToProps, mapDispatchToProps)(ReconstructVis);
