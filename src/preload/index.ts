import { ipcRenderer, nativeImage, contextBridge } from 'electron'

try {
  contextBridge.exposeInMainWorld('ipcRenderer', ipcRenderer)
  contextBridge.exposeInMainWorld('nativeImage', nativeImage)
} catch (error) {
  console.error(error)
}
