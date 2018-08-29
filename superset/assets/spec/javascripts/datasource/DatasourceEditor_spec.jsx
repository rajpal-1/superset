import React from 'react';
import { Tabs } from 'react-bootstrap';
import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { shallow } from 'enzyme';
import configureStore from 'redux-mock-store';
import fetchMock from 'fetch-mock';
import thunk from 'redux-thunk';

import DatasourceEditor from '../../../src/datasource/DatasourceEditor';
import mockDatasource from '../../fixtures/mockDatasource';

const props = {
  datasource: mockDatasource['7__table'],
  addSuccessToast: () => {},
  addDangerToast: () => {},
  onChange: () => {},
};

const extraColumn = {
  column_name: 'new_column',
  type: 'VARCHAR(10)',
  description: null,
  filterable: true,
  verbose_name: null,
  is_dttm: false,
  expression: '',
  groupby: true,
};

const endpoint = 'glob:*/datasource/external_metadata/*';

describe('DatasourceEditor', () => {
  const mockStore = configureStore([thunk]);
  const store = mockStore({});
  fetchMock.get(endpoint, []);

  let wrapper;
  let el;
  let inst;

  beforeEach(() => {
    el = <DatasourceEditor {...props} />;
    wrapper = shallow(el, { context: { store } }).dive();
    inst = wrapper.instance();
  });

  it('is valid', () => {
    expect(React.isValidElement(el)).to.equal(true);
  });

  it('renders Tabs', () => {
    expect(wrapper.find(Tabs)).to.have.lengthOf(1);
  });

  it('makes an async request', (done) => {
    wrapper.setState({ activeTabKey: 2 });
    const syncButton = wrapper.find('.sync-from-source');
    expect(syncButton).to.have.lengthOf(1);
    syncButton.simulate('click');

    setTimeout(() => {
      expect(fetchMock.calls(endpoint)).to.have.lengthOf(1);
      fetchMock.reset();
      done();
    }, 0);
  });

  it('merges columns', () => {
    const numCols = props.datasource.columns.length;
    expect(inst.state.databaseColumns.length).to.equal(numCols);
    inst.mergeColumns([extraColumn]);
    expect(inst.state.databaseColumns.length).to.equal(numCols + 1);
  });
});
