import React from 'react';
import {Grid} from '@material-ui/core';

import Softmax from '../../cards/SoftmaxComponent';

/**
 * Displaying the illustration for this step in the explainable.
 */
class TextSpecialtyIllustration extends React.Component {
  /**
   * Renders the illustration.
   *
   * @return {jsx} the component to be rendered.
   */
  render() {
    return (
      <Grid item xs className='explanationItem'>
        <Softmax/>
      </Grid>
    );
  }
}

export default TextSpecialtyIllustration;
