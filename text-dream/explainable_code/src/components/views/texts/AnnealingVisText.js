import React from "react";
import { Grid } from "@material-ui/core";

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
      <Grid item className="explanationItem overflow">
        <p className="normalText">
          To investigate our first idea for why BERT might have problems with
          dreaming, we wanted to see how the annealing progresses. Here, we were
          interested in how the softmax token-distribution changed throughout
          the process. We see how the model first uses a linear combination of
          many tokens to get to activation values that could not be achieved
          with any single token alone. Then, the model is forced by the
          temperature value to reduce this bag of tokens, whereas the number of
          tokens used for the linear combination is reduced step-by-step. In
          many cases, the model cannot switch back to a single, highly
          activating token after this reduction.
        </p>
      </Grid>
    );
  }
}

export default AnnealingVisTexts;
