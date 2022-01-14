<template>
  <OverlayLayer v-if="show">
    <div class="new-category">
      <div
        class="icon-close close-btn"
        @click="close"
      />
      Input new category name
      <input
        ref="input"
        type="text"
        class="new-category-input"
        :placeholder="state.ui.INPUT_NEW_CATEGORY"
        @keydown.enter="addNewCategory"
      >
    </div>
  </OverlayLayer>
</template>
<script lang="ts">
import { addNewCategory, setNewCategoryDialog, state } from '../ts/store'
import { defineComponent } from 'vue'
import OverlayLayer from './overlay-layer.vue'
export default defineComponent({

  components: { OverlayLayer },
  data(){
    return {
      state
    }
  },
  computed: {
    show() { return state.showNewCategoryDialog }
  },
  watch: {
    show(v) {
      if (!v) {
        return
      }
      this.$nextTick(() => this.$refs.input.focus())
    }
  },
  methods: {
    addNewCategory(ev: KeyboardEvent) {
      const target = ev.target as HTMLInputElement
      const name = target.value.trim() as string
      if (!name) {
        return
      }
      addNewCategory(name)
      this.close()
    },
    close() {
      setNewCategoryDialog(false)
    }
  }
})
</script>

<style lang="stylus">
.new-category
  width 300px
  margin 10% auto
  background-color white
  text-align center
  padding 10px
  border-radius 2px
  input
    padding 5px
</style>