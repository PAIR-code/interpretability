import React from 'react';
import {Grid} from '@material-ui/core';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

/**
 * Displaying the text for this step in the explainable.
 */
class ShiftVisTexts extends React.Component {
  /**
   * Renders the text.
   *
   * @return {jsx} the component to be rendered.
   */
  render() {
    return (
      <Grid item className='explanationItem overflow'>
        <p className='normalText'>
          If reconstructing activations works, what happens if we change
          some activations before reconstruction? To investigate potential bias in such models, we
          wanted to make meaningful changes to the activations and look into
          what the model makes of these changes during reconstruction. Thus,
          we changed activations of gender-specific words in the directions
          of their counterparts, e.g. "he" in the direction of "she".
        </p>
        <ExpansionPanel>
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}
            classes={{expanded: 'expandedPanel'}}>
                Technical Details
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <p className='smallText'>
              Performing such changes can be done with some preprocessing.
              First, we gathered sentences for two concepts we want to test
              bias for. Then, we fed all these sentences through the network
              and saved the activation value for the concept-word in each
              layer. This gave us a representation of both concepts per
              layer. To then find a direction to reasonably change the
              activation towards, we
              used <a href="https://arxiv.org/pdf/1711.11279.pdf">Concept
              Activation Vectors (CAV)</a>. Thus, we trained linear
              classifiers between activations for both concepts. The vector
              that is orthogonal to the classification boundary could then
              be used as the direction to shift the activation by simply
              adding it to the original activation value. To follow this
              idea, we used a corpus of sentences containing male and female
              pronouns, namely "he" and "she". After obtaining the CAV for
              these concepts, we use the same approach of reconstructing
              activations as before. The only difference here is, that the
              activation that is to be reconstructed gets changed before the
              reconstruction process. To be more precise, we change the
              activation that we retrieved for a sentence at the position of
              a pronoun. The activations of all the other tokens are kept
              the same.
            </p>
          </ExpansionPanelDetails>
        </ExpansionPanel>
        <p className='normalText'>
          Interestingly, not only did a change occur during reconstruction
          of the token we shifted the activation for, but also for some of
          the tokens for which the activations were untouched. Most exciting
          was that sometimes the token "her" changed to "his", which matches the
          direction we shifted the pronoun token. Thus, even though we only
          changed the pronoun, this was so important for the model, that
          other tokens could be changed on this basis. On the other hand, we
          were not able to find even stronger indications of bias, where for
          example, the model would change the word "baseball" so something
          it understands as more "female". Also, as with all the other
          experiments we conducted, the results were neither completely
          reproducible nor predictable.
        </p>
      </Grid>
    );
  }
}

export default ShiftVisTexts;
