import React from 'react';
import PropTypes from 'prop-types';

import {Grid, Typography} from '@material-ui/core';

/**
 * Provides a component for displaying sentences in other Components.
 */
class ResemblingSentence extends React.Component {
  /**
   * Renders a component to display sentences in other components.
   *
   * @return {jsx} the component to be rendered.
   */
  render() {
    const words = this.props.sentence.slice(1, -1);
    const colors = [];

    for (const i in words) {
      if (words[i] === this.props.target[parseInt(i) + 1]) {
        colors.push(this.props.colors[0]);
      } else if (words[i] === this.props.original[parseInt(i) + 1]) {
        colors.push(this.props.colors[1]);
      } else {
        colors.push(this.props.colors[2]);
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
}

ResemblingSentence.propTypes = {
  sentence: PropTypes.array.isRequired,
  target: PropTypes.array.isRequired,
  original: PropTypes.array.isRequired,
  colors: PropTypes.array.isRequired,
};

export default ResemblingSentence;
