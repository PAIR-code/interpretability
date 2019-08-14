import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {bindActionCreators} from 'redux';

import * as actions from '../../actions';
import { Grid, Typography } from '@material-ui/core';

class ResemblingSentence extends React.Component {
  render() {
    var words = this.props.sentence.slice(1, -1);
    var colors = [];

    for (var i in words) {
      if (words[i] === this.props.target[parseInt(i) + 1]) {
        colors.push(this.props.colors[0]);
      } else if (words[i] === this.props.original[parseInt(i) + 1]) {
        colors.push(this.props.colors[1])
      } else {
        colors.push(this.props.colors[2])
      }
    }

    return (
      <Grid container direction='row' spacing={1} className='mainGrid'>
        {words.map((word, index) =>
          <Grid item key={index}>
            <Typography variant="body2" style={{color: colors[index]}}>
              {word}
            </Typography>
          </Grid>
        )}
      </Grid>
    );
  }
};

// PropTypes of this Class, containing the Global Layer Settings
ResemblingSentence.propTypes = {
  sentence: PropTypes.array.isRequired,
  target: PropTypes.array.isRequired,
  original: PropTypes.array.isRequired,
  colors: PropTypes.array.isRequired
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
