/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import React from 'react';
import { hot } from 'react-hot-loader';
import thunk from 'redux-thunk';
import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import Menu from 'src/components/Menu/Menu';
import DashboardList from 'src/views/dashboardList/DashboardList';

import messageToastReducer from '../messageToasts/reducers';
import { initEnhancer } from '../reduxUtils';
import setupApp from '../setup/setupApp';
import Welcome from './Welcome';
import {ThemeProvider} from 'styled-components';
import ToastPresenter from '../messageToasts/containers/ToastPresenter';
import {supersetTheme} from '../../stylesheets/styled-components/superset-theme';


setupApp();

const container = document.getElementById('app');
const bootstrap = JSON.parse(container.getAttribute('data-bootstrap'));
const user = { ...bootstrap.user };
const menu = { ...bootstrap.common.menu_data };

const store = createStore(
  combineReducers({
    messageToasts: messageToastReducer,
  }),
  {},
  compose(applyMiddleware(thunk), initEnhancer(false)),
);

const App = () => (
  <ThemeProvider theme={supersetTheme}>
    <Provider store={store}>
      <Router>
        <Menu data={menu} />
        <Switch>
          <Route path="/superset/welcome/">
            <Welcome user={user} />
          </Route>
          <Route path="/dashboard/list/">
            <DashboardList user={user} />
          </Route>
        </Switch>
        <ToastPresenter />
      </Router>
    </Provider>
  </ThemeProvider>
);

export default hot(module)(App);
