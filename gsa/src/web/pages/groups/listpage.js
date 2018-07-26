/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 - 2018 Greenbone Networks GmbH
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

import _ from 'gmp/locale';

import {GROUPS_FILTER_FILTER} from 'gmp/models/filter';

import PropTypes from 'web/utils/proptypes';
import withCapabilities from 'web/utils/withCapabilities';

import EntitiesPage from 'web/entities/page';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';

import ManualIcon from 'web/components/icon/manualicon';
import NewIcon from 'web/components/icon/newicon';

import IconDivider from 'web/components/layout/icondivider';

import {createFilterDialog} from 'web/components/powerfilter/dialog';

import GroupComponent from './component';
import Table, {SORT_FIELDS} from './table';

const ToolBarIcons = withCapabilities(({
  capabilities,
  onGroupCreateClick,
}) => (
  <IconDivider>
    <ManualIcon
      page="gui_administration"
      anchor="groups"
      title={_('Help: Groups')}
    />
    {capabilities.mayCreate('group') &&
      <NewIcon
        title={_('New Group')}
        onClick={onGroupCreateClick}
      />
    }
  </IconDivider>
));

ToolBarIcons.propTypes = {
  onGroupCreateClick: PropTypes.func.isRequired,
};

const GroupsFilterDialog = createFilterDialog({sortFields: SORT_FIELDS});

const GroupsPage = ({
  onChanged,
  onDownloaded,
  onError,
  ...props
}) => (
  <GroupComponent
    onCreated={onChanged}
    onSaved={onChanged}
    onCloned={onChanged}
    onCloneError={onError}
    onDeleted={onChanged}
    onDeleteError={onError}
    onDownloaded={onDownloaded}
    onDownloadError={onError}
  >
    {({
      clone,
      create,
      delete: delete_func,
      download,
      edit,
      save,
    }) => (
      <EntitiesPage
        {...props}
        filterEditDialog={GroupsFilterDialog}
        sectionIcon="group.svg"
        table={Table}
        title={_('Groups')}
        toolBarIcons={ToolBarIcons}
        onChanged={onChanged}
        onDownloaded={onDownloaded}
        onError={onError}
        onGroupCloneClick={clone}
        onGroupCreateClick={create}
        onGroupDeleteClick={delete_func}
        onGroupDownloadClick={download}
        onGroupEditClick={edit}
        onGroupSaveClick={save}
      />
    )}
  </GroupComponent>
);

GroupsPage.propTypes = {
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
};

export default withEntitiesContainer('group', {
  filtersFilter: GROUPS_FILTER_FILTER,
})(GroupsPage);

// vim: set ts=2 sw=2 tw=80:
