import React from 'react';
import {Grid} from '@material-ui/core';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {bindActionCreators} from 'redux';

import {getCard} from '../../../cardprocessing';
import * as actions from '../../../actions';

/**
 * Displaying the illustration for this step in the explainable.
 */
class ShiftVisIllustration extends React.Component {
  /**
   * Updating the page progress.
   */
  componentDidMount() {
    this.props.actions.loadShiftedReconstruction(this.props.dreamID);
    const cardElement = document.getElementById('cardItem');
    if (cardElement != null) {
      this.props.actions.changeCardDimensions({
        'width': cardElement.getBoundingClientRect().width,
        'height': cardElement.getBoundingClientRect().height,
      });
    }
  }

  /**
   * Renders the illustration.
   *
   * @return {jsx} the component to be rendered.
   */
  render() {
    const shiftCard = getCard(this.props.shiftVisJSON, 0);
    return (
     <Grid item xs className='fullHeight' id='cardItem'>
        {shiftCard}
      </Grid>
    );
  }
}

ShiftVisIllustration.propTypes = {
  actions: PropTypes.object.isRequired,
  dreamID: PropTypes.number.isRequired,
  shiftVisJSON: PropTypes.object.isRequired,
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
    dreamID: state.dreamID,
    shiftVisJSON: state.shiftVisJSON,
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

export default connect(mapStateToProps, mapDispatchToProps)(ShiftVisIllustration);
