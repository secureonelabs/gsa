/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Icon from 'web/components/icon/svg/target.svg';
import withSvgIcon from 'web/components/icon/withSvgIcon';

const TargetIconComponent = withSvgIcon()(Icon);

const TargetIcon = props => (
  <TargetIconComponent {...props} data-testid="target-icon" />
);

export default TargetIcon;
