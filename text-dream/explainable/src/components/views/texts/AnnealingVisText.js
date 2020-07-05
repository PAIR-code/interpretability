import React from 'react';
import {Grid} from '@material-ui/core';

/**
 * Displaying the text for this step in the explainable.
 */
class AnnealingVisTexts extends React.Component {
  /**
   * Renders the text.
   *
   * @return {jsx} the component to be rendered.
   */
  render() {
    return (
      <Grid item className='explanationItem overflow'>
        <p className='normalText'>
          To investigate our first idea for why BERT might have problems
          with dreaming, we wanted to see how the annealing progresses.
          Here, we were interested in how the softmax token-distribution
          changed throughout the process. Interestingly, the token "hands"
          has a very low weight. If we went on, we could see that the model
          ruled out more tokens and was unable to swap back to "hands" to
          get a higher activation. In the end, it could only choose between
          tokens "##pile", "##gas", and "##gles", none of which highly
          activated the neuron.
        </p>
      </Grid>
    );
  }
}

export default AnnealingVisTexts;