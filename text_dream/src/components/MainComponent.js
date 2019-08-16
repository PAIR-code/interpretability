import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {bindActionCreators} from 'redux';

import * as actions from '../actions';

import {Grid} from '@material-ui/core';

import CardComponent from './CardComponent';

/**
 * The Main Component holding all the cards of the visualization.
 */
class Main extends React.Component {
  /**
   * Called whenever this component updates its state to set the card
   * dimensions.
   */
  componentDidUpdate() {
    if (this.props.dreamingElements.length > 0) {
      const cardElement = document.getElementById('cardItem');
      if (cardElement != null) {
        this.props.actions.changeCardDimensions({
          'width': cardElement.getBoundingClientRect().width,
          'height': cardElement.getBoundingClientRect().height,
        });
      }
    }
  }

  /**
   * Renders the main component containing all the cards.
   *
   * @return {jsx} the component to be rendered.
   */
  render() {
    return (
      <Grid container direction='row' spacing={1} className='fullHeight'>
        <Grid item xs className='fullHeight'>
          <Grid container direction='row' className='fullHeight' spacing={1}>
            {this.props.dreamingElements.map((element, index) =>
              <CardComponent
                dreamingElement={element}
                elementIndex={index}
                key={index}/>
            )}
          </Grid>
        </Grid>
      </Grid>
    );
  }
}

Main.propTypes = {
  dreamingElements: PropTypes.array.isRequired,
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

export default connect(mapStateToProps, mapDispatchToProps)(Main);
