/* eslint no-undef: 0, no-native-reassign: 0 */
import 'babel-polyfill';
import chai from 'chai';
import jsdom from 'jsdom';

require('babel-register')();

const exposedProperties = ['window', 'navigator', 'document'];

global.jsdom = jsdom.jsdom;
global.document = global.jsdom('<!doctype html><html><body></body></html>');
// bootstrap attribute, used by localization
const bootstrap = JSON.stringify({
  common: {
    language_pack: {
      domain: 'superset',
      locale_data: {
        superset: {
          '': {
            domain: 'superset',
            lang: 'en',
            plural_forms: 'nplurals=1; plural=0',
          },
        },
      },
    },
  },
});
const appRoot = document.createElement('div');
appRoot.setAttribute('id', 'app');
appRoot.setAttribute('data-bootstrap', bootstrap);
global.document.body.appendChild(appRoot);

global.window = document.defaultView;
Object.keys(document.defaultView).forEach((property) => {
  if (typeof global[property] === 'undefined') {
    exposedProperties.push(property);
    global[property] = document.defaultView[property];
  }
});

global.navigator = {
  userAgent: 'node.js',
  platform: 'linux',
  appName: 'Netscape',
};

// Configuration copied from https://github.com/sinonjs/sinon/issues/657
// allowing for sinon.fakeServer to work

global.window = global.document.defaultView;
global.XMLHttpRequest = global.window.XMLHttpRequest;

global.sinon = require('sinon');

global.expect = chai.expect;
global.assert = chai.assert;

global.sinon.useFakeXMLHttpRequest();

global.window.XMLHttpRequest = global.XMLHttpRequest;
global.$ = require('jquery')(global.window);
