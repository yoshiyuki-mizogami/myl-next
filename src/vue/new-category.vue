<template>
  <OverlayLayer v-if="state.showNewCategoryDialog">
    <div class="new-category">
      <div
        class="icon-close close-btn"
        @click="closeMe"
      />
      Input new category name
      <input
        ref="input"
        type="text"
        class="new-category-input"
        :placeholder="state.ui.INPUT_NEW_CATEGORY"
        @keydown.enter="doAddNewCategory"
      >
    </div>
  </OverlayLayer>
</template>
<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { addNewCategory, setNewCategoryDialog, state } from '../ts/store'
import OverlayLayer from './overlay-layer.vue'
const input = ref(null)
watch(()=>state.showNewCategoryDialog, (to)=>{
  if( !to ){
    return
  }
  nextTick(()=> input.value.focus())
})
function doAddNewCategory(ev: KeyboardEvent) {
  const target = ev.target as HTMLInputElement
  const name = target.value.trim() as string
  if (!name) {
    return
  }
  addNewCategory(name)
  closeMe()
}
function closeMe() {
  setNewCategoryDialog(false)
}
</script>

<style lang="stylus">
.new-category
  width 300px
  margin 10% auto
  background-color white
  text-align center
  padding 10px
  border-radius 2px
  input
    padding 5px
</style>