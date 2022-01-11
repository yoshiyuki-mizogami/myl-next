import {
  Menu,
  MenuItem,
  dialog,
  ipcMain,
  BrowserWindow,
  FileIconOptions
} from 'electron'

export function setIpcFunc(app:Electron.App, mainWindow:BrowserWindow){
  ipcMain.handle('getrootdir', ()=>__dirname)

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

  ipcMain.on('setAlwaysOnTop', (_ev,tf:boolean)=>{
    mainWindow.setAlwaysOnTop(tf)
  })
  const ICON_OPT:FileIconOptions = {
    size:'normal'
  }  
  ipcMain.handle('getFileIcon', (_ev, filepath:string)=>{
    return app.getFileIcon(filepath, ICON_OPT)
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
  })
  
  const ITEM_REPONSE_EVENT = 'select-item-menu'
  ipcMain.on('show-item-menu', (ev:Electron.IpcMainEvent, ui:any)=>{
    const menu = new Menu()

    const openParent = new MenuItem({
      id:'OpenParent',
      accelerator:'o',
      type:'normal',
      label:ui.OPEN_PARENT,
      click(){
        ev.sender.send(ITEM_REPONSE_EVENT, 'openParent')
      }
    })
    const thisCopyItemPath = new MenuItem({
      id:'Copy',
      accelerator:'c',
      type:'normal',
      label:ui.COPY,
      click(){
        ev.sender.send(ITEM_REPONSE_EVENT, 'copy')
      }
    })
    const editItem  = new MenuItem({
      id:'Edit', 
      accelerator:'e',
      type:'normal',
      label:ui.EDIT, 
      click(){
        ev.sender.send(ITEM_REPONSE_EVENT, 'edit')
      }
    })
    const thisRemoveItem = new MenuItem({
      id:'Remove',
      accelerator:'r',
      type:'normal',
      label:ui.REMOVE,
      click(){
        ev.sender.send(ITEM_REPONSE_EVENT, 'remove')
      }
    })
    menu.append(openParent)
    menu.append(thisCopyItemPath)
    menu.append(editItem)
    menu.append(thisRemoveItem)
    menu.popup({})
  })


}
