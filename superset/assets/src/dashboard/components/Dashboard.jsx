/* global window */
import React from 'react';
import PropTypes from 'prop-types';

import AlertsWrapper from '../../components/AlertsWrapper';
import getChartIdsFromLayout from '../util/getChartIdsFromLayout';
import DashboardBuilder from '../containers/DashboardBuilder';
import V2PreviewModal from '../deprecated/V2PreviewModal';
import {
  chartPropShape,
  slicePropShape,
  dashboardInfoPropShape,
  dashboardStatePropShape,
  loadStatsPropShape,
} from '../util/propShapes';
import { areObjectsEqual } from '../../reduxUtils';
import getFormDataWithExtraFilters from '../util/charts/getFormDataWithExtraFilters';
import {
  Logger,
  ActionLog,
  DASHBOARD_EVENT_NAMES,
  LOG_ACTIONS_MOUNT_DASHBOARD,
  LOG_ACTIONS_LOAD_DASHBOARD_PANE,
  LOG_ACTIONS_FIRST_DASHBOARD_LOAD,
  LOG_ACTIONS_FALLBACK_TO_V1,
} from '../../logger';

import { t } from '../../locales';

import '../stylesheets/index.less';

const propTypes = {
  actions: PropTypes.shape({
    addSliceToDashboard: PropTypes.func.isRequired,
    removeSliceFromDashboard: PropTypes.func.isRequired,
    runQuery: PropTypes.func.isRequired,
  }).isRequired,
  dashboardInfo: dashboardInfoPropShape.isRequired,
  dashboardState: dashboardStatePropShape.isRequired,
  charts: PropTypes.objectOf(chartPropShape).isRequired,
  slices: PropTypes.objectOf(slicePropShape).isRequired,
  datasources: PropTypes.object.isRequired,
  loadStats: loadStatsPropShape.isRequired,
  layout: PropTypes.object.isRequired,
  impressionId: PropTypes.string.isRequired,
  initMessages: PropTypes.array,
  timeout: PropTypes.number,
  userId: PropTypes.string,
};

const defaultProps = {
  initMessages: [],
  timeout: 60,
  userId: '',
};

class Dashboard extends React.PureComponent {
  static onBeforeUnload(hasChanged) {
    if (hasChanged) {
      window.addEventListener('beforeunload', Dashboard.unload);
    } else {
      window.removeEventListener('beforeunload', Dashboard.unload);
    }
  }

  static unload() {
    const message = t('You have unsaved changes.');
    window.event.returnValue = message; // Gecko + IE
    return message; // Gecko + Webkit, Safari, Chrome etc.
  }

  constructor(props) {
    super(props);
    this.handleCloseV2PreviewModal = this.handleCloseV2PreviewModal.bind(this);
    this.handleFallbackToV1 = this.handleFallbackToV1.bind(this);
    this.state = {
      hideV2PreviewModal: false,
    };
    this.isFirstLoad = true;
    this.actionLog = new ActionLog({
      impressionId: props.impressionId,
      source: 'dashboard',
      sourceId: props.dashboardInfo.id,
      eventNames: DASHBOARD_EVENT_NAMES,
    });
    Logger.start(this.actionLog);
  }

  componentDidMount() {
    this.ts_mount = new Date().getTime();
    Logger.append(LOG_ACTIONS_MOUNT_DASHBOARD);
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.dashboardState.editMode) {
      const version = nextProps.dashboardState.isV2Preview ? 'v2-preview' : 'v2';
      // log pane loads
      const loadedPaneIds = [];
      const allPanesDidLoad = Object.entries(nextProps.loadStats).every(
        ([paneId, stats]) => {
          const { didLoad, minQueryStartTime, ...restStats } = stats;

          if (
            didLoad &&
            this.props.loadStats[paneId] &&
            !this.props.loadStats[paneId].didLoad
          ) {
            const duration = new Date().getTime() - minQueryStartTime;
            Logger.append(LOG_ACTIONS_LOAD_DASHBOARD_PANE, {
              ...restStats,
              duration,
              version,
            });

            if (!this.isFirstLoad) {
              Logger.send(this.actionLog);
            }
          }
          if (this.isFirstLoad && didLoad && stats.slice_ids.length > 0) {
            loadedPaneIds.push(paneId);
          }
          return didLoad || stats.index !== 0;
        },
      );

      if (allPanesDidLoad && this.isFirstLoad) {
        Logger.append(LOG_ACTIONS_FIRST_DASHBOARD_LOAD, {
          pane_ids: loadedPaneIds,
          duration: new Date().getTime() - this.ts_mount,
          version,
        });
        Logger.send(this.actionLog);
        this.isFirstLoad = false;
      }
    }

