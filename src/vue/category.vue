<template>
  <div @contextmenu="showContextMenu" :class="{selected}"
    @drop="dropToCategory"
    @dragstart="dragStartCategory"
    @click="$emit('select-category', category)" class="category">
    <span v-if="!editMode">{{category.name}}</span>
    <span v-else><input ref="editor" @focusout="updateName" type="text" class="category-name-editor" v-model="category.name"></span>
  </div>
</template>
<script lang="ts">
import { defineComponent, toRaw } from 'vue'
import Category from '../ts/models/category'
import hub from '../ts/event-hub'
import {ipcRenderer, Menu, MenuItem} from 'electron'
import { moveItem, removeCategory, state } from '../ts/store'
import { nextTick } from 'process'
export default defineComponent({
  data(){
    return {
      editMode:false,
      saveName:''
    }
  },
  props:{
    category:{
      type:Object,
      required:true
    },
    selected:Boolean
  },
  computed:{
    sortMode(){return state.sortMode}
  },
  watch:{
    editMode(v:boolean){
      if(v){
        this.enterEdit()
      }
    }
  } as any,
  methods:{
    dragStartCategory(this:any, ev:DragEvent){
      if(!this.sortMode){
        ev.stopPropagation()
        ev.preventDefault()
        return
      }
      const dataTransfer = ev.dataTransfer as DataTransfer
      dataTransfer.setData('myl/category', '1')
    },
    showContextMenu(this:any, ev:MouseEvent){
      ipcRenderer.once('select-category-menu-item', (e, select:string)=>{
        switch(select){
          case 'rename':{
            this.editMode = true
            break;
          }
          case 'delete':{
            hub.emit('show-dialog' ,{
              y:ev.clientY,
              x:ev.clientX,
              message:state.ui.CONFIRM_DELETE,
              onOk:()=>{
                removeCategory(this.category)
              },
              cancelable:true
            })
            break;
          }
          default:{

          }
        }
      })
      ipcRenderer.send('show-category-menu', toRaw(state.ui))
    },
    enterEdit(this:any){
      this.saveName = this.category.name
      nextTick(()=>this.$refs.editor.select())
    },
    updateName(this:any){
      const {saveName} = this
      this.editMode = false
      this.saveName = ''
      if(!this.category.name.trim()){
        this.category.name = saveName
        hub.emit('notify', state.ui.REQUIRE_NAME)
        return 
      }
      if(this.category.name === saveName){
        return
      }
      hub.emit('notify', state.ui.NAME_UPDATED)
      this.$store.dispatch('updateCategoryName', this.category)
    },
    dropToCategory(this:any, ev:DragEvent){
      console.log(ev)
      const dt = ev.dataTransfer as DataTransfer
      const fromCategory = dt.getData('myl/category')
      console.log(fromCategory)
      if(fromCategory){
        return ev.stopPropagation()
      }
      const fromThis = dt.getData('myl/item')
      if(!fromThis){
        return
      }
      ev.stopPropagation()
      return moveItem(this.category)
    }
  }
})
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
    background-color var(--selected-cate)
    color var(--selected-cate-color)
  &:hover
    background-color var(--cate-hover)
  .category-name-editor
    width 100%
</style>