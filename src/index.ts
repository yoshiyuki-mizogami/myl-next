import {join} from 'path'
import {app, BrowserWindow, ipcMain} from 'electron'
import { setIpcFunc } from './setIpcFunc'

app.commandLine.appendSwitch('disable-renderer-backgrounding')
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = '1'
let mainWindow:BrowserWindow
const lock = app.requestSingleInstanceLock()
if(!lock){
  app.quit()
}else{
  app.on('second-instance', ()=>{
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
    show:false,
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
  setIpcFunc(app, mainWindow)
  mainWindow.loadFile(join(__dirname, 'index.html'))
  mainWindow.on('closed', app.quit.bind(app))
  const dragIcon = join(__dirname, 'imgs', 'drag.png')
  ipcMain.on('ondragstart', (event, file:string)=>{
    event.sender.startDrag({
      file,
      icon:dragIcon
    })
  })
})
