import { defineComponent } from 'vue'
import {popLayer, pushLayer} from '../ts/event-hub'
import {state} from '../ts/store'
export default defineComponent({
  watch:{
    show(v:any){
      if(v){
        return pushLayer(this)
      }
      popLayer()
    }
  },
  computed:{
    ui(){
      return state.ui
    }
  },
  created(){
  },
  methods:{
    keydown(this:any, ev:KeyboardEvent){
      const {key} = ev
      const func = this.shortCuts[key]
      if(!func){
        return
      }
      func()
    },
    setShortcut(this:any, shortcuts:object){
      this.shortCuts = shortcuts
    }
  }
})