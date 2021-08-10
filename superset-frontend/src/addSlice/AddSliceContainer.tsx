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
import React from 'react';
import rison from 'rison';
import Button from 'src/components/Button';
import { Select } from 'src/components';
import {
  css,
  styled,
  t,
  SupersetClient,
  JsonResponse,
} from '@superset-ui/core';
import { FormLabel } from 'src/components/Form';
import { Tooltip } from 'src/components/Tooltip';

import VizTypeGallery, {
  MAX_ADVISABLE_VIZ_GALLERY_WIDTH,
} from 'src/explore/components/controls/VizTypeControl/VizTypeGallery';

type Dataset = {
  id: number;
  table_name: string;
  description: string;
  datasource_type: string;
};

export type AddSliceContainerProps = {};

export type AddSliceContainerState = {
  datasource?: { label: string; value: string };
  visType: string | null;
};

const ESTIMATED_NAV_HEIGHT = '56px';

const StyledContainer = styled.div`
  ${({ theme }) => `
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 100%;
    max-width: ${MAX_ADVISABLE_VIZ_GALLERY_WIDTH}px;
    max-height: calc(100vh - ${ESTIMATED_NAV_HEIGHT});
    border-radius: ${theme.gridUnit}px;
    background-color: ${theme.colors.grayscale.light5};
    margin-left: auto;
    margin-right: auto;
    padding-left: ${theme.gridUnit * 4}px;
    padding-right: ${theme.gridUnit * 4}px;
    padding-bottom: ${theme.gridUnit * 4}px;

    h3 {
      padding-bottom: ${theme.gridUnit * 3}px;
    }

    & .dataset {
      display: flex;
      flex-direction: row;
      align-items: center;

      & > div {
        min-width: 200px;
        width: 300px;
      }

      & > span {
        color: ${theme.colors.grayscale.light1};
        margin-left: ${theme.gridUnit * 4}px;
        margin-top: ${theme.gridUnit * 6}px;
      }
    }

    & .ant-tooltip-open {
      display: inline;
    }
  `}
`;

const TooltipContent = styled.div<{ hasDescription: boolean }>`
  ${({ theme, hasDescription }) => `
    .tooltip-header {
      font-size: ${
        hasDescription ? theme.typography.sizes.l : theme.typography.sizes.s
      }px;
      font-weight: ${
        hasDescription
          ? theme.typography.weights.bold
          : theme.typography.weights.normal
      };
    }

    .tooltip-description {
      margin-top: ${theme.gridUnit * 2}px;
      display: -webkit-box;
      -webkit-line-clamp: 20;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  `}
`;

const cssStatic = css`
  flex: 0 0 auto;
`;

const StyledVizTypeGallery = styled(VizTypeGallery)`
  ${({ theme }) => `
    border: 1px solid ${theme.colors.grayscale.light2};
    border-radius: ${theme.gridUnit}px;
    margin: ${theme.gridUnit * 3}px 0px;
    flex: 1 1 auto;
  `}
`;

export default class AddSliceContainer extends React.PureComponent<
  AddSliceContainerProps,
  AddSliceContainerState
> {
  constructor(props: AddSliceContainerProps) {
    super(props);
    this.state = {
      visType: null,
    };

    this.changeDatasource = this.changeDatasource.bind(this);
    this.changeVisType = this.changeVisType.bind(this);
    this.gotoSlice = this.gotoSlice.bind(this);
    this.newLabel = this.newLabel.bind(this);
    this.loadDatasources = this.loadDatasources.bind(this);
  }

  exploreUrl() {
    const formData = encodeURIComponent(
      JSON.stringify({
        viz_type: this.state.visType,
        datasource: this.state.datasource?.value,
      }),
    );
    return `/superset/explore/?form_data=${formData}`;
  }

  gotoSlice() {
    window.location.href = this.exploreUrl();
  }

  changeDatasource(datasource: { label: string; value: string }) {
    this.setState({ datasource });
  }

  changeVisType(visType: string | null) {
    this.setState({ visType });
  }

  isBtnDisabled() {
    return !(this.state.datasource?.value && this.state.visType);
  }

  newLabel(item: Dataset) {
    return (
      <Tooltip
        title={
          <TooltipContent hasDescription={!!item.description}>
            <div className="tooltip-header">{item.table_name}</div>
            {item.description && (
              <div className="tooltip-description">{item.description}</div>
            )}
          </TooltipContent>
        }
      >
        {item.table_name}
      </Tooltip>
    );
  }

  loadDatasources(search: string, page: number, pageSize: number) {
    const query = rison.encode({
      columns: ['id', 'table_name', 'description', 'datasource_type'],
      filter: search,
      page,
      page_size: pageSize,
    });
    return SupersetClient.get({
      endpoint: `/api/v1/dataset?q=${query}`,
    }).then((response: JsonResponse) => {
      const list = response.json.result.map((item: Dataset) => ({
        value: `${item.id}__${item.datasource_type}`,
        label: this.newLabel(item),
      }));
      return {
        data: list,
        totalCount: response.json.count,
      };
    });
  }

  render() {
    return (
      <StyledContainer>
        <h3 css={cssStatic}>{t('Create a new chart')}</h3>
        <div className="dataset">
          <Select
            autoFocus
            ariaLabel={t('Dataset')}
            name="select-datasource"
            header={<FormLabel required>{t('Choose a dataset')}</FormLabel>}
            onChange={this.changeDatasource}
            options={this.loadDatasources}
            placeholder={t('Choose a dataset')}
            showSearch
            value={this.state.datasource}
          />
          <span>
            {t(
              'Instructions to add a dataset are available in the Superset tutorial.',
            )}{' '}
            <a
              href="https://superset.apache.org/docs/creating-charts-dashboards/first-dashboard#adding-a-new-table"
              rel="noopener noreferrer"
              target="_blank"
            >
              <i className="fa fa-external-link" />
            </a>
          </span>
        </div>
        <StyledVizTypeGallery
          onChange={this.changeVisType}
          selectedViz={this.state.visType}
        />
        <Button
          css={[
            cssStatic,
            css`
              align-self: flex-end;
            `,
          ]}
          buttonStyle="primary"
          disabled={this.isBtnDisabled()}
          onClick={this.gotoSlice}
        >
          {t('Create new chart')}
        </Button>
      </StyledContainer>
    );
  }
}
