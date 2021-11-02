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
/* eslint-disable camelcase */
import { allowCrossDomain } from 'src/utils/hostNamesConfig';
import {
  SET_REPORT,
  ADD_REPORT,
  EDIT_REPORT,
  DELETE_REPORT,
} from '../actions/reports';

// Talk about the delete

export default function reportsReducer(state = {}, action) {
  const actionHandlers = {
    [SET_REPORT]() {
      return {
        ...state,
        ...action.report.result.reduce(
          (obj, report) => ({ ...obj, [report.id]: report }),
          {},
        ),
      };
    },
    [ADD_REPORT]() {
      const report = action.json.result;
      report.id = action.json.id;
      return {
        ...state,
        [action.json.id]: report,
      };
    },
    [EDIT_REPORT]() {
      const report = action.json.result;
      report.id = action.json.id;
      return {
        ...state,
        [action.json.id]: report,
      };
    },
    [DELETE_REPORT]() {
      console.log('findme REPORT IN REDUCER', action.reportId);
      // state.users.filter(item => item.id !== action.payload)
      return {
        ...state.filter(report => report.id !== action.reportId),
      };
    },
  };

  if (action.type in actionHandlers) {
    return actionHandlers[action.type]();
  }
  return state;
}
