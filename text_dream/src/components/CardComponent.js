import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {bindActionCreators} from 'redux';

import {Grid} from '@material-ui/core';

import * as actions from '../actions';

import {getCard} from '../cardprocessing';

/**
 * Component to render Cards of different types.
 */
class Card extends React.Component {
  /**
   * Renders a card of a specific type.
   *
   * @return {jsx} the card component to be rendered.
   */
  render() {
    const dreamingCard = getCard(this.props.dreamingElement,
        this.props.elementIndex);
    return (
      <Grid item xs className='fullHeight'>
        {dreamingCard}
      </Grid>
    );
  }
}

Card.propTypes = {
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

export default connect(mapStateToProps, mapDispatchToProps)(Card);
