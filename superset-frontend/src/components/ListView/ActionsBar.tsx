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
import { styled } from '@superset-ui/core';
import TooltipWrapper from 'src/components/TooltipWrapper';
import Icon from 'src/components/Icon';

/* type ActionProps = {
  label: string;
  tooltip?: string | React.ReactElement;
  placement?: string;
  icon: IconName | string;
  onClick: () => void;
}; */

type ActionsBarProps = {
  actions: Array<any>;
};

const StyledActions = styled.span`
  white-space: nowrap;
  min-width: 100px;

  svg,
  i {
    margin-right: 8px;

    &:hover {
      path {
        fill: ${({ theme }) => theme.colors.primary.base};
      }
    }
  }
`;

export default function ActionsBar({ actions }: ActionsBarProps) {
  return (
    <StyledActions className="actions">
      {actions.map(action => {
        if (action.tooltip) {
          return (
            <TooltipWrapper
              label={action.label}
              tooltip={action.tooltip}
              placement={action.placement || ''}
            >
              <span
                role="button"
                tabIndex={0}
                className="action-button"
                onClick={action.onClick}
              >
                <Icon name={action.icon} />
              </span>
            </TooltipWrapper>
          );
        }

        return (
          <span
            role="button"
            tabIndex={0}
            className="action-button"
            onClick={action.onClick}
          >
            <Icon name={action.icon} />
          </span>
        );
      })}
    </StyledActions>
  );
}
