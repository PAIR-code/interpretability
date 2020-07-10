import React from 'react';
import {Grid} from '@material-ui/core';

/**
 * Displaying the text for this step in the explainable.
 */
class SimilarVisTexts extends React.Component {
  /**
   * Renders the text.
   *
   * @return {jsx} the component to be rendered.
   */
  render() {
    return (
      <Grid item className='explanationItem overflow'>
        <p className='normalText'>
          Another possible reason this method doesn't always lead to the
          desired results is that the optimization problem is hard. A reason
          for this could be that the model's neurons are highly specialized
          on certain tokens, while all the tokens around it might not
          activate the neuron as much. To explore this possibility, we
          developed another visualization that allows us to look at
          activations for tokens that are close to the token we know highly
          activates the neuron. We see that sometimes words that are close in
          the high-dimensional embedding to the word we know
          produces a high activation, do not also activate the neuron that
          much. This could be an indication that some neurons are so
          specialized, that it gets extremely hard to find optima using
          gradient descent, and might indeed be another reason for why these
          dreaming approaches sometimes fail to produce the expected
          results.
        </p>
      </Grid>
    );
  }
}

export default SimilarVisTexts;
