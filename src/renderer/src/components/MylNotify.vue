<template>
  <transition name="notify">
    <div v-if="data.show" class="notify">
      {{ data.m }}
    </div>
  </transition>
</template>
<script setup lang="ts">
import { reactive } from 'vue'
import hub from '../event-hub'
const NOTIFY_TIMEOUT = 4000
const data = reactive({
  show: false,
  ev: 0 as number,
  m: ''
})
hub.on('notify', showNotify)
function showNotify(message: string): void {
  data.show = true
  data.m = message
  setHideTimer()
}
function setHideTimer(): void {
  clearTimeout(data.ev)
  data.ev = window.setTimeout(() => (data.show = false), NOTIFY_TIMEOUT)
}
</script>

<style lang="scss">
.notify {
  position: fixed;
  top: 10%;
  right: 0;
  padding: 3px;
  border-radius: 2px 0px 0px 2px;
  background-color: var(--notify-bg);
}
.notify-enter-active,
.notify-leave-active {
  transition: transform 0.3s ease;
  transform: translateX(0);
}
.notify-enter,
.notify-leave-to {
  transform: translateX(100px);
}
</style>
