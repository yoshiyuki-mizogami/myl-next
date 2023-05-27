<template>
  <OverlayLayer v-if="colorSetter.show">
    <div class="color-setting">
      <div>
        <span style="color: red">R</span>:
        <input v-model="colorSetter.color.r" type="range" min="0" max="255" />
      </div>
      <div>
        <span style="color: green">G</span>:
        <input v-model="colorSetter.color.g" type="range" min="0" max="255" />
      </div>
      <div>
        <span style="color: blue">B</span>:
        <input v-model="colorSetter.color.b" type="range" min="0" max="255" />
      </div>
      <div class="example" :style="{ backgroundColor: colorSetter.toColorValue }">
        {{ colorSetter.target?.name }}
      </div>
      <input type="button" value="Set" @click="colorSetter.submit" />
      <input type="button" value="Clear" @click="colorSetter.clear" />
      <input type="button" value="Cancel" @click="colorSetter.close" />
    </div>
  </OverlayLayer>
</template>

<script setup lang="ts">
import OverlayLayer from './OverlayLayer.vue'
import { useColorSetter } from '@renderer/lib/color-setter-store'
const colorSetter = useColorSetter()
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
