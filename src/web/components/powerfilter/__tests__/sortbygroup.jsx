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
  getRadioInputs,
  getSelectElement,
  getSelectItemElements,
  openSelectElement,
} from 'web/components/testing';

import SortByGroup from '../sortbygroup';

describe('SortByGroup tests', () => {
  test('should render', () => {
    const filter = Filter.fromString('sort');
    const handleSortByChange = testing.fn();
    const handleSortOrderChange = testing.fn();
    const {element} = render(
      <SortByGroup
        by=""
        fields={[{name: 'foo', displayName: 'bar'}]}
        filter={filter}
        order="sort"
        onSortByChange={handleSortByChange}
        onSortOrderChange={handleSortOrderChange}
      />,
    );

    expect(element).toBeInTheDocument();
  });

  test('should render fields', async () => {
    const filter1 = Filter.fromString('sort=severity');
    const handleSortByChange = testing.fn();
    const handleSortOrderChange = testing.fn();

    render(
      <SortByGroup
        by="solution"
        fields={[
          {name: 'severity', displayName: 'Severity'},
          {name: 'solution_type', displayName: 'Solution Type'},
        ]}
        filter={filter1}
        order="sort-reverse"
        onSortByChange={handleSortByChange}
        onSortOrderChange={handleSortOrderChange}
      />,
    );

    await openSelectElement();

    const selectElements = getSelectItemElements();
    expect(selectElements.length).toEqual(2);

    expect(selectElements[0]).toHaveTextContent('Severity');
    expect(selectElements[1]).toHaveTextContent('Solution Type');
  });

  test('should use filter by default', () => {
    const filter1 = Filter.fromString('sort=severity');
    const filter2 = Filter.fromString('sort-reverse=severity');
    const handleSortByChange = testing.fn();
    const handleSortOrderChange = testing.fn();

    const {rerender} = render(
      <SortByGroup
        by="solution"
        fields={[
          {name: 'severity', displayName: 'Severity'},
          {name: 'solution_type', displayName: 'Solution Type'},
        ]}
        filter={filter1}
        order="sort-reverse"
        onSortByChange={handleSortByChange}
        onSortOrderChange={handleSortOrderChange}
      />,
    );

    const radio = getRadioInputs();

    expect(radio[0].checked).toEqual(true);
    expect(radio[1].checked).toEqual(false);

    const selectedValue = getSelectElement();
    expect(selectedValue).toHaveValue('Severity');

    rerender(
      <SortByGroup
        by="solution"
        fields={[
          {name: 'severity', displayName: 'Severity'},
          {name: 'solution_type', displayName: 'Solution Type'},
        ]}
        filter={filter2}
        order="sort-reverse"
        onSortByChange={handleSortByChange}
        onSortOrderChange={handleSortOrderChange}
      />,
    );

    expect(radio[0].checked).toEqual(false);
    expect(radio[1].checked).toEqual(true);

    expect(selectedValue).toHaveValue('Severity');
  });

  test('should use by and order', () => {
    const handleSortByChange = testing.fn();
    const handleSortOrderChange = testing.fn();
    render(
      <SortByGroup
        by="solution_type"
        fields={[
          {name: 'severity', displayName: 'Severity'},
          {name: 'solution_type', displayName: 'Solution Type'},
        ]}
        order="sort-reverse"
        onSortByChange={handleSortByChange}
        onSortOrderChange={handleSortOrderChange}
      />,
    );

    const radio = getRadioInputs();

    expect(radio[0].checked).toEqual(false);
    expect(radio[1].checked).toEqual(true);

    const selectedValue = getSelectElement();

    expect(selectedValue).toHaveValue('Solution Type');
  });

  test('should call change handler of select', async () => {
    const filter = Filter.fromString('sort');
    const handleSortByChange = testing.fn();
    const handleSortOrderChange = testing.fn();

    render(
      <SortByGroup
        by=""
        fields={[
          {name: 'severity', displayName: 'Severity'},
          {name: 'solution_type', displayName: 'Solution Type'},
        ]}
        filter={filter}
        order="sort"
        onSortByChange={handleSortByChange}
        onSortOrderChange={handleSortOrderChange}
      />,
    );

    await openSelectElement();

    const selectElements = getSelectItemElements();
    expect(selectElements.length).toEqual(2);

    await clickElement(selectElements[1]);

    expect(handleSortByChange).toHaveBeenCalledWith('solution_type', 'sort_by');
  });

  test('should call change handler of radio button', () => {
    const filter = Filter.fromString('sort');
    const handleSortByChange = testing.fn();
    const handleSortOrderChange = testing.fn();

    render(
      <SortByGroup
        by=""
        fields={[
          {name: 'severity', displayName: 'Severity'},
          {name: 'solution_type', displayName: 'Solution Type'},
        ]}
        filter={filter}
        order="sort"
        onSortByChange={handleSortByChange}
        onSortOrderChange={handleSortOrderChange}
      />,
    );

    const radio = getRadioInputs();
    fireEvent.click(radio[1]);

    expect(handleSortOrderChange).toHaveBeenCalledWith(
      'sort-reverse',
      'sort_order',
    );
  });
});
