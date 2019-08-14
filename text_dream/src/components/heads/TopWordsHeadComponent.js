import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {bindActionCreators} from 'redux';

import { Grid, Typography, Tooltip, Paper, Slider } from '@material-ui/core';
import Input from '@material-ui/core/Input';

import * as actions from '../../actions'

class TopWordsHead extends React.Component {
  handleSliderChange = (event, newValue) => {
    this.props.actions.changeDreamingElementIteration(newValue,
        this.props.elementIndex);
  };

  handleInputChange = event => {
    const newValue =
      event.target.value === '' ? '' : Number(event.target.value);
    this.props.actions.changeDreamingElementIteration(newValue,
        this.props.elementIndex);
  };

  render() {
    return (
      <Grid item>
        <Paper className='subHeadingPaper'
            style={{backgroundColor: '#DDDDDD'}} square>
          <Grid container direction='row' spacing={1} alignItems="center">
            <Tooltip title="Input Sentence" placement="top">
              <Grid item>
                <Typography variant="body1" color="inherit">
                  Iteration:
                </Typography>
              </Grid>
            </Tooltip>
            <Grid item xs>
              <Slider
                value={this.props.dreamingElement.iteration}
                onChange={this.handleSliderChange}
                max={this.props.maxIterations}
                aria-labelledby="input-slider"
                className='inputElement'
              />
            </Grid>
            <Grid item>
              <Input
                value={this.props.dreamingElement.iteration}
                margin="dense"
                onChange={this.handleInputChange}
                inputProps={{
                  step: 1,
                  min: 0,
                  max: this.props.maxIterations,
                  type: 'number',
                  'aria-labelledby': 'input-slider',
                }}
                className='inputElement'
              />
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    );
  }
}

TopWordsHead.propTypes = {
  maxIterations: PropTypes.number.isRequired,
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

export default connect(mapStateToProps, mapDispatchToProps)(TopWordsHead);
