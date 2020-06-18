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
import {Grid, Button, Tooltip} from '@material-ui/core';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import * as actions from '../../actions';

/**
 * The Main Component holding all the cards of the visualization.
 */
class BERTResults extends React.Component {
  /**
   * Updating the page progress.
   */
  componentDidMount() {
    this.props.actions.changeProgressPage(3);
  }

  /**
   * Renders the main component containing all the cards.
   *
   * @return {jsx} the component to be rendered.
   */
  render() {
    return (
      <Grid container alignItems='center' spacing={2} className='fullHeight'>
        <Grid item xs container direction='column' alignItems='center'
          spacing={2}>
          <Grid item className='explanationItem'>
            <h1>
              Results with BERT
            </h1>
            <p className='normalText'>
              Now that we know how Deep Dream can be used in combination with
              text models, what do those results look like? Well, very
              unpredictable. For some neurons it was possible to produce
              sentences that highly activated them, however, for other neurons
              we weren&apos;t able to dream such sentences
              <Tooltip title={<span className='styledTooltip'>
                As a baseline for all experiments, we used results from corpus
                search. Here, we searched through a large corpus of sentences
                and looked into which one activates the neuron of interest most.
                We always started the process with one of the top 10 sentences
                from this corpus, as this approach has a lot more freedom to
                change words and thus should be able to get to higher
                activations than corpus search
                alone.</span>}><sup>[i]</sup></Tooltip>.
              When changing single words, the model sometimes found one that led
              to a high activation, but not always. For whole sentences, the
              success rate was reduced even more. This meant that our idea of
              feature visualization for text was not working.
            </p>
            <ExpansionPanel>
              <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}
                classes={{expanded: 'expandedPanel'}}>
                    Changing Words with BERT
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>
                <p className='smallText'>
                  There are different options of which words to change using
                  Deep Dream. We always kept the CLS and SEP tokens static. CLS
                  is a special classification token used by BERT for some
                  downstream tasks, while SEP marks the end of a sentence. When
                  we allowed the model to change these tokens as well, it seemed
                  to be even more confused and the approach completely failed.
                  In between those special tokens, one can change anything from
                  one word to the whole sentence, albeit with mixed results.
                </p>
              </ExpansionPanelDetails>
            </ExpansionPanel>
            <p className='normalText'>
              The lack of success in dreaming words to highly activate specific
              neurons was surprising to us. This method uses gradient descent
              and seemed to work for other models (<a href="https://www.aclweb.org/anthology/W18-5437">
                see Poerner et. al. 2018</a>). However, BERT is a complex model,
              arguably much more complex than the models that have been
              previously investigated with this method.
            </p>
            <p className='normalText'>
              So, why is BERT such a bad dreamer? This is a question we tried to
              answer <a href="https://ai.google/research/teams/brain/pair">
              PAIR</a>-style, by providing explainability approaches to visually
              inspect those dreaming results
              <Tooltip title={<span className='styledTooltip'>
                We used these tools to reason about our approaches with BERT,
                but if you run into similar problems, feel free to use them with
                any model. All tools presented within this are publicly
                available on GitHub.</span>}><sup>[i]</sup></Tooltip>.
            </p>
          </Grid>
          <Grid item container direction='row' justify='center' spacing={2}>
            <Grid item>
              <Link to='/textspecial'>
                <Button variant='contained' color='secondary'
                  endIcon={<NavigateBefore/>}>
                  Back
                </Button>
              </Link>
            </Grid>
            <Grid item>
              <Link to='/dreamvis'>
                <Button variant='contained' color='secondary'
                  endIcon={<NavigateNext/>}>
                  Next
                </Button>
              </Link>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs className='explanationItem'>
          <img
            src="https://2.bp.blogspot.com/-17ajatawCW4/VYITTA1NkDI/AAAAAAAAAlM/eZmy5_Uu9TQ/s1600/classvis.png"
            className='slim'
            alt='Deep Dream'/>
          <div className="caption-slim">
            <p>
              Examples for Deep Dream processes with images from the
              original Deep
              Dream <a href="https://ai.googleblog.com/2015/06/inceptionism-going-deeper-into-neural.html">
              blogpost
              </a>.
              Here, they take a randomly initialized image and use Deep
              Dream to transform the image by maximizing the activation
              of the corresponding output neuron.
              This can show what a network has learned about different
              classes or for individual neurons.
            </p>
          </div>
        </Grid>
      </Grid>
    );
  }
}

BERTResults.propTypes = {
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

export default connect(mapStateToProps, mapDispatchToProps)(BERTResults);
