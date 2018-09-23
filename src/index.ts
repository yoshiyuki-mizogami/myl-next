import {join} from 'path'
import {app, BrowserWindow} from 'electron'
let mainWindow:BrowserWindow
global['ROOTDIR'] = __dirname
const isDev = process.execPath.includes('electron.exe')

app.on('ready', ()=>{
  mainWindow = new BrowserWindow({
    height:400,
    width:350,
    frame:false,
    resizable:false,
    show:isDev,
    icon:join(__dirname, 'imgs', 'icon.ico')
  })
  mainWindow.loadFile(join(__dirname, 'index.html'))
  mainWindow.on('closed', ()=>{
    app.quit()
  })
  if(isDev){
    BrowserWindow.addDevToolsExtension(join(__dirname, '..', 'node_modules', 'vue-devtools', 'vender'))
    mainWindow.webContents.openDevTools()
  }
})