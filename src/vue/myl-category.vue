<template>
  <div
    class="category"
    :class="{selected}"
    :style="{backgroundColor}"
    @contextmenu="showContextMenu"
    @drop="dropToCategory"
    @dragstart="dragStartCategory"
    @click="$emit('select-category', category)"
  >
    <span v-if="!thisState.editMode">{{ category.name }}</span>
    <span v-else><input
      ref="editor"
      class="category-name-editor"
      :value="category.name"
      type="text"
      @keydown.enter.prevent="updateName"
      @focusout="updateName"
    ></span>
  </div>
</template>
<script setup lang="ts">
import { defineEmits, defineProps, computed, reactive, toRaw, PropType, watchEffect, ref } from 'vue'
import hub from '../ts/event-hub'
import {ipcRenderer} from 'electron'
import { moveItem, openColorSetter, removeCategory, state, updateCategoryName } from '../ts/store'
import { nextTick } from 'process'
import Category from 'src/ts/models/category'
defineEmits(['select-category'])
const thisState = reactive({
  editMode:false
})
const props = defineProps({
  category:{
    type:Object as PropType<Category>,
    required:true
  },
  selected:Boolean
})
const backgroundColor = computed(()=>{
  const {color:c} = props.category
  if(!c){
    return ''
  }
  return `rgb(${c.r},${c.g},${c.b})`
})
watchEffect(()=>{
  if(thisState.editMode)
    nextTick(()=>enterEdit())
})

function dragStartCategory(ev:DragEvent){
  if(!state.sortMode){
    ev.stopPropagation()
    ev.preventDefault()
    return
  }
  const dataTransfer = ev.dataTransfer as DataTransfer
  dataTransfer.setData('myl/category', '1')
}
function showContextMenu(ev:MouseEvent){
  ipcRenderer.once('select-category-menu-item', (e, select:string)=>{
    switch(select){
    case 'rename':{
      thisState.editMode = true
      break
    }
    case 'openColorSetter':{
      openColorSetter(props.category)
      break
    }
    case 'delete':{
      hub.emit('show-dialog' ,{
        y:ev.clientY,
        x:ev.clientX,
        message:state.ui.CONFIRM_DELETE,
        onOk:()=>{
          removeCategory(props.category)
        },
        cancelable:true
      })
      break
    }
    default:{
      console.warn('unknown event response', select)
    }
    }
  })
  ipcRenderer.send('show-category-menu', toRaw(state.ui))
}
const editor = ref(null)  as null|{value:HTMLInputElement}
function enterEdit(){
  nextTick(()=>editor.value.select())
}
function updateName(event:FocusEvent|KeyboardEvent){
  const target = event.target as HTMLInputElement
  const newName = target.value
  thisState.editMode = false
  if(newName === props.category.name){
    return
  }
  hub.emit('notify', state.ui.NAME_UPDATED)
  updateCategoryName(props.category, newName)
}
function dropToCategory(ev:DragEvent){
  console.log(ev)
  const dt = ev.dataTransfer as DataTransfer
  const fromCategory = dt.getData('myl/category')
  if(fromCategory){
    return ev.stopPropagation()
  }
  const fromThis = dt.getData('myl/item')
  if(!fromThis){
    return
  }
  ev.stopPropagation()
  return moveItem(props.category)
}

</script>
<style lang="stylus">
.category
  min-height 20px
  background-color var(--cate-bg)
  color var(--cate-color)
  width 100%
  cursor pointer
  font-size 13px
  word-wrap break-all
  input,textarea
    font-size inherit
    padding inherit
  &:nth-child(even)
    background-color var(--cate-even-bg)
    color var(--cate-even-color)
  &.selected
    font-weight bold
    opacity 0.7
  &:hover
    background-color var(--cate-hover)
  .category-name-editor
    width 100%
</style>