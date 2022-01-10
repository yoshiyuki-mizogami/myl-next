<template>
  <div @contextmenu="showContentMenu" @dblclick="call" class="item" @dragstart="setDrag">
    <div class="item-icon" :style="{'background-image':dataUrl}"></div><span class="item-content">{{item.name}}</span>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import hub from '../ts/event-hub'
import Item from '../ts/models/item'
import { ipcRenderer} from 'electron'
import {Menu, MenuItem} from 'electron'
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
  const ui = state.ui
  const menu = new Menu()
  const openParent = new MenuItem({
    id:'OpenParent',
    accelerator:'o',
    type:'normal',
    label:ui.OPEN_PARENT,
    click(){
      item.openParent()
    }
  })
  const thisCopyItemPath = new MenuItem({
    id:'Copy',
    accelerator:'c',
    type:'normal',
    label:ui.COPY,
    click(){
      copyItemPath(item)
    }
  })
  const editItem  = new MenuItem({
    id:'Edit', 
    accelerator:'e',
    type:'normal',
    label:ui.EDIT, 
    click(){
      showItemDetail(item)
    }
  })
  const thisRemoveItem = new MenuItem({
    id:'Remove',
    accelerator:'r',
    type:'normal',
    label:ui.REMOVE,
    click(){
      hub.emit('show-dialog' ,{
        y:ev.clientY,
        x:ev.clientX,
        message:'Remove ok?',
        onOk(){
          removeItem(item)
        },
        cancelable:true
      })
    }
  })
  menu.append(openParent)
  menu.append(thisCopyItemPath)
  menu.append(editItem)
  menu.append(thisRemoveItem)
  menu.popup({})
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