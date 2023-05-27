<template>
  <OverlayLayer v-if="appState.showSetting">
    <div class="setting-layer">
      <div class="icon-close close-btn" @click="close" />
      <div class="setting-title">
        Myl <span v-once class="version">ver {{ appState.version }}</span> Setting
      </div>
      <ul class="setting-items">
        <li>
          <div class="setting-name">
            {{ appState.ui.LANG }}
          </div>
          <div class="setting-val">
            <label
              :class="{ selected: appState.config.lang === 'en' }"
              @click="appState.langSwitch(Langs.EN)"
              >{{ appState.ui.EN }}</label
            ><input :checked="appState.config.lang === 'en'" type="radio" name="lang" /><label
              :class="{ selected: appState.config.lang === 'ja' }"
              @click="appState.langSwitch(Langs.JA)"
              >{{ appState.ui.JA }}</label
            >
            <input :checked="appState.config.lang === 'ja'" type="radio" name="lang" />
          </div>
        </li>
        <li>
          <div class="setting-name">
            {{ appState.ui.THEME }}
          </div>
          <div class="setting-val" style="text-align: center">
            <div
              v-for="(t, k) in appState.themes"
              :key="k"
              class="theme"
              :class="{ selected: appState.config.theme === k }"
              @click="appState.selectTheme(k)"
            >
              {{ t }}
            </div>
          </div>
        </li>
        <li>
          <div class="setting-item">
            <input type="button" :value="appState.ui.IMPORT" @click="appState.importJson" />
            <input type="button" :value="appState.ui.EXPORT" @click="appState.exportJson" />
          </div>
        </li>
        <li>
          <div class="setting-item">
            <a href="#" @click.prevent="appState.openHP">{{ appState.ui.CHECK_UPDATE }}</a>
          </div>
        </li>
      </ul>
    </div>
  </OverlayLayer>
</template>
<script setup lang="ts">
import { useAppState, Langs } from '@renderer/state'
import OverlayLayer from './OverlayLayer.vue'
const appState = useAppState()
function close(): void {
  appState.setSetting(false)
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
