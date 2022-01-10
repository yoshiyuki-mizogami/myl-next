import { ipcRenderer } from 'electron'
import {createApp} from 'vue'
import Root from '../vue/root.vue'

!async function load(){
  await ipcRenderer.invoke('getrootdir')
  await ipcRenderer.invoke('getversion')
  createApp(Root).mount('#app')
}()

