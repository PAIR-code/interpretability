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
import {Grid, Button} from '@material-ui/core';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import * as actions from '../../actions';

/**
 * The Main Component holding all the cards of the visualization.
 */
class FeatureVis extends React.Component {
  /**
   * Updating the page progress.
   */
  componentDidMount() {
    this.props.actions.changeProgressPage(1);
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
              Feature Visualization for Text?
            </h1>
            <p className='normalText'>
              <a href="https://distill.pub/2017/feature-visualization/">
                Feature Visualization
              </a> is a common tool for interpretability of neural networks.
                The ideas of feature visualization are borrowed
                from <a href="https://ai.googleblog.com/2015/06/inceptionism-going-deeper-into-neural.html">
                Deep Dream
              </a>
                , where we can obtain inputs that excite the network by
                maximizing the activation of neurons, channels, or layers of the
                network. This way, we get an idea about which part of the
                network is looking for what kind of input.
            </p>
            <ExpansionPanel>
              <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}
                classes={{expanded: 'expandedPanel'}}>
                    Deep Dream
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>
                <p className='smallText'>
                  In Deep Dream, inputs are changed through gradient descent
                  to maximize activation values.
                  This can be thought of as similar to the initial training
                  process, where through many iterations, we try to optimize a
                  mathematical equation.
                  But instead of updating network parameters, Deep Dream
                  updates the input sample.
                  What this leads to is somewhat psychedelic but very
                  interesting images, that can reveal to what kind of input
                  these neurons react.
                </p>
              </ExpansionPanelDetails>
            </ExpansionPanel>
            <p className='normalText'>
              This explainable provides visual insight into how we adapted
              the techniques of feature visualization to text-based models.
              Along this line,
              we <a href="https://github.com/PAIR-code/interpretability/tree/master/text-dream/webapp">
                visually illustrate
              </a> this process, and
              explore reasons for why feature visualization does not work as
              well for text. We also
              publish <a href="https://github.com/PAIR-code/interpretability/tree/master/text-dream/python">
                tools
              </a> to explore this direction further.
            </p>
            <p className='normalText'>
              Our experiments have been conducted
              with <a href="https://arxiv.org/pdf/1810.04805.pdf">
                BERT
              </a>, a neural network published by Google in 2018.
              BERT excels in natural language understanding. It can be used
              for multiple different tasks, such as sentiment analysis or next
              sentence prediction, and
              has <a href="https://www.blog.google/products/search/search-language-understanding-bert/">
              recently been integrated into Google Search
              </a>.
            </p>
          </Grid>
          <Grid item container direction='row' justify='center' spacing={2}>
            <Grid item>
              <Link to='/textspecial'>
                <Button variant='contained' color='secondary'
                  endIcon={<NavigateNext/>}>
                  Start Exploring
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

FeatureVis.propTypes = {
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

export default connect(mapStateToProps, mapDispatchToProps)(FeatureVis);
