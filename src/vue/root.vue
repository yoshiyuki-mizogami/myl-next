<template>
  <div class="whole" ref="app">
    <div class="loading" v-if="loading"/>
    <div class="header">
      <div class="icon-plus header-btn new-cate-btn" @click="addNewCategory"></div>
      <div class="icon-sort-amount-asc header-btn switch-sortmode" :class="{sortMode}" @click="switchSortMode"></div>
      <div class="icon-gear header-btn setting" @click="openSetting"></div>
      <div class="icon-clone header-btn aot-btn" :class="{aot}" @click="toggleAOT"></div>
      <div class="icon-sign-out header-btn close-app" @click="close"></div>
    </div>
    <div class="content" @drop.prevent="dropAny" @dragenter.prevent @dragover.prevent>
      <div class="categories">
        <draggable v-model="state.categories" item-key="id">
          <template #item="{element}">
            <a-category :selected="selectedCategory === element" @select-category="selectCategory" :category="element"/>
          </template>
        </draggable>
      </div>
      <div class="items">
        <draggable v-model="state.items" :move="checkMove" item-key="id">
          <template #item="{element}">
            <an-item :item="element"/>
          </template>
        </draggable>
      </div>
    </div>
    <new-cate-dialog/>
    <app-setting/>
    <item-detail/>
    <app-dialog/>
    <notify/>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import Category from './category.vue'
import Item from './item.vue'
import NewCateDialog from './new-category.vue'
import Dialog from './dialog.vue'
import Notify from './notify.vue'
import eventHub, {pushLayer, popLayer, keydown} from '../ts/event-hub'
import ItemDetail from './item-detail.vue'
import AppSetting from './app-setting.vue'
import draggable from 'vuedraggable'
import {
  switchSortMode,
  state,
  init,
  getItems,
  setNewCategoryDialog,
  toggleAOT,
  addUrl,
  setLoading,
  addFile,
  setSelectedCategory,
  setSize,
  setAlwaysOnTop,
updateItemsOrder,
updateCategoriesOrder
  } 
from '../ts/store'
import { nextTick } from 'process'
export default defineComponent({ 
  async created(){
    pushLayer(this)
    await init()
    eventHub.on('adjust', this.adjust)
    document.documentElement.addEventListener('keydown', keydown)
  },
  data(){
    return {
      state:state
    }
  },
  watch:{
    async selectedCategory(v){
      await getItems(v.id)
    },
    'state.items'(to,from){
      updateItemsOrder(to)
    },
    'state.categories'(to, from){
      updateCategoriesOrder(to)
    },
  },
  computed:{
    aot(){
      return state.config.aot
    },
    config(){
      return state.config
    },
    selectedCategory(){
      return state.selectedCategory
    },
    loading(){return state.loading},
    sortMode(){return state.sortMode},
    dragItem(){return state.dragItem}
  },
  mounted(){
    setTimeout(()=>this.adjust(), 100)
  },
  components:{
    'new-cate-dialog':NewCateDialog,
    'a-category':Category,
    'an-item':Item,
    'app-dialog':Dialog,
    AppSetting,
    ItemDetail,
    draggable,
    'notify':Notify
  },
  methods:{
    switchSortMode,
    checkMove(){
      return state.sortMode
    },
    addNewCategory(){
      setNewCategoryDialog(true)
    },
    close(){
      close()
    },
    toggleAOT(){
      toggleAOT()
      setAlwaysOnTop(this.aot)
    },
    async dropAny(e:DragEvent):Promise<void>{
      const trackLink = e.ctrlKey
      const {dataTransfer} = e as {dataTransfer:DataTransfer}
      const fromThis = dataTransfer.getData('myl/item')
      if(fromThis){
        return
      }
      let files = Array.from(dataTransfer.files)
      if(!files.length){
        const dragString = dataTransfer.getData('text/plain')
        await addUrl({url:dragString})
        return 
      }
      files = files.filter(f=>{
        return (!this.dragItem) || f.path !== this.dragItem.path
      })
      if(!files.length){
        return
      }
      setLoading(true)
      await files.reduce((b, f)=>{
        return b.then(async ()=>{
          await addFile({filepath:f.path})
        })
      }, Promise.resolve())
      setLoading(false)
    },
    selectCategory(c:any){
      setSelectedCategory(c)
    },
    adjust(){
      nextTick(()=>{
        const {app} = this.$refs
        const {clientHeight, clientWidth} = app as {clientHeight:number, clientWidth:number}
        setSize(clientHeight, clientWidth)
      })
    },
    openSetting(){
      eventHub.emit('open-setting')
    }
  }
})
</script>

<style lang="stylus">
html,body
  height 100%
  width 100%
  padding 0
  margin 0
  box-sizing border-box
  font-family 'メイリオ'
  overflow hidden
  background-color var(--base)
  color var(--base-color)
.layer-enter-active, .layer-leave-active
  transition opacity .3s ease
  opacity 1
.layer-enter, .layer-leave-to
  opacity 0
input
  outline none
  border-radius 2px
  padding 2px
  border none
  text-align center
  background-color rgb(244,244,244)
div,input, textarea, select
  box-sizing border-box
  font-family 'メイリオ'
input[type=button],button
  transition background .3s ease
  &:hover
    background-color rgb(255,223,233)

.whole
  width 100%
.header
  height 20px
  width:100%
  -webkit-app-region drag
  background-color var(--header-color)
  text-align right
  .header-btn
    -webkit-app-region no-drag
    text-align center
    width 20px
    height 20px
    font-size 18px
    color rgb(100,100,100)
    border-radius 10%
    display inline-block
    cursor pointer
    &.new-cate-btn
      color rgb(120, 200, 255)
    &.aot-btn
      transition color .3s ease
      font-size 15px
    &.aot
      color rgb(255,255,30)
    &.close-app
      color rgb(255, 100, 120)
    &.setting
      color rgb(200,200,100)
    &.switch-sortmode
      color rgb(100,100,100)
      font-size 90%
      vertical-align middle
      &.sortMode
        color rgb(100,255,10)

.content
  height calc(100% - 20px)
  width 100%
  display flex
  flex-direction row
  .categories
    min-height 210px
    height 100%
    display flexbox
    text-align center
    width 122px
  .items
    background-color var(--item-back)
    width 228px
.loading
  position fixed
  top 0
  left 0
  height 1000px
  width 100%
  background-color rgba(0,0,0,.5)
.loading-enter,.loading-leave-to
  opacity 0
.close-btn
  position absolute
  font-size 20px
  top 0
  right 0
  width 25px
  height 25px
  text-align center
  color gray
  cursor pointer
  &:hover
    color black
</style>