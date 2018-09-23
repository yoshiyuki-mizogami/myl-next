<template>
  <transition name="layer">
    <div class="layer-back" v-if="show">
      <div class="setting">

      </div>
    </div>
  </transition>
</template>
<script lang="ts">
import Vue from 'vue'
import layer from './layer'
import Hub from '../ts/event-hub'
import {mapState,mapActions} from 'vuex'
export default Vue.extend({
  mixins:[layer],
  data(){
    return {
      show:false
    }
  },
  computed:mapState({
    config:'config'
  }),
  created(){
    Hub.$on('open-setting', this.open)
  },
  methods:{
    ...mapActions({
      exportJson:'exrpotJson',
      importJson:'importJson'
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

</style>

