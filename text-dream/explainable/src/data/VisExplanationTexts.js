import React from 'react';

/**
 * Returns the explanation text for a given visualization.
 *
 * @param {*} visTitle the title of the visualization the text is requeste for.
 * @return {string} the helper text fot this visualization component.
 */
export default function getVisExplanation(visTitle) {
  return explanationTexts[visTitle];
}

const explanationTexts = {
  Dream:
    <div className='tooltipDiv'>
      <span className='styledTooltip'><b>Dream Visualization</b></span>
      <br></br>
      <br></br>
      <span className='styledTooltip'>
        Here, you can see how the dreaming process changes its predictions over
        the course of many iterations.
      </span>
      <br></br>
      <br></br>
      <span className='styledTooltip'>
        At the top, you can see which layer, word, and neuron was maximized for.
        Below that, you see the sentence that we started the process with.
      </span>
      <br></br>
      <br></br>
      <span className='styledTooltip'>
        Iteration numbers are written on the left, next to a small plot showing
        the temperature in blue, the activation of the softmax combination in
        dark green, and the activation when taking only the word with the
        highest softmax value in light green.
      </span>
      <br></br>
      <br></br>
      <span className='styledTooltip'>
        The sentences for each row show the words with the highest softmax value
        for each iteration.
        Black words are fixed, while blue words can be changed by the model.
      </span>
    </div>,
  TopWords:
    <div className='tooltipDiv'>
      <span className='styledTooltip'><b>Annealing Visualization</b></span>
      <br></br>
      <br></br>
      <span className='styledTooltip'>
        This visualization shows how the softmax distribution changes over the
        training process.
      </span>
      <br></br>
      <br></br>
      <span className='styledTooltip'>
        At the top, you can see which layer, word, and neuron was maximized for.
        Below that, you see the sentence that we started the process with.
        The blue word marks for which word the annealing process is visualized
        here.
      </span>
      <br></br>
      <br></br>
      <span className='styledTooltip'>
        With the iteration slider, you can change the iteration for which the
        softmax distribution is currently displayed.
      </span>
      <br></br>
      <br></br>
      <span className='styledTooltip'>
        The graph below this shows the words with the highest softmax values for
        the selected iteration.
      </span>
    </div>,
  TokenSearch:
    <div className='tooltipDiv'>
      <span className='styledTooltip'><b>Token Search Visualization</b></span>
      <br></br>
      <br></br>
      <span className='styledTooltip'>
        This visualization shows the words for a given position that lead to the
        highest activation of the selected neuron.
      </span>
      <br></br>
      <br></br>
      <span className='styledTooltip'>
        At the top, you can see which layer, word, and neuron was maximized for.
        Below that, you see the sentence that we started the process with.
        The blue word marks the position for which we searched for the most
        activating words.
      </span>
      <br></br>
      <br></br>
      <span className='styledTooltip'>
        The graph below shows the words which lead to the highest activation
        values.
        The numbers on the bars represent the activation that this word leads
        to.
      </span>
    </div>,
  SimilarEmbeddings:
    <div className='tooltipDiv'>
      <span className='styledTooltip'><b>Similar Words Activations</b></span>
      <br></br>
      <br></br>
      <span className='styledTooltip'>
        Here you can see the activations for words that are close to the
        highlighted words in embedding space.
      </span>
      <br></br>
      <br></br>
      <span className='styledTooltip'>
        At the top, you can see which layer, word, and neuron was maximized for.
        Below that, you see the sentence that we started the process with.
        The blue word marks the position for which we looked up the activation
        of similar words.
      </span>
      <br></br>
      <br></br>
      <span className='styledTooltip'>
        The graph below shows the most similar words alongside their activation
        values.
        Green bars represent the activation of the word, while grey bars show
        the distance in embedding space.
      </span>
    </div>,
  Reconstruct:
    <div className='tooltipDiv'>
      <span className='styledTooltip'><b>Reconstructing Activations</b></span>
      <br></br>
      <br></br>
      <span className='styledTooltip'>
        In this visualization, we show the results of an experiment where we try
        to reconstruct activations of a sentence that we previously recorded.
      </span>
      <br></br>
      <br></br>
      <span className='styledTooltip'>
        At the top, we show the sentence for which we recorded activation
        values.
      </span>
      <br></br>
      <br></br>
      <span className='styledTooltip'>
        Below that, you can see the reuslts of this reconstruction process for
        each layer in the model.
        Green words are words that were reconstructed correctly, while red words
        differ from the original sentence.
      </span>
      <br></br>
      <br></br>
      <span className='styledTooltip'>
        To get even more insights, you can also click on one of the layers,
        which shows how the reconstruction process evolved over many iterations.
        Here, we show the iteration number next to a small graph.
        For this graph, the blue bar shows the temperature value for this
        iteration, while the dark red bar shows the loss between the activation
        of the softmax combination of tokens and the target activation.
        The light red bar shows the loss if we were to only look at the
        top-ranked word at each position.
      </span>
    </div>,
  Shift:
    <div className='tooltipDiv'>
      <span className='styledTooltip'><b>Shifting Activations</b></span>
      <br></br>
      <br></br>
      <span className='styledTooltip'>
        At the top of this visualization, we show the sentence for which we
        recorded activation values.
        Below that, you can see the change we wanted to force the model into.
        Only the activation value for the green word is changed in this process.
      </span>
      <br></br>
      <br></br>
      <span className='styledTooltip'>
        We applied this change to all the layers in the model.
        For each layer, we show the result that came closest to the target
        sentence of this change.
        Black words are words that did not change from the original sentence,
        if a word is green, the shift was successful, and if a word is red, it
        has been changed to something we did not intend it to change to.
      </span>
      <br></br>
      <br></br>
      <span className='styledTooltip'>
        To get even more insights, you can also click on one of the layers,
        which shows results for different magnitudes of this activation shift.
        We show this magnitude as a number on the left of each row.
        Next to it is the loss graph, where a dark red bar shows the loss
        between the activation of the softmax combination of tokens and the
        target activation, whereas the light red bar shows the loss if we were
        to only look at the top-ranked word at each position.
      </span>
    </div>,
};
