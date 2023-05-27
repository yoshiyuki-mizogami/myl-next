<template>
  <OverlayLayer v-if="state.show">
    <div class="color-setting">
      <div>
        <span style="color: red">R</span>:
        <input v-model="state.color.r" type="range" min="0" max="255" />
      </div>
      <div>
        <span style="color: green">G</span>:
        <input v-model="state.color.g" type="range" min="0" max="255" />
      </div>
      <div>
        <span style="color: blue">B</span>:
        <input v-model="state.color.b" type="range" min="0" max="255" />
      </div>
      <div class="example" :style="{ backgroundColor: toColorValue }">
        {{ state.category?.name }}
      </div>
      <input type="button" value="Set" @click="submit" />
      <input type="button" value="Clear" @click="clear" />
      <input type="button" value="Cancel" @click="close" />
    </div>
  </OverlayLayer>
</template>

<script setup lang="ts">
import Category from '../models/category'
import { updateCategoryColor } from '../store'
import { reactive, computed, toRaw } from 'vue'
import eventHub from '../event-hub'
import OverlayLayer from './OverlayLayer.vue'
const DEFAULT_COLOR = {
  r: 255,
  g: 255,
  b: 255
}
const state = reactive<{ color: RGB; category: Category | undefined; show: boolean }>({
  color: {
    r: 255,
    g: 255,
    b: 255
  },
  category: undefined,
  show: false
})

const toColorValue = computed(() => {
  const { color: c } = state
  return `rgb(${c.r},${c.g},${c.b})`
})

async function submit(): Promise<void> {
  state.category!.color = toRaw(state.color)
  await updateCategoryColor(state.category!)
  close()
}

async function clear(): Promise<void> {
  state.category!.color = undefined
  await updateCategoryColor(state.category!)
  close()
}

function close(): void {
  state.show = false
  state.category = undefined
}
eventHub.on('openColorSetter', (c: Category): void => {
  state.category = c
  if (state.category.color) {
    state.color = Object.assign({}, toRaw(state.category.color))
  } else {
    state.color = Object.assign({}, DEFAULT_COLOR)
  }
  state.show = true
})
</script>

<style lang="scss" scoped>
.color-setting {
  margin: 10% auto;
  background-color: white;
  height: 60vh;
  width: 80vw;
  text-align: center;
  .example {
    width: 50%;
    margin: auto;
    border-radius: 5px;
  }
  input[type='button'] {
    width: 70px;
    margin: 10px;
  }
}
</style>
