<style lang="stylus">
.layer-back
  background-color var(--layer-back)
  position fixed
  top 0
  left 0
  height 100%
  width 100%
  .new-category
    width 300px
    margin 10% auto
    background-color white
    text-align center
    padding 10px
    border-radius 10px
    input
      padding 5px
</style>
<template>
  <transition name="layer">
  <div class="layer-back" v-if="show">
    <div class="new-category">
      Input new category name
      <input type="text" class="new-category-input" @keydown.enter="addNewCategory">
    </div>
  </div>
  </transition>
</template>
<script lang="ts">
import Vue from 'vue'
import {mapState} from 'vuex'
export default Vue.extend({
  computed:mapState({
    show:'showNewCategoryDialog'
  }),
  created(){
    
  },
  methods:{
    addNewCategory(ev){
      const name = ev.target.value.trim()
      if(!name){
        return
      }
      this.$store.dispatch('addNewCategory', name)
      this.close()
    },
    close(){
      this.$store.commit('setNewCategoryDialog', false)
    }
  }
})
</script>