    const currentChartIds = getChartIdsFromLayout(this.props.layout);
    const nextChartIds = getChartIdsFromLayout(nextProps.layout);

    if (currentChartIds.length < nextChartIds.length) {
      // adding new chart
      const newChartIds = nextChartIds.filter(
        key => currentChartIds.indexOf(key) === -1,
      );
      if (newChartIds.length) {
        newChartIds.forEach(newChartId =>
          this.props.actions.addSliceToDashboard(newChartId),
        );
      }
    } else if (currentChartIds.length > nextChartIds.length) {
      // remove chart
      const removedChartIds = currentChartIds.filter(
        key => nextChartIds.indexOf(key) === -1,
      );
      if (removedChartIds.length) {
        removedChartIds.forEach(removedChartId =>
          this.props.actions.removeSliceFromDashboard(removedChartId),
        );
      }
    }
  }

  componentDidUpdate(prevProps) {
    const { refresh, filters, hasUnsavedChanges } = this.props.dashboardState;
    if (refresh) {
      // refresh charts if a filter was removed, added, or changed
      let changedFilterKey = null;
      const currFilterKeys = Object.keys(filters);
      const prevFilterKeys = Object.keys(prevProps.dashboardState.filters);

      currFilterKeys.forEach(key => {
        const prevFilter = prevProps.dashboardState.filters[key];
        if (
          // filter was added or changed
          typeof prevFilter === 'undefined' ||
          !areObjectsEqual(prevFilter, filters[key])
        ) {
          changedFilterKey = key;
        }
      });

      if (
        !!changedFilterKey ||
        currFilterKeys.length !== prevFilterKeys.length
      ) {
        this.refreshExcept(changedFilterKey);
      }
    }

    if (hasUnsavedChanges) {
      Dashboard.onBeforeUnload(true);
    } else {
      Dashboard.onBeforeUnload(false);
    }
  }

  // return charts in array
  getAllCharts() {
    return Object.values(this.props.charts);
  }

  handleCloseV2PreviewModal() {
    this.setState({ hideV2PreviewModal: true });
  }

  handleFallbackToV1() {
    Logger.append(
      LOG_ACTIONS_FALLBACK_TO_V1,
      {
        force_v2_edit: this.props.dashboardInfo.forceV2Edit,
      },
      true,
    );
    const url = new URL(window.location); // eslint-disable-line
    url.searchParams.set('version', 'v1');
    url.searchParams.delete('edit'); // remove JIC they were editing and v1 editing is not allowed
    window.location = url;
  }

  refreshExcept(filterKey) {
    const immune = this.props.dashboardInfo.metadata.filter_immune_slices || [];

    this.getAllCharts().forEach(chart => {
      // filterKey is a string, immune array contains numbers
      if (String(chart.id) !== filterKey && immune.indexOf(chart.id) === -1) {
        const updatedFormData = getFormDataWithExtraFilters({
          chart,
          dashboardMetadata: this.props.dashboardInfo.metadata,
          filters: this.props.dashboardState.filters,
          sliceId: chart.id,
        });

        this.props.actions.runQuery(
          updatedFormData,
          false,
          this.props.timeout,
          chart.id,
        );
      }
    });
  }

  render() {
    const { hideV2PreviewModal } = this.state;
    const { dashboardState, dashboardInfo } = this.props;
    const { isV2Preview } = dashboardState;
    return (
      <div>
        <AlertsWrapper initMessages={this.props.initMessages} />
        {isV2Preview &&
          !hideV2PreviewModal && (
            <V2PreviewModal
              onClose={this.handleCloseV2PreviewModal}
              handleFallbackToV1={this.handleFallbackToV1}
              v2AutoConvertDate={dashboardInfo.v2AutoConvertDate}
              v2FeedbackUrl={dashboardInfo.v2FeedbackUrl}
            />
          )}
        <DashboardBuilder />
      </div>
    );
  }
}

Dashboard.propTypes = propTypes;
Dashboard.defaultProps = defaultProps;

export default Dashboard;
