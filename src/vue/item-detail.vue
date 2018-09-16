<style lang="stylus">
  .item-wrap
    width 100%
    height 100%
    position fixed
    top 0
    left 0
    background-color rgba(0,0,0 .5)
  .item-detail
    width 90%
    height 200px
    margin 20px auto
    background-color white
    box-shadow 0 0 5px rgba(0,0,0, .5)
    padding 5px
    font-size 0
    .prop
      margin 1px
    .prop-title
      font-size 13px
      display inline-block
      width 20%
      text-align center
    .prop-text
      text-align left
      border-bottom solid 1px gray
      background-color transparent
      width 80%
</style>
<template>
  <div class="item-wrap" v-if="show">
    <div class="item-detail">
      <div class="prop">
        <span class="prop-title">{{ui.ITEM_NAME}}</span>
        <input type="text" class="prop-text" v-model.lazy="data.name">
      </div>
      <div class="prop">
        <span class="prop-title">{{ui.ITEM_PATH}}</span>
        <input type="text" class="prop-text" v-model.lazy="data.path">
      </div>
      <div class="prop"></div>
      <div class="prop"></div>
    </div>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import Item from '../ts/models/item'
import LayerMixin from './layer'
import EventHub from '../ts/event-hub'
const DEF = {}
Object.seal(DEF)
export default Vue.extend({
  data(){
    return {
      show:false,
      data:DEF as Item | any
    }
  },
  mixins:[LayerMixin],
  created(){
    EventHub.$on('show-item-detail', this.showMe)
    this.setShortcut({
      'Escape':this.hideMe
    })
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
      this.$store.dispatch('updateItem', data)
    }
  }
})
</script>


