<template>
  <transition name="notify">
    <div 
      v-if="show"
      class="notify"
    >
      {{ m }}
    </div>
  </transition>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import hub from '../ts/event-hub'
const NOTIFY_TIMEOUT = 4000
export default defineComponent({
  data(){
    return {
      show:false,
      ev:0,
      m:''
    }
  },
  created(){
    hub.on('notify', this.showNotify)
  },
  methods:{
    showNotify(message:string){
      this.show = true
      this.m = message
      this.setHideTimer()
    },
    setHideTimer(){
      clearTimeout(this.ev)
      this.ev = setTimeout(()=>this.show = false, NOTIFY_TIMEOUT)
    }
  }
})
</script>

<style lang="stylus">
.notify
  position fixed
  top 10%
  right 0
  padding 3px
  border-radius 2px 0px 0px 2px
  background-color var(--notify-bg)
.notify-enter-active, .notify-leave-active
  transition transform .3s ease
  transform translateX(0)
.notify-enter, .notify-leave-to
  transform translateX(100px)
</style>