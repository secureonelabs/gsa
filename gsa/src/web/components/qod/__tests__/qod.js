/* Copyright (C) 2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import React from 'react';

import Qod from 'web/components/qod/qod';

import {render} from 'web/utils/testing';

describe('Qod tests', () => {

  test('should render Qod value', () => {
    const {element} = render(<Qod value="42"/>);
    const {element: element2} = render(<Qod value={42}/>);

    expect(element).toMatchSnapshot();
    expect(element2).toMatchSnapshot();
  });

  test('should prevent linebreaks', () => {
    const {element} = render(<Qod value="42"/>);

    expect(element).toHaveStyleRule('white-space', 'nowrap');
  });
});

// vim: set ts=2 sw=2 tw=80:
