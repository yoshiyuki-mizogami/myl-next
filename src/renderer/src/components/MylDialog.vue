<template>
  <div v-if="dialog.show" class="layer-back">
    <div class="dialog" :style="{ top: dialog.y + 'px', left: dialog.x + 'px' }">
      <div class="dialog-mess">
        {{ dialog.message }}
      </div>
      <div class="dialog-console">
        <input type="button" value="OK" @click="dialog.ok" />
        <input v-if="dialog.cancelable" type="button" value="Cancel" @click="dialog.cancel" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDialog } from '@renderer/lib/dialog-store'
const dialog = useDialog()
</script>
<style lang="scss">
.dialog {
  white-space: pre-wrap;
  width: 200px;
  min-height: 60px;
  background-color: var(--dialog-back);
  padding: 5px;
  border-radius: 2px;
  text-align: center;
  position: fixed;
  top: 0;
  left: 0;
  .dialog-console {
    > input {
      padding: 2px 10px;
      &:first-child {
        margin-right: 1rem;
      }
    }
  }
}
</style>
