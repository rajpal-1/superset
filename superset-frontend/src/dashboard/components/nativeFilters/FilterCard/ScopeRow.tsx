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
import React, { useMemo, useRef } from 'react';
import { t } from '@superset-ui/core';
import { Tooltip } from 'src/components/Tooltip';
import { useFilterScope } from './useFilterScope';
import {
  Row,
  RowLabel,
  RowTruncationCount,
  RowValue,
  TooltipList,
  TooltipTrigger,
} from './Styles';
import { useTruncation } from './useTruncation';
import { FilterCardRowProps } from './types';

export const ScopeRow = React.memo(({ filter }: FilterCardRowProps) => {
  const scope = useFilterScope(filter);
  const scopeRef = useRef<HTMLDivElement>(null);

  const [elementsTruncated, hasHiddenElements] = useTruncation(scopeRef);
  const tooltipText = useMemo(
    () =>
      elementsTruncated > 0 && scope ? (
        <TooltipList>
          {scope.map(val => (
            <li>{val}</li>
          ))}
        </TooltipList>
      ) : null,
    [elementsTruncated, scope],
  );

  return Array.isArray(scope) && scope.length > 0 ? (
    <Row>
      <RowLabel>{t('Scope')}</RowLabel>
      <Tooltip
        title={tooltipText}
        placement="bottom"
        overlayClassName="filter-card-tooltip"
      >
        <TooltipTrigger>
          <RowValue ref={scopeRef}>
            {scope.map((element, index) =>
              index === 0 ? <span>{element}</span> : <span>, {element}</span>,
            )}
          </RowValue>
          {hasHiddenElements > 0 && (
            <RowTruncationCount>+{elementsTruncated}</RowTruncationCount>
          )}
        </TooltipTrigger>
      </Tooltip>
    </Row>
  ) : null;
});
