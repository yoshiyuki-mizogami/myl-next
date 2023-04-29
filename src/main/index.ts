import { join } from 'path'
import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { setIpcFunc } from './setIpcFunc'
import icon from '../../resources/icon.png?asset'

app.commandLine.appendSwitch('disable-renderer-backgrounding')
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = '1'
let mainWindow: BrowserWindow
function createWindow(): void {
  const lock = app.requestSingleInstanceLock()
  if (!lock) {
    app.quit()
    return
  } else {
    app.on('second-instance', () => {
      if (mainWindow) {
        mainWindow.restore()
        mainWindow.focus()
      }
    })
  }
  mainWindow = new BrowserWindow({
    height: 400,
    width: 350,
    frame: false,
    show: false,
    resizable: false,
    fullscreenable: false,
    maximizable: false,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
      sandbox: false
    },
    icon
  })
  mainWindow.on('ready-to-show', () => mainWindow.show())
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  setIpcFunc(app, mainWindow)

  const dragIcon = join(__dirname, 'imgs', 'drag.png')
  ipcMain.on('ondragstart', (event, file: string) => {
    event.sender.startDrag({
      file,
      icon: dragIcon
    })
  })
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', () => {
    BrowserWindow.getAllWindows().length === 0 && createWindow()
  })
})

app.on('window-all-closed', () => process.platform !== 'darwin' && app.quit())
