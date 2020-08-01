import React from 'react';

import GenericHeading from '../components/views/headings/GenericHeading';

import FeatureVisTexts from '../components/views/texts/FeatureVisText';
import TextSpecialtyTexts from '../components/views/texts/TextSpecialtyText';
import BertResultsTexts from '../components/views/texts/BertResultsText';
import DreamVisTexts from '../components/views/texts/DreamVisText';
import AnnealingVisTexts from '../components/views/texts/AnnealingVisText';
import TopWordsVisTexts from '../components/views/texts/TopWordsVisText';
import SimilarVisTexts from '../components/views/texts/SimilarVisText';
import ReconstructVisTexts from '../components/views/texts/ReconstructVisText';
import ShiftVisTexts from '../components/views/texts/ShiftVisText';
import ConclusionVisTexts from '../components/views/texts/ConclusionVisText';

import FeatureVisButtons from '../components/views/buttons/FeatureVisButtons';
import BothButtons from '../components/views/buttons/BothButtons';
import ConclusionButtons from '../components/views/buttons/ConclusionButtons';

import FeatureVisIllustration from
  '../components/views/illustrations/FeatureVisIllustration';
import TextSpecialtyIllustration from
  '../components/views/illustrations/TextSpecialtyIllustration';
import DreamVisIllustration from
  '../components/views/illustrations/DreamVisIllustration';
import AnnealingVisIllustration from
  '../components/views/illustrations/AnnealingVisIllustration';
import TopWordsVisIllustration from
  '../components/views/illustrations/TopWordsVisIllustration';
import SimilarVisIllustration from
  '../components/views/illustrations/SimilarVisIllustration';
import ReconstructVisIllustration from
  '../components/views/illustrations/ReconstructVisIllustration';
import ShiftVisIllustration from
  '../components/views/illustrations/ShiftVisIllustration';

/**
 * Returns the view for the given view index.
 *
 * @param {number} index the index of the view to be retreived.
 * @return {object} the view elements that should be rendered for this index.
 */
export default function getViewData(index) {
  return viewData[index];
}

const viewData = [
  {
    heading: <GenericHeading title={'Feature Visualization for Text?'}/>,
    texts: <FeatureVisTexts/>,
    buttons: <FeatureVisButtons/>,
    illustration: <FeatureVisIllustration/>,
  },
  {
    heading: <GenericHeading title={'Textual Models'}/>,
    texts: <TextSpecialtyTexts/>,
    buttons: <BothButtons prev={'/featurevis'} next={'/bertresults'}/>,
    illustration: <TextSpecialtyIllustration/>,
  },
  {
    heading: <GenericHeading title={'Results with BERT'}/>,
    texts: <BertResultsTexts/>,
    buttons: <BothButtons prev={'/textspecial'} next={'/dreamvis'}/>,
    illustration: null,
  },
  {
    heading: <GenericHeading title={'Visualized Dreams'}/>,
    texts: <DreamVisTexts/>,
    buttons: <BothButtons prev={'/bertresults'} next={'/annealingvis'}/>,
    illustration: <DreamVisIllustration/>,
  },
  {
    heading: <GenericHeading title={'Annealing Processes Visualized'}/>,
    texts: <AnnealingVisTexts/>,
    buttons: <BothButtons prev={'/dreamvis'} next={'/topvis'}/>,
    illustration: <AnnealingVisIllustration/>,
  },
  {
    heading: <GenericHeading title={'Top Words Visualized'}/>,
    texts: <TopWordsVisTexts/>,
    buttons: <BothButtons prev={'/annealingvis'} next={'/similarvis'}/>,
    illustration: <TopWordsVisIllustration/>,
  },
  {
    heading: <GenericHeading title={'Activations for Similar Words'}/>,
    texts: <SimilarVisTexts/>,
    buttons: <BothButtons prev={'/topvis'} next={'/reconstructvis'}/>,
    illustration: <SimilarVisIllustration/>,
  },
  {
    heading: <GenericHeading title={'Reconstructing known Activations'}/>,
    texts: <ReconstructVisTexts/>,
    buttons: <BothButtons prev={'/similarvis'} next={'/shiftvis'}/>,
    illustration: <ReconstructVisIllustration/>,
  },
  {
    heading: <GenericHeading title={'Reconstructing changed Activations'}/>,
    texts: <ShiftVisTexts/>,
    buttons: <BothButtons prev={'/reconstructvis'} next={'/conclusionvis'}/>,
    illustration: <ShiftVisIllustration/>,
  },
  {
    heading: <GenericHeading title={'Conclusion'}/>,
    texts: <ConclusionVisTexts/>,
    buttons: <ConclusionButtons/>,
    illustration: null,
  },
];
