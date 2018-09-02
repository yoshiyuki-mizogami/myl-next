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

<template>
  <transition name="notify">
    <div class="notify" v-if="show">{{m}}</div>
  </transition>
</template>
<script lang="ts">
import Vue from 'vue'
import NOTIFY from '../enum/notify'
import hub from '../ts/event-hub'
const NOTIFY_TIMEOUT = 4000
export default Vue.extend({
  data(){
    return {
      show:false,
      ev:null,
      m:''
    }
  },
  created(){
    hub.$on('notify', this.showNotify)
  },
  methods:{
    showNotify(message, level = NOTIFY.INFO){
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

