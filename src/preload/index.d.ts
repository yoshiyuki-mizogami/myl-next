import { NativeImage, IpcRenderer } from 'electron'
declare global {
  interface Window {
    ipcRenderer: IpcRenderer
    nativeImage: NativeImage
  }
}
