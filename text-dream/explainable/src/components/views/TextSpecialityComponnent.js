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
import MathJax from 'react-mathjax2';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import Softmax from '../cards/SoftmaxComponent';
import * as actions from '../../actions';

/**
 * The Main Component holding all the cards of the visualization.
 */
class TextSpecial extends React.Component {
  /**
   * Updating the page progress.
   */
  componentDidMount() {
    this.props.actions.changeProgressPage(2);
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
              Textual Models
            </h1>
            <p className='normalText'>
              When dreaming for images, the input to the model is
              gradually changed. Language, however,
              is made of discrete structures, i.e.
              tokens, which represent words, or word-pieces. Thus, there is no
              such gradual change to be
              made<Tooltip title={<span className='styledTooltip'>
                Looking at a single pixel in an input image,
                such a change could be gradually going from green to red. The
                green value would slowly go down, while the red value would
                increase. In language, however, we can not slowly go from the
                word 'green' to the word 'red', as everything in between does
                not make sense.</span>}><sup>[i]</sup></Tooltip>.
            </p>
            <ExpansionPanel>
              <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}
                classes={{expanded: 'expandedPanel'}}>
                    Word Embeddings
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>
                <p className='smallText'>
                  Language models operate on embeddings of words. Using these
                  embeddings, words are converted into high-dimensional vectors
                  of continuous numbers. In this embedding space, words with
                  similar meanings are closer together than words with different
                  meanings. You might ask: "Why can't we use these embeddings to
                  dream to?" The answer is that there is often no mapping from
                  unconstrained embedding vectors back to real tokens. With Deep
                  Dream changing the embeddings rather than input tokens, we can
                  end up with embeddings that are nowhere close to any token.
                </p>
              </ExpansionPanelDetails>
            </ExpansionPanel>
            <p className='normalText'>
              To still be able to use Deep Dream, we have to utilize the
              so-called softmax-trick, which has already been employed in
              a <a href="https://www.aclweb.org/anthology/W18-5437">
                paper by Poerner et. al.
              </a>. This trick was introduced
              by <a href="https://arxiv.org/pdf/1611.01144.pdf">
                Jang et. al.
              </a> and <a href="https://arxiv.org/pdf/1611.00712.pdf">
                Maddison et. al.
              </a>.
              It allows us to soften the requirement for discrete inputs, and
              instead use a linear combination of tokens as input to the model.
              To assure that we do not end up with something crazy, it uses two
              mechanisms. First, it constrains this linear combination so that
              the linear weights sum up to one. This, however, still leaves the
              problem that we can end up with any linear combination of such
              tokens, including ones that are not close to real tokens in the
              embedding space. Therefore, we also make use of a temperature
              parameter, which controls the sparsity of this linear combination.
              By slowly decreasing this temperature value, we can make the model
              first explore different linear combinations of tokens, before
              deciding on one token.
            </p>
            <ExpansionPanel>
              <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}
                classes={{expanded: 'expandedPanel'}}>
                    Softmax Trick
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>
                <MathJax.Context input='tex'>
                  <p className='smallText'>
                    The trick does two things. To ensure that we sum up to one
                    for the linear combination of tokens, it takes the softmax
                    function over the smooth input token distribution. However,
                    before applying the softmax function, we divide our token
                    distribution vector by a temperature value,
                    i.e. <MathJax.Node inline>
                      softmax(token\_distribution / t)
                    </MathJax.Node>. Dividing by large
                    temperature values means that the softmax result will be
                    smooth, whereas dividing by small temperature values results
                    in a more spiky softmax function.
                  </p>
                </MathJax.Context>
              </ExpansionPanelDetails>
            </ExpansionPanel>
          </Grid>
          <Grid item container direction='row' justify='center' spacing={2}>
            <Grid item>
              <Link to='/featurevis'>
                <Button variant='contained' color='secondary'
                  endIcon={<NavigateBefore/>}>
                  Back
                </Button>
              </Link>
            </Grid>
            <Grid item>
              <Link to='/bertresults'>
                <Button variant='contained' color='secondary'
                  endIcon={<NavigateNext/>}>
                  Next
                </Button>
              </Link>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs className='explanationItem'>
          <Softmax/>
        </Grid>
      </Grid>
    );
  }
}

TextSpecial.propTypes = {
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

export default connect(mapStateToProps, mapDispatchToProps)(TextSpecial);
