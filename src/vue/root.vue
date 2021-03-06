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
        <draggable v-model="categories">
          <a-category v-for="c in categories" :selected="selectedCategory === c" :category="c" :key="c.id"/>
        </draggable>
      </div>
      <div class="items">
        <draggable v-model="items" :move="checkMove">
          <an-item v-for="i in items" :item="i" :key="i.id"></an-item>
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
import {remote} from 'electron'
import Vue from 'vue'
import {mapState,mapMutations} from 'vuex'
import Category from './category.vue'
import Item from './item.vue'
import NewCateDialog from './new-category.vue'
import Dialog from './dialog.vue'
import Notify from './notify.vue'
import hub from '../ts/event-hub'
import ItemDetail from './item-detail.vue'
import AppSetting from './app-setting.vue'
declare var require:(moduleId:string) => any
const draggable = require('vuedraggable')
const thisWindow = remote.getCurrentWindow()
export default Vue.extend({ 
  async created(){
    hub.pushLayer(this)
    await this.$store.dispatch('init')
    hub.$on('adjust', this.adjust)
    document.documentElement.addEventListener('keydown', hub.keydown)
  },
  watch:{
    async selectedCategory(v){
      await this.$store.dispatch('getItems', v.id)
    }
  },
  computed:{
    items:{
      get(){
        return this.$store.state.items
      },
      set(v){
        this.$store.dispatch('updateItemsOrder', v)
      }
    },
    categories:{
      get(){
        return this.$store.state.categories
      },
      set(v){
        this.$store.dispatch('updateCategoriesOrder', v)
      }
    },
    aot(){
      return this.$store.state.config.aot
    },
    config(){
      return this.$store.state.config
    },
    ...mapState({
      selectedCategory:'selectedCategory',
      loading:'loading',
      sortMode:'sortMode',
      dragItem:'dragItem'
    })
  },
  mounted(){
    this.adjust()
    this.showWindow()
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
    ...mapMutations({
      switchSortMode:'switchSortMode'
    }),
    checkMove(){
      return this.sortMode
    },
    addNewCategory(){
      this.$store.commit('setNewCategoryDialog', true)
    },
    close(){
      thisWindow.close()
    },
    toggleAOT(){
      this.$store.commit('toggleAOT')
      thisWindow.setAlwaysOnTop(this.aot)
    },
    async dropAny(e:DragEvent):Promise<void>{
      const trackLink = e.ctrlKey
      const {dataTransfer:df} = e
      const fromThis = df.getData('myl/item')
      if(fromThis){
        return
      }
      let files = Array.from(df.files)
      if(!files.length){
        const dragString = df.getData('text/plain')
        await this.$store.dispatch('addUrl', {url:dragString})
        return 
      }
      files = files.filter(f=>{
        return (!this.dragItem) || f.path !== this.dragItem.path
      })
      if(!files.length){
        return
      }
      this.$store.commit('setLoading', true)
      await files.reduce((b, f)=>{
        return b.then(async ()=>{
          await this.$store.dispatch('addFile', {filepath:f.path, trackLink})
        })
      }, Promise.resolve())
      this.$store.commit('setLoading', false)
    },
    selectCategory(c){
      this.$store.commit('setSelectedCategory', c)
    },
    adjust(){
      const {app} = this.$refs
      const {clientHeight, clientWidth} = app
      thisWindow['resizable'] = true
      thisWindow.setSize(clientWidth, clientHeight)
      thisWindow['resizable'] = false
    },
    showWindow(){
      thisWindow.show()
    },
    openSetting(){
      hub.$emit('open-setting')
    }
  }
})
</script>

