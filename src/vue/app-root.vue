<template>
  <div
    ref="app"
    class="whole"
  >
    <div
      v-if="state.loading"
      class="loading"
    />
    <div class="header">
      <div
        class="icon-plus header-btn new-cate-btn"
        @click="addNewCategory"
      />
      <div
        class="icon-sort-amount-asc header-btn switch-sortmode"
        :class="{sortMode:state.sortMode}"
        @click="switchSortMode"
      />
      <div
        class="icon-gear header-btn setting"
        @click="openSetting"
      />
      <div
        class="icon-clone header-btn aot-btn"
        :class="{aot:state.config.aot}"
        @click="doToggleAOT"
      />
      <div
        class="icon-sign-out header-btn close-app"
        @click="close"
      />
    </div>
    <div
      class="content"
      @drop.prevent="dropAny"
      @dragenter.prevent
      @dragover.prevent
    >
      <div class="categories">
        <draggable
          v-model="state.categories"
          item-key="id"
        >
          <template #item="{element}">
            <myl-category
              :selected="state.selectedCategory === element"
              :category="element"
              @select-category="state.selectedCategory = $event"
            />
          </template>
        </draggable>
      </div>
      <div class="items">
        <draggable
          v-model="state.items"
          :move="setSelectedCategory"
          item-key="id"
        >
          <template #item="{element}">
            <myl-item :item="element" />
          </template>
        </draggable>
      </div>
    </div>
    <new-cate-dialog />
    <app-setting />
    <item-detail />
    <myl-dialog />
    <myl-notify />
    <set-color />
  </div>
</template>
<script setup lang="ts">
import { nextTick, watch, ref, onMounted} from 'vue'
import MylCategory from './myl-category.vue'
import MylItem from './myl-item.vue'
import NewCateDialog from './new-category.vue'
import MylDialog from './myl-dialog.vue'
import MylNotify from './myl-notify.vue'
import eventHub from '../ts/event-hub'
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
  updateCategoriesOrder,
  isUrl,
  activateCategoryBykeydown
} from '../ts/store'
import SetColor from './set-color.vue'
watch(()=>state.selectedCategory,(to)=>getItems(to.id))
watch(()=>state.items, (to)=>updateItemsOrder(to))
watch(()=>state.categories, (to)=>updateCategoriesOrder(to))

onMounted(async ()=>{
  await init()
  eventHub.on('adjust', adjust)
  setTimeout(()=>adjust(), 100)
  setShortcut()
})

function addNewCategory(){
  setNewCategoryDialog(true)
}
function close(){
  window.close()
}
function doToggleAOT(){
  toggleAOT()
  setAlwaysOnTop(this.aot)
}
async function dropAny(e:DragEvent):Promise<void>{
  const {dataTransfer} = e as {dataTransfer:DataTransfer}
  const fromThis = dataTransfer.getData('myl/item')
  if(fromThis){
    return
  }
  let files = Array.from(dataTransfer.files)
  const url = dataTransfer.getData('text/plain')
  const thisIsUrl = isUrl.test(url)
  if(thisIsUrl){
    console.log(files[0])
    const name  = (()=>{
      return files.length > 0 ? files[0].name : ''
    })()
    return await addUrl({url, name})
  }
  files = files.filter(f=>{
    return (!state.dragItem) || f.path !== state.dragItem.path
  })
  if(!files.length){
    return
  }
  setLoading(true)
  await files.reduce((b, f)=>{
    return b.then(async ()=>await addFile({filepath:f.path}))
  }, Promise.resolve())
  setLoading(false)
}
const app = ref(null)
function adjust(){
  nextTick(()=>{
    const {clientHeight, clientWidth} = app.value as HTMLDivElement
    setSize(clientHeight, clientWidth)
  })
}
function openSetting(){
  eventHub.emit('open-setting')
}


function setShortcut(){
  window.addEventListener('keydown', ev=>{
    const tg = ev.target as unknown|HTMLElement
    if(tg['select'] !== undefined){
      return
    }
    activateCategoryBykeydown(ev)
  })
}
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