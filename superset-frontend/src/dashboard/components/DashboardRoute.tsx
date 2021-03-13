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
import React, { useEffect, useState, FC } from 'react';
import { connect } from 'react-redux';
import { AnyAction, bindActionCreators, Dispatch } from 'redux';
import Loading from 'src/components/Loading';
import ErrorBoundary from 'src/components/ErrorBoundary';
import {
  useDashboard,
  useDashboardCharts,
  useDashboardDatasets,
} from 'src/common/hooks/apiResources';
import { ResourceStatus } from 'src/common/hooks/apiResources/apiResources';
import { usePrevious } from 'src/common/hooks/usePrevious';
import { bootstrapDashboardState } from 'src/dashboard/actions/bootstrapData';
import DashboardContainer from 'src/dashboard/containers/Dashboard';

interface DashboardRouteProps {
  actions: {
    bootstrapDashboardState: typeof bootstrapDashboardState;
  };
  dashboardIdOrSlug: string;
}

const DashboardRouteGuts: FC<DashboardRouteProps> = ({
  actions,
  dashboardIdOrSlug, // eventually get from react router
}) => {
  const [isLoaded, setLoaded] = useState(false);
  const dashboardResource = useDashboard(dashboardIdOrSlug);
  const chartsResource = useDashboardCharts(dashboardIdOrSlug);
  const datasetsResource = useDashboardDatasets(dashboardIdOrSlug);
  const isLoading = [dashboardResource, chartsResource, datasetsResource].some(
    resource => resource.status === ResourceStatus.LOADING,
  );
  const wasLoading = usePrevious(isLoading);
  const error = [dashboardResource, chartsResource, datasetsResource].find(
    resource => resource.status === ResourceStatus.ERROR,
  )?.error;
  useEffect(() => {
    if (
      wasLoading &&
      dashboardResource.status === ResourceStatus.COMPLETE &&
      chartsResource.status === ResourceStatus.COMPLETE &&
      datasetsResource.status === ResourceStatus.COMPLETE
    ) {
      actions.bootstrapDashboardState(
        dashboardResource.result,
        chartsResource.result,
        datasetsResource.result,
      );
      setLoaded(true);
    }
  }, [
    actions,
    wasLoading,
    dashboardResource,
    chartsResource,
    datasetsResource,
  ]);

  if (error) throw error; // caught in error boundary

  if (!isLoaded) return <Loading />;
  return <DashboardContainer />;
};

function mapDispatchToProps(dispatch: Dispatch<AnyAction>) {
  return {
    actions: bindActionCreators(
      {
        bootstrapDashboardState,
      },
      dispatch,
    ),
  };
}

const ConnectedDashboardRoute = connect(
  null,
  mapDispatchToProps,
)(DashboardRouteGuts);

const DashboardRoute = ({ dashboardIdOrSlug }: DashboardRouteProps) => (
  <ErrorBoundary>
    <ConnectedDashboardRoute dashboardIdOrSlug={dashboardIdOrSlug} />
  </ErrorBoundary>
);

export default DashboardRoute;
