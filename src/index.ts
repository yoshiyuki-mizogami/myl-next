import {join} from 'path'
import * as remote from '@electron/remote/main'
import {app, BrowserWindow, ipcMain} from 'electron'
remote.initialize()

const ROOTDIR = __dirname
ipcMain.handle('getrootdir', ()=>ROOTDIR)

ipcMain.handle('getversion', ()=> app.getVersion())

app.commandLine.appendSwitch('disable-renderer-backgrounding')
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = '1'
let mainWindow:BrowserWindow
const isDev = false //process.execPath.includes('electron.exe')

const lock = app.requestSingleInstanceLock()
if(!lock){
  app.quit()
}else{
  app.on('second-instance', (ev, cmdLine, workDir)=>{
    if(mainWindow){
      mainWindow.restore()
      mainWindow.focus()
    }
  })
}
app.on('ready', ()=>{
  mainWindow = new BrowserWindow({
    height:400,
    width:350,
    frame:false,
    show:isDev || true,
    resizable:false,
    fullscreenable:false,
    maximizable:false,
    webPreferences:{
      contextIsolation: false,
      nodeIntegration:true,
      backgroundThrottling:true
    },
    icon:join(__dirname, 'imgs', 'icon.png')
  })
  mainWindow.loadFile(join(__dirname, 'index.html'))
  remote.enable(mainWindow.webContents)

  mainWindow.on('closed', app.quit.bind(app))
  if(isDev){
    const ses = mainWindow.webContents.session
    ses.loadExtension(join(__dirname, '..', 'node_modules', 'vue-devtools', 'vender'))
    mainWindow.webContents.openDevTools()
  }
  const dragIcon = join(global['ROOTDIR'], 'imgs', 'drag.png')
  ipcMain.on('ondragstart', (event:any, file:string)=>{
    event.sender.startDrag({
      file,
      icon:dragIcon
    })
  })
})
