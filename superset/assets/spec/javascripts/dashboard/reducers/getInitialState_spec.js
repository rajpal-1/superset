import getInitialState from '../../../../src/dashboard/reducers/getInitialState';
import { getParam } from '../../../../src/modules/utils';
import { applyDefaultFormData } from '../../../../src/explore/store';

jest.mock('../../../../src/modules/utils');
jest.mock('../../../../src/explore/store');

describe('getInitialState reducer applies filters', () => {
  const mockBootstrapData = {
    user_id: 10,
    datasources: {},
    common: {},
    editMode: false,
    dashboard_data: {
      slices: [],
      metadata: {},
    },
  };

  function setup(sliceOverrides = [], metadataOverrides = {}) {
    const bootstrapData = { ...mockBootstrapData };
    bootstrapData.dashboard_data.slices = sliceOverrides;
    bootstrapData.dashboard_data.metadata = metadataOverrides;

    return { bootstrapData };
  }

  it('should return no filters when none specified', () => {
    const { bootstrapData } = setup();
    expect(getInitialState(bootstrapData).dashboardState.filters).toEqual({});
  });

  it('should apply old-style filters to slices from preselect_filters', () => {
    const filter = {
      slice_id: 35,
      form_data: {
        viz_type: 'filter_box',
        groupby: ['column'],
        datasource: '2__table',
      },
    };
    const { bootstrapData } = setup([filter]);

    applyDefaultFormData.mockReturnValue({});
    getParam.mockReturnValue('{"35":{"column":["val"]}}');

    expect(getInitialState(bootstrapData).dashboardState.filters).toEqual({
      35: {
        column: ['val'],
      },
    });
  });

  it('should apply new-style filters to slices from preselect_filters', () => {
    const filter = {
      slice_id: 35,
      form_data: {
        viz_type: 'filter_box',
        groupby: ['column'],
        datasource: '2__table',
      },
    };
    const { bootstrapData } = setup([filter]);

    applyDefaultFormData.mockReturnValue({});
    getParam.mockReturnValue('{"column":["val"]}');

    expect(getInitialState(bootstrapData).dashboardState.filters).toEqual({
      35: {
        column: ['val'],
      },
    });
  });

  it('should apply mixed-style filters to slices from preselect_filters', () => {
    const filters = [
      {
        slice_id: 35,
        form_data: {
          viz_type: 'filter_box',
          groupby: ['column1', 'column2'],
          datasource: '2__table',
        },
      },
      {
        slice_id: 45,
        form_data: {
          viz_type: 'filter_box',
          groupby: ['column1'],
          datasource: '2__table',
        },
      },
    ];

    const { bootstrapData } = setup(filters);

    applyDefaultFormData.mockReturnValue({});
    getParam.mockReturnValue(
      '{"column1":["val1"],"column2":["val2","val3"],"45":{"__time_grain":"PT1H","__granularity":"1 minute"}}',
    );

    expect(getInitialState(bootstrapData).dashboardState.filters).toEqual({
      35: {
        column1: ['val1'],
        column2: ['val2', 'val3'],
      },
      45: {
        column1: ['val1'],
        __time_grain: 'PT1H',
        __granularity: '1 minute',
      },
    });
  });

  it('should apply default_filters if preselect_filters not present', () => {
    const filter = {
      slice_id: 35,
      form_data: {
        viz_type: 'filter_box',
        groupby: ['column'],
        datasource: '2__table',
      },
    };

    const metadata = {
      default_filters: '{"35": {"column": ["val"]}}',
    };

    const { bootstrapData } = setup([filter], metadata);

    applyDefaultFormData.mockReturnValue({});
    getParam.mockReturnValue('');

    expect(getInitialState(bootstrapData).dashboardState.filters).toEqual({
      35: {
        column: ['val'],
      },
    });
  });

  it('should override default_filters if preselect_filters present', () => {
    const filter = {
      slice_id: 35,
      form_data: {
        viz_type: 'filter_box',
        groupby: ['column1', 'column2'],
        datasource: '2__table',
      },
    };

    const metadata = {
      default_filters: '{"35": {"column1": ["val1"]}}',
    };

    const { bootstrapData } = setup([filter], metadata);

    applyDefaultFormData.mockReturnValue({});
    getParam.mockReturnValue('{"column2":["val2"]}');

    expect(getInitialState(bootstrapData).dashboardState.filters).toEqual({
      35: {
        column2: ['val2'],
      },
    });
  });
});
