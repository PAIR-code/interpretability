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
import data from '../../data/shift.json';
import * as actions from '../../actions';

/**
 * The Main Component holding all the cards of the visualization.
 */
class ShiftVis extends React.Component {
  /**
   * Updating the page progress.
   */
  componentDidMount() {
    this.props.actions.changeProgressPage(9);
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
              Reconstructing changed Activations
            </h1>
            <p className='normalText'>
              If reconstructing activations works, what happens if we change
              some activations? To investigate potential bias in such models, we
              wanted to make meaningful changes to the activations and look into
              what the model makes of these changes during reconstruction. Thus,
              we changed activations of gender-specific words in the directions
              of their counterparts, e.g. "he" in the direction of "she".
            </p>
            <ExpansionPanel>
              <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}
                classes={{expanded: 'expandedPanel'}}>
                    Technical Details
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>
                <p className='smallText'>
                  Performing such changes can be done with some preprocessing.
                  First, we gathered sentences for two concepts we want to test
                  bias for. Then, we fed all these sentences through the network
                  and saved the activation value for the concept-word in each
                  layer. This gave us a representation of both concepts per
                  layer. To then find a direction to reasonably change the
                  activation towards, we
                  used <a href="https://arxiv.org/pdf/1711.11279.pdf">Concept
                  Activation Vectors (CAV)</a>. Thus, we trained linear
                  classifiers between activations for both concepts. The vector
                  that is orthogonal to the classification boundary could then
                  be used as the direction to shift the activation by simply
                  adding it to the original activation value. To follow this
                  idea, we used a corpus of sentences containing male and female
                  pronouns, namely "he" and "she". After obtaining the CAV for
                  these concepts, we use the same approach of reconstructing
                  activations as before. The only difference here is, that the
                  activation that is to be reconstructed gets changed before the
                  reconstruction process. To be more precise, we change the
                  activation that we retrieved for a sentence at the position of
                  a pronoun. The activations of all the other tokens are kept
                  the same.
                </p>
              </ExpansionPanelDetails>
            </ExpansionPanel>
            <p className='normalText'>
              One can see the results of such an experiment in Figure 6.
              Interestingly, not only did a change occur during reconstruction
              of the token we shifted the activation for, but also for some of
              the tokens for which the activations were untouched. Most exciting
              was that the token "her" changed to "his", which matches the
              direction we shifted the pronoun token. Thus, even though we only
              changed the pronoun, this was so important for the model, that
              other tokens could be changed on this basis. On the other hand, we
              were not able to find even stronger indications of bias, where for
              example, the model would change the word "baseball" so something
              it understands as more "female". Also, as with all the other
              experiments we conducted, the results were neither completely
              reproducible nor predictable.
            </p>
          </Grid>
          <Grid item container direction='row' justify='center' spacing={2}>
            <Grid item>
              <Link to='/reconstructvis'>
                <Button variant='contained' color='secondary'
                  endIcon={<NavigateBefore/>}>
                  Back
                </Button>
              </Link>
            </Grid>
            <Grid item>
              <Link to='/conclusionvis'>
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

ShiftVis.propTypes = {
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

export default connect(mapStateToProps, mapDispatchToProps)(ShiftVis);
