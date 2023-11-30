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
import DvtNavigationBarItem, { DvtNavigationBarItemProps } from '.';

export default {
  title: 'Dvt-Components/DvtNavigationBarItem',
  component: DvtNavigationBarItem,
};

export const Default = (args: DvtNavigationBarItemProps) => (
  <DvtNavigationBarItem {...args} />
);

export const Active = (args: DvtNavigationBarItemProps) => (
  <DvtNavigationBarItem {...args} />
);

Default.args = {
  icon: 'calendar',
  label: 'Schedule',
  onClick: () => {},
};

Active.args = {
  icon: 'calendar',
  label: 'Schedule',
  onClick: () => {},
  active: true,
};
