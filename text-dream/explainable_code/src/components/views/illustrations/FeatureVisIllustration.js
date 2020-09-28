import React from "react";
import { Grid } from "@material-ui/core";

/**
 * Displaying the illustration for this step in the explainable.
 */
class FeatureVisIllustration extends React.Component {
  /**
   * Renders the illustration.
   *
   * @return {jsx} the component to be rendered.
   */
  render() {
    return (
      <Grid item xs className="explanationItem">
        <img
          src="https://2.bp.blogspot.com/-17ajatawCW4/VYITTA1NkDI/AAAAAAAAAlM/eZmy5_Uu9TQ/s1600/classvis.png"
          className="slim"
          alt="Deep Dream"
        />
        <div className="caption-slim">
          <p>
            Examples for Deep Dream processes with images from the original Deep
            Dream{" "}
            <a href="https://ai.googleblog.com/2015/06/inceptionism-going-deeper-into-neural.html">
              blogpost
            </a>
            . Here, they take a randomly initialized image and use Deep Dream to
            transform the image by maximizing the activation of the
            corresponding output neuron. This can show what a network has
            learned about different classes or for individual neurons.
          </p>
        </div>
      </Grid>
    );
  }
}

export default FeatureVisIllustration;
