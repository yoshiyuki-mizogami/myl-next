import { defineStore } from 'pinia'

const NOOP = (): void => {
  /**noop */
}

type DialogOption = {
  show?: boolean
  message: string
  onOk: () => void
  onCancel?: () => void
  cancelable: boolean
  x: number
  y: number
}

const defOpt = {
  show: false,
  message: '',
  onOk: NOOP,
  onCancel: NOOP,
  cancelable: true,
  x: 0,
  y: 0
} as DialogOption

const NUMBER = 'number'
const H = 60,
  W = 200
export const useDialog = defineStore('dialogStore', {
  state: (): DialogOption => {
    return Object.assign({}, defOpt) as DialogOption
  },
  actions:{
    showDialog(opts: DialogOption){
      this.show = true
      opts.cancelable = !opts.onCancel || !!opts.cancelable
      Object.assign(this, opts)
      this.calcPos()
    },
    calcPos(): void {
      const wh = window.outerHeight
      const ww = window.outerWidth
      let { y, x } = this
      if (typeof y !== NUMBER) {
        y = wh - wh / 2
      }
      if (typeof x !== NUMBER) {
        x = ww - ww / 2
      }
      y -= H / 2
      x -= W / 2
      y = Math.min(y, wh - H)
      y = Math.max(y, 0)
      x = Math.min(x, ww - W)
      x = Math.max(x, 0)
      this.y = y
      this.x = x
    },
    reset(): void {
      Object.assign(this, defOpt)
    },
    async ok(): Promise<void>{
      this.onOk()
      this.show = false
    },
    async cancel(): Promise<void> {
      this.onCancel!()
      this.show = false
    }
  }
})
