import Category from '@renderer/models/category'
import { defineStore } from 'pinia'
import { toRaw } from 'vue'
import { useAppState } from '@renderer/state'

const DEFAULT_COLOR = {
  r: 255,
  g: 255,
  b: 255
}
type COLOR = typeof DEFAULT_COLOR

export const useColorSetter = defineStore('colorSetterStore', {
  state: () => {
    return {
      show: false,
      target: null as null | Category,
      color: Object.assign({}, DEFAULT_COLOR) as COLOR
    }
  },
  actions: {
    open(target: Category): void {
      this.target = target
      if (this.target.color) {
        this.color = Object.assign({}, toRaw(this.target.color))
      } else {
        this.color = Object.assign({}, DEFAULT_COLOR)
      }
      this.show = true
    },
    async submit(): Promise<void> {
      const state = useAppState()
      this.target!.color = toRaw(this.color)
      await state.updateCategoryColor(this.target!)
      this.close()
    },
    async clear(): Promise<void> {
      const state = useAppState()
      this.target!.color = undefined
      await state.updateCategoryColor(this.target!)
      this.close()
    },
    close(): void {
      this.show = false
      this.target = null
    }
  },
  getters: {
    toColorValue(state) {
      return `rgb(${state.color.r},${state.color.g},${state.color.b})`
    }
  }
})
