import {join} from 'path'
import {app, BrowserWindow} from 'electron'
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = '1'
let mainWindow:BrowserWindow
global['ROOTDIR'] = __dirname
const isDev = process.execPath.includes('electron.exe')

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
      backgroundThrottling:true,
    },
    icon:join(__dirname, 'imgs', 'icon.ico')
  })
  mainWindow.loadFile(join(__dirname, 'index.html'))
  mainWindow.on('closed', app.quit.bind(app))
  if(isDev){
    BrowserWindow.addDevToolsExtension(join(__dirname, '..', 'node_modules', 'vue-devtools', 'vender'))
    mainWindow.webContents.openDevTools()
  }
})