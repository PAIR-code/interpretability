import React from 'react';
import {Grid, Tooltip} from '@material-ui/core';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

/**
 * Displaying the text for this step in the explainable.
 */
class BertResultsTexts extends React.Component {
  /**
   * Renders the text.
   *
   * @return {jsx} the component to be rendered.
   */
  render() {
    return (
      <Grid item className='explanationItem overflow'>
        <p className='normalText'>
          Now that we know how Deep Dream can be used in combination with
          text models, what do those results look like? Well, very
          unpredictable. For some neurons it was possible to produce
          sentences that highly activated them, however, for other neurons
          we weren&apos;t able to dream such sentences
          <Tooltip title={<span className='styledTooltip'>
            As a baseline for all experiments, we used results from corpus
            search. Here, we searched through a large corpus of sentences
            and looked into which one activates the neuron of interest most.
            We always started the process with one of the top 10 sentences
            from this corpus, as this approach has a lot more freedom to
            change words and thus should be able to get to higher
            activations than corpus search
            alone.</span>}><sup>[i]</sup></Tooltip>.
          When changing single words, the model sometimes found one that led
          to a high activation, but not always. For whole sentences, the
          success rate was reduced even more. This meant that our idea of
          feature visualization for text was not working.
        </p>
        <ExpansionPanel>
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}
            classes={{expanded: 'expandedPanel'}}>
                Changing Words with BERT
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <p className='smallText'>
              There are different options of which words to change using
              Deep Dream. We always kept the CLS and SEP tokens static. CLS
              is a special classification token used by BERT for some
              downstream tasks, while SEP marks the end of a sentence. When
              we allowed the model to change these tokens as well, it seemed
              to be even more confused and the approach completely failed.
              In between those special tokens, one can change anything from
              one word to the whole sentence, albeit with mixed results.
            </p>
          </ExpansionPanelDetails>
        </ExpansionPanel>
        <p className='normalText'>
          The lack of success in dreaming words to highly activate specific
          neurons was surprising to us. This method uses gradient descent
          and seemed to work for other models (<a href="https://www.aclweb.org/anthology/W18-5437">
            see Poerner et. al. 2018</a>). However, BERT is a complex model,
          arguably much more complex than the models that have been
          previously investigated with this method.
        </p>
        <p className='normalText'>
          So, why is BERT such a bad dreamer? This is a question we tried to
          answer <a href="https://pair.withgoogle.com/">
          PAIR</a>-style, by providing explainability approaches to visually
          inspect those dreaming results
          <Tooltip title={<span className='styledTooltip'>
            We used these tools to reason about our approaches with BERT,
            but if you run into similar problems, feel free to use them with
            any model. All tools presented within this are publicly
            available on GitHub.</span>}><sup>[i]</sup></Tooltip>.
        </p>
      </Grid>
    );
  }
}

export default BertResultsTexts;
