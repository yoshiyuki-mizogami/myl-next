<style lang="stylus">
.category
  min-height 20px
  background-color var(--cate-bg)
  width 100%
  cursor pointer
  transition background .3s ease
  font-size 13px
  input,textarea
    font-size inherit
    padding inherit
  &:nth-child(even)
    background-color var(--cate-even-bg)
  &.selected
    background-color var(--selected-cate)
  &:hover
    background-color var(--cate-hover)
  .category-name-editor
    width 100%
</style>

<template>
  <div @contextmenu="showContextMenu" :class="{selected}" @click="$parent.$parent.selectCategory(category)" class="category">
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
  watch:{
    editMode(v){
      if(v){
        this.enterEdit()
      }
    }
  },
  methods:{
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
    }
  }
})
function contextMenu(vm:any ,store:Store<any>, ev:MouseEvent, cate:Category){
  const menu = new Menu()
  const renameItem  = new MenuItem({
    id:'Rename', 
    accelerator:'e',
    type:'normal',
    label:'Rename', 
    click(){
      vm.editMode = true
    }
  })
  const removeItem = new MenuItem({
    id:'Remove',
    accelerator:'r',
    type:'normal',
    label:'Remove',
    click(){
      hub.$emit('show-dialog' ,{
        y:ev.clientY,
        x:ev.clientX,
        message:'Remove ok?',
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
