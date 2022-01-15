<template>
  <div
    v-if="data.show"
    class="layer-back"
  >
    <div
      class="dialog"
      :style="{top:data.y+'px', left:data.x+'px'}"
    >
      <div class="dialog-mess">
        {{ data.message }}
      </div>
      <div class="dialog-console">
        <input
          type="button"
          value="OK"
          @click="ok"
        >
        <input
          v-if="data.cancelable"
          type="button"
          value="Cancel"
          @click="cancel"
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import hub from '../ts/event-hub'
const NOOP = ()=>{/**noop */}
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
const data = reactive(Object.assign({}, defOpt))
hub.on('show-dialog', showDialog)
function showDialog(opts){
  data.show = true
  opts.cancelable = (!opts.onCancel) || !!opts.cancelable
  Object.assign(data, opts)
  calcPos()
}
function calcPos(){
  const wh = window.outerHeight
  const ww = window.outerWidth
  let {y, x} = data
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
  data.y = y
  data.x = x
}
function reset(){
  Object.assign(data, defOpt)
}
async function ok(){
  await data.onOk()
  reset()
}
async function cancel(){
  await data.onCancel()
  reset()
}
</script>
<style lang="stylus">
.dialog
  white-space pre-wrap
  width 200px
  min-height 60px
  background-color var(--dialog-back)
  padding 5px
  border-radius 2px
  text-align center
  position fixed
  top 0
  left 0
  .dialog-console
    >input
      padding 2px 10px

</style>