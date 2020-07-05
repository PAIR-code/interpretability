import React from 'react';
import {Grid} from '@material-ui/core';

/**
 * Displaying the text for this step in the explainable.
 */
class TopWordsVisTexts extends React.Component {
  /**
   * Renders the text.
   *
   * @return {jsx} the component to be rendered.
   */
  render() {
    return (
      <Grid item className='explanationItem overflow'>
        <p className='normalText'>
          It is also interesting to look at this in combination with the top
          activations for a specific word position. We can do that by
          checking the activation for each word in the vocabulary. You can
          see a visualization of this in Figure 3. One thing that this
          reveals is that "hands" is indeed the most activating word for the
          investigated neuron, given this sentence. Interestingly, none of
          the tokens that have high weights in the linear combination of
          tokens to input into the model can be found in these top
          activating ones. This shows one possible problem with this method
          and supports our theory that sometimes the annealing process
          removes highly activating tokens from the set of tokens that can
          be selected by the dreaming process.
        </p>
      </Grid>
    );
  }
}

export default TopWordsVisTexts;