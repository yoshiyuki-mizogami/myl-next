import {join} from 'path'
import {app, BrowserWindow} from 'electron'
let mainWindow:BrowserWindow
global['ROOTDIR'] = __dirname
app.on('ready', ()=>{
  mainWindow = new BrowserWindow({
    height:400,
    width:350,
    frame:false,
    resizable:false,
    icon:join(__dirname, 'imgs', 'icon.ico')
  })
  mainWindow.loadFile(join(__dirname, 'index.html'))
  mainWindow.on('closed', ()=>{
    app.quit()
  })
})