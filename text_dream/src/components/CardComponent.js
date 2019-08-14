import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {bindActionCreators} from 'redux';

import { Grid } from '@material-ui/core';

import * as actions from '../actions'
import Dream from './cards/DreamComponent';
import Resemble from './cards/ResembleComponent';
import Layers from './cards/LayersComponent';
import Magnitudes from './cards/MagnitudesComponent';
import ShiftedResembling from './cards/ShiftedResemblingComponent';
import TopWordsComponent from './cards/TopWordsComponent';

class Card extends React.Component {
  render() {
    var dreamingCard;
    switch (this.props.dreamingElement.type) {
      case "dream":
        dreamingCard = <Dream
            results={this.props.dreamingElement.results}
            params={this.props.dreamingElement.params}
            elementIndex={this.props.elementIndex}/>
        break;
      case "resemble":
        dreamingCard = <Resemble
            results={this.props.dreamingElement.results}
            params={this.props.dreamingElement.params}
            elementIndex={this.props.elementIndex}/>
        break;
      case "resemble_shifted":
        dreamingCard = <ShiftedResembling
            results={this.props.dreamingElement.results}
            params={this.props.dreamingElement.params}
            elementIndex={this.props.elementIndex}/>
        break;
      case "top_words":
        dreamingCard = <TopWordsComponent
            dreamingElement={this.props.dreamingElement}
            elementIndex={this.props.elementIndex}/>
        break;
      case "magnitudes":
        dreamingCard = <Magnitudes
            magnitudes={this.props.dreamingElement.magnitudes}
            elementIndex={this.props.elementIndex}/>
        break;
      case "layers":
        dreamingCard = <Layers
            layers={this.props.dreamingElement.layers}
            elementIndex={this.props.elementIndex}/>
        break;
      default:
        dreamingCard = <div></div>
    }
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
