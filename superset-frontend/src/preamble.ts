/* eslint-disable theme-colors/no-literal-colors */
// DODO was here
import { setConfig as setHotLoaderConfig } from 'react-hot-loader';
import 'abortcontroller-polyfill/dist/abortcontroller-polyfill-only';
import moment from 'moment';
// eslint-disable-next-line no-restricted-imports
import { configure, makeApi, supersetTheme } from '@superset-ui/core';
import { merge } from 'lodash';
import setupClient from './setup/setupClient';
import setupColors from './setup/setupColors';
import setupFormatters from './setup/setupFormatters';
import setupDashboardComponents from './setup/setupDasboardComponents';
import { BootstrapUser, User } from './types/bootstrapTypes';

if (process.env.WEBPACK_MODE === 'development') {
  setHotLoaderConfig({ logLevel: 'debug', trackTailUpdates: false });
}

// eslint-disable-next-line import/no-mutable-exports
export let bootstrapData: {
  user?: BootstrapUser;
  common?: any;
  config?: any;
  embedded?: {
    dashboard_id: string;
  };
} = {};
// Configure translation
if (typeof window !== 'undefined') {
  const root = document.getElementById('app');
  bootstrapData = root
    ? JSON.parse(root.getAttribute('data-bootstrap') || '{}')
    : {};
  if (bootstrapData.common && bootstrapData.common.language_pack) {
    const languagePack = bootstrapData.common.language_pack;
    configure({ languagePack });
    moment.locale(bootstrapData.common.locale);
  } else {
    configure();
  }
} else {
  configure();
}

// Setup SupersetClient
setupClient();

setupColors(
  bootstrapData?.common?.extra_categorical_color_schemes,
  bootstrapData?.common?.extra_sequential_color_schemes,
);

// Setup number formatters
setupFormatters();

const dodoTheme = {
  ...supersetTheme,
  colors: {
    ...supersetTheme.colors,
    primary: {
      base: '#ff6900',
      dark1: '#e86100',
      dark2: '#d15700',
      light1: '#fff0e6',
      light2: '#fff0e6',
      light3: '#d2edf4',
      light4: '#fff0e6',
      light5: '#f3f8fa',
    },
    secondary: {
      base: '#000',
      dark1: '#363636',
      dark2: '#555555',
      dark3: '#1B1F31',
      light1: '#8E94B0',
      light2: '#B4B8CA',
      light3: '#D9DBE4',
      light4: '#fff0e6',
      light5: '#F5F5F8',
    },
  },
};

setupDashboardComponents();

export const theme = merge(
  dodoTheme,
  bootstrapData?.common?.theme_overrides ?? {},
);

const getMe = makeApi<void, User>({
  method: 'GET',
  endpoint: '/api/v1/me/',
});

/**
 * When you re-open the window, we check if you are still logged in.
 * If your session expired or you signed out, we'll redirect to login.
 * If you aren't logged in in the first place (!isActive), then we shouldn't do this.
 */
if (bootstrapData.user?.isActive) {
  document.addEventListener('visibilitychange', () => {
    // we only care about the tab becoming visible, not vice versa
    if (document.visibilityState !== 'visible') return;

    getMe().catch(() => {
      // ignore error, SupersetClient will redirect to login on a 401
    });
  });
}
