<template>
  <div class="whole" ref="app">
    <transition name="loading">
      <div class="loading" v-if="loading"/>
    </transition>
    <div class="header">
      <div class="header-btn new-cate-btn" @click="addNewCategory"></div>
      <div :class="{aot:config.AOT}" class="header-btn" @click="toggleAOT"></div>
      <div class="header-btn close-btn" @click="close"></div>
    </div>
    <div class="content" @drop.prevent="dropAny" @dragenter.prevent @dragover.prevent>
      <div class="categories">
        <draggable v-model="categories">
          <a-category v-for="c in categories" :selected="selectedCategory === c" :category="c" :key="c.id"/>
        </draggable>
      </div>
      <div class="items">
        <draggable v-model="items">
          <an-item v-for="i in items" :item="i" :key="i.id"></an-item>
        </draggable>
      </div>
    </div>
    <new-cate-dialog/>
    <app-dialog/>
    <notify/>
  </div>
</template>
<script lang="ts">
import {remote} from 'electron'
import Vue from 'vue'
import {mapState} from 'vuex'
import Category from './category.vue'
import Item from './item.vue'
import NewCateDialog from './new-category.vue'
import Dialog from './dialog.vue'
import Notify from './notify.vue'
import hub from '../ts/event-hub'
declare var require:(moduleId:string) => any
const draggable = require('vuedraggable')
const thisWindow = remote.getCurrentWindow()
export default Vue.extend({ 
  async created(){
    await this.$store.dispatch('init')
    hub.$on('adjust', this.adjust)
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
    ...mapState({
      selectedCategory:'selectedCategory',
      config:'config',
      loading:'loading'
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
    draggable,
    'notify':Notify
  },
  methods:{
    addNewCategory(){
      this.$store.commit('setNewCategoryDialog', true)
    },
    close(){
      thisWindow.close()
    },
    toggleAOT(){
      this.$store.commit('toggleAOT')
      thisWindow.setAlwaysOnTop(this.config.AOT)
    },
    async dropAny(e:DragEvent):Promise<void>{
      const trackLink = e.ctrlKey
      const {dataTransfer:df} = e
      const files = df.files
      if(!files.length){
        const dragString = df.getData('text/plain')
        await this.$store.dispatch('addUrl', {url:dragString})
        return 
      }
      this.$store.commit('setLoading', true)
      await Array.from(files).reduce((b, f)=>{
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
      thisWindow.setSize(clientWidth, clientHeight)
    },
    showWindow(){
      thisWindow.show()
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
    width 20px
    height 20px
    background-color white
    border-radius 100%
    display inline-block
    cursor pointer
    &.new-cate-btn
      background-color rgb(120, 200, 255)
    &.aot
      background-color rgb(255,255,155)
    &.close-btn
      background-color rgb(255, 100, 120)

.content
  height calc(100% - 20px)
  width 100%
  display flex
  flex-direction row
  .categories
    min-height 100px
    height 100%
    width 150px
    display flexbox
    text-align center
    flex-basis 35%
  .items
    background-color var(--item-back)
    flex-basis 65%
.loading
  position fixed
  top 0
  left 0
  height 1000px
  width 100%
  background-color rgba(0,0,0,.5)
.loading-enter-active,.loading-leave-active
  transition opacity .3s ease 
.loading-enter,.loading-leave-to
  opacity 0
</style>