import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {bindActionCreators} from 'redux';

import { Grid } from '@material-ui/core';

import * as actions from '../actions'

import { getCard } from '../cardprocessing';

class Card extends React.Component {
  render() {
    var dreamingCard = getCard(this.props.dreamingElement,
        this.props.elementIndex)
    return (
      <Grid item xs className='fullHeight'>
        {dreamingCard}
      </Grid>
    );
  }
}

Card.propTypes = {
  dreamingElement: PropTypes.object.isRequired,
  elementIndex: PropTypes.number.isRequired
}

function mapStateToProps(state, _) {
  return {
  };
}

function mapDispatchToProps(dispatch) {
  return {actions: bindActionCreators(actions, dispatch)}
}

export default connect(mapStateToProps, mapDispatchToProps)(Card);
