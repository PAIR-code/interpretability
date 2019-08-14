import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {bindActionCreators} from 'redux';

import { Grid, Typography, IconButton, Paper } from '@material-ui/core';
import Close from '@material-ui/icons/Close';

import * as actions from '../../actions'

class ExplanationHead extends React.Component {
  closeButtonClicked = () => {
    this.props.actions.removeDreamingElement(this.props.elementIndex);
  }

  render() {
    var keys = Object.keys(this.props.params);
    var filteredParams = {};
    for (var i in keys) {
      if (this.props.params[keys[i]] !== null) {
        filteredParams[keys[i]] = this.props.params[keys[i]];
      }
    }
    keys = Object.keys(filteredParams);
    return (
      <Grid item>
        <Paper className='headingPaper' style={{backgroundColor: '#DDDDDD'}}
            square>
          <Grid container direction='row' spacing={0} alignItems="center">
            <Grid item xs>
              <Grid container direction='row' spacing={1} alignItems="center">
                <Grid item>
                  <Typography variant="body1" color="inherit">
                    {this.props.topic}
                  </Typography>
                </Grid>
                {keys.map((key, index) =>
                  <Grid item key={index}>
                    <Typography variant="caption" color="inherit">
                      {key}: {this.props.params[key]}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Grid>
              <Grid item>
                <IconButton
                    color="inherit"
                    onClick={this.closeButtonClicked}>
                  <Close />
                </IconButton>
              </Grid>
          </Grid>
        </Paper>
      </Grid>
    );
  }
}

ExplanationHead.propTypes = {
  topic: PropTypes.string.isRequired,
  params: PropTypes.object.isRequired,
  elementIndex: PropTypes.number.isRequired
}

function mapStateToProps(state, _) {
  return {
  };
}

function mapDispatchToProps(dispatch) {
  return {actions: bindActionCreators(actions, dispatch)}
}

export default connect(mapStateToProps, mapDispatchToProps)(ExplanationHead);
