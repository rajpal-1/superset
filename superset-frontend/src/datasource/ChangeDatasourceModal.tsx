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
import React, {
  FunctionComponent,
  useState,
  useRef,
  useEffect,
  useCallback,
} from 'react';
import Alert from 'src/components/Alert';
import { SupersetClient, t, styled } from '@superset-ui/core';
import rison from 'rison';
import TableView, { EmptyWrapperType } from 'src/components/TableView';
import StyledModal from 'src/components/Modal';
import Button from 'src/components/Button';
import { useListViewResource } from 'src/views/CRUD/hooks';
import Dataset from 'src/types/Dataset';
import { useDebouncedEffect } from 'src/explore/exploreUtils';
import { getClientErrorObject } from 'src/utils/getClientErrorObject';
import Loading from 'src/components/Loading';
import withToasts from 'src/messageToasts/enhancers/withToasts';
import { Input, AntdInput } from 'src/common/components';

const CONFIRM_WARNING_MESSAGE = t(
  'Warning! Changing the dataset may break the chart if the metadata does not exist.',
);

const CHANGE_WARNING_MSG = t(
  'Changing the dataset may break the chart if the chart relies ' +
    'on columns or metadata that does not exist in the target dataset',
);

interface Datasource {
  type: string;
  id: number;
  uid: string;
}

interface ChangeDatasourceModalProps {
  addDangerToast: (msg: string) => void;
  addSuccessToast: (msg: string) => void;
  onChange: (uid: string) => void;
  onDatasourceSave: (datasource: object, errors?: Array<any>) => {};
  onHide: () => void;
  show: boolean;
}

const ConfirmModalStyled = styled.div`
  .btn-container {
    display: flex;
    justify-content: flex-end;
    padding: 0px 15px;
    margin: 10px 0 0 0;
  }

  .confirm-modal-container {
    margin: 9px;
  }
`;

const StyledSpan = styled.span`
  cursor: pointer;
  color: ${({ theme }) => theme.colors.primary.dark1};
  &: hover {
    color: ${({ theme }) => theme.colors.primary.dark2};
  }
`;

const TABLE_COLUMNS = [
  'name',
  'type',
  'schema',
  'connection',
  'creator',
].map(col => ({ accessor: col, Header: col }));

const emptyRequest = {
  pageIndex: 0,
  pageSize: 20,
  filters: [],
  sortBy: [{ id: 'changed_on_delta_humanized' }],
};

const ChangeDatasourceModal: FunctionComponent<ChangeDatasourceModalProps> = ({
  addDangerToast,
  addSuccessToast,
  onChange,
  onDatasourceSave,
  onHide,
  show,
}) => {
  const [filter, setFilter] = useState<any>(undefined);
  const [confirmChange, setConfirmChange] = useState(false);
  const [confirmedDataset, setConfirmedDataset] = useState<Datasource>();
  const searchRef = useRef<AntdInput>(null);
  const [pageIndex, setPageIndex] = useState(0);

  const {
    state: { resourceCount, loading, resourceCollection },
    fetchData,
    setResourceCollection
  } = useListViewResource<Dataset>('dataset', t('dataset'), addDangerToast);

  const selectDatasource = useCallback((datasource: Datasource) => {
    setConfirmChange(true);
    setConfirmedDataset(datasource);
  }, []);

  useDebouncedEffect(
    () => {
      fetchData({
        ...emptyRequest,
        ...(filter && {
          filters: [
            {
              id: 'table_name',
              operator: 'ct',
              value: filter,
            },
          ],
        }),
      });
    },
    300,
    [filter],
  );

  useEffect(() => {
    const onEnterModal = async () => {
      setTimeout(() => searchRef?.current?.focus(), 200);
    };

    if (show) {
      onEnterModal();
    }
  }, [
    addDangerToast,
    fetchData,
    onChange,
    onDatasourceSave,
    onHide,
    selectDatasource,
    show,
  ]);

  const changeSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = event.target.value ?? '';
    setFilter(searchValue);
  };

  const handleChangeConfirm = () => {
    SupersetClient.get({
      endpoint: `/datasource/get/${confirmedDataset?.type}/${confirmedDataset?.id}/`,
    })
      .then(({ json }) => {
        onDatasourceSave(json);
        onChange(`${confirmedDataset?.id}__table`);
      })
      .catch(response => {
        getClientErrorObject(response).then(
          ({ error, message }: { error: any; message: string }) => {
            const errorMessage = error
              ? error.error || error.statusText || error
              : message;
            addDangerToast(errorMessage);
          },
        );
      });
    onHide();
    addSuccessToast('Successfully changed dataset!');
  };

  const handlerCancelConfirm = () => {
    setConfirmChange(false);
  };

  const renderTableView = () => {
    const data = resourceCollection.map((ds: any) => ({
      rawName: ds.table_name,
      connection: ds.database.database_name,
      schema: ds.schema,
      name: (
        <StyledSpan
          role="button"
          tabIndex={0}
          data-test="datasource-link"
          onClick={() => selectDatasource({ type: 'table', ...ds })}
        >
          {ds.table_name}
        </StyledSpan>
      ),
      type: ds.kind,
    }));

    return data;
  };

  const customGotoPage = (p: number) => {
    console.log({p})
    SupersetClient.get({endpoint: `/api/v1/dataset/?q=${rison.encode({
      order_column: 'changed_on_delta_humanized',
      order_direction: 'desc',
      page: p-1,
      page_size: 20, 
    })}`,
    })
      .then((resources)=> {
        setPageIndex(p-1);
        setResourceCollection(resources.json.result)
      })
  }

  return (
    <StyledModal
      show={show}
      onHide={onHide}
      responsive
      title={t('Change dataset')}
      width={confirmChange ? '432px' : ''}
      height={confirmChange ? 'auto' : '480px'}
      hideFooter={!confirmChange}
      footer={
        <>
          {confirmChange && (
            <ConfirmModalStyled>
              <div className="btn-container">
                <Button onClick={handlerCancelConfirm}>Cancel</Button>
                <Button
                  className="proceed-btn"
                  buttonStyle="primary"
                  onClick={handleChangeConfirm}
                >
                  Proceed
                </Button>
              </div>
            </ConfirmModalStyled>
          )}
        </>
      }
    >
      <>
        {!confirmChange && (
          <>
            <Alert
              roomBelow
              type="warning"
              css={theme => ({ marginBottom: theme.gridUnit * 4 })}
              message={
                <>
                  <strong>{t('Warning!')}</strong> {CHANGE_WARNING_MSG}
                </>
              }
            />
            <Input
              ref={searchRef}
              type="text"
              value={filter}
              placeholder={t('Search / Filter')}
              onChange={changeSearch}
            />
            {loading && <Loading />}
            {!loading && (
              <TableView
                columns={TABLE_COLUMNS}
                data={renderTableView()}
                pageSize={20}
                className="table-condensed"
                emptyWrapperType={EmptyWrapperType.Small}
                initialPageIndex={0}
                customGotoPage={customGotoPage}
                customPageCount={Math.ceil(resourceCount/20)} 
                customPageIndex={pageIndex}
                resourceCount={resourceCount}
                withPagination
              />
            )}
          </>
        )}
        {confirmChange && <>{CONFIRM_WARNING_MESSAGE}</>}
      </>
    </StyledModal>
  );
};

export default withToasts(ChangeDatasourceModal);
