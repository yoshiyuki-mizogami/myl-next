import { FILE, DIR } from '../consts'
import {
  basenamePath,
  extnamePath,
  getFileIconProxy,
  readShortcutLinkProxy,
  statFile
} from '@renderer/lib/native_fnc_proxy'
const FILEICONSIZE = 22
const LINKSUFF = '.lnk'

export default async function getFileInfo(filepath: string): Promise<FileInfo> {
  let fileType: string = FILE
  const stat = await statFile(filepath)
  if (stat.isDir) {
    fileType = DIR
  }

  let icon = await getIcon(filepath)
  if (!stat.isDir) {
    const ext = extnamePath(filepath).toLowerCase()
    if (!stat.isDir && ext === LINKSUFF) {
      try {
        const shortCutTarget = await readShortcutLinkProxy(filepath)
        const linkTargetInfo = await getIcon(shortCutTarget)
        icon = await blendShortcutIcon(linkTargetInfo)
      } catch (e) {
        /** nope */
      }
    }
  }
  const fileName = basenamePath(filepath)
  return {
    path: filepath,
    type: fileType,
    name: fileName,
    icon
  }
}

export function getIcon(filepath: string): Promise<string> {
  return getFileIconProxy(filepath)
}
const shortcutSymbol =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAANCAIAAAD9iXMrAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAZdEVYdFNvZnR3YXJlAHBhaW50Lm5ldCA0LjAuMTnU1rJkAAABX0lEQVQoU4WRu0/CUBjFvz/JR3ytPhZ3N6NBJLpoZJXNydkYlRASFYtYr0CKUKGUV1PoKOAmwcWoCYmhPFrAxRNvgjh5coZ701+/x7mUyWQMwygVi7qua5pWyBfyuVw2m1VVNa2klVQq+ZBkCYkAff2nRDxOqISTbdtPtY8ltzi3LYzasix8vY/FCO04B1Vr74t7odmty6HBDQYDSZIIM41yC7vCjOt86G63Cy4aiRIG51z1+W1+JzC96f+109/pdPr9fiQcJmzHOdehNOX0/fGGr91ug7tjjBABuManOenw/vgMZmoFxqHVavV6PSaKhJzA1V8bE+un3Ewtox0qicqjaZrgxNANIUzed9l9Mb52vLIf5BAqAWo2m+BCwWtC4uBw0cv1sdUjx8EtdhyiEEoEBYHwLOAg7F+qvHhOZAyO37gAQVeBAMmyjGdB4ggTOSECbIfBMRPaoRIgn9f7Ddtnec9GFThrAAAAAElFTkSuQmCC'
function blendShortcutIcon(icon: string): Promise<string> {
  return new Promise<string>((resolve) => {
    const c = document.createElement('canvas')
    c.width = c.height = FILEICONSIZE
    const context = c.getContext('2d') as CanvasRenderingContext2D
    const baseIcon = new Image()
    const scMark = new Image()
    scMark.src = shortcutSymbol
    scMark.onload = (): void => {
      baseIcon.src = icon
      baseIcon.onload = (): void => {
        context.drawImage(baseIcon, 0, 0)
        context.drawImage(scMark, 0, 11)
        resolve(c.toDataURL())
      }
    }
  })
}
