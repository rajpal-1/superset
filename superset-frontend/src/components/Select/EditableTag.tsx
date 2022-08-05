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

import React, { Dispatch, SetStateAction, useRef, useState } from 'react';
import { SelectValue as AntdSelectValue } from 'antd/lib/select';
import { Tag } from 'antd';
import { Input } from '../Input';

export type CustomTagProps = {
  label: React.ReactNode;
  value: any;
  disabled: boolean;
  onClose: (event?: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  closable: boolean;
};

export interface EditableTagProps extends CustomTagProps {
  selectValue: AntdSelectValue | undefined;
  setSelectValue: Dispatch<SetStateAction<AntdSelectValue | undefined>>;
  onChange?: (value: any, option: any) => void;
}

const EditableTag = (props: EditableTagProps) => {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(props.value);
  const inputRef = useRef(null);

  const updateValue = () => {
    setEditing(false);
    if (Array.isArray(props.selectValue)) {
      const array = props.selectValue as string[];
      const v: string[] = array
        .map(e => (e === props.value ? value : e))
        .filter(e => e !== '');
      props.setSelectValue(value);
      if (props.onChange) {
        props.onChange(v, null);
      }
    } else {
      props.setSelectValue(value);
    }
  };

  // Sometimes an empty tag will appear for some reason if this is not included.
  if (!props.value || props.value === '') {
    return null;
  }

  return (
    <Tag
      closable
      onDoubleClick={() => {
        setEditing(true);
        if (inputRef.current) {
        }
      }}
      onClose={props.onClose}
    >
      {editing ? (
        <Input
          style={{ width: '95%' }}
          autoFocus
          onBlur={event => updateValue()}
          onKeyDown={event => {
            if (event.key === 'Backspace') {
              event.stopPropagation();
            } else if (event.key === 'Enter') {
              updateValue();
              event.stopPropagation();
            }
          }}
          ref={inputRef}
          value={value}
          onChange={event => setValue(event.target.value)}
        />
      ) : (
        props.value
      )}
    </Tag>
  );
};

export default EditableTag;
