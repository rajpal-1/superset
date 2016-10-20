import React from 'react';
import Link from '../../../javascripts/SqlLab/components/Link';
import TableElement from '../../../javascripts/SqlLab/components/TableElement';
import { table } from './common'
import { Button } from 'react-bootstrap';
import { mount, shallow } from 'enzyme';
import { describe, it } from 'mocha';
import { expect } from 'chai';


describe('TableElement', () => {

  const mockedProps = {
    'table': table,
  }
  it('should just render', () => {
    expect(
      React.isValidElement(<TableElement />)
    ).to.equal(true);
  });
  it('should render with props', () => {
    expect(
      React.isValidElement(<TableElement {...mockedProps} />)
    ).to.equal(true);
  });
  it('has 3 Link elements', () => {
    const wrapper = shallow(<TableElement {...mockedProps} />);
    expect(wrapper.find(Link)).to.have.length(2);
  });
  it('has 14 columns', () => {
    const wrapper = shallow(<TableElement {...mockedProps} />);
    expect(wrapper.find('div.table-column')).to.have.length(14);
  });
  it('mounts', () => {
    const wrapper = mount(<TableElement {...mockedProps} />);
  });
});
