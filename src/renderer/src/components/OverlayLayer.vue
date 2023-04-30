<template>
  <div class="overlay">
    <slot />
  </div>
</template>

<style lang="stylus">
.overlay
  position fixed
  top 0
  left 0
  width 100vw
  height 100vh
  background-color var(--layer-back)
  z-index 1000
  >div
    position relative
    box-shadow 0px 3px 5px rgb(0,0,0)
</style>