// Import all Reducers
import {combineReducers} from 'redux';
import dreamingElements from './DreamingElementsReducer';
import cardDimensions from './CardDimensionsReducer';

// Combine all Reducers
export default combineReducers({
  dreamingElements,
  cardDimensions,
});
