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
import Select from 'src/components/Select/Select';
import { t, styled } from '@superset-ui/core';
import Alert from 'src/components/Alert';
import Button from 'src/components/Button';

import ModalTrigger, { ModalTriggerRef } from 'src/components/ModalTrigger';
import { FormLabel } from 'src/components/Form';
import { propertyComparator } from 'src/components/Select/utils';

const StyledModalTrigger = styled(ModalTrigger)`
  .ant-modal-body {
    overflow: visible;
  }
`;

const RefreshWarningContainer = styled.div`
  margin-top: ${({ theme }) => theme.gridUnit * 6}px;
`;

type RefreshIntervalModalProps = {
  addSuccessToast: (msg: string) => void;
  triggerNode: JSX.Element;
  refreshFrequency: number;
  onChange: (refreshLimit: number, editMode: boolean) => void;
  editMode: boolean;
  refreshLimit?: number;
  refreshWarning: string | null;
  refreshIntervalOptions: [number, string][];
};

type RefreshIntervalModalState = {
  refreshFrequency: number;
};

class RefreshIntervalModal extends React.PureComponent<
  RefreshIntervalModalProps,
  RefreshIntervalModalState
> {
  static defaultProps = {
    refreshLimit: 0,
    refreshWarning: null,
  };

  modalRef: ModalTriggerRef | null;

  constructor(props: RefreshIntervalModalProps) {
    super(props);
    this.modalRef = React.createRef() as ModalTriggerRef;
    this.state = {
      refreshFrequency: props.refreshFrequency,
    };
    this.handleFrequencyChange = this.handleFrequencyChange.bind(this);
    this.onSave = this.onSave.bind(this);
    this.onCancel = this.onCancel.bind(this);
  }

  onSave() {
    this.props.onChange(this.state.refreshFrequency, this.props.editMode);
    this.modalRef?.current?.close();
    this.props.addSuccessToast(t('Refresh interval saved'));
  }

  onCancel() {
    this.setState({
      refreshFrequency: this.props.refreshFrequency,
    });
    this.modalRef?.current?.close();
  }

  handleFrequencyChange(value: number) {
    const { refreshIntervalOptions } = this.props;
    this.setState({
      refreshFrequency: value || refreshIntervalOptions[0][0],
    });

    const custom_block = document.getElementById('custom_block_view');
    if (value === -1) {
      if (custom_block) {
        custom_block.style.visibility = 'visible';
      }
    } else if (custom_block) {
      custom_block.style.visibility = 'hidden';
    }
  }

  onSaveValue(value: number) {
    this.props.onChange(value, this.props.editMode);
    this.modalRef?.current?.close();
    this.props.addSuccessToast(t('Refresh interval saved'));
  }

  createIntervalOptions(refreshIntervalOptions: [number, string][]) {
    const refresh_options = [];
    refresh_options.push({
      value: refreshIntervalOptions[0][0],
      label: t(refreshIntervalOptions[0][1]),
    });
    refresh_options.push({ value: -1, label: 'Custom interval' });
    for (let i = 1; i < refreshIntervalOptions.length; i += 1)
      refresh_options.push({
        value: refreshIntervalOptions[i][0],
        label: t(refreshIntervalOptions[i][1]),
      });
    return refresh_options;
  }

  render() {
    const {
      refreshLimit = 0,
      refreshWarning,
      editMode,
      refreshIntervalOptions,
    } = this.props;
    const { refreshFrequency = 0 } = this.state;
    const showRefreshWarning =
      !!refreshFrequency && !!refreshWarning && refreshFrequency < refreshLimit;

    return (
      <StyledModalTrigger
        ref={this.modalRef}
        triggerNode={this.props.triggerNode}
        modalTitle={t('Refresh interval')}
        modalBody={
          <div>
            <div id="refresh_from_dropdown">
              <FormLabel>
                <b>{t('Refresh frequency')}</b>
              </FormLabel>
              <Select
                ariaLabel={t('Refresh interval')}
                options={this.createIntervalOptions(refreshIntervalOptions)}
                value={refreshFrequency}
                onChange={this.handleFrequencyChange}
                sortComparator={propertyComparator('value')}
              />
            </div>
            <div
              style={{
                visibility: refreshFrequency === -1 ? 'visible' : 'hidden',
                display: 'flex',
                gap: '3%',
                marginTop: '15px',
              }}
              id="custom_block_view"
            >
              <div style={{ minWidth: 0, margin: 'auto' }}>
                <FormLabel>
                  <b>{t('HOUR')}</b>
                </FormLabel>{' '}
                <br />
                <input
                  type="number"
                  min="0"
                  style={{
                    border: '1px solid lightgrey',
                    borderRadius: '3px',
                    maxWidth: '100%',
                    padding: '5px',
                  }}
                  id="custom_refresh_frequency_hour"
                  placeholder="Type a number"
                />
              </div>
              <div style={{ minWidth: 0, margin: 'auto' }}>
                <FormLabel>
                  <b>{t('MINUTE')}</b>
                </FormLabel>{' '}
                <br />
                <input
                  type="number"
                  min="0"
                  style={{
                    border: '1px solid lightgrey',
                    borderRadius: '3px',
                    maxWidth: '100%',
                    padding: '5px',
                  }}
                  id="custom_refresh_frequency_minute"
                  placeholder="Type a number"
                />
              </div>
              <div style={{ minWidth: 0, margin: 'auto' }}>
                <FormLabel>
                  <b>{t('SECOND')}</b>
                </FormLabel>{' '}
                <br />
                <input
                  type="number"
                  min="0"
                  style={{
                    border: '1px solid lightgrey',
                    borderRadius: '3px',
                    maxWidth: '100%',
                    padding: '5px',
                  }}
                  id="custom_refresh_frequency_second"
                  placeholder="Type a number"
                />
              </div>
            </div>
            {showRefreshWarning && (
              <RefreshWarningContainer>
                <Alert
                  type="warning"
                  message={
                    <>
                      <div>{refreshWarning}</div>
                      <br />
                      <strong>{t('Are you sure you want to proceed?')}</strong>
                    </>
                  }
                />
              </RefreshWarningContainer>
            )}
          </div>
        }
        modalFooter={
          <>
            <Button onClick={this.onCancel} buttonSize="small">
              {t('Cancel')}
            </Button>
            <Button
              buttonStyle="primary"
              buttonSize="small"
              onClick={() => {
                const custom_block =
                  document.getElementById('custom_block_view');
                if (
                  custom_block &&
                  custom_block.style.visibility === 'visible'
                ) {
                  // Get hour value
                  const hour = document.getElementById(
                    'custom_refresh_frequency_hour',
                  );
                  const hour_value = Number(
                    (hour as HTMLInputElement).value || 0,
                  );

                  // Get minutes value
                  const minute = document.getElementById(
                    'custom_refresh_frequency_minute',
                  );
                  const minute_value = Number(
                    (minute as HTMLInputElement).value || 0,
                  );

                  // Get seconds value
                  const second = document.getElementById(
                    'custom_refresh_frequency_second',
                  );
                  const second_value = Number(
                    (second as HTMLInputElement).value || 0,
                  );

                  if (hour_value < 0 || minute_value < 0 || second_value < 0) {
                    this.props.addSuccessToast(t('Put positive values'));
                    if (hour) {
                      (hour as HTMLInputElement).value = '';
                    }
                    if (minute) {
                      (minute as HTMLInputElement).value = '';
                    }
                    if (second) {
                      (second as HTMLInputElement).value = '';
                    }
                    return;
                  }
                  // Convert given input to seconds
                  const value =
                    hour_value * 60 * 60 + minute_value * 60 + second_value;
                  if (value === 0) {
                    this.props.addSuccessToast(
                      t('Put some positive value greater than 0'),
                    );
                    return;
                  }
                  this.handleFrequencyChange(value);
                  this.onSaveValue(value);
                } else this.onSave();
              }}
            >
              {editMode ? t('Save') : t('Save for this session')}
            </Button>
          </>
        }
      />
    );
  }
}

export default RefreshIntervalModal;
