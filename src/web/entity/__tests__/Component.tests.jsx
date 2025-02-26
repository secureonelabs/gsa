/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import EntityComponent from 'web/entity/Component';
import {rendererWith, wait} from 'web/utils/Testing';

const currentSettingsResponse = {
  data: {
    detailsexportfilename: {
      id: 'a6ac88c5-729c-41ba-ac0a-deea4a3441f2',
      name: 'Details Export File Name',
      value: '%T-%U',
    },
  },
};
const currentSettings = testing.fn().mockResolvedValue(currentSettingsResponse);

describe('EntityComponent', () => {
  test('should render', () => {
    const gmp = {foo: {}, user: {currentSettings}};
    const {render} = rendererWith({gmp});
    const {queryByTestId} = render(
      <EntityComponent
        name="foo"
        onCloneError={testing.fn()}
        onCloned={testing.fn()}
        onCreateError={testing.fn()}
        onCreated={testing.fn()}
        onDeleteError={testing.fn()}
        onDeleted={testing.fn()}
        onDownloadError={testing.fn()}
        onDownloaded={testing.fn()}
        onInteraction={testing.fn()}
        onSaveError={testing.fn()}
        onSaved={testing.fn()}
      >
        {() => <div data-testid="child"></div>}
      </EntityComponent>,
    );

    expect(queryByTestId('child')).toBeInTheDocument();
  });

  test('should allow cloning an entity', async () => {
    const clonedData = {id: '123'};
    const onCloned = testing.fn();
    const onCloneError = testing.fn();
    const onInteraction = testing.fn();
    const gmp = {
      foo: {clone: testing.fn().mockResolvedValue(clonedData)},
      user: {currentSettings},
    };
    const {render} = rendererWith({gmp});
    const {queryByTestId} = render(
      <EntityComponent
        name="foo"
        onCloneError={onCloneError}
        onCloned={onCloned}
        onInteraction={onInteraction}
      >
        {({clone}) => (
          <button data-testid="button" onClick={() => clone({id: '123'})} />
        )}
      </EntityComponent>,
    );

    queryByTestId('button').click();
    await wait();
    expect(onCloned).toHaveBeenCalledWith(clonedData);
    expect(onCloneError).not.toHaveBeenCalled();
    expect(onInteraction).toHaveBeenCalledOnce();
  });

  test('should call onCloneError when cloning an entity fails', async () => {
    const error = new Error('error');
    const onCloned = testing.fn();
    const onCloneError = testing.fn();
    const onInteraction = testing.fn();
    const gmp = {
      foo: {clone: testing.fn().mockRejectedValue(error)},
      user: {currentSettings},
    };
    const {render} = rendererWith({gmp});
    const {queryByTestId} = render(
      <EntityComponent
        name="foo"
        onCloneError={onCloneError}
        onCloned={onCloned}
        onInteraction={onInteraction}
      >
        {({clone}) => (
          <button data-testid="button" onClick={() => clone({id: '123'})} />
        )}
      </EntityComponent>,
    );

    queryByTestId('button').click();
    await wait();
    expect(onCloneError).toHaveBeenCalledWith(error);
    expect(onCloned).not.toHaveBeenCalled();
    expect(onInteraction).toHaveBeenCalledOnce();
  });

  test('should allow deleting an entity', async () => {
    const deletedData = {id: '123'};
    const onDeleted = testing.fn();
    const onDeleteError = testing.fn();
    const onInteraction = testing.fn();
    const gmp = {
      foo: {
        delete: testing.fn().mockResolvedValue(deletedData),
      },
      user: {currentSettings},
    };
    const {render} = rendererWith({gmp});
    const {queryByTestId} = render(
      <EntityComponent
        name="foo"
        onDeleteError={onDeleteError}
        onDeleted={onDeleted}
        onInteraction={onInteraction}
      >
        {({delete: del}) => (
          <button data-testid="button" onClick={() => del({id: '123'})} />
        )}
      </EntityComponent>,
    );

    queryByTestId('button').click();
    await wait();
    expect(onDeleted).toHaveBeenCalledOnce(); // currently the redux action for deleting an entity is passed
    expect(onDeleteError).not.toHaveBeenCalled();
    expect(onInteraction).toHaveBeenCalledOnce();
  });

  test('should call onDeleteError when deleting an entity fails', async () => {
    const error = new Error('error');
    const onDeleted = testing.fn();
    const onDeleteError = testing.fn();
    const onInteraction = testing.fn();
    const gmp = {
      foo: {delete: testing.fn().mockRejectedValue(error)},
      user: {currentSettings},
    };
    const {render} = rendererWith({gmp});
    const {queryByTestId} = render(
      <EntityComponent
        name="foo"
        onDeleteError={onDeleteError}
        onDeleted={onDeleted}
        onInteraction={onInteraction}
      >
        {({delete: del}) => (
          <button data-testid="button" onClick={() => del({id: '123'})} />
        )}
      </EntityComponent>,
    );

    queryByTestId('button').click();
    await wait();
    expect(onDeleteError).toHaveBeenCalledWith(error);
    expect(onDeleted).not.toHaveBeenCalled();
    expect(onInteraction).toHaveBeenCalledOnce();
  });

  test('should allow saving an entity', async () => {
    const savedData = {id: '123'};
    const onSaved = testing.fn();
    const onSaveError = testing.fn();
    const onInteraction = testing.fn();
    const gmp = {
      foo: {
        save: testing.fn().mockResolvedValue(savedData),
      },
      user: {currentSettings},
    };
    const {render} = rendererWith({gmp});
    const {queryByTestId} = render(
      <EntityComponent
        name="foo"
        onInteraction={onInteraction}
        onSaveError={onSaveError}
        onSaved={onSaved}
      >
        {({save}) => (
          <button data-testid="button" onClick={() => save({id: '123'})} />
        )}
      </EntityComponent>,
    );

    queryByTestId('button').click();
    await wait();
    expect(onSaved).toHaveBeenCalledWith(savedData);
    expect(onSaveError).not.toHaveBeenCalled();
    expect(onInteraction).toHaveBeenCalledOnce();
  });

  test('should call onSaveError when saving an entity fails', async () => {
    const error = new Error('error');
    const onSaved = testing.fn();
    const onSaveError = testing.fn();
    const onInteraction = testing.fn();
    const gmp = {
      foo: {save: testing.fn().mockRejectedValue(error)},
      user: {currentSettings},
    };
    const {render} = rendererWith({gmp});
    const {queryByTestId} = render(
      <EntityComponent
        name="foo"
        onInteraction={onInteraction}
        onSaveError={onSaveError}
        onSaved={onSaved}
      >
        {({save}) => (
          <button data-testid="button" onClick={() => save({id: '123'})} />
        )}
      </EntityComponent>,
    );

    queryByTestId('button').click();
    await wait();
    expect(onSaveError).toHaveBeenCalledWith(error);
    expect(onSaved).not.toHaveBeenCalled();
    expect(onInteraction).toHaveBeenCalledOnce();
  });

  test('should allow to create an entity', async () => {
    const createdData = {id: '123'};
    const onCreated = testing.fn();
    const onCreateError = testing.fn();
    const onInteraction = testing.fn();
    const gmp = {
      foo: {
        create: testing.fn().mockResolvedValue(createdData),
      },
      user: {currentSettings},
    };
    const {render} = rendererWith({gmp});
    const {queryByTestId} = render(
      <EntityComponent
        name="foo"
        onCreateError={onCreateError}
        onCreated={onCreated}
        onInteraction={onInteraction}
      >
        {({create}) => (
          <button data-testid="button" onClick={() => create({})} />
        )}
      </EntityComponent>,
    );

    queryByTestId('button').click();
    await wait();
    expect(onCreated).toHaveBeenCalledWith(createdData);
    expect(onCreateError).not.toHaveBeenCalled();
    expect(onInteraction).toHaveBeenCalledOnce();
  });

  test('should call onCreateError when creating an entity fails', async () => {
    const error = new Error('error');
    const onCreated = testing.fn();
    const onCreateError = testing.fn();
    const onInteraction = testing.fn();
    const gmp = {
      foo: {create: testing.fn().mockRejectedValue(error)},
      user: {currentSettings},
    };
    const {render} = rendererWith({gmp});
    const {queryByTestId} = render(
      <EntityComponent
        name="foo"
        onCreateError={onCreateError}
        onCreated={onCreated}
        onInteraction={onInteraction}
      >
        {({create}) => (
          <button data-testid="button" onClick={() => create({})} />
        )}
      </EntityComponent>,
    );

    queryByTestId('button').click();
    await wait();
    expect(onCreateError).toHaveBeenCalledWith(error);
    expect(onCreated).not.toHaveBeenCalled();
    expect(onInteraction).toHaveBeenCalledOnce();
  });

  test('should allow to download an entity', async () => {
    const entity = {
      id: '123',
      name: 'foo',
      creationTime: '2025-01-01T00:00:00Z',
      modificationTime: '2025-01-01T00:00:00Z',
    };
    const downloadedData = {id: '123'};
    const onDownloaded = testing.fn();
    const onDownloadError = testing.fn();
    const onInteraction = testing.fn();
    const gmp = {
      foo: {
        export: testing.fn().mockResolvedValue({data: downloadedData}),
      },
      user: {currentSettings},
    };
    const {render} = rendererWith({gmp, store: true});
    const {queryByTestId} = render(
      <EntityComponent
        name="foo"
        onDownloadError={onDownloadError}
        onDownloaded={onDownloaded}
        onInteraction={onInteraction}
      >
        {({download}) => (
          <button data-testid="button" onClick={() => download(entity)} />
        )}
      </EntityComponent>,
    );

    await wait(); // wait for currentSettings to be resolved and put into the store
    queryByTestId('button').click();
    await wait();
    expect(onDownloaded).toHaveBeenCalledWith({
      filename: 'foo-123.xml',
      data: downloadedData,
    });
    expect(onDownloadError).not.toHaveBeenCalled();
    expect(onInteraction).toHaveBeenCalledOnce();
  });

  test('should call onDownloadError when downloading an entity fails', async () => {
    const error = new Error('error');
    const entity = {id: '123'};
    const onDownloaded = testing.fn();
    const onDownloadError = testing.fn();
    const onInteraction = testing.fn();
    const gmp = {
      foo: {export: testing.fn().mockRejectedValue(error)},
      user: {currentSettings},
    };
    const {render} = rendererWith({gmp, store: true});
    const {queryByTestId} = render(
      <EntityComponent
        name="foo"
        onDownloadError={onDownloadError}
        onDownloaded={onDownloaded}
        onInteraction={onInteraction}
      >
        {({download}) => (
          <button data-testid="button" onClick={() => download(entity)} />
        )}
      </EntityComponent>,
    );

    await wait(); // wait for currentSettings to be resolved and put into the store
    queryByTestId('button').click();
    await wait();
    expect(onDownloadError).toHaveBeenCalledWith(error);
    expect(onDownloaded).not.toHaveBeenCalled();
    expect(onInteraction).toHaveBeenCalledOnce();
  });
});
