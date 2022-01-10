
<template>
  <div class="item-wrap" v-if="show">
    <div class="item-detail">
      <div class="close-btn icon-close" @click="hideMe"></div>
      <div class="prop">
        <span class="prop-title">{{ui.ITEM_NAME}}</span>
        <input type="text" class="prop-text" v-model.lazy="data.name">
      </div>
      <div class="prop">
        <span class="prop-title">{{ui.ITEM_PATH}}</span>
        <input type="text" class="prop-text" v-model.lazy="data.path">
      </div>
      <div class="prop">
        <span class="prop-title">{{ui.BY}}</span>
        <input type="text" class="prop-text with-text" readonly v-model.lazy="data.by"><input type="button" class="with-select" :value="ui.SELECT" @click="selectWith">
      </div>
      <div class="prop" v-if="isFile">
        <span class="prop-title">{{ui.ARG}}</span>
        <input type="text" class="prop-text" v-model.lazy="data.cmd">
      </div>
      <div class="prop">
        <span class="prop-title">{{ui.SHORTCUT}}</span>

      </div>
      <div class="prop"></div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import Item from '../ts/models/item'
import LayerMixin from './layer'
import EventHub from '../ts/event-hub'
import {FILE} from '../ts/consts'
import { updateItem } from '../ts/store'
const DEF = {}
Object.seal(DEF)
export default defineComponent({
  data(){
    return {
      show:false,
      data:DEF as Item | any,
      by:''
    }
  },
  mixins:[LayerMixin],
  created(){
    (EventHub as any).on('show-item-detail', this.showMe)
    this.setShortcut({
      Escape:this.hideMe
    })
  },
  computed:{
    isFile(){
      return this.data.type === FILE
    }
  },
  methods:{
    showMe(item:Item){
      this.show = true
      this.data = item
    },
    hideMe(){
      const {data} = this
      this.data = DEF
      this.show = false
      updateItem(data)
    },
    async selectWith(){
      // const def = this.data.by || process.env.PROGRAMFILES
      // const files = await dialog.showOpenDialog(thisWindow,{
      //   title:this.ui.SELECT_WITH,
      //   properties:['openFile'],
      //   defaultPath:def
      // })
      const files = {} as any
      if(!files.filePaths.length){
        return this.data.by = ''
      }
      const [filepath] = files.filePaths
      this.by = filepath
    }
  }
})
</script>


<style lang="stylus">
  .item-wrap
    width 100%
    height 100%
    position fixed
    top 0
    left 0
    background-color rgba(0,0,0 .5)
  .item-detail
    position relative
    width 95%
    height 200px
    margin 20px auto
    background-color var(--base)
    color var(--base-color)
    box-shadow 0 0 5px rgba(0,0,0, .5)
    padding 5px
    font-size 0
    input
      color var(--base-color)
    .prop
      margin 1px
    .prop-title
      font-size 12px
      display inline-block
      width 25%
      text-align center
    .prop-text
      text-align left
      border-bottom solid 1px gray
      background-color transparent
      width 75%
      &.with-text
        width 60%
    .with-select
      font-size 10px
      width 15%
      vertical-align middle
</style>