<template>
  <transition name="layer">
    <div class="layer-back" v-if="show">
      <div class="setting-layer">
        <div class="icon-close close-btn" @click="close"/>
        <div class="setting-title">Myl Setting</div>
        <ul class="setting-items">
          <li>
            <div class="setting-name">{{ui.LANG}}</div>
            <div class="setting-val">
              <label :class="{selected:config.lang === 'en'}" @click="langSwitch('en')">{{ui.EN}}</label><input :checked="config.lang === 'en'" type="radio" name="lang">
              <label :class="{selected:config.lang === 'ja'}" @click="langSwitch('ja')">{{ui.JA}}</label><input :checked="config.lang === 'ja'" type="radio" name="lang">
            </div>
          </li>
          <li>
            <div class="setting-name">{{ui.THEME}}</div>
            <div class="setting-val"></div>
          </li>
          <li>
            <div class="setting-item">
              <input type="button" :value="ui.IMPORT">
              <input type="button" :value="ui.EXPORT">
            </div>
          </li>
          <li>
            <div class="setting-item">
              <input type="button" :value="ui.LIST">
            </div>
          </li>
        </ul>
      </div>
    </div>
  </transition>
</template>
<script lang="ts">
import Vue from 'vue'
import layer from './layer'
import Hub from '../ts/event-hub'
import {mapState,mapActions, mapMutations} from 'vuex'
export default Vue.extend({
  mixins:[layer],
  data(){
    return {
      show:false
    }
  },
  computed:mapState({
    config:'config',
    ui:'ui'
  }),
  created(){
    Hub.$on('open-setting', this.open)
    this.setShortcut({
      Escape:this.close
    })
  },
  methods:{
    ...mapActions({
      exportJson:'exrpotJson',
      importJson:'importJson'
    }),
    ...mapMutations({
      langSwitch:'langSwitch'
    }),
    open(){
      this.show = true
    },
    close(){
      this.show = false
    }
  }
})
</script>
<style lang="stylus">
  .setting-layer
    position relative
    width 90%
    height 200px
    margin 20px auto
    background-color white
    box-shadow 0 0 5px rgba(0,0,0, .5)
    padding 5px 
    font-size 0
    .setting-title
      font-size 16px
      text-align center
    .setting-items
      list-sytle none
      padding 0
      margin 0
      font-size 14px
      li
        height 30px
        display flex
        border-bottom solid 1px rgb(150,150,150)
        input[type=button]
          cursor pointer
          padding 3px 10px
        .setting-item
          text-align center
          width 100%
        .setting-name
          text-align center
          height 100%
          width 110px
        .setting-val
          height 100%
          flex-grow 1
          label
            transition background .3s ease
            cursor pointer
            padding 3px
            background-color rgb(180,180,180)
            width 80px
            display inline-block
            text-align center
            &.selected
              background-color rgb(50, 100, 220)
              color white
          input[type=radio]
            display none
      
</style>

