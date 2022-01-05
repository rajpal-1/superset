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
import Button from 'src/components/Button';
import { t, styled, css } from '@superset-ui/core';
import Collapse from 'src/components/Collapse';
import Icons from 'src/components/Icons';
import TableSelector from 'src/components/TableSelector';
import { IconTooltip } from 'src/components/IconTooltip';
import { QueryEditor } from 'src/SqlLab/types';
import { DatabaseObject } from 'src/components/DatabaseSelector';
import TableElement from '../TableElement';

// const propTypes = {
//   queryEditor: PropTypes.object.isRequired,
//   height: PropTypes.number,
//   tables: PropTypes.array,
//   actions: PropTypes.object,
//   database: PropTypes.object,
//   offline: PropTypes.bool,
// };

/**
    onSchemaChange={actions.queryEditorSetSchema}
    onSchemasLoad={actions.queryEditorSetSchemaOptions}
    onTableChange={onTableChange}
    onTablesLoad={actions.queryEditorSetTableOptions}
 */

// anywhere there is void or any I didnt know what to put, will look into it

interface actionsTypes {
  queryEditorSetDb: (queryEditor: QueryEditor, dbId: number) => void;
  queryEditorSetFunctionNames: (queryEditor: QueryEditor, dbId: number) => void;
  /*
    Need to add:
    addTable (X)
    collapseTable (X)
    expandTable (X)
    queryEditorSetSchemaOptions (X)
    queryEditorSetTableOptions (X)
    resetState (X)
  */

  collapseTable: (table: tableType) => void;
  expandTable: (table: tableType) => void;

  // This came from /home/josue/superset/superset-frontend/src/SqlLab/components/AceEditorWrapper/index.tsx
  addTable: (queryEditor: any, value: any, schema: any) => void;

  // utilized the typing that TableSelector used for its props, which are the same functions for these two below
  setDatabases: (arg0: any) => {};
  addDangerToast: (msg: string) => void;
  queryEditorSetSchema: (schema?: string) => void;
  queryEditorSetSchemaOptions: () => void;
  queryEditorSetTableOptions: (options: Array<any>) => void;
  resetState: () => void;
}

// my first attempt at actionTypes:
// interface actionsTypes {
//   queryEditorSetDb: (queryEditor: QueryEditor, dbId: number) => void;
//   queryEditorSetFunctionNames: (queryEditor: QueryEditor, dbId: number) => void;
//   setDatabases: (databases: any) => object;
//   addDangerToast: (text: string, options?: ToastOptions) => void;
//   queryEditorSetSchema: (queryEditor: QueryEditor, schema: any) => void;
// }

type tableType = {
  id: number;
  expanded: boolean;
};

type dbType = {
  id: number;
};

interface propTypes {
  queryEditor: QueryEditor;
  height: number;
  tables: tableType[] | [];
  actions: actionsTypes;
  database: DatabaseObject;
  offline: boolean;
}

// const defaultProps = {
//   actions: {},
//   height: 500,
//   offline: false,
//   tables: [],
// };

const StyledScrollbarContainer = styled.div`
  flex: 1 1 auto;
  overflow: auto;
`;

const collapseStyles = css`
  .ant-collapse-item {
    margin-bottom: ${({ theme }) => theme.gridUnit * 3}px;
  }
  .ant-collapse-header {
    padding: 0px !important;
    display: flex;
    align-items: center;
  }
  .ant-collapse-content-box {
    padding: 0px ${({ theme }) => theme.gridUnit * 4}px 0px 0px !important;
  }
  .ant-collapse-arrow {
    top: ${({ theme }) => theme.gridUnit * 2}px !important;
    color: ${({ theme }) => theme.colors.primary.dark1} !important;
    &: hover {
      color: ${({ theme }) => theme.colors.primary.dark2} !important;
    }
  }
`;

export default function SqlEditorLeftBar({
  actions,
  database,
  height = 500,
  queryEditor,
  tables = [],
}: propTypes) {
  const onDbChange = (db: dbType) => {
    actions.queryEditorSetDb(queryEditor, db.id);
    actions.queryEditorSetFunctionNames(queryEditor, db.id);
  };

  const onTableChange = (tableName: string, schemaName: string) => {
    if (tableName && schemaName) {
      actions.addTable(queryEditor, tableName, schemaName);
    }
  };

  const onToggleTable = (updatedTables: string[]) => {
    tables.forEach((table: tableType) => {
      if (!updatedTables.includes(table.id.toString()) && table.expanded) {
        actions.collapseTable(table);
      } else if (
        updatedTables.includes(table.id.toString()) &&
        !table.expanded
      ) {
        actions.expandTable(table);
      }
    });
  };

  const renderExpandIconWithTooltip = ({ isActive }: { isActive: boolean }) => (
    <IconTooltip
      css={css`
        transform: rotate(90deg);
      `}
      aria-label="Collapse"
      tooltip={
        isActive ? t('Collapse table preview') : t('Expand table preview')
      }
    >
      <Icons.RightOutlined
        iconSize="s"
        css={css`
          transform: ${isActive ? 'rotateY(180deg)' : ''};
        `}
      />
    </IconTooltip>
  );

  const shouldShowReset = window.location.search === '?reset=1';
  const tableMetaDataHeight = height - 130; // 130 is the height of the selects above

  return (
    <div className="SqlEditorLeftBar">
      <TableSelector
        database={database}
        dbId={queryEditor.dbId}
        getDbList={actions.setDatabases}
        handleError={actions.addDangerToast}
        onDbChange={onDbChange}
        onSchemaChange={actions.queryEditorSetSchema}
        onSchemasLoad={actions.queryEditorSetSchemaOptions}
        onTableChange={onTableChange}
        onTablesLoad={actions.queryEditorSetTableOptions}
        schema={queryEditor.schema}
        sqlLabMode
      />
      <div className="divider" />
      <StyledScrollbarContainer>
        <div
          css={css`
            height: ${props => props.contentHeight}px;
          `}
          contentHeight={tableMetaDataHeight}
        >
          <Collapse
            activeKey={tables
              .filter(({ expanded }) => expanded)
              .map(({ id }) => id)}
            css={collapseStyles}
            expandIconPosition="right"
            ghost
            onChange={onToggleTable}
            expandIcon={renderExpandIconWithTooltip}
          >
            {tables.map(table => (
              <TableElement table={table} key={table.id} actions={actions} />
            ))}
          </Collapse>
        </div>
      </StyledScrollbarContainer>
      {shouldShowReset && (
        <Button
          buttonSize="small"
          buttonStyle="danger"
          onClick={actions.resetState}
        >
          <i className="fa fa-bomb" /> {t('Reset state')}
        </Button>
      )}
    </div>
  );
}

// SqlEditorLeftBar.propTypes = propTypes;
// SqlEditorLeftBar.defaultProps = defaultProps;
