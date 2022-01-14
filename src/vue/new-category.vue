<template>
  <OverlayLayer v-if="show">
    <div class="new-category">
      <div class="icon-close close-btn" @click="close"></div>
      Input new category name
      <input ref="input" type="text" class="new-category-input" @keydown.enter="addNewCategory"
            :placeholder="ui.INPUT_NEW_CATEGORY">
    </div>
  </OverlayLayer>
</template>
<script lang="ts">
import { addNewCategory, setNewCategoryDialog, state } from '../ts/store'
import { defineComponent } from 'vue'
import layerMixin from './layer'
import OverlayLayer from './overlay-layer.vue'
export default defineComponent({
    mixins: [layerMixin],
    computed: {
        ui() { return state.ui; },
        show() { return state.showNewCategoryDialog; }
    },
    created() {
        this.setShortcut({
            "Escape": this.close
        });
    },
    watch: {
        show(this: any, v) {
            if (!v) {
                return;
            }
            this.$nextTick(() => this.$refs.input.focus());
        }
    },
    methods: {
        addNewCategory(ev: any) {
            const name = ev.target.value.trim() as string;
            if (!name) {
                return;
            }
            addNewCategory(name);
            this.close();
        },
        close() {
            setNewCategoryDialog(false);
        }
    },
    components: { OverlayLayer }
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