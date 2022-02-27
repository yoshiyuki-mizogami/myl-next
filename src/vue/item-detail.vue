
<template>
  <OverlayLayer v-if="data.show">
    <div class="item-detail">
      <div
        class="close-btn icon-close"
        @click="hideMe"
      />
      <div class="prop">
        <span class="prop-title">{{ state.ui.ITEM_NAME }}</span>
        <input
          v-model.lazy="data.data.name"
          type="text"
          class="prop-text"
        >
      </div>
      <div class="prop">
        <span class="prop-title">{{ state.ui.ITEM_PATH }}</span>
        <input
          v-model.lazy="data.data.path"
          type="text"
          class="prop-text"
        >
      </div>
      <div class="prop">
        <span class="prop-title">{{ state.ui.BY }}</span>
        <input
          v-model.lazy="data.data.by"
          type="text"
          class="prop-text with-text"
          readonly
        >
        <input
          type="button"
          class="with-select"
          :value="state.ui.SELECT"
          @click="selectWith"
        >
      </div>
      <div 
        v-if="isFile"
        class="prop"
      >
        <span class="prop-title">{{ state.ui.ARG }}</span>
        <input
          v-model.lazy="data.data.cmd"
          type="text"
          class="prop-text"
        >
      </div>
    </div>
  </OverlayLayer>
</template>
<script setup lang="ts">
import { reactive, computed } from 'vue'
import Item from '../ts/models/item'
import EventHub from '../ts/event-hub'
import {FILE} from '../ts/consts'
import { updateItem } from '../ts/store'
import OverlayLayer from './overlay-layer.vue'
import { ipcRenderer } from 'electron'
import { state } from '../ts/store'
const DEF = {}
Object.seal(DEF)
const data = reactive({
  show: false,
  data: DEF as Item,
  by: ''
})
const isFile = computed(()=>data.data.type === FILE)
EventHub.on('show-item-detail', showMe)
function showMe(item: Item) {
  data.show = true
  data.data = item
}
function hideMe() {
  data.show = false
  updateItem(data.data)
  data.data = DEF as Item
}
async function selectWith() {
  const files = await ipcRenderer.invoke('showOpenDialog', {
    title:state.ui.SELECT_BOOT_BY,
  })
  if (!files.filePaths.length) {
    return data.data.by = ''
  }
  const [filepath] = files.filePaths
  data.by = filepath
}

</script>


<style lang="stylus">
.item-detail
  position relative
  width 95%
  height 200px
  margin 20px auto
  background-color var(--base)
  color var(--base-color)
  box-shadow 0 0 5px rgba(0,0,0, .5)
  padding 5px
  font-size 0
  input
    color var(--base-color)
  .prop
    margin 1px
  .prop-title
    font-size 12px
    display inline-block
    width 25%
    text-align center
  .prop-text
    text-align left
    border-bottom solid 1px gray
    background-color transparent
    width 75%
    &.with-text
      width 60%
  .with-select
    font-size 10px
    width 15%
    vertical-align middle
</style>