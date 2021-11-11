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
import PropTypes from 'prop-types';
import { isFunction } from 'lodash';
import { Select } from 'src/components';
import { Tooltip } from 'src/components/Tooltip';
import { styled, t } from '@superset-ui/core';
import Icons from 'src/components/Icons';
import ControlHeader from 'src/explore/components/ControlHeader';

const propTypes = {
  hasCustomLabelColors: PropTypes.bool,
  description: PropTypes.string,
  label: PropTypes.string,
  labelMargin: PropTypes.number,
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func,
  value: PropTypes.string,
  clearable: PropTypes.bool,
  default: PropTypes.string,
  choices: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.array),
    PropTypes.func,
  ]),
  schemes: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
  isLinear: PropTypes.bool,
};

const defaultProps = {
  choices: [],
  hasCustomLabelColors: false,
  label: t('Color scheme'),
  schemes: {},
  clearable: false,
  onChange: () => {},
};

const StyledAlert = styled(Icons.AlertSolid)`
  color: ${({ theme }) => theme.colors.alert.base};
`;

export default class ColorSchemeControl extends React.PureComponent {
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.renderOption = this.renderOption.bind(this);
    this.renderLabel = this.renderLabel.bind(this);
  }

  onChange(value) {
    this.props.onChange(value);
  }

  renderOption(value) {
    const { isLinear } = this.props;
    const currentScheme = this.schemes[value];

    // For categorical scheme, display all the colors
    // For sequential scheme, show 10 or interpolate to 10.
    // Sequential schemes usually have at most 10 colors.
    let colors = [];
    if (currentScheme) {
      colors = isLinear ? currentScheme.getColors(10) : currentScheme.colors;
    }

    return (
      <Tooltip id={`${currentScheme.id}-tooltip`} title={currentScheme.label}>
        <ul
          css={{
            listStyle: 'none',
            margin: 0,
            padding: 0,
            display: 'flex',
            alignItems: 'center',

            '& li': {
              flexBasis: 9,
              height: 10,
              margin: '9px 1px',
            },
          }}
          data-test={currentScheme.id}
        >
          {colors.map((color, i) => (
            <li
              key={`${currentScheme.id}-${i}`}
              css={{
                backgroundColor: color,
                border: `1px solid ${color === 'white' ? 'black' : color}`,
              }}
            >
              &nbsp;
            </li>
          ))}
        </ul>
      </Tooltip>
    );
  }

  renderLabel() {
    const { hasCustomLabelColors, label } = this.props;

    if (hasCustomLabelColors) {
      return (
        <>
          {label}{' '}
          <Tooltip
            title={t(
              `This color scheme is being overriden by custom label colors. 
              Check the JSON metadata in the Advanced settings of the dashboard`,
            )}
          >
            <StyledAlert iconSize="s" />
          </Tooltip>
        </>
      );
    }
    return label;
  }

  render() {
    const { choices, schemes } = this.props;
    // save parsed schemes for later
    this.schemes = isFunction(schemes) ? schemes() : schemes;
    const controlChoices = isFunction(choices) ? choices() : choices;
    const allColorOptions = [];
    const filteredColorOptions = controlChoices.filter(o => {
      const option = o[0];
      const isValidColorOption =
        option !== 'SUPERSET_DEFAULT' && !allColorOptions.includes(option);
      allColorOptions.push(option);
      return isValidColorOption;
    });
    const options = filteredColorOptions.map(([value]) => ({
      customLabel: this.renderOption(value),
      label: this.schemes?.[value]?.label || value,
      value,
    }));
    let currentScheme =
      this.props.value ||
      (this.props.default !== undefined ? this.props.default : undefined);

    if (currentScheme === 'SUPERSET_DEFAULT') {
      currentScheme = this.schemes?.SUPERSET_DEFAULT?.id;
    }

    const selectProps = {
      ariaLabel: t('Select color scheme'),
      allowClear: this.props.clearable,
      name: `select-${this.props.name}`,
      onChange: this.onChange,
      options,
      placeholder: `Select (${options.length})`,
      value: currentScheme,
    };
    return (
      <Select
        header={<ControlHeader {...this.props} label={this.renderLabel()} />}
        {...selectProps}
      />
    );
  }
}

ColorSchemeControl.propTypes = propTypes;
ColorSchemeControl.defaultProps = defaultProps;
