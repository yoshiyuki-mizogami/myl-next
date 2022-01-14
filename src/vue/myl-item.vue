<template>
  <div
    class="item"
    @contextmenu="showContentMenu"
    @dblclick="call"
    @dragstart="setDrag"
  >
    <div
      class="item-icon"
      :style="{'background-image':dataUrl}"
    />
    <span class="item-content">{{ item.name }}</span>
  </div>
</template>
<script lang="ts">
import { defineComponent, toRaw } from 'vue'
import hub from '../ts/event-hub'
import Item from '../ts/models/item'
import { ipcRenderer} from 'electron'
import { copyItemPath, removeItem, setDragItem, showItemDetail, state } from '../ts/store'
export default defineComponent({
  props:{
    item:{
      type:Item,
      required:true
    }
  }, 
  computed:{
    sortMode(){
      return state.sortMode
    },
    dataUrl(){
      return `url(${this.item.icon})`
    }
  },
  methods:{
    call(){
      this.item.call()
    },
    showContentMenu(ev:MouseEvent){
      contextMenu(ev, this.item)
    },
    setDrag(ev:DragEvent){
      setDragItem(this.item)
      const dataTransfer = ev.dataTransfer as DataTransfer
      if(this.sortMode){
        dataTransfer.setData('text/plain', this.item.path)
        dataTransfer.setData('myl/item', '1')
        return
      }
      if(this.item.type === 'url'){
        ev.stopPropagation()
        dataTransfer.setData('myl/item', '1')
        dataTransfer.setData('text/uri-list', this.item.path)
        return
      }
      ev.preventDefault()
      ev.stopPropagation()
      ipcRenderer.send('ondragstart', this.item.path)
    }
  }
})
function contextMenu(ev:MouseEvent, item:Item){
  const SEND_EVENT_NAME = 'show-item-menu'
  const RESPONSE_EVENT_NAME = 'select-item-menu'
  ipcRenderer.once(RESPONSE_EVENT_NAME, (_ev, type)=>{
    switch(type){
    case 'openParent':{
      item.openParent()
      break
    }
    case 'copy':{
      copyItemPath(item)
      break
    }
    case 'edit':{
      showItemDetail(item)
      break
    }
    case 'remove':{
      let itemName = item.name
      if(itemName.length > 8){
        itemName = itemName.substring(0,8) + '...'
      }
      hub.emit('show-dialog' ,{
        y:ev.clientY,
        x:ev.clientX,
        message:`${itemName}
${state.ui.CONFIRM_REMOVE}`,
        onOk(){
          removeItem(item)
        },
        cancelable:true
      })
      break
    }
    }
  })
  ipcRenderer.send(SEND_EVENT_NAME, toRaw(state.ui))
}
</script>

<style lang="stylus">
.item
  padding 0
  width 100%
  background-color var(--item-bg)
  color var(--item-color)
  font-size 13px
  word-wrap break-word
  cursor pointer
  >span
    vertical-align middle
  &:nth-child(even)
    background-color var(--item-even-bg)
    color var(--item-even-color)
  .item-icon
    vertical-align middle
    margin 0
    margin-right 1px
    padding 0
    display inline-block
    height 22px
    width 22px
    background-repeat no-repeat
    background-position center
    background-size cover
  &:hover
    background-color var(--item-hover) !important
  .item-content
    display:inline-block;
    width calc(100% - 23px)
</style>