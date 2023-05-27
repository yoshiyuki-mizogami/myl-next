import { nextTick, toRaw } from 'vue'
import { defineStore } from 'pinia'
import { Themes } from './consts'
import Category from './models/category'
import MylDB from './utils/scheme'
import Config from './models/config'

import Item from './models/item'
import langSwitchFn, { LangUI } from './lib/lang-swicher'

import switchTheme, { ThemeName } from './lib/switch-theme'

import globals from './globals'

import {
  existsFileProxy,
  getDesktopPathProxy,
  readFileProxy,
  shellOpenExternalProxy,
  writeClipboardProxy,
  writeFileProxy
} from './lib/native_fnc_proxy'
import getFileInfo from './utils/get-file-info'
import { useNotify } from './lib/notify-store'

const { ipcRenderer } = window
const { DEFAULT_JSON_NAME } = globals
export enum Langs {
  EN = 'en',
  JA = 'ja'
}
//DB can't set state
const db = new MylDB()
let appElement!: HTMLDivElement
export const useAppState = defineStore('mylState', {
  state: () => {
    return {
      version: '',
      themes: Themes,
      categories: [] as Category[],
      items: [] as Item[],
      showNewCategoryDialog: false,
      selectedCategory: null as null | Category,
      config: new Config(),
      configRaw: null as Config | null,
      loading: false,
      ui: {} as LangUI,
      sortMode: false,
      dragItem: null as null | Item,
      showSetting: false,
      detailItemTarget: null as null | Item
    }
  },
  actions: {
    adjust(){
      nextTick(() => {
        const { clientHeight, clientWidth } = appElement
        this.setSize(clientHeight, clientWidth)
      })
    },
    isUrl(s: string) {
      return /^https?:\/\//.test(s)
    },
    setSetting(tf: boolean){
      this.showSetting = tf
    },
    switchSortMode(): void {
      this.sortMode = !this.sortMode
    },
    setNewCategoryDialog(tf: boolean): void {
      this.showNewCategoryDialog = tf
    },
    setLoading(tf: boolean): void {
      this.loading = tf
    },
    setSelectedCategory(c: Category): void {
      this.selectedCategory = c
    },
    toggleAOT(): void {
      this.config.aot = !this.config.aot
    },
    setDragItem(item: Item): void {
      this.dragItem = item
    },
    async moveItem(destCategory: Category): Promise<void> {
      if (destCategory === this.selectedCategory) {
        return
      }
      const { dragItem } = this
      this.dragItem = null
      const ind = this.items.indexOf(dragItem!)
      this.items.splice(ind, 1)
      await db.moveItem(dragItem!, destCategory.id)
    },
    async init(_appElement: HTMLDivElement): Promise<void> {
      appElement = _appElement
      this.loadConfig()
      this.version = await ipcRenderer.invoke('getVersion')
      this.categories = await db.getCategories()
      this.selectedCategory = this.categories[0]
      this.ui = langSwitchFn(this.config.lang)
      this.selectTheme(this.config.theme)
      ipcCommunicate('showWindow')
    },
    async loadConfig(): Promise<void> {
      try {
        const configRaw = await db.loadConfig()
        if (
          !configRaw.aot === undefined ||
          configRaw.lang === undefined ||
          configRaw.theme === undefined
        ) {
          throw configRaw.id
        }
        this.configRaw = configRaw
        this.config = this.configRaw
      } catch (id) {
        this.config.id = id as number
        this.configRaw = this.config
      }
    },
    async saveConfig(): Promise<void> {
      return db.saveConfig(this.configRaw!)
    },
    async langSwitch(lang: Langs): Promise<void> {
      this.config.lang = lang
      this.ui = langSwitchFn(lang)
      return this.saveConfig()
    },
    async selectTheme(theme: ThemeName): Promise<void> {
      this.config.theme = theme
      await this.saveConfig()
      switchTheme(theme)
    },
    updateItemsOrder(newOrders: Array<Item>): void {
      this.items = newOrders
      newOrders.forEach((o, i) => {
        o.sort = i
        db.items.update(o.id, { sort: o.sort })
      })
    },
    updateCategoriesOrder(newOrders: Category[]): void {
      this.categories = newOrders
      newOrders.forEach((o, i) => {
        o.sort = i
        db.categories.update(o.id, { sort: o.sort })
      })
    },
    updateCategoryName(cate: Category, newName: string): Promise<number> {
      cate.name = newName
      return db.categories.update(cate.id, { name: cate.name })
    },
    updateCategoryColor(cate: Category): Promise<number> {
      return db.categories.update(cate.id, { color: toRaw(cate.color) })
    },
    async addNewCategory(categoryName: string): Promise<void> {
      const cate: Category = await db.addCategory(categoryName)
      this.categories.push(cate)
      this.selectedCategory = cate
      nextTick(() => this.adjust())
    },
    async removeCategory(cate: Category): Promise<void> {
      await db.removeCategory(cate)
      const removeIndex = this.categories.findIndex((c) => c === cate)
      this.categories.splice(removeIndex, 1)
      if (this.selectedCategory === cate) {
        this.items = []
      }
      nextTick(() => this.adjust())
    },
    async getItems(cateId: number): Promise<void> {
      const items = await db.getItems(cateId)
      this.items = items
      nextTick(() => this.adjust())
    },
    openHP(): void {
      shellOpenExternalProxy(globals.HP_URL)
    },
    async removeItem(item: Item): Promise<void> {
      await db.removeItem(item)
      const removeIndex = this.items.findIndex((i) => i === item)
      this.items.splice(removeIndex, 1)
      nextTick(() => this.adjust())
    },
    async addFile({ filepath }: { filepath: string }): Promise<void> {
      const cateId = this.selectedCategory?.id
      const items = this.items
      const fileInfo = await getFileInfo(filepath)
      fileInfo.cateId = cateId
      const fileItem = await db.addItem(fileInfo)
      items.push(fileItem)
      nextTick(() => this.adjust())
    },
    async addUrl({ url, name }: { url: string; name: string }): Promise<void> {
      if (!this.isUrl(url)) {
        const notify = useNotify()
        notify.showNotify(this.ui.INVALID_URL)
        return
      }
      const urlItem = await db.addUrlItem(name, url, this.selectedCategory!.id)
      this.items.push(urlItem)
      nextTick(() => this.adjust())
    },
    async copyItemPath(item: Item): Promise<void> {
      writeClipboardProxy(item.path)
    },
    async showItemDetail(item: Item): Promise<void> {
      this.detailItemTarget = item
    },
    async updateItem(item: Item): Promise<number> {
      return db.items.update(item.id, item)
    },
    async importJson(): Promise<void> {
      const desktop = await getDesktopPathProxy()
      const targetJsonFiles = await ipcHandleCommunicate<{ filePaths: string[] }>(
        'showOpenDialog',
        {
          title: 'Select Myl save data json.',
          defaultPath: `${desktop}/${DEFAULT_JSON_NAME}`,
          filters: [
            {
              name: 'Json',
              extensions: ['json']
            }
          ]
        }
      )
      if (targetJsonFiles.filePaths.length === 0) {
        return
      }
      const [targetJson] = targetJsonFiles.filePaths
      const fileExists = await existsFileProxy(targetJson)
      if (!fileExists) {
        const notify = useNotify()
        return notify.showNotify(this.ui.FILE_NOT_FOUND)
      }
      try {
        const jsonTxt = await readFileProxy(targetJson)
        const importData = JSON.parse(jsonTxt)
        await importData.reduce(async (b: Promise<void>, d: unknown) => {
          await b
          const { category, items } = d as { category: Category; items: Item[] }
          const cate: Category = await db.addCategory(category.name)
          await items.reduce(async (ib: Promise<void>, i) => {
            await ib
            i.cateId = cate.id
            await db.addItem(i)
          }, Promise.resolve())
          this.categories.push(cate)
        }, Promise.resolve())
        const notify = useNotify()
        notify.showNotify(this.ui.IMPORT_DONE)
      } catch (e) {
        console.error(e)
        const notify = useNotify()
        notify.showNotify(this.ui.FILE_IS_INVALID)
      }
    },
    setSize(h: number, w: number): void {
      ipcCommunicate('setSize', [h, w])
    },
    setAlwaysOnTop(tf: boolean): void {
      ipcCommunicate('setAlwaysOnTop', tf)
    },
    async exportJson(): Promise<void> {
      const desktop = await getDesktopPathProxy()
      const savePath = await ipcHandleCommunicate<{ filePath: string }>('showSaveDialog', {
        title: 'Select save filepath.',
        defaultPath: `${desktop}/${DEFAULT_JSON_NAME}`
      })
      if (!savePath.filePath) {
        return
      }
      const exportData = await db.exportAll()
      await writeFileProxy(
        savePath.filePath,
        JSON.stringify(exportData, (key, val) => {
          if (key === 'cateId' || key === 'id') {
            return
          }
          return val
        })
      )
      const notify = useNotify()
      notify.showNotify(this.ui.EXPORT_DONE)
    },
    getActivateCategoryStr: ((): ((categoryName: string) => void) => {
      const clearTime = 250
      let findTmpStr = ''
      let evId = null as null | number
      return function getActivateCategoryString(s: string): string {
        clearTimeout(evId as number)
        evId = setTimeout(() => {
          findTmpStr = ''
        }, clearTime) as unknown as number
        return (findTmpStr += s)
      }
    })(),
    activateCategoryBykeydown(ev: KeyboardEvent): void {
      const { key } = ev
      if (key.length !== 1) {
        return
      }
      const keyReg = new RegExp(`^${this.getActivateCategoryStr(key)}`, 'i')
      const finds = [] as number[]
      let current = null as null | number
      this.categories.forEach((c, ind) => {
        if (keyReg.test(c.name)) {
          finds.push(ind)
        }
        if (this.selectedCategory === c) {
          current = ind
        }
      })
      if (finds.length === 0) {
        return
      }
      let pos = 0
      if (current !== null) {
        pos = finds.find((p) => (current as number) < p) as number
        if (pos === undefined) {
          pos = finds[0]
        }
      }
      this.selectedCategory = this.categories[pos]
    }
  }
})

function ipcCommunicate(channel: string, data: unknown = undefined): void {
  ipcRenderer.send(channel, data)
}
async function ipcHandleCommunicate<T>(channel: string, data: unknown = undefined): Promise<T> {
  return await ipcRenderer.invoke(channel, data)
}
