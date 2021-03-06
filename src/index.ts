import {join} from 'path'
import {app, BrowserWindow, ipcMain} from 'electron'

app.commandLine.appendSwitch('disable-renderer-backgrounding')
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = '1'
let mainWindow:BrowserWindow
global['ROOTDIR'] = __dirname
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
    show:isDev,
    resizable:false,
    fullscreenable:false,
    maximizable:false,
    webPreferences:{
      nodeIntegration:true,
      enableRemoteModule:true,
      backgroundThrottling:true,
    },
    icon:join(__dirname, 'imgs', 'icon.png')
  })
  mainWindow.loadFile(join(__dirname, 'index.html'))
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
