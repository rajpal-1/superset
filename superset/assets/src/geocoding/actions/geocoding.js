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
import { SupersetClient } from '@superset-ui/connection';
import getClientErrorObject from 'src/utils/getClientErrorObject';

export const GET_COLUMNS_FOR_TABLE_SUCCESS = 'GET_COLUMNS_FOR_TABLE_SUCCESS';
export const GET_COLUMNS_FOR_TABLE_FAILURE = 'GET_COLUMNS_FOR_TABLE_FAILURE';

export const GEOCODE_SUCCESS = 'GEOCODE_SUCCESS';
export const GEOCODE_FAILURE = 'GEOCODE_FAILURE';

export const GEOCODE_PROGRESS_SUCCESS = 'GEOCODE_PROGRESS_SUCCESS';
export const GEOCODE_PROGRESS_FAILURE = 'GEOCODE_PROGRESS_FAILURE';

export const GEOCODE_INTERRUPT_SUCCESS = 'GEOCODE_INTERRUPT_SUCCESS';
export const GEOCODE_INTERRUPT_FAILURE = 'GEOCODE_INTERRUPT_FAILURE';

export function getColumnsForTable(tableName) {
    return dispatch =>
    SupersetClient.post({
      endpoint: '/geocoder/geocoding/columns',
      body: JSON.stringify({ tableName }),
      headers: { 'Content-Type': 'application/json' },
    })
      .then((response) => {
        dispatch({ type: GET_COLUMNS_FOR_TABLE_SUCCESS, columnList: response.json });
      })
      .catch((response) => {
        getClientErrorObject(response).then((error) => {
          dispatch({ type: GET_COLUMNS_FOR_TABLE_FAILURE, message: error.error });
        });
      });
}

export function resetColumnsForTable() {
  return dispatch => dispatch({ type: GET_COLUMNS_FOR_TABLE_SUCCESS, columnList: [] });
}

export function geocodingProgress() {
  return dispatch =>
  SupersetClient.get({
    endpoint: '/geocoder/geocoding/progress',
  })
    .then((response) => {
      dispatch({ type: GEOCODE_PROGRESS_SUCCESS, progress: response.json });
    })
    .catch((response) => {
      getClientErrorObject(response).then((error) => {
        dispatch({ type: GEOCODE_PROGRESS_FAILURE, message: error.error });
      });
    });
}

export function geocode(data) {
    return dispatch =>
    SupersetClient.post({
      endpoint: '/geocoder/geocoding/geocode',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    })
      .then(() => {
        dispatch({ type: GEOCODE_SUCCESS });
        dispatch(geocodingProgress());
      })
      .catch((response) => {
        getClientErrorObject(response).then((error) => {
          dispatch({ type: GEOCODE_FAILURE, message: error.error });
        });
      });
}

export function interruptGeocoding() {
    return dispatch =>
    SupersetClient.post({
      endpoint: '/geocoder/geocoding/interrupt',
    })
      .then(() => {
        dispatch({ type: GEOCODE_INTERRUPT_SUCCESS });
      })
      .catch((response) => {
        getClientErrorObject(response).then((error) => {
          dispatch({ type: GEOCODE_INTERRUPT_FAILURE, message: error.error });
        });
      });
}
