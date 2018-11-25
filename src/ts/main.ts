import Vue from 'vue'
import Root from '../vue/root.vue'
import MylStore from '../ts/store'

new Vue({
  el:'#app',
  store:MylStore,
  render(createElement){
    return createElement(Root)
  }
})