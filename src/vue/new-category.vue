<template>
  <div class="layer-back" v-if="show">
    <div class="new-category">
      <div class="icon-close close-btn" @click="close"></div>
      Input new category name
      <input ref="input" type="text" class="new-category-input" @keydown.enter="addNewCategory"
             :placeholder="ui.INPUT_NEW_CATEGORY">
    </div>
  </div>
</template>
<script lang="ts">
import { addNewCategory, setNewCategoryDialog, state } from '../ts/store'
import { defineComponent } from 'vue'
import layerMixin from './layer'
export default defineComponent({
  mixins:[layerMixin],
  computed:{
    ui(){return state.ui},
    show(){return state.showNewCategoryDialog}
  },
  created(){
    this.setShortcut({
      'Escape':this.close
    })
  },
  watch:{
    show(this:any, v){
      if(!v){
        return
      }
      this.$nextTick(()=>this.$refs.input.focus())
    }
  },
  methods:{
    addNewCategory(ev:any){
      const name = ev.target.value.trim() as string
      if(!name){
        return
      }
      addNewCategory(name)
      this.close()
    },
    close(){
      setNewCategoryDialog(false)
    }
  }
})
</script>

<style lang="stylus">
.layer-back
  background-color var(--layer-back)
  position fixed
  top 0
  left 0
  height 100%
  width 100%
  .new-category
    position relative
    width 300px
    margin 10% auto
    background-color white
    text-align center
    padding 10px
    border-radius 2px
    box-shadow 0px 3px 5px black
    input
      padding 5px
</style>