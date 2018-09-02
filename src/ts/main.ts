import Vue from 'vue'
import Vuex from 'vuex'
import Root from '../vue/root.vue'
import MylStore from '../ts/store'
Vue.use(Vuex)
new Vue({
  el:'#app',
  store:new MylStore(),
  render(createElement){
    return createElement(Root)
  }
})