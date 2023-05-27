import { contextBridge, ipcRenderer, nativeImage } from 'electron'

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('ipcRenderer', ipcRenderer)
    contextBridge.exposeInMainWorld('nativeImage', nativeImage)
  } catch (error) {
    console.error(error)
  }
} else {
  // // @ts-ignore (define in dts)
  // window.electron = electronAPI
  // // @ts-ignore (define in dts)
  // window.api = api
}
