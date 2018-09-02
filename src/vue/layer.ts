import Vue from "vue";
import Hub from '../ts/event-hub'
export default {
  watch:{
    show(v){
      if(v){
        return Hub.pushLayer(this)
      }
      Hub.popLayer()
    }
  },
  created(){
    this.$on('keydown',ev=>{
      console.log(ev)
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