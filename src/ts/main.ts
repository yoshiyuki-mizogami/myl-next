import { ipcRenderer } from 'electron'
import {createApp} from 'vue'
import AppRoot from '../vue/app-root.vue'

createApp(AppRoot).mount('#app')

