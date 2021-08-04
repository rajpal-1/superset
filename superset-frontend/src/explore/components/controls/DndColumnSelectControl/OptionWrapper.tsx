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
import React, { useRef } from 'react';
import {
  useDrag,
  useDrop,
  DropTargetMonitor,
  DragSourceMonitor,
} from 'react-dnd';
import { DragContainer } from 'src/explore/components/controls/OptionControls';
import { DndItemType } from 'src/explore/components/DndItemType';
import {
  OptionProps,
  OptionItemInterface,
} from 'src/explore/components/controls/DndColumnSelectControl/types';
import { Tooltip } from 'src/components/Tooltip';
import { StyledColumnOption } from 'src/explore/components/optionRenderers';
import { styled } from '@superset-ui/core';
import Option from './Option';

export const OptionLabel = styled.div`
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export default function OptionWrapper(
  props: OptionProps & {
    type: DndItemType;
    onShiftOptions: (dragIndex: number, hoverIndex: number) => void;
  },
) {
  const {
    index,
    label,
    column,
    type,
    onShiftOptions,
    clickClose,
    withCaret,
    isExtra,
    canDelete = true,
    ...rest
  } = props;
  const ref = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  const item: OptionItemInterface = {
    dragIndex: index,
    type,
  };
  const [{ isDragging }, drag] = useDrag({
    item,
    collect: (monitor: DragSourceMonitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: type,

    hover: (item: OptionItemInterface, monitor: DropTargetMonitor) => {
      if (!ref.current) {
        return;
      }
      const { dragIndex } = item;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }
      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      // Determine mouse position
      const clientOffset = monitor.getClientOffset();
      // Get pixels to the top
      const hoverClientY = clientOffset?.y
        ? clientOffset?.y - hoverBoundingRect.top
        : 0;
      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%
      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Time to actually perform the action
      onShiftOptions(dragIndex, hoverIndex);
      // eslint-disable-next-line no-param-reassign
      item.dragIndex = hoverIndex;
    },
  });

  const shouldShowTooltip = () => {
    if (labelRef && labelRef.current) {
      console.log("SCROLL WIDTH OPTION WRAPPER", labelRef.current.scrollWidth);
      console.log("CLIENT WIDTH OPTION", labelRef.current.clientWidth);
      return labelRef.current.scrollWidth > labelRef.current.clientWidth;
    }
    return false;
  };

  const Label = () => {
    if (label) {
      const showTooltip = !isDragging && shouldShowTooltip();
      if (!showTooltip) {
        return <>{label}</>;
      }
      return <Tooltip title={label}>{label}</Tooltip>;
    }
    return null;
  };

  const ColumnOption = () => {
    if (column) {
      const showTooltip = !isDragging && shouldShowTooltip();
      return (
        <StyledColumnOption
          column={column}
          labelRef={labelRef}
          showTooltip={showTooltip}
          showType
        />
      );
    }
    return null;
  };

  const LabelContent = () => {
    if (label) {
      return <Label />;
    }
    if (column) {
      return <ColumnOption />;
    }
    return null;
  };

  drag(drop(ref));

  return (
    <DragContainer ref={ref} {...rest}>
      <Option
        index={index}
        clickClose={clickClose}
        withCaret={withCaret}
        isExtra={isExtra}
        canDelete={canDelete}
      >
        <OptionLabel ref={label ? labelRef : undefined}>
          <LabelContent />
        </OptionLabel>
      </Option>
    </DragContainer>
  );
}
