import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {bindActionCreators} from 'redux';
import Input from '@material-ui/core/Input';
import { Typography, Slider } from '@material-ui/core';

import * as actions from '../../../actions';

class TopWordsPreferences extends React.Component {
  handleSliderChange = (event, newValue) => {
    this.props.actions.setTopWordsIteration(newValue);
  };

  handleInputChange = event => {
    const newValue =
      event.target.value === '' ? '' : Number(event.target.value);
    this.props.actions.setTopWordsIteration(newValue);
  };

  render() {
    return(
      <div>
        <Typography variant="h6" color="inherit">
          Top Words
        </Typography>
        <div className='preferencesItem'>
          <Slider
            value={this.props.top_words.iteration}
            onChange={this.handleSliderChange}
            max={this.props.top_words.max_iterations}
            aria-labelledby="input-slider"
            className='inputElement'
          />
          <Input
            value={this.props.top_words.iteration}
            margin="dense"
            onChange={this.handleInputChange}
            onBlur={this.handleBlur}
            inputProps={{
              step: 1,
              min: 0,
              max: this.props.top_words.max_iterations,
              type: 'number',
              'aria-labelledby': 'input-slider',
            }}
            className='inputElement'
          />
        </div>
      </div>
    )
  }
}

TopWordsPreferences.propTypes = {
  top_words: PropTypes.object.isRequired,
}

// Map the State of the Application to the Props of this Class
function mapStateToProps(state, ownProps) {
  return {
    top_words: state.top_words,
  };
}

// Map the Actions for the State to the Props of this Class
function mapDispatchToProps(dispatch) {
  return {actions: bindActionCreators(actions, dispatch)}
}

export default connect(mapStateToProps, mapDispatchToProps)(TopWordsPreferences);
