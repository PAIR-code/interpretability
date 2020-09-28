import React from "react";
import { Grid, Tooltip } from "@material-ui/core";
import MathJax from "react-mathjax2";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

/**
 * Displaying the text for this step in the explainable.
 */
class TextSpecialtyTexts extends React.Component {
  /**
   * Renders the text.
   *
   * @return {jsx} the component to be rendered.
   */
  render() {
    return (
      <Grid item className="explanationItem overflow">
        <p className="normalText">
          When dreaming for images, the input to the model is gradually changed.
          Language, however, is made of discrete structures, i.e. tokens, which
          represent words, or word-pieces. Thus, there is no such gradual change
          to be made
          <Tooltip
            title={
              <span className="styledTooltip">
                Looking at a single pixel in an input image, such a change could
                be gradually going from green to red. The green value would
                slowly go down, while the red value would increase. In language,
                however, we can not slowly go from the word 'green' to the word
                'red', as everything in between does not make sense.
              </span>
            }
          >
            <sup>[i]</sup>
          </Tooltip>
          .
        </p>
        <ExpansionPanel>
          <ExpansionPanelSummary
            expandIcon={<ExpandMoreIcon />}
            classes={{ expanded: "expandedPanel" }}
          >
            Word Embeddings
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <p className="smallText">
              Language models operate on embeddings of words. Using these
              embeddings, words are converted into high-dimensional vectors of
              continuous numbers. In this embedding space, words with similar
              meanings are closer together than words with different meanings.
              You might ask: "Why can't we use these embeddings to dream to?"
              The answer is that there is often no mapping from unconstrained
              embedding vectors back to real tokens. With Deep Dream changing
              the embeddings rather than input tokens, we can end up with
              embeddings that are nowhere close to any token.
            </p>
          </ExpansionPanelDetails>
        </ExpansionPanel>
        <p className="normalText">
          To still be able to use Deep Dream, we have to utilize the so-called
          softmax-trick, which has already been employed in a{" "}
          <a href="https://www.aclweb.org/anthology/W18-5437">
            paper by Poerner et. al.
          </a>
          . This trick was introduced by{" "}
          <a href="https://arxiv.org/pdf/1611.01144.pdf">Jang et. al.</a> and{" "}
          <a href="https://arxiv.org/pdf/1611.00712.pdf">Maddison et. al.</a>.
          It allows us to soften the requirement for discrete inputs, and
          instead use a linear combination of tokens as input to the model. To
          assure that we do not end up with something crazy, it uses two
          mechanisms. First, it constrains this linear combination so that the
          linear weights sum up to one. This, however, still leaves the problem
          that we can end up with any linear combination of such tokens,
          including ones that are not close to real tokens in the embedding
          space. Therefore, we also make use of a temperature parameter, which
          controls the sparsity of this linear combination. By slowly decreasing
          this temperature value, we can make the model first explore different
          linear combinations of tokens, before deciding on one token. You can
          experiment with this mechanism in this visualization.
        </p>
        <ExpansionPanel>
          <ExpansionPanelSummary
            expandIcon={<ExpandMoreIcon />}
            classes={{ expanded: "expandedPanel" }}
          >
            Softmax Trick
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <MathJax.Context input="tex">
              <p className="smallText">
                The trick does two things. To ensure that we sum up to one for
                the linear combination of tokens, it takes the softmax function
                over the smooth input token distribution. However, before
                applying the softmax function, we divide our token distribution
                vector by a temperature value, i.e.{" "}
                <MathJax.Node inline>
                  softmax(token\_distribution / t)
                </MathJax.Node>
                . Dividing by large temperature values means that the softmax
                result will be smooth, whereas dividing by small temperature
                values results in a more spiky softmax function.
              </p>
            </MathJax.Context>
          </ExpansionPanelDetails>
        </ExpansionPanel>
      </Grid>
    );
  }
}

export default TextSpecialtyTexts;
