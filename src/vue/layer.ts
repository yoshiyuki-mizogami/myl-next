import Vue from "vue";
import Hub from '../ts/event-hub'
import { mapState } from "vuex";
export default {
  watch:{
    show(v){
      if(v){
        return Hub.pushLayer(this)
      }
      Hub.popLayer()
    }
  },
  computed:mapState({
    ui:'ui'
  }),
  created(){
    this.$on('keydown',ev=>{
      const {key} = ev
      const func = this.shortCuts[key]
      if(!func){
        return
      }
      func()
    })
  },
  methods:{
    setShortcut(shortcuts:object){
      this.shortCuts = shortcuts
    }
  }
}