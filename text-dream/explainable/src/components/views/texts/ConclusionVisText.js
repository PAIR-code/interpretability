import React from 'react';
import {Grid} from '@material-ui/core';

/**
 * Displaying the text for this step in the explainable.
 */
class ConclusionVisTexts extends React.Component {
  /**
   * Renders the text.
   *
   * @return {jsx} the component to be rendered.
   */
  render() {
    return (
      <Grid item className='explanationItem overflow'>
        <p className='normalText'>
            This explainable shows experiments aimed at looking into what a deep
            transformer language model, namely BERT, has learned. Although
            our attempts didn't work as well as we were hoping, we got some
            interesting insights into how a language model builds up its
            understanding of text using these methods. Thus, we are not
            giving up, and hope that one day we can understand what
            individual components of text models have learned through
            approaches like these. To support further research in this
            direction, we open-sourced all
            our <a href="https://github.com/PAIR-code/interpretability/tree/master/text-dream/python">code</a> and <a href="https://github.com/PAIR-code/interpretability/tree/master/text-dream/webapp">visualizations</a>.
        </p>
        <p className='normalText'>
          <span>
              Many thanks to Martin Wattenberg, Nina Poerner, and Ian Tenney
              for helpful feedback and discussions about this research, and
              to David Weinberger for editorial input.
          </span>
        </p>
      </Grid>
    );
  }
}

export default ConclusionVisTexts;
