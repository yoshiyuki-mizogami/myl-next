<template>
  <OverlayLayer v-if="appState.showNewCategoryDialog">
    <div class="new-category">
      <div class="icon-close close-btn" @click="closeMe" />
      Input new category name
      <input
        ref="input"
        type="text"
        class="new-category-input"
        :placeholder="appState.ui.INPUT_NEW_CATEGORY"
        @keydown.enter="doAddNewCategory"
      />
    </div>
  </OverlayLayer>
</template>
<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import OverlayLayer from './OverlayLayer.vue'
import { useAppState } from '@renderer/state'
const appState = useAppState()
const input = ref(null as null | HTMLInputElement)
watch(
  () => appState.showNewCategoryDialog,
  (to) => {
    if (!to) {
      return
    }
    nextTick(() => input.value && input.value.focus())
  }
)
function doAddNewCategory(ev: KeyboardEvent): void {
  const target = ev.target as HTMLInputElement
  const name = target.value.trim() as string
  if (!name) {
    return
  }
  appState.addNewCategory(name)
  closeMe()
}
function closeMe(): void {
  appState.setNewCategoryDialog(false)
}
</script>

<style lang="scss">
.new-category {
  width: 300px;
  margin: 10% auto;
  background-color: white;
  text-align: center;
  padding: 10px;
  border-radius: 2px;
  input {
    padding: 5px;
  }
}
</style>
