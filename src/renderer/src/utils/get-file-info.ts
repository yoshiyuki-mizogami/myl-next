import { FileIconOptions, NativeImage, ResizeOptions } from 'electron'
import { FILE, DIR } from '../consts'
import {
  basenamePath,
  extnamePath,
  readShortcutLinkProxy,
  statFile
} from '@renderer/lib/native_fnc_proxy'
const { nativeImage, ipcRenderer } = window
const FILEICONSIZE = 32
const LINKSUFF = '.lnk'

export const ICON_OPT: FileIconOptions = {
  size: 'normal'
}
export const RESIZE_OPT: ResizeOptions = {
  height: 22,
  width: 22,
  quality: 'best'
}

export default async function getFileInfo(filepath: string): Promise<FileInfo> {
  let fileType: string = FILE
  const stat = await statFile(filepath)
  if (stat.isDir) {
    fileType = DIR
  }

  let icon = await getIcon(filepath)
  const ext = extnamePath(filepath).toLowerCase()
  if (ext === LINKSUFF) {
    try {
      const shortCut = await readShortcutLinkProxy(filepath)
      const linkTargetInfo = await getIcon(shortCut.target)
      icon = await blendShortcutIcon(linkTargetInfo)
    } catch (e) {
      /** nope */
    }
  }
  const resizedIcon = icon.resize(RESIZE_OPT)
  const dataUrl = resizedIcon.toDataURL()
  console.log(dataUrl)
  const fileName = basenamePath(filepath)
  return {
    path: filepath,
    type: fileType,
    name: fileName,
    icon: dataUrl
  }
}

async function getFileIcon(filepath: string): Promise<NativeImage> {
  return ipcRenderer.invoke('getFileIcon', filepath)
}
export function getIcon(filepath: string): Promise<NativeImage> {
  return getFileIcon(filepath)
}
const scSymbol =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAANCAIAAAD9iXMrAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAZdEVYdFNvZnR3YXJlAHBhaW50Lm5ldCA0LjAuMTnU1rJkAAABX0lEQVQoU4WRu0/CUBjFvz/JR3ytPhZ3N6NBJLpoZJXNydkYlRASFYtYr0CKUKGUV1PoKOAmwcWoCYmhPFrAxRNvgjh5coZ701+/x7mUyWQMwygVi7qua5pWyBfyuVw2m1VVNa2klVQq+ZBkCYkAff2nRDxOqISTbdtPtY8ltzi3LYzasix8vY/FCO04B1Vr74t7odmty6HBDQYDSZIIM41yC7vCjOt86G63Cy4aiRIG51z1+W1+JzC96f+109/pdPr9fiQcJmzHOdehNOX0/fGGr91ug7tjjBABuManOenw/vgMZmoFxqHVavV6PSaKhJzA1V8bE+un3Ewtox0qicqjaZrgxNANIUzed9l9Mb52vLIf5BAqAWo2m+BCwWtC4uBw0cv1sdUjx8EtdhyiEEoEBYHwLOAg7F+qvHhOZAyO37gAQVeBAMmyjGdB4ggTOSECbIfBMRPaoRIgn9f7Ddtnec9GFThrAAAAAElFTkSuQmCC'
function blendShortcutIcon(icon: NativeImage): Promise<NativeImage> {
  return new Promise<NativeImage>((resolve) => {
    const c = document.createElement('canvas')
    c.width = c.height = FILEICONSIZE
    const context = c.getContext('2d') as CanvasRenderingContext2D
    const baseIcon = new Image()
    const scMark = new Image()
    scMark.src = scSymbol
    scMark.onload = (): void => {
      baseIcon.src = icon.toDataURL()
      baseIcon.onload = (): void => {
        context.drawImage(baseIcon, 0, 0)
        context.drawImage(scMark, 0, 19)
        const ni = nativeImage.createFromDataURL(c.toDataURL())
        resolve(ni)
      }
    }
  })
}
