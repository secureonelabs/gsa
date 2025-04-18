/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';
import {parseInt} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';
import {shorten} from 'gmp/utils/string';
import React, {useState} from 'react';
import useEntityClone from 'web/entity/hooks/useEntityClone';
import useEntityDelete from 'web/entity/hooks/useEntityDelete';
import useEntityDownload from 'web/entity/hooks/useEntityDownload';
import useEntitySave from 'web/entity/hooks/useEntitySave';
import useGmp from 'web/hooks/useGmp';
import PortListsDialog from 'web/pages/portlists/Dialog';
import ImportPortListDialog from 'web/pages/portlists/ImportDialog';
import PortRangeDialog, {
  PortRangeDialogData,
} from 'web/pages/portlists/PortRangeDialog';

interface PortList {
  id: string;
  name: string;
  comment: string;
  port_ranges: PortRange[];
}

interface PortRange {
  end: string;
  entityType: string;
  id: string;
  protocol_type: string;
  start: string;
  isTmp: boolean;
}

interface PortListComponentProps {
  children: (props: {
    clone: (entity: PortList) => void;
    download: (entity: PortList) => void;
    delete: (entity: PortList) => void;
    create: () => void;
    edit: (entity: PortList) => void;
    import: () => void;
  }) => React.ReactNode;
  onCloneError?: (error: unknown) => void;
  onCloned?: (newEntity: unknown) => void;
  onCreateError?: (error: unknown) => void;
  onCreated?: (response: unknown) => void;
  onDeleteError?: (error: unknown) => void;
  onDeleted?: () => void;
  onDownloadError?: (error: unknown) => void;
  onDownloaded?: (response: unknown) => void;
  onImportError?: (error: unknown) => void;
  onImported?: (response: unknown) => void;
  onInteraction?: () => void;
  onSaveError?: (error: unknown) => void;
  onSaved?: (response: unknown) => void;
}

