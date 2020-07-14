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
  Dream: 'testtesttest',
  TopWords: 'testtesttest2',
  TokenSearch: 'testtesttest2',
  SimilarEmbeddings: 'testtesttest2',
  Reconstruct: 'testtesttest2',
  Shift: 'testtesttest2',
};
