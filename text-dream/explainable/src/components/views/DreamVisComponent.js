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
import data from '../../data/dream_layer.json';
import * as actions from '../../actions';

/**
 * The Main Component holding all the cards of the visualization.
 */
class DreamVis extends React.Component {
  /**
   * Updating the page progress.
   */
  componentDidMount() {
    this.props.actions.changeProgressPage(4);
  }

  /**
   * Renders the main component containing all the cards.
   *
   * @return {jsx} the component to be rendered.
   */
  render() {
    const dreamingCard = getCard(data, 0);
    return (
      <Grid container alignItems='center' spacing={2} className='fullHeight'>
        <Grid item xs container direction='column' alignItems='center'
          spacing={2}>
          <Grid item className='explanationItem'>
            <h1>
              Visualized Dreams
            </h1>
            <p className='normalText'>
              The first question we wanted to answer for these dreaming
              processes is how the input representation evolves. Here it is
              interesting to look at when and how the model replaces certain
              words in the input. At the same time, we wanted to see how the
              activation value of the neuron we are trying to maximize was
              evolving alongside the change of temperature which we use to force
              the model to pick real tokens. Additionally, we compare the
              evolution of this activation value to the activation we would get
              if we were to ignore the linear combination of tokens that we
              obtain using the softmax-trick and instead snap our input to the
              top-ranked tokens of the softmax function.
            </p>
            <p className='normalText'>
              As can be seen, as the dreaming process progresses, the sentence
              quickly becomes gibberish. What was more interesting, however, is
              that while this is an example of a successful run, we were not
              able to consistently get back to the same or a higher activation
              than what we started with. As this approach has a lot more freedom
              to change words, it should be able to lead us to higher
              activations than the top sentences from a corpus search. This is
              something we wanted to investigate further.
              We had some ideas on why this might not always work as expected:
            </p>
            <ol className='normalText'>
              <li>
                <p>
                  Temperature annealing seems to first, allow the model to pick
                  any linear combination of tokens, before gradually reducing
                  the number of tokens used for this linear combination. What if
                  some tokens get removed from the combination but would highly
                  activate the neuron in isolation?
                </p>
              </li>
              <li>
                <p>
                  What if the model is so specialized that a neuron is highly
                  activated by some specific token but not by that token's
                  neighbors in embedding space? This would make the optimization
                  problem with gradient descent very hard.
                </p>
              </li>
            </ol>
            <ExpansionPanel>
              <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}
                classes={{expanded: 'expandedPanel'}}>
                    Easier Conditions
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>
                <p className='smallText'>
                  To look at these processes and what might go wrong here, we
                  made the problem easier by having it only change one word in
                  the input sentence. We did this to check if it would still
                  not always be able to reach high activation values, and
                  while the probability of getting to a high activation value
                  increased, it still did not work out all the time.
                </p>
              </ExpansionPanelDetails>
            </ExpansionPanel>
          </Grid>
          <Grid item container direction='row' justify='center' spacing={2}>
            <Grid item>
              <Link to='/bertresults'>
                <Button variant='contained' color='secondary'
                  endIcon={<NavigateBefore/>}>
                  Back
                </Button>
              </Link>
            </Grid>
            <Grid item>
              <Link to='/annealingvis'>
                <Button variant='contained' color='secondary'
                  endIcon={<NavigateNext/>}>
                  Next
                </Button>
              </Link>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs className='fullHeight'>
          {dreamingCard}
        </Grid>
      </Grid>
    );
  }
}

DreamVis.propTypes = {
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

export default connect(mapStateToProps, mapDispatchToProps)(DreamVis);
