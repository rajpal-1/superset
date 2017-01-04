/* eslint camelcase: 0 */
import React from 'react';
import ReactDOM from 'react-dom';
import ExploreViewContainer from './components/ExploreViewContainer';
import { createStore, applyMiddleware, compose } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { now } from '../modules/dates';

// jquery and bootstrap required to make bootstrap dropdown menu's work
const $ = window.$ = require('jquery'); // eslint-disable-line
const jQuery = window.jQuery = require('jquery'); // eslint-disable-line
require('bootstrap');

import { initialState } from './stores/store';

const exploreViewContainer = document.getElementById('js-explore-view-container');
const bootstrapData = JSON.parse(exploreViewContainer.getAttribute('data-bootstrap'));

import { exploreReducer } from './reducers/exploreReducer';

const bootstrappedState = Object.assign(
  initialState(bootstrapData.viz.form_data.viz_type, bootstrapData.datasource_type), {
    can_edit: bootstrapData.can_edit,
    can_download: bootstrapData.can_download,
    datasources: bootstrapData.datasources,
    datasource_type: bootstrapData.datasource_type,
    viz: bootstrapData.viz,
    user_id: bootstrapData.user_id,
    chartUpdateStartTime: now(),
    chartUpdateEndTime: null,
    chartStatus: 'loading',
  }
);
bootstrappedState.viz.form_data.datasource = parseInt(bootstrapData.datasource_id, 10);
bootstrappedState.viz.form_data.datasource_name = bootstrapData.datasource_name;

function parseFilters(form_data, prefix = 'flt') {
  const filters = [];
  for (let i = 0; i < 10; i++) {
    if (form_data[`${prefix}_col_${i}`] && form_data[`${prefix}_op_${i}`]) {
      filters.push({
        prefix,
        col: form_data[`${prefix}_col_${i}`],
        op: form_data[`${prefix}_op_${i}`],
        value: form_data[`${prefix}_eq_${i}`],
      });
    }
    /* eslint no-param-reassign: 0 */
    delete form_data[`${prefix}_col_${i}`];
    delete form_data[`${prefix}_op_${i}`];
    delete form_data[`${prefix}_eq_${i}`];
  }
  return filters;
}

function getFilters(form_data, datasource_type) {
  if (datasource_type === 'table') {
    return parseFilters(form_data);
  }
  return parseFilters(form_data).concat(parseFilters(form_data, 'having'));
}

bootstrappedState.viz.form_data.filters =
  getFilters(bootstrappedState.viz.form_data, bootstrapData.datasource_type);

function parseStyles(form_data) {
  const styles = [];
  for (let i = 0; i < 10; i++) {
    if (form_data[`style_metric_${i}`] && form_data[`style_expr_${i}`]) {
      styles.push({
        id: form_data[`style_id_${i}`],
        metric: form_data[`style_metric_${i}`],
        expr: form_data[`style_expr_${i}`],
        value: form_data[`style_value_${i}`],
      });
    }
    /* eslint no-param-reassign: 0 */
    delete form_data[`style_id_${i}`];
    delete form_data[`style_metric_${i}`];
    delete form_data[`style_expr_${i}`];
    delete form_data[`style_value_${i}`];
  }
  return styles;
}

function getStyles(form_data, datasource_type) {
  if (datasource_type === 'table') {
    return parseStyles(form_data);
  }
  return null;
}

bootstrappedState.viz.form_data.styles =
  getStyles(bootstrappedState.viz.form_data, bootstrapData.datasource_type);

function getBaseStyle(form_data) {
  const baseStyle = {};
  baseStyle["headerValue"] = form_data.headerValue;
  baseStyle["bodyValue"] = form_data.bodyValue;
  return baseStyle;
}

bootstrappedState.viz.form_data.baseStyle =
  getBaseStyle(bootstrappedState.viz.form_data, bootstrapData.datasource_type);

const store = createStore(exploreReducer, bootstrappedState,
  compose(applyMiddleware(thunk))
);

ReactDOM.render(
  <Provider store={store}>
    <ExploreViewContainer />
  </Provider>,
  exploreViewContainer
);
