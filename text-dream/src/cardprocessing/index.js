/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
*/
import React from 'react';

import Dream from '../components/cards/DreamComponent';
import Reconstruct from '../components/cards/ReconstructComponent';
import Layers from '../components/cards/LayersComponent';
import Magnitudes from '../components/cards/MagnitudesComponent';
import ShiftedReconstruct from
  '../components/cards/ShiftedReconstructComponent';
import TopWordsComponent from '../components/cards/TopWordsComponent';
import SimilarEmbeddings from
  '../components/cards/SimilarEmbeddingsComponent';
import TokenSearch from '../components/cards/TokenSearchComponent';

/**
 * Function to get the correct card Component for a dreamingElement.
 *
 * @param {object} dreamingElement - the element that should be rendered as a
 * card.
 * @param {number} elementIndex - the index of the current element.
 * @return {object} the card to be rendered.
 */
export function getCard(dreamingElement, elementIndex) {
  let dreamingCard;
  switch (dreamingElement.type) {
    case 'dream':
      dreamingCard = <Dream
        results={dreamingElement.results}
        params={dreamingElement.params}
        elementIndex={elementIndex}/>;
      break;
    case 'reconstruct':
      dreamingCard = <Reconstruct
        results={dreamingElement.results}
        params={dreamingElement.params}
        elementIndex={elementIndex}/>;
      break;
    case 'reconstruct_shifted':
      dreamingCard = <ShiftedReconstruct
        results={dreamingElement.results}
        params={dreamingElement.params}
        elementIndex={elementIndex}/>;
      break;
    case 'top_words':
      dreamingCard = <TopWordsComponent
        dreamingElement={dreamingElement}
        elementIndex={elementIndex}/>;
      break;
    case 'similar_embeddings':
      dreamingCard = <SimilarEmbeddings
        dreamingElement={dreamingElement}
        elementIndex={elementIndex}/>;
      break;
    case 'token_search':
      dreamingCard = <TokenSearch
        dreamingElement={dreamingElement}
        elementIndex={elementIndex}/>;
      break;
    case 'magnitudes':
      dreamingCard = <Magnitudes
        magnitudes={dreamingElement.magnitudes}
        elementIndex={elementIndex}/>;
      break;
    case 'layers':
      dreamingCard = <Layers
        layers={dreamingElement.layers}
        elementIndex={elementIndex}/>;
      break;
    default:
      dreamingCard = <div></div>;
  }
  return dreamingCard;
}
