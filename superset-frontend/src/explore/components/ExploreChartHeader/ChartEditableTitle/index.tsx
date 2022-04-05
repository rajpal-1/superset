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

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { css, styled, t } from '@superset-ui/core';
import { Tooltip } from 'src/components/Tooltip';
import { useResizeDetector } from 'react-resize-detector';

export type ChartEditableTitleProps = {
  title: string;
  placeholder: string;
  onSave: (title: string) => void;
  canEdit: boolean;
};

const Styles = styled.div`
  ${({ theme }) => css`
    display: flex;
    font-size: ${theme.typography.sizes.xl}px;
    font-weight: ${theme.typography.weights.bold};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    & .chart-title,
    & .chart-title-input {
      display: inline-block;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    & .chart-title {
      cursor: default;
    }
    & .chart-title-input {
      border: none;
      padding: 0;
      outline: none;

      &::placeholder {
        color: ${theme.colors.grayscale.light1};
      }
    }

    & .input-sizer {
      position: absolute;
      left: -9999px;
      display: inline-block;
    }
  `}
`;

export const ChartEditableTitle = ({
  title,
  placeholder,
  onSave,
  canEdit,
}: ChartEditableTitleProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentTitle, setCurrentTitle] = useState(title || '');
  const contentRef = useRef<HTMLInputElement>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  const { width: inputWidth, ref: sizerRef } = useResizeDetector();
  const { width: containerWidth, ref: containerRef } = useResizeDetector({
    refreshMode: 'debounce',
  });

  useEffect(() => {
    if (isEditing && contentRef?.current) {
      contentRef.current.focus();
      // move cursor and scroll to the end
      if (contentRef.current.setSelectionRange) {
        const { length } = contentRef.current.value;
        contentRef.current.setSelectionRange(length, length);
        contentRef.current.scrollLeft = contentRef.current.scrollWidth;
      }
    }
  }, [isEditing]);

  // a trick to make the input grow when user types text
  // we make additional span component, place it somewhere out of view and copy input
  // then we can measure the width of that span to resize the input element
  useLayoutEffect(() => {
    if (sizerRef.current) {
      sizerRef.current.innerHTML = (currentTitle || placeholder).replace(
        /\s/g,
        '&nbsp;',
      );
    }
  }, [currentTitle, placeholder, sizerRef]);

  useEffect(() => {
    if (
      contentRef.current &&
      contentRef.current.scrollWidth > contentRef.current.clientWidth
    ) {
      setShowTooltip(true);
    } else {
      setShowTooltip(false);
    }
  }, [inputWidth, containerWidth]);

  const handleClick = () => {
    if (!canEdit || isEditing) {
      return;
    }
    setIsEditing(true);
  };

  const handleBlur = () => {
    if (!canEdit) {
      return;
    }
    const formattedTitle = currentTitle.trim();
    setCurrentTitle(formattedTitle);
    if (title !== formattedTitle) {
      onSave(formattedTitle);
    }
    setIsEditing(false);
  };

  const handleChange = (ev: any) => {
    if (!canEdit || !isEditing) {
      return;
    }
    setCurrentTitle(ev.target.value);
  };

  const handleKeyPress = (ev: any) => {
    if (!canEdit) {
      return;
    }
    if (ev.key === 'Enter') {
      ev.preventDefault();
      contentRef.current?.blur();
    }
  };

  return (
    <Styles ref={containerRef}>
      <Tooltip
        id="title-tooltip"
        title={showTooltip && currentTitle && !isEditing ? currentTitle : null}
      >
        {canEdit ? (
          <input
            data-test="editable-title-input"
            className="chart-title-input"
            aria-label={t('Chart title')}
            ref={contentRef}
            onChange={handleChange}
            onBlur={handleBlur}
            onClick={handleClick}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            value={currentTitle}
            css={css`
              cursor: ${isEditing ? 'text' : 'pointer'};

              ${inputWidth &&
              inputWidth > 0 &&
              css`
                width: ${inputWidth}px;
              `}
            `}
          />
        ) : (
          <span
            className="chart-title"
            aria-label={t('Chart title')}
            ref={contentRef}
          >
            {currentTitle}
          </span>
        )}
      </Tooltip>
      <span ref={sizerRef} className="input-sizer" aria-hidden tabIndex={-1} />
    </Styles>
  );
};
