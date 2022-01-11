import {
  Menu,
  MenuItem,
  dialog,
  ipcMain,
  BrowserWindow
} from 'electron'

export function setIpcFunc(app:Electron.App, mainWindow:BrowserWindow){
  ipcMain.handle('getrootdir', ()=>'')

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
    let selected = false
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
  })
}
