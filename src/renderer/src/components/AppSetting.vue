<template>
  <OverlayLayer v-if="show">
    <div class="setting-layer">
      <div class="icon-close close-btn" @click="close" />
      <div class="setting-title">
        Myl <span v-once class="version">ver {{ state.version }}</span> Setting
      </div>
      <ul class="setting-items">
        <li>
          <div class="setting-name">
            {{ state.ui.LANG }}
          </div>
          <div class="setting-val">
            <label
              :class="{ selected: state.config.lang === 'en' }"
              @click="langSwitch(Langs.EN)"
              >{{ state.ui.EN }}</label
            ><input :checked="state.config.lang === 'en'" type="radio" name="lang" /><label
              :class="{ selected: state.config.lang === 'ja' }"
              @click="langSwitch(Langs.JA)"
              >{{ state.ui.JA }}</label
            >
            <input :checked="state.config.lang === 'ja'" type="radio" name="lang" />
          </div>
        </li>
        <li>
          <div class="setting-name">
            {{ state.ui.THEME }}
          </div>
          <div class="setting-val" style="text-align: center">
            <div
              v-for="(t, k) in state.themes"
              :key="k"
              class="theme"
              :class="{ selected: state.config.theme === k }"
              @click="selectTheme(k)"
            >
              {{ t }}
            </div>
          </div>
        </li>
        <li>
          <div class="setting-item">
            <input type="button" :value="state.ui.IMPORT" @click="importJson" />
            <input type="button" :value="state.ui.EXPORT" @click="exportJson" />
          </div>
        </li>
        <li>
          <div class="setting-item">
            <a href="#" @click.prevent="openHP">{{ state.ui.CHECK_UPDATE }}</a>
          </div>
        </li>
      </ul>
    </div>
  </OverlayLayer>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import Hub from '../event-hub'
import { state, Langs, exportJson, importJson, langSwitch, selectTheme, openHP } from '../store'
import OverlayLayer from './OverlayLayer.vue'
const show = ref(false)
Hub.on('open-setting', () => (show.value = true))
function close(): void {
  show.value = false
}
</script>
<style lang="scss">
.setting-layer {
  position: relative;
  width: 90%;
  height: 200px;
  margin: 20px auto;
  background-color: var(--dialog-base);
  color: var(--base-color);
  padding: 5px;
  font-size: 0;
  .version {
    font-size: smaller;
    opacity: 0.8;
  }
  .setting-title {
    font-size: 16px;
    text-align: center;
  }
  .setting-items {
    list-style: none;
    padding: 0;
    margin: 0;
    font-size: 14px;
    li {
      min-height: 30px;
      display: flex;
      border-bottom: solid 1px rgb(150, 150, 150);
      input[type='button'] {
        cursor: pointer;
        padding: 3px 10px;
      }
      .setting-item {
        text-align: center;
        width: 100%;
      }
      .setting-name {
        text-align: center;
        height: 100%;
        width: 110px;
      }
      .setting-val {
        height: 100%;
        flex-grow: 1;
        label {
          transition: background 0.3s ease;
          cursor: pointer;
          padding: 3px;
          background-color: var(--unselect);
          width: 80px;
          display: inline-block;
          text-align: center;
          &.selected {
            background-color: var(--select);
            color: white;
          }
        }
        input[type='radio'] {
          display: none;
        }
        .theme {
          display: inline-block;
          width: 50px;
          margin: 2px 5px;
          text-align: center;
          background-color: var(--unselect);
          &.selected {
            background-color: var(--select);
            color: white;
          }
        }
      }
    }
  }
}
</style>
