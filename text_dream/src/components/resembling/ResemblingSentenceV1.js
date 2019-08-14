import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {bindActionCreators} from 'redux';

import * as actions from '../../actions';
import { Paper, Grid, Typography } from '@material-ui/core';

class ResemblingSentence extends React.Component {
  // Render the Layer
  render() {
    var words = this.props.sentence;
    var colors = [];
    for (var i in words) {
      if (words[i] === this.props.target[i]) {
        colors.push('inherit');
      } else {
        colors.push('secondary')
      }
    }

    return (
      <Grid container direction='row' justify="center" spacing={2} className='mainGrid'>
        {words.map((word, index) =>
          <Grid item key={index}>
            <Paper className='wordPaper'>
              <Typography variant="body2" align="center" color={colors[index]}>
                {word}
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>
    );
  }
};

// PropTypes of this Class, containing the Global Layer Settings
ResemblingSentence.propTypes = {
  sentence: PropTypes.array.isRequired,
  target: PropTypes.array.isRequired
}

// Map the State of the Application to the Props of this Class
function mapStateToProps(state, ownProps) {
  return {
  };
}

// Map the Actions for the State to the Props of this Class
function mapDispatchToProps(dispatch) {
  return {actions: bindActionCreators(actions, dispatch)}
}

export default connect(mapStateToProps, mapDispatchToProps)(ResemblingSentence);
