// Import all Reducers
import {combineReducers} from 'redux';
import dreamingElements from './DreamingElementsReducer';
import cardDimensions from './CardDimensionsReducer';
import activeColors from './ActiveColorsReducer';

// Combine all Reducers
export default combineReducers({
  dreamingElements,
  cardDimensions,
  activeColors,
});
