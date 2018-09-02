import Vue from 'vue'
export default new Vue({
  data:{
    layers:[] as Vue[]
  },
  methods:{
    pushLayer(l){
      this.layers.push(l)
    },
    popLayer(){
      this.layers.pop()
    },
    keydown(ev){
      const {layers} = this
      const topLayer = layers[layers.length -1]
      if(!topLayer){
        return
      }
      topLayer.$emit('keydown',ev)
    }
  }
})