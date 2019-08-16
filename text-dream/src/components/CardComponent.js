import React from 'react';
import PropTypes from 'prop-types';

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
    const dreamingCard = getCard(this.props.dreamingElement,
        this.props.elementIndex);
    return (
      <Grid item xs className='fullHeight' id='cardItem'>
        {dreamingCard}
      </Grid>
    );
  }
}

Card.propTypes = {
  dreamingElement: PropTypes.object.isRequired,
  elementIndex: PropTypes.number.isRequired,
};

export default Card;
