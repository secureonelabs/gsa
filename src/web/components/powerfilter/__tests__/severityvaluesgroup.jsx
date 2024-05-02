/* Copyright (C) 2019-2022 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import {describe, test, expect, testing} from '@gsa/testing';

import Filter from 'gmp/models/filter';

import {render, fireEvent} from 'web/utils/testing';

import {
  clickElement,
  getElementOrDocument,
  getSelectItemElements,
  openSelectElement,
} from 'web/components/testing';

import SeverityValuesGroup from '../severityvaluesgroup';

const getTitle = element => {
  element = getElementOrDocument(element);
  return element.querySelector('.mantine-Text-root');
};

const getSeverityInput = element => {
  element = getElementOrDocument(element);
  return element.querySelector('.mantine-NumberInput-input');
};

describe('Severity Values Group Tests', () => {
  test('should render', () => {
    const filter = Filter.fromString('severity>3');
    const name = 'severity';
    const onChange = testing.fn();

    const {element} = render(
      <SeverityValuesGroup
        filter={filter}
        name={name}
        title="foo"
        onChange={onChange}
      />,
    );

    expect(element).toBeInTheDocument();
  });

  test('arguments are processed correctly', () => {
    const onChange = testing.fn();
    const filter = Filter.fromString('severity=3');
    const name = 'severity';

    const {debug} = render(
      <SeverityValuesGroup
        filter={filter}
        name={name}
        title="foo"
        onChange={onChange}
      />,
    );

    debug();

    const numField = getSeverityInput();

    expect(getTitle()).toHaveTextContent('foo');
    expect(numField).toHaveAttribute('name', 'severity');
    expect(numField).toHaveAttribute('value', '3');
  });

  test('should initialize value with 0 in case no filter value is given', () => {
    const onChange = testing.fn();
    const filter = Filter.fromString('rows=10');
    const name = 'severity';

    render(
      <SeverityValuesGroup
        filter={filter}
        name={name}
        title="foo"
        onChange={onChange}
      />,
    );

    const numField = getSeverityInput();

    expect(numField).toHaveAttribute('name', 'severity');
    expect(numField).toHaveAttribute('value', '0');
  });

  test('should change value', () => {
    const onChange = testing.fn();
    const filter = Filter.fromString('severity=3');
    const name = 'severity';

    render(
      <SeverityValuesGroup
        filter={filter}
        name={name}
        title="foo"
        onChange={onChange}
      />,
    );

    const numField = getSeverityInput();

    fireEvent.change(numField, {target: {value: '9'}});

    expect(onChange).toHaveBeenCalledWith(9, 'severity', '=');
  });

  test('should change relationship', async () => {
    const onChange = testing.fn();
    const filter = Filter.fromString('severity=3');
    const name = 'severity';

    render(
      <SeverityValuesGroup
        filter={filter}
        name={name}
        title="foo"
        onChange={onChange}
      />,
    );

    await openSelectElement();

    const domItems = getSelectItemElements();

    await clickElement(domItems[3]);

    expect(onChange).toBeCalled();
    expect(onChange).toBeCalledWith(3, 'severity', '<');
  });
});
