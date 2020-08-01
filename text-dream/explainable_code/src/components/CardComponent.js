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

import * as actions from '../actions';

import {Grid} from '@material-ui/core';

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
