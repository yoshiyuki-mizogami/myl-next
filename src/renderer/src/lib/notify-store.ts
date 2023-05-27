import { defineStore } from 'pinia'
const NOTIFY_TIMEOUT = 4000

export const useNotify = defineStore('notifyStore', {
  state: () => {
    return {
      show: false,
      m: '',
      ev: 0
    }
  },
  actions: {
    showNotify(message: string): void {
      this.m = message
      this.show = true
      this.setHideTimer()
    },
    setHideTimer(): void {
      clearTimeout(this.ev)
      this.ev = window.setTimeout(() => (this.show = false), NOTIFY_TIMEOUT)
    }
  }
})
