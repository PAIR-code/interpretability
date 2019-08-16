import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {bindActionCreators} from 'redux';

import * as actions from '../actions';

import {Grid} from '@material-ui/core';

import {getCard} from '../cardprocessing';
import {getCardColors} from '../colors';

/**
 * Component to render Cards of different types.
 */
class Card extends React.Component {
  /**
   * Called after the component mounted to one-time add the colors this card
   * needs.
   */
  componentDidMount() {
    const cardType = this.props.dreamingElements[this.props.elementIndex].type;
    if (cardType !== 'layers') { // If its layers, we need to add colors in it
      const colors = getCardColors(cardType);
      this.props.actions.addActiveColors(colors);
    }
  }

  /**
   * Renders a card of a specific type.
   *
   * @return {jsx} the card component to be rendered.
   */
  render() {
    const dreamingElement = this.props.dreamingElements[
        this.props.elementIndex];
    const dreamingCard = getCard(dreamingElement, this.props.elementIndex);
    return (
      <Grid item xs className='fullHeight' id='cardItem'>
        {dreamingCard}
      </Grid>
    );
  }
}

Card.propTypes = {
  dreamingElements: PropTypes.array.isRequired,
  elementIndex: PropTypes.number.isRequired,
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
    dreamingElements: state.dreamingElements,
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