const PortListComponent: React.FC<PortListComponentProps> = ({
  children,
  onCloned,
  onCloneError,
  onCreated,
  onCreateError,
  onDeleted,
  onDeleteError,
  onDownloaded,
  onDownloadError,
  onInteraction,
  onSaved,
  onSaveError,
  onImported,
  onImportError,
}) => {
  const gmp = useGmp();
  const [importDialogVisible, setImportDialogVisible] = useState(false);
  const [portListDialogVisible, setPortListDialogVisible] = useState(false);
  const [portRangeDialogVisible, setPortRangeDialogVisible] = useState(false);
  const [portListDialogTitle, setPortListDialogTitle] = useState<
    string | undefined
  >();
  const [portList, setPortList] = useState<PortList | undefined>();
  const [portRanges, setPortRanges] = useState<PortRange[]>([]);
  const [createdPortRanges, setCreatedPortRanges] = useState<PortRange[]>([]);
  const [deletedPortRanges, setDeletedPortRanges] = useState<PortRange[]>([]);

  const handleInteraction = () => {
    if (isDefined(onInteraction)) {
      onInteraction();
    }
  };

  const handleSave = useEntitySave('portlist', {
    onCreateError,
    onCreated,
    onSaveError,
    onSaved,
    onInteraction,
  });
  const handleClone = useEntityClone('portlist', {
    onCloned,
    onCloneError,
    onInteraction,
  });
  const handleDownload = useEntityDownload('portlist', {
    onDownloadError,
    onDownloaded,
    onInteraction,
  });
  const handleDelete = useEntityDelete('portlist', {
    onDeleteError,
    onDeleted,
    onInteraction,
  });

  const openPortListDialog = async (entity?: PortList) => {
    if (entity) {
      // edit
      // @ts-expect-error
      const response = await gmp.portlist.get(entity);
      const portList: PortList = response.data;
      setCreatedPortRanges([]);
      setDeletedPortRanges([]);
      setPortListDialogTitle(
        _('Edit Port List {{name}}', {name: shorten(portList.name)}),
      );
      setPortList(portList);
      setPortListDialogVisible(true);
      setPortRanges(portList.port_ranges);
    } else {
      // create
      setCreatedPortRanges([]);
      setDeletedPortRanges([]);
      setPortList(undefined);
      setPortListDialogVisible(true);
      setPortListDialogTitle(_('New Port List'));
      setPortRanges([]);
    }

    handleInteraction();
  };

  const closePortListDialog = () => {
    setPortListDialogVisible(false);
  };

  const handleClosePortListDialog = () => {
    closePortListDialog();
    handleInteraction();
  };

  const openImportDialog = () => {
    setImportDialogVisible(true);
    handleInteraction();
  };

  const closeImportDialog = () => {
    setImportDialogVisible(false);
  };

  const handleCloseImportDialog = () => {
    closeImportDialog();
    handleInteraction();
  };

  const openNewPortRangeDialog = () => {
    setPortRangeDialogVisible(true);
    handleInteraction();
  };

  const closeNewPortRangeDialog = () => {
    setPortRangeDialogVisible(false);
  };

  const handleCloseNewPortRangeDialog = () => {
    closeNewPortRangeDialog();
    handleInteraction();
  };

  const handleDeletePortRange = async (range: PortRange) => {
    // @ts-expect-error
    await gmp.portlist.deletePortRange(range);
  };

  const handleSavePortRange = async (data: unknown) => {
    // @ts-expect-error
    const response = await gmp.portlist.createPortRange(data);
    return response.data.id;
  };

  const handleImportPortList = async (data: unknown) => {
    handleInteraction();
    try {
      // @ts-expect-error
      const response = await gmp.portlist.import(data);
      if (isDefined(onImported)) {
        onImported(response);
      }
      closeImportDialog();
    } catch (error) {
      if (isDefined(onImportError)) {
        onImportError(error);
      }
    }
  };

  const handleSavePortList = async (data: {id?: string}) => {
    handleInteraction();

    try {
      const createdPromises = createdPortRanges.map(
        async (range: PortRange) => {
          // save temporary port ranges in the backend
          const id = await handleSavePortRange({
            ...range,
            port_range_start: parseInt(range.start),
            port_range_end: parseInt(range.end),
            port_type: range.protocol_type,
          });
          range.isTmp = false;
          range.id = id;
          // the range has been saved in the backend
          // if something fails the state contains the still to be saved ranges
          setCreatedPortRanges(createdPortRanges =>
            createdPortRanges.filter(pRange => pRange !== range),
          );
        },
      );
      const deletedPromises = deletedPortRanges.map(
        async (range: PortRange) => {
          await handleDeletePortRange(range);
          // the range has been deleted from the backend
          // if something fails the state contains the still to be deleted ranges
          setDeletedPortRanges(deletedPortRanges =>
            deletedPortRanges.filter(pRange => pRange !== range),
          );
        },
      );

      const promises = [...createdPromises, ...deletedPromises];
      await Promise.all(promises);
    } catch (error) {
      if (isDefined(data?.id) && isDefined(onSaveError)) {
        return onSaveError(error);
      } else if (!isDefined(data?.id) && isDefined(onCreateError)) {
        return onCreateError(error);
      }
      throw error;
    }
    await handleSave(data);
    closePortListDialog();
  };

  const handleTmpAddPortRange = (values: PortRangeDialogData) => {
    let {port_range_end, port_range_start, port_type} = values;

    const portRangeEnd = parseInt(port_range_end);
    const portRangeStart = parseInt(port_range_start);

    handleInteraction();

    // reject port ranges with missing values
    if (!portRangeStart || !portRangeEnd) {
      throw new Error(
        _('The port range needs numerical values for start and end!'),
      );
    }

    // reject port ranges with start value lower than end value
    if (portRangeStart > portRangeEnd) {
      throw new Error(
        _('The end of the port range can not be below its start!'),
      );
    }

    // check if new port range overlaps with existing and temporarily existing
    // ones, only relevant if protocol_type is the same
    for (const range of portRanges) {
      const start = parseInt(range.start);
      const end = parseInt(range.end);
      if (!start || !end) {
        continue;
      }

      if (
        range.protocol_type === port_type &&
        (portRangeStart === start ||
          portRangeStart === end ||
          (portRangeStart > start && portRangeStart < end) ||
          portRangeEnd === start ||
          portRangeEnd === end ||
          (portRangeEnd > start && portRangeEnd < end) ||
          (portRangeStart < start && portRangeEnd > end))
      ) {
        throw new Error(_('New port range overlaps with an existing one!'));
      }
    }

    const newRange = {
      end: values.port_range_end,
      entityType: 'portrange',
      id: values.id,
      protocol_type: values.port_type,
      start: values.port_range_start,
      isTmp: true,
    };

    setCreatedPortRanges(createdPortRanges => [...createdPortRanges, newRange]);
    setPortRanges(currentPortRanges => [...currentPortRanges, newRange]);
    closeNewPortRangeDialog();
  };

  const handleTmpDeletePortRange = (portRange: PortRange) => {
    if (portRange.isTmp) {
      // it hasn't been saved yet
      setCreatedPortRanges(createdPortRanges =>
        createdPortRanges.filter(range => range !== portRange),
      );
    } else {
      // we need to delete it from the backend
      setDeletedPortRanges(deletedPortRanges => [
        ...deletedPortRanges,
        portRange,
      ]);
    }

    setPortRanges(portRanges =>
      portRanges.filter(range => range !== portRange),
    );

    handleInteraction();
  };

  const {comment, id, name} = portList || {};
  return (
    <>
      {children({
        clone: handleClone,
        download: handleDownload,
        delete: handleDelete,
        create: openPortListDialog,
        edit: openPortListDialog,
        import: openImportDialog,
      })}
      {portListDialogVisible && (
        <PortListsDialog
          comment={comment}
          id={id}
          name={name}
          // @ts-expect-error
          port_list={portList}
          // @ts-expect-error
          port_ranges={portRanges}
          title={portListDialogTitle}
          onClose={handleClosePortListDialog}
          onNewPortRangeClick={openNewPortRangeDialog}
          onSave={handleSavePortList}
          onTmpDeletePortRange={handleTmpDeletePortRange}
        />
      )}
      {importDialogVisible && (
        <ImportPortListDialog
          onClose={handleCloseImportDialog}
          onSave={handleImportPortList}
        />
      )}
      {portRangeDialogVisible && id && (
        <PortRangeDialog
          id={id}
          onClose={handleCloseNewPortRangeDialog}
          onSave={handleTmpAddPortRange}
        />
      )}
    </>
  );
};

export default PortListComponent;
