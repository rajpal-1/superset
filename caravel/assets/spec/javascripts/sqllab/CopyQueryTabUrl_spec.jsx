import React from 'react';
import CopyQueryTabUrl from '../../../javascripts/SqlLab/components/CopyQueryTabUrl';
import { Tab } from 'react-bootstrap';
import { mount, shallow } from 'enzyme';
import { describe, it } from 'mocha';
import { expect } from 'chai';
import { initialState } from './common';

describe('CopyQueryTabUrl', () => {
  const mockedProps = {
    queryEditor: initialState.queryEditors[0],
  };
  it('should be valid', () => {
    expect(React.isValidElement(<CopyQueryTabUrl />)).to.equal(true);
  });
  it('should render with props', () => {
    expect(
      React.isValidElement(<CopyQueryTabUrl {...mockedProps} />)
    ).to.equal(true);
  });
  it('shallow mounts', () => {
    const wrapper = shallow(<CopyQueryTabUrl {...mockedProps} />);
    //expect(wrapper.find(Tab)).to.have.length(2);
  });
});
