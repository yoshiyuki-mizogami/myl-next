import { Menu, MenuItem, dialog, ipcMain, BrowserWindow, FileIconOptions } from 'electron'

export function setIpcFunc(app: Electron.App, mainWindow: BrowserWindow): void {
  ipcMain.handle('getrootdir', () => __dirname)

  ipcMain.handle('getVersion', () => app.getVersion())

  ipcMain.on('showWindow', () => mainWindow.show())

  ipcMain.handle('getDesktopPath', () => app.getPath('desktop'))

  ipcMain.handle('getTmpDir', () => {
    return app.getPath('temp')
  })

  ipcMain.handle('showOpenDialog', (_ev, args: any) => dialog.showOpenDialog(mainWindow, args))

  ipcMain.handle('showSaveDialog', (_ev, args: any) => dialog.showSaveDialog(mainWindow, args))

  type hw = [number, number]
  ipcMain.on('setSize', (_ev, [h, w]: hw) => {
    mainWindow.resizable = true
    mainWindow.setSize(w, h)
    mainWindow.resizable = false
  })

  ipcMain.on('setAlwaysOnTop', (_ev, tf: boolean) => {
    mainWindow.setAlwaysOnTop(tf)
  })
  const ICON_OPT: FileIconOptions = {
    size: 'normal'
  }
  ipcMain.handle('getFileIcon', (_ev, filepath: string) => {
    return app.getFileIcon(filepath, ICON_OPT)
  })
  ipcMain.on('show-category-menu', (ev: Electron.IpcMainEvent, ui: any) => {
    const menu = new Menu()
    const renameItem = new MenuItem({
      id: 'Rename',
      accelerator: 'r',
      type: 'normal',
      label: ui.RENAME,
      click(): void  {
        ev.sender.send('select-category-menu-item', 'rename')
      }
    })
    const openColorSetter = new MenuItem({
      id: 'OpenColorSetter',
      accelerator: 's',
      type: 'normal',
      label: ui.OPEN_COLOR_SETTER,
      click(): void  {
        ev.sender.send('select-category-menu-item', 'openColorSetter')
      }
    })
    const removeItem = new MenuItem({
      id: 'Delete',
      accelerator: 'd',
      type: 'normal',
      label: ui.DELETE,
      click(): void {
        ev.sender.send('select-category-menu-item', 'delete')
      }
    })
    menu.append(renameItem)
    menu.append(openColorSetter)
    menu.append(removeItem)
    menu.popup({})
  })

  const ITEM_REPONSE_EVENT = 'select-item-menu'
  ipcMain.on('show-item-menu', (ev: Electron.IpcMainEvent, ui: any) => {
    const menu = new Menu()

    const openParent = new MenuItem({
      id: 'OpenParent',
      accelerator: 'o',
      type: 'normal',
      label: ui.OPEN_PARENT,
      click(): void  {
        ev.sender.send(ITEM_REPONSE_EVENT, 'openParent')
      }
    })
    const thisCopyItemPath = new MenuItem({
      id: 'Copy',
      accelerator: 'c',
      type: 'normal',
      label: ui.COPY,
      click(): void  {
        ev.sender.send(ITEM_REPONSE_EVENT, 'copy')
      }
    })
    const editItem = new MenuItem({
      id: 'Edit',
      accelerator: 'e',
      type: 'normal',
      label: ui.EDIT,
      click(): void  {
        ev.sender.send(ITEM_REPONSE_EVENT, 'edit')
      }
    })
    const thisRemoveItem = new MenuItem({
      id: 'Remove',
      accelerator: 'r',
      type: 'normal',
      label: ui.REMOVE,
      click(): void  {
        ev.sender.send(ITEM_REPONSE_EVENT, 'remove')
      }
    })
    menu.append(openParent)
    menu.append(thisCopyItemPath)
    menu.append(editItem)
    menu.append(thisRemoveItem)
    menu.popup({})
  })
}
