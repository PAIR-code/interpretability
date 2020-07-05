import React from 'react';
import {Grid} from '@material-ui/core';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

/**
 * Displaying the text for this step in the explainable.
 */
class DreamVisTexts extends React.Component {
  /**
   * Renders the text.
   *
   * @return {jsx} the component to be rendered.
   */
  render() {
    return (
      <Grid item className='explanationItem overflow'>
        <p className='normalText'>
          The first question we wanted to answer for these dreaming
          processes is how the input representation evolves. Here it is
          interesting to look at when and how the model replaces certain
          words in the input. At the same time, we wanted to see how the
          activation value of the neuron we are trying to maximize was
          evolving alongside the change of temperature which we use to force
          the model to pick real tokens. Additionally, we compare the
          evolution of this activation value to the activation we would get
          if we were to ignore the linear combination of tokens that we
          obtain using the softmax-trick and instead snap our input to the
          top-ranked tokens of the softmax function.
        </p>
        <p className='normalText'>
          As can be seen, as the dreaming process progresses, the sentence
          quickly becomes gibberish. What was more interesting, however, is
          that while this is an example of a successful run, we were not
          able to consistently get back to the same or a higher activation
          than what we started with. As this approach has a lot more freedom
          to change words, it should be able to lead us to higher
          activations than the top sentences from a corpus search. This is
          something we wanted to investigate further.
          We had some ideas on why this might not always work as expected:
        </p>
        <ol className='normalText'>
          <li>
            <p>
              Temperature annealing seems to first, allow the model to pick
              any linear combination of tokens, before gradually reducing
              the number of tokens used for this linear combination. What if
              some tokens get removed from the combination but would highly
              activate the neuron in isolation?
            </p>
          </li>
          <li>
            <p>
              What if the model is so specialized that a neuron is highly
              activated by some specific token but not by that token's
              neighbors in embedding space? This would make the optimization
              problem with gradient descent very hard.
            </p>
          </li>
        </ol>
        <ExpansionPanel>
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}
            classes={{expanded: 'expandedPanel'}}>
                Easier Conditions
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <p className='smallText'>
              To look at these processes and what might go wrong here, we
              made the problem easier by having it only change one word in
              the input sentence. We did this to check if it would still
              not always be able to reach high activation values, and
              while the probability of getting to a high activation value
              increased, it still did not work out all the time.
            </p>
          </ExpansionPanelDetails>
        </ExpansionPanel>
      </Grid>
    );
  }
}

export default DreamVisTexts;