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
import {
  DTTM_ALIAS,
  getColumnLabel,
  QueryFormColumn,
  QueryFormData,
} from '@superset-ui/core';

export const getAxis = (formData: QueryFormData): string => {
  // The formData should be "raw form_data" -- the snake_case version of formData rather than camelCase.
  let col: QueryFormColumn = DTTM_ALIAS;
  if (formData.x_axis && formData.granularity_sqla) {
    col = formData.x_axis;
  }

  return getColumnLabel(col);
};
