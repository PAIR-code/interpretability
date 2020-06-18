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
import {Grid, Button} from '@material-ui/core';

import * as actions from '../../actions';

/**
 * The Main Component holding all the cards of the visualization.
 */
class ConclusionVis extends React.Component {
  /**
   * Updating the page progress.
   */
  componentDidMount() {
    this.props.actions.changeProgressPage(10);
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
                This article shows experiments aimed at looking into what a deep
                transformer language model, namely BERT, has learned. Although
                our attempts didn't work as well as we were hoping, we got some
                interesting insights into how a language model builds up its
                understanding of text using these methods. Thus, we are not
                giving up, and hope that one day we can understand what
                individual components of text models have learned through
                approaches like these. To support further research in this
                direction, we open-sourced all
                our <a href="https://github.com/PAIR-code/interpretability/tree/master/text-dream/python">code</a> and <a href="https://github.com/PAIR-code/interpretability/tree/master/text-dream/webapp">visualizations</a>.
            </p>
            <p className='normalText'>
              <span>
                  Many thanks to Martin Wattenberg, Nina Poerner, and Ian Tenney
                  for helpful feedback and discussions about this research, and
                  to David Weinberger for editorial input.
              </span>
            </p>
          </Grid>
          <Grid item container direction='row' justify='center' spacing={2}>
            <Grid item>
              <Link to='/shiftvis'>
                <Button variant='contained' color='secondary'
                  endIcon={<NavigateBefore/>}>
                  Back
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

ConclusionVis.propTypes = {
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

export default connect(mapStateToProps, mapDispatchToProps)(ConclusionVis);
