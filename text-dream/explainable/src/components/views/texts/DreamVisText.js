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
          interesting to look at:
        </p>
        <ol className='normalText'>
          <li>
            <p>
              When and how the model replaces certain words.
            </p>
          </li>
          <li>
            <p>
              How the activation value of the neuron we are trying to maximize
              evolves.
            </p>
          </li>
          <li>
            <p>
              How the activation value would evolve if we always just picked the
              top-ranked token instead of the softmax combination we use during
              optimization.
            </p>
          </li>
          <li>
            <p>
              How these interact with the change of temperature which forces
              the model to pick real tokens.
            </p>
          </li>
        </ol>
        <p className='normalText'>
          As can be seen in this visualization, we were not
          able to consistently get back to the same or a higher activation
          than what we started with. This is despite this approach has a lot
          more freedom to change words than corpus search.
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
              neighbors in embedding space?
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
              the input sentence. While the probability of getting to a high
              activation value is higher than when changing the whole sentence,
              it still did not work out all the time.
            </p>
          </ExpansionPanelDetails>
        </ExpansionPanel>
      </Grid>
    );
  }
}

export default DreamVisTexts;
