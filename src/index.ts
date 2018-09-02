import {join} from 'path'
import {app, BrowserWindow} from 'electron'
let mainWindow:BrowserWindow
global['ROOTDIR'] = __dirname
app.on('ready', ()=>{
  console.log(__dirname)
  mainWindow = new BrowserWindow({
    height:300,
    width:350,
    frame:false,
    resizable:false
  })
  mainWindow.loadFile(join(__dirname, 'index.html'))
  mainWindow.on('closed', ()=>{
    app.quit()
  })
})