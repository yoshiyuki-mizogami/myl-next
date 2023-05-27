<template>
  <div
    class="item"
    @contextmenu="showContentMenu"
    @dblclick="() => item.call()"
    @dragstart="setDrag"
  >
    <div class="item-icon" :style="{ 'background-image': dataUrl }" />
    <span class="item-content">{{ item.name }}</span>
  </div>
</template>
<script setup lang="ts">
import { computed, defineProps, toRaw } from 'vue'
import hub from '../event-hub'
import Item from '../models/item'
import { copyItemPath, removeItem, setDragItem, showItemDetail, state } from '../store'
const { ipcRenderer } = window as any

const props = defineProps({
  item: {
    type: Item,
    required: true
  }
})
const dataUrl = computed(() => `url(${props.item.icon})`)
function showContentMenu(ev: MouseEvent): void {
  contextMenu(ev, props.item)
}
function setDrag(ev: DragEvent): void {
  setDragItem(props.item)
  const dataTransfer = ev.dataTransfer as DataTransfer
  if (state.sortMode) {
    dataTransfer.setData('text/plain', props.item.path)
    dataTransfer.setData('myl/item', '1')
    return
  }
  if (props.item.type === 'url') {
    ev.stopPropagation()
    dataTransfer.setData('myl/item', '1')
    dataTransfer.setData('text/uri-list', props.item.path)
    return
  }
  ev.preventDefault()
  ev.stopPropagation()
  ipcRenderer.send('ondragstart', props.item.path)
}
function contextMenu(ev: MouseEvent, item: Item): void {
  const SEND_EVENT_NAME = 'show-item-menu'
  const RESPONSE_EVENT_NAME = 'select-item-menu'
  ipcRenderer.once(RESPONSE_EVENT_NAME, (_ev, type) => {
    switch (type) {
      case 'openParent': {
        item.openParent()
        break
      }
      case 'copy': {
        copyItemPath(item)
        break
      }
      case 'edit': {
        showItemDetail(item)
        break
      }
      case 'remove': {
        let itemName = item.name
        if (itemName.length > 8) {
          itemName = itemName.substring(0, 8) + '...'
        }
        hub.emit('show-dialog', {
          y: ev.clientY,
          x: ev.clientX,
          message: `${itemName}
${state.ui.CONFIRM_REMOVE}`,
          onOk() {
            removeItem(item)
          },
          cancelable: true
        })
        break
      }
    }
  })
  ipcRenderer.send(SEND_EVENT_NAME, toRaw(state.ui))
}
</script>

<style lang="scss">
.item {
  padding: 0;
  width: 100%;
  background-color: var(--item-bg);
  color: var(--item-color);
  font-size: 13px;
  word-wrap: break-word;
  cursor: pointer;
  > span {
    vertical-align: middle;
  }
  &:nth-child(even) {
    background-color: var(--item-even-bg);
    color: var(--item-even-color);
  }
  .item-icon {
    vertical-align: middle;
    margin: 0;
    margin-right: 1px;
    padding: 0;
    display: inline-block;
    height: 22px;
    width: 22px;
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
  }
  &:hover {
    background-color: var(--item-hover) !important;
  }
  .item-content {
    display: inline-block;
    width: calc(100% - 23px);
  }
}
</style>
