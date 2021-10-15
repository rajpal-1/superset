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
import PropTypes from 'prop-types';
import React from 'react';
import { CategoricalColorNamespace } from '@superset-ui/core';

const propTypes = {
  onChange: PropTypes.func,
  value: PropTypes.object,
  colorScheme: PropTypes.string,
  colorNamespace: PropTypes.string,
};

const defaultProps = {
  onChange: () => {},
  value: {},
  colorScheme: undefined,
  colorNamespace: undefined,
};

export default class ColorMapControl extends React.PureComponent {
  constructor(props) {
    super(props);
    const colorMap = this.props.value;
    const categoricalNamespace = CategoricalColorNamespace.getNamespace(
      this.props.colorNamespace,
    );
    Object.keys(colorMap).forEach(label => {
      categoricalNamespace.setColor(label, colorMap[label]);
    });
  }

  render() {
    return null;
  }
}

ColorMapControl.propTypes = propTypes;
ColorMapControl.defaultProps = defaultProps;
