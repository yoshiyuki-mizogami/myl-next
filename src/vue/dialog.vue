<style lang="stylus">
.dialog
  width 200px
  height 60px
  background-color var(--dialog-back)
  padding 5px
  border-radius 5px
  text-align center
  position fixed
  top 0
  left 0
  .dialog-console
    >input
      padding 2px 10px

</style>
<template>
  <transition name="layer">
    <div class="layer-back" v-if="show">
      <div class="dialog" :style="{top:y+'px', left:x+'px'}">
        <div class="dialog-mess">{{message}}</div>
        <div class="dialog-console">
          <input @click="ok" type="button" value="OK">
          <input v-if="cancelable" @click="cancel" type="button" value="Cancel">
        </div>
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
import Vue from 'vue'
import globals from '../ts/globals'
import hub from '../ts/event-hub'
import {mapState} from 'vuex'
const {mainWindow} = globals
const NOOP = function(){}
const defOpt = {
  show:false,
  message:'',
  onOk:NOOP,
  onCancel:NOOP,
  cancelable:true,
  x:0,
  y:0
}
const H = 60, W = 200
const NUMBER = 'number'
export default Vue.extend({
  data(){
    return Object.assign({}, defOpt)
  },
  created(){
    hub.$on('show-dialog', this.showDialog)
  },
  methods:{
    showDialog(opts){
      this.show = true
      opts.cancelable = (!opts.onCancel) || !!opts.cancelable
      Object.assign(this, opts)
      this.calcPos()
    },
    calcPos(){
      const [ww, wh] = mainWindow.getSize()
      let {y, x} = this
      if(typeof y !== NUMBER){
        y = wh - wh / 2
      }
      if(typeof x !== NUMBER){
        x = ww - ww / 2
      }
      y -= H / 2
      x -= W / 2
      y = Math.min(y, wh - H)
      y = Math.max(y, 0)
      x = Math.min(x, ww - W)
      x = Math.max(x, 0)
      this.y = y
      this.x = x
    },
    reset(){
      Object.assign(this, defOpt)
    },
    async ok(){
      await this.onOk()
      this.reset()
    },
    async cancel(){
      await this.onCancel()
      this.reset()
    }
  }
})
</script>
