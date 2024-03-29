const { ipcRenderer } = window
import type { Stats } from 'node:fs'

export function joinPath(base: string, add: string): string {
  if (!base.endsWith('/')) {
    base += '/'
  }
  return `${base}${add}`
}

export function extnamePath(path: string): string {
  const m = path.match(/\.[^/\\]+$/)
  if (m == null) {
    return ''
  }
  return m[0]
}

export function dirnamePath(path: string): string {
  const sp = path.split(/([\\/])/)
  const last = sp.pop()
  if (last === '/' || last === '\\') {
    sp.pop()
  }
  return sp.join('').replace(/[\\/]$/, '')
}

export function basenamePath(path: string): string {
  const sp = path.split(/([\\/])/)
  let last = sp.pop()
  if (last === '/' || last === '\\') {
    last = sp.pop()
  }
  return last || ''
}

export async function writeFileProxy(
  path: string,
  content: string,
  encoding = 'utf8'
): Promise<boolean> {
  return ipcHandleCommunicate('write-file', { path, content, encoding })
}

export async function readFileProxy(path: string, encoding = 'utf8'): Promise<string> {
  return ipcHandleCommunicate('read-file', { path, encoding })
}

export async function existsFileProxy(path: string): Promise<boolean> {
  return ipcHandleCommunicate('exists-file', { path })
}

export async function unlinkProxy(path: string): Promise<boolean> {
  return ipcHandleCommunicate('unlink-file', { path })
}

export async function statFile(filepath: string): Promise<Stats & { isDir: boolean }> {
  return ipcHandleCommunicate('stat-file', filepath)
}


export function shellOpenExternalProxy(path: string): void {
  ipcSend('open-shell-external', path)
}

export function shellOpenProxy(path: string): void {
  ipcSend('open-shell', path)
}

export function writeClipboardProxy(txt: string): void {
  ipcSend('write-clipboard', txt)
}

export function readShortcutLinkProxy(path: string): Promise<string> {
  return ipcHandleCommunicate<string>('read-shortcut', path)
}

export function execProcess(cmd: string): void {
  ipcHandleCommunicate('exec-process', cmd)
}

export function getDesktopPathProxy(): Promise<string>{
  return ipcHandleCommunicate('get-desktop-path')
}

export function getFileIconProxy(path: string): Promise<string>{
  return ipcHandleCommunicate('get-file-icon', path)
}

function ipcHandleCommunicate<T>(channel: string, data: unknown = undefined): Promise<T> {
  return ipcRenderer.invoke(channel, data)
}

function ipcSend(channel: string, data: unknown): void {
  ipcRenderer.send(channel, data)
}
