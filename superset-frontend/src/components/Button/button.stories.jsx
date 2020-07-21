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
import { action } from '@storybook/addon-actions';
import { withKnobs, boolean, select } from '@storybook/addon-knobs';
import Button from './index'

export default {
  title: 'Button',
  component: Button,
  decorators: [withKnobs],
};

const bsStyleKnob = {
  label: 'Types',
  options: {
    Primary: 'primary',
    Secondary: 'secondary',
    Danger: 'danger',
    Warning: 'warning',
    Success: 'success',
    Link: 'link',
    Default: 'default',
    None: null,
  },
  defaultValue: null,
  // groupId: 'ButtonType',
};
const bsSizeKnob = {
  label: 'Sizes',
  options: {
    XS: 'xsmall',
    S: 'small',
    M: 'medium',
    L: 'large',
    None: null,
  },
  defaultValue: null,
};
// TODO remove the use of these in the codebase where they're not necessary
// const classKnob = {
//   label: 'Known Classes',
//   options: {
//     Refresh: 'refresh-btn',
//     Primary: 'btn-primary',
//     Reset: 'reset',
//     Fetch: 'fetch',
//     Query: 'query',
//     saveBtn: 'save-btn',
//     MR3: 'm-r-3',
//     cancelQuery: 'cancelQuery',
//     toggleSave: 'toggleSave',
//     toggleSchedule: 'toggleSchedule',
//     autocomplete: 'autocomplete',
//     OK: 'ok',
//     None: null,
//   },
//   defaultValue: null,
// };
const typeKnob = {
  label: 'Type',
  options: {
    Submit: 'submit',
    Button: 'button',
    None: null,
  },
  defaultValue: null,
}
const targetKnob = {
  label: 'Target',
  options: {
    Blank: '_blank',
    None: null,
  },
  defaultValue: null,
}
const hrefKnob = {
  label: 'HREF',
  options: {
    Superset: 'http://https://superset.incubator.apache.org/',
    None: null,
  },
  defaultValue: null,
}

// TODO with tooltip
/* <Button
  bsSize="small"
  onClick={this.onClick}
  tooltip={t('Explore the result set in the data exploration view')}
>
  <InfoTooltipWithTrigger icon="line-chart" placement="top" label="explore" />{' '}
  {t('Explore')}
</Button>; */

//AND this kinda tooltip
/*<Button
  className="modal-trigger"
  tooltip={this.props.tooltip}
  onClick={this.open}
>
  {this.props.triggerNode}
</Button>;*/

//AND with Icon
/*
<Button style={{ position: 'absolute', right: 20 }}>
  <i className="fa fa-clipboard" /> Text
</Button>
*/

export const SupersetButton = () => (
  <Button
    disabled={boolean('Disabled', false)}
    bsStyle={select(
      bsStyleKnob.label,
      bsStyleKnob.options,
      bsStyleKnob.defaultValue,
      bsStyleKnob.groupId,
    )}
    bsSize={select(
      bsSizeKnob.label,
      bsSizeKnob.options,
      bsSizeKnob.defaultValue,
      bsSizeKnob.groupId,
    )}
    onClick={action('clicked')}
    // className={select(
    //   classKnob.label,
    //   classKnob.options,
    //   classKnob.defaultValue,
    //   classKnob.groupId,
    // )}
    type={select(
      typeKnob.label,
      typeKnob.options,
      typeKnob.defaultValue,
      typeKnob.groupId,
    )}
    target={select(
      targetKnob.label,
      targetKnob.options,
      targetKnob.defaultValue,
      targetKnob.groupId,
    )}
    href={select(
      hrefKnob.label,
      hrefKnob.options,
      hrefKnob.defaultValue,
      hrefKnob.groupId,
    )}
  >
    Hello Button
  </Button>
);