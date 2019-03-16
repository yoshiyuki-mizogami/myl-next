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

<template>
  <div @contextmenu="showContextMenu" :class="{selected}"
    @drop="dropToCategory"
    @dragstart="dragStartCategory"
    @click="$parent.$parent.selectCategory(category)" class="category">
    <span v-if="!editMode">{{category.name}}</span>
    <span v-else><input ref="editor" @focusout="updateName" type="text" class="category-name-editor" v-model="category.name"></span>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import {remote, PopupOptions} from 'electron'
import {mapState, Store} from 'vuex'
import Vuex from 'vuex'
import Category from '../ts/models/category'
import globals from '../ts/globals'
import hub from '../ts/event-hub'
const {Menu, MenuItem} = remote
export default Vue.extend({
  data(){
    return {
      editMode:false,
      saveName:''
    }
  },
  props:{
    category:Object,
    selected:Boolean
  },
  computed:{
    ...mapState({
      sortMode:'sortMode'
    })
  },
  watch:{
    editMode(v){
      if(v){
        this.enterEdit()
      }
    }
  },
  methods:{
    dragStartCategory(ev:DragEvent){
      if(!this.sortMode){
        ev.stopPropagation()
        ev.preventDefault()
        return
      }
      ev.dataTransfer.setData('myl/category', '1')
    },
    showContextMenu(ev:MouseEvent){
      contextMenu(this,this.$store,ev,this.category)
    },
    enterEdit(){
      this.saveName = this.category.name
      this.$nextTick(()=>this.$refs.editor.select())
    },
    updateName(){
      const {saveName} = this
      this.editMode = false
      this.saveName = ''
      if(!this.category.name.trim()){
        this.category.name = saveName
        hub.$emit('notify', this.$store.state.ui.REQUIRE_NAME)
        return 
      }
      if(this.category.name === saveName){
        return
      }
      hub.$emit('notify', this.$store.state.ui.NAME_UPDATED)
      this.$store.dispatch('updateCategoryName', this.category)
    },
    dropToCategory(ev:DragEvent){
      console.log(ev)
      const {dataTransfer:dt} = ev
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
      return this.$store.dispatch('moveItem', this.category)
    }
  }
})
function contextMenu(vm:any ,store:Store<any>, ev:MouseEvent, cate:Category){
  const {state:{ui}} = store
  const menu = new Menu()
  const renameItem  = new MenuItem({
    id:'Rename', 
    accelerator:'r',
    type:'normal',
    label:ui.RENAME, 
    click(){
      vm.editMode = true
    }
  })
  const removeItem = new MenuItem({
    id:'Delete',
    accelerator:'d',
    type:'normal',
    label:ui.DELETE,
    click(){
      hub.$emit('show-dialog' ,{
        y:ev.clientY,
        x:ev.clientX,
        message:ui.CONFIRM_DELETE,
        onOk(){
          store.dispatch('removeCategory', cate)
        },
        cancelable:true
      })
    }
  })
  menu.append(renameItem)
  menu.append(removeItem)
  menu.popup({})
}
</script>
