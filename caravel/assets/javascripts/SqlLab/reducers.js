import shortid from 'shortid';
import * as actions from './actions';
import { now } from '../modules/dates';
import * as utils from '../../utils/reducerUtils';

const defaultQueryEditor = {
  id: shortid.generate(),
  title: 'Untitled Query',
  sql: 'SELECT *\nFROM\nWHERE',
  latestQueryId: null,
  autorun: false,
  dbId: null,
};

export const initialState = {
  alerts: [],
  networkOn: true,
  queries: {},
  databases: {},
  queryEditors: [defaultQueryEditor],
  tabHistory: [defaultQueryEditor.id],
  tables: [],
  workspaceQueries: [],
  queriesLastUpdate: 0,
};

export const sqlLabReducer = function (state, action) {
  const actionHandlers = {
    [actions.ADD_QUERY_EDITOR]() {
      const tabHistory = state.tabHistory.slice();
      tabHistory.push(action.queryEditor.id);
      const newState = Object.assign({}, state, { tabHistory });
      return utils.addToArr(newState, 'queryEditors', action.queryEditor);
    },
    [actions.REMOVE_QUERY_EDITOR]() {
      let newState = utils.removeFromArr(state, 'queryEditors', action.queryEditor);
      // List of remaining queryEditor ids
      const qeIds = newState.queryEditors.map((qe) => qe.id);
      let th = state.tabHistory.slice();
      th = th.filter((id) => qeIds.includes(id));
      newState = Object.assign({}, newState, { tabHistory: th });
      return newState;
    },
    [actions.REMOVE_QUERY]() {
      const newQueries = Object.assign({}, state.queries);
      delete newQueries[action.query.id];
      return Object.assign({}, state, { queries: newQueries });
    },
    [actions.RESET_STATE]() {
      return Object.assign({}, initialState);
    },
    [actions.ADD_TABLE]() {
      return utils.addToArr(state, 'tables', action.table);
    },
    [actions.EXPAND_TABLE]() {
      return utils.alterInArr(state, 'tables', action.table, { expanded: true });
    },
    [actions.COLLAPSE_TABLE]() {
      return utils.alterInArr(state, 'tables', action.table, { expanded: false });
    },
    [actions.REMOVE_TABLE]() {
      return utils.removeFromArr(state, 'tables', action.table);
    },
    [actions.START_QUERY]() {
      const newState = utils.addToObject(state, 'queries', action.query);
      const sqlEditor = { id: action.query.sqlEditorId };
      return utils.alterInArr(
        newState, 'queryEditors', sqlEditor, { latestQueryId: action.query.id });
    },
    [actions.STOP_QUERY]() {
      return utils.alterInObject(state, 'queries', action.query, { state: 'stopped' });
    },
    [actions.QUERY_SUCCESS]() {
      const alts = {
        state: 'success',
        results: action.results,
        rows: action.results.data.length,
        progress: 100,
        endDttm: now(),
      };
      return utils.alterInObject(state, 'queries', action.query, alts);
    },
    [actions.QUERY_FAILED]() {
      const alts = { state: 'failed', errorMessage: action.msg, endDttm: now() };
      return utils.alterInObject(state, 'queries', action.query, alts);
    },
    [actions.SET_ACTIVE_QUERY_EDITOR]() {
      const qeIds = state.queryEditors.map((qe) => qe.id);
      if (qeIds.includes(action.queryEditor.id)) {
        const tabHistory = state.tabHistory.slice();
        tabHistory.push(action.queryEditor.id);
        return Object.assign({}, state, { tabHistory });
      }
      return state;
    },
    [actions.QUERY_EDITOR_SETDB]() {
      return utils.alterInArr(state, 'queryEditors', action.queryEditor, { dbId: action.dbId });
    },
    [actions.QUERY_EDITOR_SET_SCHEMA]() {
      return utils.alterInArr(state, 'queryEditors', action.queryEditor, { schema: action.schema });
    },
    [actions.QUERY_EDITOR_SET_TITLE]() {
      return utils.alterInArr(state, 'queryEditors', action.queryEditor, { title: action.title });
    },
    [actions.QUERY_EDITOR_SET_SQL]() {
      return utils.alterInArr(state, 'queryEditors', action.queryEditor, { sql: action.sql });
    },
    [actions.QUERY_EDITOR_SET_AUTORUN]() {
      return utils.alterInArr(
        state, 'queryEditors', action.queryEditor, { autorun: action.autorun });
    },
    [actions.ADD_WORKSPACE_QUERY]() {
      return utils.addToArr(state, 'workspaceQueries', action.query);
    },
    [actions.REMOVE_WORKSPACE_QUERY]() {
      return utils.removeFromArr(state, 'workspaceQueries', action.query);
    },
    [actions.ADD_ALERT]() {
      return utils.addToArr(state, 'alerts', action.alert);
    },
    [actions.SET_DATABASES]() {
      const databases = {};
      action.databases.forEach((db) => {
        databases[db.id] = db;
      });
      return Object.assign({}, state, { databases });
    },
    [actions.REMOVE_ALERT]() {
      return utils.removeFromArr(state, 'alerts', action.alert);
    },
    [actions.SET_NETWORK_STATUS]() {
      if (state.networkOn !== action.networkOn) {
        return Object.assign({}, state, { networkOn: action.networkOn });
      }
      return state;
    },
    [actions.REFRESH_QUERIES]() {
      let newQueries = Object.assign({}, state.queries);
      // Fetch the updates to the queries present in the store.
      let change = false;
      for (const id in action.alteredQueries) {
        const changedQuery = action.alteredQueries[id];
        if (
            !state.queries.hasOwnProperty(id) ||
            state.queries[id].changedOn !== changedQuery.changedOn) {
          newQueries[id] = Object.assign({}, state.queries[id], changedQuery);
          change = true;
        }
      }
      if (!change) {
        newQueries = state.queries;
      }
      const queriesLastUpdate = now();
      return Object.assign({}, state, { queries: newQueries, queriesLastUpdate });
    },
  };
  if (action.type in actionHandlers) {
    return actionHandlers[action.type]();
  }
  return state;
};
