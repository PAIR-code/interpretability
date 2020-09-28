import React from "react";
import { Grid } from "@material-ui/core";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

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
      <Grid item className="explanationItem overflow">
        <p className="normalText">
          Another possible reason this method doesn't always lead to the desired
          results is that the optimization problem is hard. A reason for this
          could be that the model's neurons are highly specialized on certain
          tokens, while all the tokens around it might not activate the neuron
          as much. To explore this possibility, we developed another
          visualization that allows us to look at activations for tokens that
          are close to the token we know highly activates the neuron. We see
          that just because a word is close in the embedding-space to a word we
          know produces a high activation, does not mean that it also highly
          activates the neuron. This could be an indication that some neurons
          are so specialized that it gets extremely hard to find optima using
          gradient descent, and might indeed be another reason for why these
          dreaming approaches sometimes fail to produce the expected results.
        </p>
        <ExpansionPanel>
          <ExpansionPanelSummary
            expandIcon={<ExpandMoreIcon />}
            classes={{ expanded: "expandedPanel" }}
          >
            Distance Calculation
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <p className="smallText">
              For this visualization, distance is calculated in embedding space.
              We get the high-dimensional representation of the token we are
              looking at as well as the most activating token, and then take the
              euclidian distance to figure out how close the tokens are to each
              other.
            </p>
          </ExpansionPanelDetails>
        </ExpansionPanel>
      </Grid>
    );
  }
}

export default SimilarVisTexts;
