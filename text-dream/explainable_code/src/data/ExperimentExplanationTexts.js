/**
 * Returns the explanation for the currently selected dream experiment.
 *
 * @param {number} index the index of the currently selected dream experiment.
 * @return {string} the explanation for the currently selected dream experiment.
 */
export function getDreamExperimentExplanation(index) {
  const dreamExperimentExplanations = [
    "In this experiment. The process first finds a linear combination of " +
      "tokens which leads to a high activation value. However, after reducing " +
      "the temperature, it is not able to get back to the original activation " +
      "anymore.",
    "As with the first experiment, here we are not able to find a word that " +
      "leads to the same or a higher activation than what we started with.",
    "This is an example of a more successful run. Here, we are able to go " +
      "back to the same high activation value as we started with. In a later " +
      "visualization, we will see that this is the highest possible activation " +
      "for this neuron.",
  ];
  return dreamExperimentExplanations[index - 1];
}

/**
 * Returns the explanation for the currently selected anneal experiment.
 *
 * @param {number} index the index of the currently selected anneal experiment.
 * @return {string} explanation for the currently selected anneal experiment.
 */
export function getAnnealExperimentExplanation(index) {
  const dreamExperimentExplanations = [
    "None of the words that individually highly activate the neuron are " +
      "in the top-ranked for most of the iterations. We suspect this is the " +
      "reason why the model cannot get to a high activation when the " +
      "temperature is lowered.",
    "None of the words that individually highly activate the neuron are " +
      "in the top-ranked for most of the iterations. We suspect this is the " +
      "reason why the model cannot get to a high activation when the " +
      "temperature is lowered.",
    'We see how the word "anger" is continually in the top-ranked words. ' +
      "This might be why the model can later select this word to get a high " +
      "activation.",
  ];
  return dreamExperimentExplanations[index - 1];
}

/**
 * Returns the explanation for the currently selected anneal experiment.
 *
 * @param {number} index the index of the currently selected anneal experiment.
 * @return {string} explanation for the currently selected anneal experiment.
 */
export function getTopWordsExperimentExplanation(index) {
  const dreamExperimentExplanations = [
    "Even though for is not the word with the highest activation value, " +
      "feature visualization can't reproduce this activation.",
    'The word we start with, "match", is only the third-highest activating ' +
      "word. Still, we are not able to get to the same, or a higher activation " +
      "through feature visualization.",
    'We see that the word we started with, "anger", is the highest activating ' +
      "word for this neuron.",
  ];
  return dreamExperimentExplanations[index - 1];
}

/**
 * Returns the explanation for the currently selected similar experiment.
 *
 * @param {number} index the index of the currently selected similar experiment.
 * @return {string} explanation for the currently selected similar experiment.
 */
export function getSimilarExperimentExplanation(index) {
  const dreamExperimentExplanations = [
    'Words that are similar to our start word "for" have a significantly ' +
      "lower activation value. This might make optimization hard.",
    "There are words that are close to our start word that lead to similar " +
      "high activation values, however, the process still fails during " +
      "optimization.",
    "Even though in this case, the optimization process is successful, no " +
      "words that are close to our start word in embedding space lead to high " +
      "activation values.",
  ];
  return dreamExperimentExplanations[index - 1];
}

/**
 * Returns the explanation for the currently selected reconstruct experiment.
 *
 * @param {number} index index of the currently selected reconstruct experiment.
 * @return {string} explanation for currently selected reconstruct experiment.
 */
export function getReconstructExperimentExplanation(index) {
  const dreamExperimentExplanations = [
    'We can see that connections such as the word "for", ' +
      'commas, and the word "and" get replaced with seemingly random ' +
      "words early. This might be because these words are not " +
      "critical to understand the meaning of the sentence. " +
      'Other words, such as "duties", ' +
      '"include", and "sites" are replaced by conceptually similar ' +
      'words, such as "interests", "reflect", and "venues" in some of ' +
      "the layers that preserve the overall " +
      "meaning of the sentence. Interestingly, some important " +
      "words are consistently reconstructed across all layers.",
    'Again, the first thing getting replaced is the "." at the end of the ' +
      "sentence, which is not important for a general understanding of the sentence. " +
      'Additionally "no" gets replaced with "nothing", "neither", and "nobody" ' +
      'at different stages of the optimization, which are all similar to "no".',
    'The model first replaces irrelevant words such as "the" and "of", but  ' +
      'also "he", indicating that gender is not important here. Then, we again ' +
      "see replacements with similar words, before only the most important " +
      'words, such as "anger" and "defeat" can be reconstructed.',
  ];
  return dreamExperimentExplanations[index - 1];
}

/**
 * Returns the explanation for the currently selected shift experiment.
 *
 * @param {number} index index of the currently selected shift experiment.
 * @return {string} explanation for currently selected shift experiment.
 */
export function getShiftExperimentExplanation(index) {
  const dreamExperimentExplanations = [
    'Through the activation shift, the model indeed reconstructs "he" for ' +
      "some layers. Looking at layer 4 in detail, we see that the model even " +
      'sometimes swaps our "her" for "his".',
    "While we can, again, bring the model to replace the pronoun, it does not" +
      "seem like there is enough bias to then also flip the unchanged word " +
      '"doctor".',
    "This sentence has gender dependencies in more than one place, which " +
      "even prevents " +
      "the targeted pronoun flip which worked in both of the other experiments.",
  ];
  return dreamExperimentExplanations[index - 1];
}
