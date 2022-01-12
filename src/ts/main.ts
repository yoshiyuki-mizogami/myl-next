import { ipcRenderer } from 'electron'
import {createApp} from 'vue'
import Root from '../vue/root.vue'

createApp(Root).mount('#app')

