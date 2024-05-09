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
import React, { MouseEventHandler } from 'react';
import {
  ensureIsArray,
  FeatureFlag,
  isFeatureEnabled,
  logging,
  QueryFormData,
  styled,
  t,
  SupersetError,
  SqlaFormData,
} from '@superset-ui/core';
import { PLACEHOLDER_DATASOURCE } from 'src/dashboard/constants';
import Loading from 'src/components/Loading';
import { EmptyStateBig } from 'src/components/EmptyState';
import ErrorBoundary from 'src/components/ErrorBoundary';
import { Logger, LOG_ACTIONS_RENDER_CHART } from 'src/logger/LogUtils';
import { URL_PARAMS } from 'src/constants';
import { getUrlParam } from 'src/utils/urlUtils';
import { isCurrentUserBot } from 'src/utils/isBot';
import { ChartSource } from 'src/types/ChartSource';
import { ResourceStatus } from 'src/hooks/apiResources/apiResources';
import { Dispatch } from 'redux';
import ChartRenderer from './ChartRenderer';
import { ChartErrorMessage } from './ChartErrorMessage';
import { getChartRequiredFieldsMissingMessage } from '../../utils/getChartRequiredFieldsMissingMessage';

export interface ChartProps {
  annotationData?: Object;
  actions: Actions;
  chartId: string;
  datasource?: {
    database?: {
      name: string;
    };
  };
  dashboardId?: number;
  initialValues?: object;
  formData: QueryFormData;
  labelColors?: object;
  sharedLabelColors?: object;
  width: number;
  height: number;
  setControlValue: Function;
  timeout?: number;
  vizType: string;
  triggerRender?: boolean;
  force?: boolean;
  isFiltersInitialized?: boolean;
  chartAlert?: string;
  chartStatus?: string;
  chartStackTrace?: string;
  queriesResponse?: QueryResponse[];
  triggerQuery?: boolean;
  chartIsStale?: boolean;
  errorMessage?: React.ReactNode;
  addFilter?: Function;
  onQuery?: MouseEventHandler<HTMLSpanElement>;
  onFilterMenuOpen?: Function;
  onFilterMenuClose?: Function;
  ownState?: any;
  postTransformProps?: Function;
  datasetsStatus?: 'loading' | 'error' | 'complete';
  isInView?: boolean;
  emitCrossFilters?: boolean;
}

export type QueryResponse = {
  errors: SupersetError[];
  message: string;
  link: string;
};

export type Actions = {
  logEvent(
    LOG_ACTIONS_RENDER_CHART: string,
    arg1: {
      slice_id: string;
      has_err: boolean;
      error_details: string;
      start_offset: any;
      ts: number;
      duration: number;
    },
  ): Dispatch;
  chartRenderingFailed(
    arg0: string,
    chartId: string,
    arg2: string | null,
  ): Dispatch;
  postChartFormData(
    formData: SqlaFormData,
    arg1: boolean,
    timeout: number | undefined,
    chartId: string,
    dashboardId: number | undefined,
    ownState: boolean,
  ): Dispatch;
};
const BLANK = {};
const NONEXISTENT_DATASET = t(
  'The dataset associated with this chart no longer exists',
);

const defaultProps: Partial<ChartProps> = {
  addFilter: () => BLANK,
  onFilterMenuOpen: () => BLANK,
  onFilterMenuClose: () => BLANK,
  initialValues: BLANK,
  setControlValue: () => BLANK,
  triggerRender: false,
  dashboardId: undefined,
  chartStackTrace: undefined,
  force: false,
  isInView: true,
};

const Styles = styled.div<{ height: number }>`
  min-height: ${p => p.height}px;
  position: relative;
  text-align: center;

  .chart-tooltip {
    opacity: 0.75;
    font-size: ${({ theme }) => theme.typography.sizes.s}px;
  }

  .slice_container {
    display: flex;
    flex-direction: column;
    justify-content: center;

    height: ${p => p.height}px;

    .pivot_table tbody tr {
      font-feature-settings: 'tnum' 1;
    }

    .alert {
      margin: ${({ theme }) => theme.gridUnit * 2}px;
    }
  }
`;

const LoadingDiv = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  width: 80%;
  transform: translate(-50%, -50%);
`;

const MessageSpan = styled.span`
  display: block;
  margin: ${({ theme }) => theme.gridUnit * 4}px auto;
  width: fit-content;
  color: ${({ theme }) => theme.colors.grayscale.base};
`;

const MonospaceDiv = styled.div`
  font-family: ${({ theme }) => theme.typography.families.monospace};
  word-break: break-word;
  overflow-x: auto;
  white-space: pre-wrap;
