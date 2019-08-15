import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {bindActionCreators} from 'redux';

import {Grid, Paper} from '@material-ui/core';

import ExplanationHead from '../heads/ExplanationHeadComponent';
import TopWordsHead from '../heads/TopWordsHeadComponent';
import TopWordsBody from '../bodies/TopWordsBodyComponent';

import * as actions from '../../actions';

/**
 * Providing a Card Component for the TopWords chart in different experiments.
 */
class TopWords extends React.Component {
  /**
   * Rendering the chart card.
   *
   * @return {jsx} the component to be rendered.
   */
  render() {
    const headParams = {
      'WordID': this.props.dreamingElement.word_id,
    };
    const maxIterations = this.props.dreamingElement.iterations[
        this.props.dreamingElement.iterations.length -1].number;
    return (
      <Grid container direction='column' className='fullHeight' wrap='nowrap'>
        <ExplanationHead
          topic="Top Words"
          params={headParams}
          elementIndex={this.props.elementIndex}/>
        <TopWordsHead
          maxIterations={maxIterations}
          dreamingElement={this.props.dreamingElement}
          elementIndex={this.props.elementIndex}/>
        <Grid item xs>
          <Paper id='topWordsPaper' className={'dreamPaper fullHeight'}>
            <TopWordsBody
              dreamingElement={this.props.dreamingElement}
              elementIndex={this.props.elementIndex}/>
            Activation: {this.props.dreamingElement.iterations[
                this.props.dreamingElement.iteration].activation}
          </Paper>
        </Grid>
      </Grid>
    );
  }
}

TopWords.propTypes = {
  dreamingElement: PropTypes.object.isRequired,
  elementIndex: PropTypes.number.isRequired,
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

export default connect(mapStateToProps, mapDispatchToProps)(TopWords);
