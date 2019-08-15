// Import all Reducers
import {combineReducers} from 'redux';
import dreamingElements from './DreamingElementsReducer'

// Combine all Reducers
export default combineReducers({
  dreamingElements,
});
