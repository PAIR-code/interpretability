import React from 'react';
import {Grid} from '@material-ui/core';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

/**
 * Displaying the text for this step in the explainable.
 */
class FeatureVisTexts extends React.Component {
  /**
   * Renders the text.
   *
   * @return {jsx} the component to be rendered.
   */
  render() {
    return (
      <Grid item className='explanationItem overflow'>
        <p className='normalText'>
          <a href="https://distill.pub/2017/feature-visualization/">
            Feature Visualization
          </a> is a common tool for interpretability of neural networks.
            The ideas of feature visualization are borrowed
            from <a href="https://ai.googleblog.com/2015/06/inceptionism-going-deeper-into-neural.html">
            Deep Dream
          </a>
            , where we can obtain inputs that excite the network by
            maximizing the activation of neurons, channels, or layers of the
            network. This way, we get an idea about which part of the
            network is looking for what kind of input.
        </p>
        <ExpansionPanel>
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}
            classes={{expanded: 'expandedPanel'}}>
                Deep Dream
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <p className='smallText'>
              In Deep Dream, inputs are changed through gradient descent
              to maximize activation values.
              This can be thought of as similar to the initial training
              process, where through many iterations, we try to optimize a
              mathematical equation.
              But instead of updating network parameters, Deep Dream
              updates the input sample.
              What this leads to is somewhat psychedelic but very
              interesting images, that can reveal to what kind of input
              these neurons react.
            </p>
          </ExpansionPanelDetails>
        </ExpansionPanel>
        <p className='normalText'>
          This explainable provides visual insight into how we adapted
          the techniques of feature visualization to text-based models.
          Along this line,
          we <a href="https://github.com/PAIR-code/interpretability/tree/master/text-dream/webapp">
            visually illustrate
          </a> this process, and
          explore reasons for why feature visualization does not work as
          well for text. We also
          publish <a href="https://github.com/PAIR-code/interpretability/tree/master/text-dream/python">
            tools
          </a> to explore this direction further.
        </p>
        <p className='normalText'>
          Our experiments have been conducted
          with <a href="https://arxiv.org/pdf/1810.04805.pdf">
            BERT
          </a>, a neural network published by Google in 2018.
          BERT excels in natural language understanding. It can be used
          for multiple different tasks, such as sentiment analysis or next
          sentence prediction, and
          has <a href="https://www.blog.google/products/search/search-language-understanding-bert/">
          recently been integrated into Google Search
          </a>.
        </p>
      </Grid>
    );
  }
}

export default FeatureVisTexts;