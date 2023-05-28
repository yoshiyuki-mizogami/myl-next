import { exec, spawn } from 'child_process'
import { LangUI } from './../renderer/src/lib/lang-swicher'
import {
  Menu,
  MenuItem,
  dialog,
  ipcMain,
  BrowserWindow,
  App,
  OpenDialogOptions,
  SaveDialogOptions,
  shell,
  clipboard
} from 'electron'
import { existsSync } from 'fs'
import { readFile, stat, writeFile } from 'fs/promises'

export function setIpcFunc(app: App, mainWindow: BrowserWindow): void {
  ipcMain.handle('getrootdir', () => __dirname)

  ipcMain.handle('getVersion', () => app.getVersion())

  ipcMain.on('showWindow', () => mainWindow.show())

  ipcMain.handle('getDesktopPath', () => app.getPath('desktop'))

  ipcMain.handle('getTmpDir', () => {
    return app.getPath('temp')
  })

  ipcMain.handle('showOpenDialog', (_ev, args: OpenDialogOptions) =>
    dialog.showOpenDialog(mainWindow, args)
  )

  ipcMain.handle('showSaveDialog', (_ev, args: SaveDialogOptions) =>
    dialog.showSaveDialog(mainWindow, args)
  )

  type hw = [number, number]
  ipcMain.on('setSize', (_ev, [h, w]: hw) => {
    mainWindow.resizable = true
    mainWindow.setSize(w, h)
    mainWindow.resizable = false
  })

  ipcMain.on('setAlwaysOnTop', (_ev, tf: boolean) => {
    mainWindow.setAlwaysOnTop(tf)
  })

  ipcMain.handle('show-category-menu', async (_ev, ui: LangUI): Promise<string> => {
    let selected = false
    const promise = await new Promise<string>((resolve) => {
      const menu = new Menu()
      const renameItem = new MenuItem({
        id: 'Rename',
        accelerator: 'r',
        type: 'normal',
        label: ui.RENAME,
        click(): void {
          selected = true
          resolve('rename')
        }
      })
      const openColorSetter = new MenuItem({
        id: 'OpenColorSetter',
        accelerator: 's',
        type: 'normal',
        label: ui.OPEN_COLOR_SETTER,
        click(): void {
          selected = true
          resolve('openColorSetter')
        }
      })
      const removeItem = new MenuItem({
        id: 'Delete',
        accelerator: 'd',
        type: 'normal',
        label: ui.DELETE,
        click(): void {
          selected = true
          resolve('delete')
        }
      })
      menu.append(renameItem)
      menu.append(openColorSetter)
      menu.append(removeItem)
      menu.popup({})
    })
    return promise
  })

  ipcMain.handle('show-item-menu', async (_ev, ui: LangUI): Promise<string> => {
    let selected = false
    const result = await new Promise<string>((resolve) => {
      const menu = new Menu()
      const openParent = new MenuItem({
        id: 'OpenParent',
        accelerator: 'o',
        type: 'normal',
        label: ui.OPEN_PARENT,
        click(): void {
          selected = true
          resolve('openParent')
        }
      })
      const thisCopyItemPath = new MenuItem({
        id: 'Copy',
        accelerator: 'c',
        type: 'normal',
        label: ui.COPY,
        click(): void {
          selected = true
          resolve('copy')
        }
      })
      const editItem = new MenuItem({
        id: 'Edit',
        accelerator: 'e',
        type: 'normal',
        label: ui.EDIT,
        click(): void {
          selected = true
          resolve('edit')
        }
      })
      const thisRemoveItem = new MenuItem({
        id: 'Remove',
        accelerator: 'r',
        type: 'normal',
        label: ui.REMOVE,
        click(): void {
          selected = true
          resolve('remove')
        }
      })

      menu.append(openParent)
      menu.append(thisCopyItemPath)
      menu.append(editItem)
      menu.append(thisRemoveItem)
      menu.popup({})
    })
    return result
  })
  ipcMain.handle('exists-file', (_ev, arg: { path: string }) => existsSync(arg.path))

  ipcMain.handle('read-file', (_ev, arg: { path: string }) => readFile(arg.path, 'utf-8'))
  ipcMain.handle('write-file', (_ev, arg: { path: string; content: string }) => {
    return writeFile(arg.path, arg.content, 'utf-8')
  })

  ipcMain.handle('get-desktop-path', () => app.getPath('desktop'))

  ipcMain.handle('stat-file', async (_ev, path: string) => {
    const statInfo = await stat(path)
    statInfo['isDir'] = statInfo.isDirectory()
    return statInfo
  })

  const ICON_OPT = { size: 'normal' } as const
  const RESIZE_OPT = {
    height: 22,
    width: 22,
    quality: 'best'
  } as const

  ipcMain.handle('get-file-icon', async (_ev, path: string) => {
    const icon = await app.getFileIcon(path, ICON_OPT)
    const resized = icon.resize(RESIZE_OPT)
    return resized.toDataURL()
  })
  ipcMain.handle('read-shortcut', (_ev, path: string) => {
    return shell.readShortcutLink(path).target
  })
  ipcMain.on('open-shell', (_ev, path: string) => shell.openPath(path))

  ipcMain.on('open-shell-external', (_ev, path: string) => shell.openExternal(path))

  ipcMain.on('write-clipboard', (_ev, txt: string) => clipboard.writeText(txt))

  ipcMain.handle('exec-process', (_ev, cmd: string): void => {
    exec(cmd)
  })
}
