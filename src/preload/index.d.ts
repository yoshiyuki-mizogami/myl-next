import { nativeImage, ipcRenderer } from 'electron'
declare global {
  interface Window {
    ipcRenderer: ipcRenderer
    nativeImage: ativeImage
  }
}
