import React from "react";
import { Grid } from "@material-ui/core";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

/**
 * Displaying the text for this step in the explainable.
 */
class ReconstructVisTexts extends React.Component {
  /**
   * Renders the text.
   *
   * @return {jsx} the component to be rendered.
   */
  render() {
    return (
      <Grid item className="explanationItem overflow">
        <p className="normalText">
          To test the general applicability of this approach in a simpler
          setting, we tried to reconstruct activations instead of maximizing
          them. For this experiment, we fed a sentence into the network, saved
          the activation for a specific layer, and then tried to get back to
          this initial sentence using Deep Dream.
        </p>
        <ExpansionPanel>
          <ExpansionPanelSummary
            expandIcon={<ExpandMoreIcon />}
            classes={{ expanded: "expandedPanel" }}
          >
            Experiment Details
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <p className="smallText">
              Instead of looking for single neurons, we reconstructed the
              activation for the entire layer. As an initial input for the
              optimization problem, we used a random input sentence with the
              same length as the target sentence. We then used the same
              technique of changing the input to the network through gradient
              descent. This time, the optimization target was to minimize the
              difference between our saved activation and the input to the
              network. We used the same sentence for every layer, to see how
              this unfolds in different stages of the network.
            </p>
          </ExpansionPanelDetails>
        </ExpansionPanel>
        <p className="normalText">
          Surprisingly, these experiments seem to work comparably well. Even
          more interesting: this indicates not only that our approach has no
          major conceptual flaws, but reveals additional insight into the
          workings of BERT.
        </p>
        <p className="normalText">
          One such insight is that it seems to be easier to completely
          reconstruct the activation for earlier layers. Layers that take on
          later processing steps are consistently harder to reconstruct. Another
          interesting analysis is to look at which words get replaced in each of
          the layers. While some words cannot be reconstructed relatively early,
          which indicates that they might not be as important, others are
          replaced by conceptually similar words, which hints at how the model
          is able to reason about language. Other, seemingly important words are
          consistently reconstructed across all layers.
        </p>
        <p className="normalText">
          All in all, this experiment provided more insight than we initially
          expected, which led us to build on this and try something similar.
        </p>
      </Grid>
    );
  }
}

export default ReconstructVisTexts;
