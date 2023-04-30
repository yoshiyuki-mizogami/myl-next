import { shell } from 'electron'
import { Sortable } from './sortable'
import { URL } from '../consts'
import url from 'url'
import { dirnamePath, execProcess, spawnProcess } from '@renderer/lib/native_fnc_proxy'
export default class Item implements Sortable {
  id!: number
  cateId!: number
  name = ''
  path = ''
  type = 'file'
  by = ''
  cmd = ''
  icon = ''
  sc = ''
  sort!: number
  cwd = ''
  constructor(obj: unknown) {
    Object.assign(this, obj)
  }
  call(): void {
    if (this.by) {
      spawnProcess(this.by, this.path)
      return
    }
    if (this.cmd) {
      return execProcess(`"${this.path}" ${this.cmd}`)
    }
    this.openItem(this.path)
  }
  openParent(): void|Promise<void> {
    if (this.type === URL) {
      return shell.openExternal(getTopUrl(this.path))
    }
    let parent = dirnamePath(this.path)
    if (!parent) {
      parent = this.path
    }
    this.openItem(parent)
  }
  openItem(path: string): void {
    console.log(path)
    shell.openPath(path)
  }
}

function getTopUrl(urlstring: string): string {
  const thisUrl = new url.URL(urlstring)
  return `${thisUrl.protocol}//${thisUrl.host}/`
}