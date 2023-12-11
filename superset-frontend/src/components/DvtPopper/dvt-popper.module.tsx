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
import { styled } from '@superset-ui/core';

interface DvtPopperProps {
  direction: string;
}

const StyledPopper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
`;

const StyledPopperUp = styled.div`
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-bottom: 20px solid ${({ theme }) => theme.colors.dvt.primary.base};
`;

const StyledPopperBody = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.dvt.primary.base};
  border-radius: 4px;
  height: 44px;
  color: ${({ theme }) => theme.colors.grayscale.light5};
  font-size: 16px;
  font-weight: 500;
  line-height: 140%;
  letter-spacing: 0.2px;
  cursor: pointer;
  padding: 0 17px;
`;

const StyledPopperGroup = styled.div``;

const StyledPopperAbsolute = styled.div<DvtPopperProps>`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: absolute;
  top: ${({ direction }) => (direction === 'top' ? '0' : 'auto')};
  bottom: ${({ direction }) => (direction === 'bottom' ? '0' : 'auto')};
  right: ${({ direction }) => (direction === 'right' ? '0' : 'auto')};
  left: ${({ direction }) => (direction === 'left' ? '0' : 'auto')};
`;

export {
  StyledPopper,
  StyledPopperUp,
  StyledPopperBody,
  StyledPopperGroup,
  StyledPopperAbsolute,
};
