import {stat, Stats} from 'fs'
import remote from '@electron/remote'
import {shell, FileIconOptions, ResizeOptions, nativeImage, NativeImage} from 'electron'
import {basename, extname} from 'path'
import {FILE, DIR} from '../consts'
const FILEICONSIZE = 32
const LINKSUFF = '.lnk'

export const ICON_OPT:FileIconOptions = {
  size:'normal'
}
export const RESIZE_OPT:ResizeOptions = {
  height:22,
  width:22,
  quality:'best'
}

interface FileInfo {
  cateId?:number
  path:string
  type:string
  name:string
  icon:string
}
export default async function getFileInfo(filepath:string):Promise<FileInfo>{
  const fileType:string = await new Promise<string>(resolve=>{
    stat(filepath,(_, stat:Stats)=>{
      let type = FILE
      if(stat.isDirectory()){
        type = DIR
      }
      resolve(type)
    })
  })
  let icon = await getIcon(filepath)
  const ext = extname(filepath).toLowerCase()
  if( ext === LINKSUFF){
    try{
      const shortCut = shell.readShortcutLink(filepath)
      const linkTargetInfo = await getIcon(shortCut.target)
      icon = await blendShortcutIcon(linkTargetInfo)
    }catch(e){

    }
  }
  const resizedIcon = icon.resize(RESIZE_OPT)
  const dateUrl = resizedIcon.toDataURL()
  const fileName = basename(filepath)
  return {
    path:filepath,
    type:fileType,
    name:fileName,
    icon:dateUrl
  }
}
export function getIcon(filepath:string):Promise<NativeImage>{
  return remote.app.getFileIcon(filepath, ICON_OPT)
}
const scSymbol = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAANCAIAAAD9iXMrAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAZdEVYdFNvZnR3YXJlAHBhaW50Lm5ldCA0LjAuMTnU1rJkAAABX0lEQVQoU4WRu0/CUBjFvz/JR3ytPhZ3N6NBJLpoZJXNydkYlRASFYtYr0CKUKGUV1PoKOAmwcWoCYmhPFrAxRNvgjh5coZ701+/x7mUyWQMwygVi7qua5pWyBfyuVw2m1VVNa2klVQq+ZBkCYkAff2nRDxOqISTbdtPtY8ltzi3LYzasix8vY/FCO04B1Vr74t7odmty6HBDQYDSZIIM41yC7vCjOt86G63Cy4aiRIG51z1+W1+JzC96f+109/pdPr9fiQcJmzHOdehNOX0/fGGr91ug7tjjBABuManOenw/vgMZmoFxqHVavV6PSaKhJzA1V8bE+un3Ewtox0qicqjaZrgxNANIUzed9l9Mb52vLIf5BAqAWo2m+BCwWtC4uBw0cv1sdUjx8EtdhyiEEoEBYHwLOAg7F+qvHhOZAyO37gAQVeBAMmyjGdB4ggTOSECbIfBMRPaoRIgn9f7Ddtnec9GFThrAAAAAElFTkSuQmCC'
function blendShortcutIcon(icon:NativeImage):Promise<NativeImage>{
  return new Promise<NativeImage>(resolve=>{
    const c = document.createElement('canvas')
    c.width = c.height = FILEICONSIZE
    const context = c.getContext('2d')
    const baseIcon = new Image()
    const scMark = new Image()
    scMark.src = scSymbol
    scMark.onload = ()=>{
      baseIcon.src = icon.toDataURL()
      baseIcon.onload = ()=>{
        context.drawImage(baseIcon, 0, 0)
        context.drawImage(scMark, 0, 19)
        const ni = nativeImage.createFromDataURL(c.toDataURL())
        resolve(ni)
      }
    }

  })
}