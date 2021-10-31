import { ipcRenderer } from 'electron'
import Vue from 'vue'
import Root from '../vue/root.vue'
import MylStore from '../ts/store'

!async function load(){
  window['ROOTDIR'] = await ipcRenderer.invoke('getrootdir')
  window['VERSION'] = await ipcRenderer.invoke('getversion')
  new Vue({
    el:'#app',
    store:MylStore,
    render(createElement){
      return createElement(Root)
    }
  })
}()

