import {join} from 'path'
import {app, dialog, BrowserWindow, ipcMain, Menu, MenuItem} from 'electron'

const ROOTDIR = __dirname

ipcMain.handle('getrootdir', ()=>ROOTDIR)

ipcMain.handle('getversion', ()=> app.getVersion())

ipcMain.on('showWindow', ()=>mainWindow.show())

ipcMain.handle('getDesktopPath', ()=>app.getPath('desktop'))

ipcMain.handle('showOpenDialog', (_ev,args:any)=>dialog.showOpenDialog(args))

ipcMain.handle('showSaveDialog', (_ev,args:any)=>dialog.showSaveDialog(args))

type hw = [number, number]
ipcMain.on('setSize', (_ev,[h, w]:hw)=>{
  mainWindow.resizable = true
  mainWindow.setSize(w, h)
  mainWindow.resizable = false
})

ipcMain.on('setAlwaysOnTop', (_ev,tf:boolean, ui:any)=>{
  mainWindow.setAlwaysOnTop(tf)
})

ipcMain.on('show-category-menu', (ev:Electron.IpcMainEvent, ui:any)=>{
  const menu = new Menu()
  const renameItem  = new MenuItem({
    id:'Rename', 
    accelerator:'r',
    type:'normal',
    label:ui.RENAME, 
    click(){
      ev.sender.send('select-category-menu-item', 'rename')
    }
  })
  const removeItem = new MenuItem({
    id:'Delete',
    accelerator:'d',
    type:'normal',
    label:ui.DELETE,
    click(){
      ev.sender.send('select-category-menu-item', 'delete')
    }
  })
  menu.append(renameItem)
  menu.append(removeItem)
  menu.popup({})
  menu.addListener('menu-will-close', ()=>ev.sender.send('select-category-menu-item', 'none'))
})


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
  mainWindow.loadFile(join('.', 'index.html'))

  mainWindow.on('closed', app.quit.bind(app))
  const dragIcon = join('.', 'imgs', 'drag.png')
  ipcMain.on('ondragstart', (event:any, file:string)=>{
    event.sender.startDrag({
      file,
      icon:dragIcon
    })
  })
})
