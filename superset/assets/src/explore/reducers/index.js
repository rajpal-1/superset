import { combineReducers } from 'redux';
import shortid from 'shortid';

import charts from '../../chart/chartReducer';
import saveModal from './saveModalReducer';
import explore from './exploreReducer';

const impressionId = (state = '') => {
  if (!state) {
    state = shortid.generate();
  }
  return state;
};

export default combineReducers({
  charts,
  saveModal,
  explore,
  impressionId,
});
