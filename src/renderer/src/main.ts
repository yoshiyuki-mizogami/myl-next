import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './AppRoot.vue'
import './assets/css/styles.scss'
const pinia = createPinia()
createApp(App).use(pinia).mount('#app')
