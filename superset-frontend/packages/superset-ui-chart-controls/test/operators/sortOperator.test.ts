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
import { QueryObject, SqlaFormData, UnsortedXAxis } from '@superset-ui/core';
import { sortOperator } from '@superset-ui/chart-controls';
import * as supersetCoreModule from '@superset-ui/core';

const formData: SqlaFormData = {
  metrics: [
    'count(*)',
    { label: 'sum(val)', expressionType: 'SQL', sqlExpression: 'sum(val)' },
  ],
  time_range: '2015 : 2016',
  granularity: 'month',
  datasource: 'foo',
  viz_type: 'table',
};
const queryObject: QueryObject = {
  metrics: [
    'count(*)',
    { label: 'sum(val)', expressionType: 'SQL', sqlExpression: 'sum(val)' },
  ],
  time_range: '2015 : 2016',
  granularity: 'month',
  post_processing: [
    {
      operation: 'pivot',
      options: {
        index: ['__timestamp'],
        columns: ['nation'],
        aggregates: {
          'count(*)': {
            operator: 'sum',
          },
        },
      },
    },
  ],
};

test('should ignore the sortOperator', () => {
  // FF is disabled
  Object.defineProperty(supersetCoreModule, 'hasGenericChartAxes', {
    value: false,
  });
  expect(sortOperator(formData, queryObject)).toEqual(undefined);

  // FF is enabled
  Object.defineProperty(supersetCoreModule, 'hasGenericChartAxes', {
    value: true,
  });
  expect(
    sortOperator(
      {
        ...formData,
        ...{
          x_axis_sort: {
            sortByLabel: undefined,
            isAsc: true,
          },
        },
      },
      queryObject,
    ),
  ).toEqual(undefined);

  // sortOperator will be ignored when sortByLabel is unsorted
  Object.defineProperty(supersetCoreModule, 'hasGenericChartAxes', {
    value: true,
  });
  expect(
    sortOperator(
      {
        ...formData,
        ...{
          x_axis_sort: {
            sortByLabel: UnsortedXAxis,
            isAsc: true,
          },
        },
      },
      queryObject,
    ),
  ).toEqual(undefined);

  // sortOperator doesn't support multiple series
  Object.defineProperty(supersetCoreModule, 'hasGenericChartAxes', {
    value: true,
  });
  expect(
    sortOperator(
      {
        ...formData,
        ...{
          x_axis_sort: {
            sortByLabel: 'metric label',
            isAsc: true,
          },
          groupby: ['col1'],
          x_axis: 'axis column',
        },
      },
      queryObject,
    ),
  ).toEqual(undefined);
});

test('should sort by metric', () => {
  Object.defineProperty(supersetCoreModule, 'hasGenericChartAxes', {
    value: true,
  });
  expect(
    sortOperator(
      {
        ...formData,
        ...{
          x_axis_sort: {
            sortByLabel: 'a metric label',
            isAsc: true,
          },
        },
      },
      queryObject,
    ),
  ).toEqual({
    operation: 'sort',
    options: {
      by: 'a metric label',
      ascending: true,
    },
  });
});

test('should sort by axis', () => {
  Object.defineProperty(supersetCoreModule, 'hasGenericChartAxes', {
    value: true,
  });
  expect(
    sortOperator(
      {
        ...formData,
        ...{
          x_axis_sort: {
            sortByLabel: 'Categorical Column',
            isAsc: true,
          },
          x_axis: 'Categorical Column',
        },
      },
      queryObject,
    ),
  ).toEqual({
    operation: 'sort',
    options: {
      is_sort_index: true,
      ascending: true,
    },
  });
});
