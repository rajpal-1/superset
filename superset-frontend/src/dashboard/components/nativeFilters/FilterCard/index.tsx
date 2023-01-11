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

import React, { useEffect, useRef, useState } from 'react';
import Popover from 'src/components/Popover';
import { FilterCardContent } from './FilterCardContent';
import { FilterCardProps } from './types';

export const FilterCard = ({
  children,
  filter,
  getPopupContainer,
  isVisible: externalIsVisible = true,
  placement,
}: FilterCardProps) => {
  const [internalIsVisible, setInternalIsVisible] = useState(false);
  const [popoverVisible, setPopoverVisible] = useState(false);
  const visibilityTimer = useRef<number | null>();

  const hidePopover = () => {
    setInternalIsVisible(false);
  };

  useEffect(() => {
    if (!externalIsVisible) {
      setInternalIsVisible(false);
    }
  }, [externalIsVisible]);
  return (
    <Popover
      placement={placement}
      overlayClassName="filter-card-popover"
      mouseEnterDelay={0.2}
      mouseLeaveDelay={0.2}
      onVisibleChange={visible => {
        const vis = visible;
        // The popover has a delay while it transitions to visible where its is display: hidden
        // and child DOM elements will all provide widths of zero.  This timeout provides
        // a delay to ensure the elements are truly visible when they receive the visibility change event
        // and can safely measure child DOM element widths if needed
        if (visibilityTimer.current) {
          window.clearTimeout(visibilityTimer.current);
          visibilityTimer.current = null;
        }
        visibilityTimer.current = window.setTimeout(
          () => setPopoverVisible(vis),
          500,
        );
        setInternalIsVisible(externalIsVisible && visible);
      }}
      visible={externalIsVisible && internalIsVisible}
      content={
        <FilterCardContent
          filter={filter}
          hidePopover={hidePopover}
          isContainerVisible={popoverVisible}
        />
      }
      getPopupContainer={getPopupContainer ?? (() => document.body)}
    >
      {children}
    </Popover>
  );
};
