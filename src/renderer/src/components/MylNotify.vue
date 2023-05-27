<template>
  <transition name="notify" appear>
    <div v-if="notify.show" class="notify">
      {{ notify.m }}
    </div>
  </transition>
</template>
<script setup lang="ts">
import { useNotify } from '@renderer/lib/notify-store'

const notify = useNotify()
</script>

<style lang="scss">
.notify {
  position: fixed;
  bottom: 10%;
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