`;
class Chart extends React.PureComponent<ChartProps, {}> {
  static defaultProps = defaultProps;

  renderStartTime: any;

  constructor(props: ChartProps) {
    super(props);
    this.handleRenderContainerFailure =
      this.handleRenderContainerFailure.bind(this);
  }

  componentDidMount() {
    if (this.props.triggerQuery) {
      this.runQuery();
    }
  }

  componentDidUpdate() {
    if (this.props.triggerQuery) {
      this.runQuery();
    }
  }

  runQuery() {
    // Create chart with POST request
    this.props.actions.postChartFormData(
      this.props.formData,
      Boolean(this.props.force || getUrlParam(URL_PARAMS.force)), // allow override via url params force=true
      this.props.timeout,
      this.props.chartId,
      this.props.dashboardId,
      this.props.ownState,
    );
  }

  handleRenderContainerFailure(
    error: Error,
    info: { componentStack: string } | null,
  ) {
    const { actions, chartId } = this.props;
    logging.warn(error);
    actions.chartRenderingFailed(
      error.toString(),
      chartId,
      info ? info.componentStack : null,
    );

    actions.logEvent(LOG_ACTIONS_RENDER_CHART, {
      slice_id: chartId,
      has_err: true,
      error_details: error.toString(),
      start_offset: this.renderStartTime,
      ts: new Date().getTime(),
      duration: Logger.getTimestamp() - this.renderStartTime,
    });
  }

  renderErrorMessage(QueryResponse: QueryResponse) {
    const {
      chartId,
      chartAlert,
      chartStackTrace,
      datasource,
      dashboardId,
      height,
      datasetsStatus,
    } = this.props;
    const error = QueryResponse?.errors?.[0];
    const message = chartAlert || QueryResponse?.message;

    // if datasource is still loading, don't render JS errors
    if (
      chartAlert !== undefined &&
      chartAlert !== NONEXISTENT_DATASET &&
      datasource === PLACEHOLDER_DATASOURCE &&
      datasetsStatus !== ResourceStatus.Error
    ) {
      return (
        <Styles
          key={chartId}
          data-ui-anchor="chart"
          className="chart-container"
          data-test="chart-container"
          height={height}
        >
          <Loading />
        </Styles>
      );
    }

    return (
      <ChartErrorMessage
        key={chartId}
        chartId={chartId}
        error={error}
        subtitle={<MonospaceDiv>{message}</MonospaceDiv>}
        copyText={message}
        link={QueryResponse ? QueryResponse.link : undefined}
        source={dashboardId ? ChartSource.Dashboard : ChartSource.Explore}
        stackTrace={chartStackTrace}
      />
    );
  }

  renderSpinner(databaseName: string | undefined) {
    const message = databaseName
      ? t('Waiting on %s', databaseName)
      : t('Waiting on database...');

    return (
      <LoadingDiv>
        <Loading position="inline-centered" />
        <MessageSpan>{message}</MessageSpan>
      </LoadingDiv>
    );
  }

  renderChartContainer() {
    return (
      <div className="slice_container" data-test="slice-container">
        {this.props.isInView ||
        !isFeatureEnabled(FeatureFlag.DashboardVirtualization) ||
        isCurrentUserBot() ? (
          <ChartRenderer
            {...this.props}
            source={this.props.dashboardId ? 'dashboard' : 'explore'}
            data-test={this.props.vizType}
          />
        ) : (
          <Loading />
        )}
      </div>
    );
  }

  render() {
    const {
      height,
      chartAlert,
      chartStatus,
      datasource,
      errorMessage,
      chartIsStale,
      queriesResponse = [],
    } = this.props;
    const databaseName = datasource?.database?.name;

    const isLoading = chartStatus === 'loading';

    if (chartStatus === 'failed') {
      return queriesResponse.map(item => this.renderErrorMessage(item));
    }

    if (errorMessage && ensureIsArray(queriesResponse).length === 0) {
      return (
        <EmptyStateBig
          title={t('Add required control values to preview chart')}
          description={getChartRequiredFieldsMissingMessage(true)}
          image="chart.svg"
        />
      );
    }

    if (
      !isLoading &&
      !chartAlert &&
      !errorMessage &&
      chartIsStale &&
      ensureIsArray(queriesResponse).length === 0
    ) {
      return (
        <EmptyStateBig
          title={t('Your chart is ready to go!')}
          description={
            <span>
              {t(
                'Click on "Create chart" button in the control panel on the left to preview a visualization or',
              )}{' '}
              <span role="button" tabIndex={0} onClick={this.props.onQuery}>
                {t('click here')}
              </span>
              .
            </span>
          }
          image="chart.svg"
        />
      );
    }

    return (
      <ErrorBoundary
        onError={this.handleRenderContainerFailure}
        showMessage={false}
      >
        <Styles
          data-ui-anchor="chart"
          className="chart-container"
          data-test="chart-container"
          height={height}
        >
          {isLoading
            ? this.renderSpinner(databaseName)
            : this.renderChartContainer()}
        </Styles>
      </ErrorBoundary>
    );
  }
}
export default Chart;
