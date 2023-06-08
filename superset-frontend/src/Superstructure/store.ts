import thunk from 'redux-thunk';
import { createStore, applyMiddleware, compose } from 'redux';
import { initFeatureFlags } from './utils/featureFlags';
import { USER_ROLES, SUPERSET_WEBSERVER_TIMEOUT } from './constants';
import { initEnhancer } from '../reduxUtils';
import rootReducer from './reducers/index';

// TODO: get data bootstrap from superset API
// Because the roles are empty -> export in CSV is not shown
const bootstrap = {
  user: { roles: USER_ROLES },
  common: {
    conf: { SUPERSET_WEBSERVER_TIMEOUT },
    feature_flags: {
      GLOBAL_ASYNC_QUERIES: true,
      DYNAMIC_PLUGINS: true,
      DASHBOARD_NATIVE_FILTERS: true,
      DASHBOARD_CROSS_FILTERS: true,
      DASHBOARD_NATIVE_FILTERS_SET: false,
    },
  },
};

initFeatureFlags(bootstrap.common.feature_flags);

export const store = createStore(
  rootReducer,
  bootstrap,
  compose(applyMiddleware(thunk), initEnhancer(false)),
);
