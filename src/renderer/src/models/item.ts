import { shell } from 'electron'
import { spawn, exec } from 'child_process'
import { dirname } from 'path'
import { Sortable } from './sortable'
import { URL } from '../consts'
import url from 'url'
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
  call(): void|ReturnType<typeof exec> {
    if (this.by) {
      spawn(this.by, [this.path], { detached: true })
      return
    }
    if (this.cmd) {
      return exec(
        `"${this.path}" ${this.cmd}`,
        {
          windowsHide: true
        },
        () => {}
      )
    }
    this.openItem(this.path)
  }
  openParent(): void|Promise<void> {
    if (this.type === URL) {
      return shell.openExternal(getTopUrl(this.path))
    }
    let parent = dirname(this.path)
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
