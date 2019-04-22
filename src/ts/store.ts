import Vue from 'vue'
import {remote, clipboard, shell} from 'electron'
import {join} from 'path'
import Category from '../ts/models/category'
import Item from '../ts/models/item'
import getFileInfo from './utils/get-file-info'
import MylDB from './utils/scheme'
import hub from './event-hub'
import Vuex, {Store} from 'vuex'
import langSwitch from './lib/lang-swicher'
import switchTheme from './lib/switch-theme'
import {Themes} from './consts'
import Config from './models/config';
import globals from './globals'
import {writeFile, existsSync, readFile} from 'fs';
import eventHub from './event-hub';

const {DEFAULT_JSON_NAME} = globals
Vue.use(Vuex)
const thisWindow = remote.getCurrentWindow()

export enum Langs{
  EN = 'en',
  JA = 'ja'
}
const config = new Config()
const db = new MylDB()
const isUrl = /^https?:\/\//
const storeData = {
  state:{
    version:globals.VERSION,
    themes:Themes,
    categories:[],
    items:[],
    showNewCategoryDialog:false,
    selectedCategory:null,
    config,
    configRaw:null as any,
    loading:false,
    ui:{},
    sortMode:false,
    dragItem:null as object | unknown
  },
  mutations:{
    switchSortMode(state:any){
      state.sortMode = !state.sortMode
      console.log(state.sortMode)
    },
    setNewCategoryDialog(state:any, tf:boolean){
      state.showNewCategoryDialog = tf
    },
    setLoading(state:any, tf:boolean){
      state.loading = tf
    },
    setSelectedCategory(state:any, c:Category){
      state.selectedCategory = c
    },
    toggleAOT(state:any){
      state.config.aot = !state.config.aot
    },
    setDragItem(state:any, item:object){
      state.dragItem = item
    }
  },
  actions:{
    async moveItem({state}, destCategory:any){
      if(destCategory === state.selectedCategory){
        return
      }
      const {dragItem} = state
      state.dragItem = null
      const ind = state.items.indexOf(dragItem)
      Vue.delete(state.items, ind)
      await db.moveItem(dragItem, destCategory.id)
    },
    async init(store:any){
      const {state} = store
      await store.dispatch('loadConfig')
      state.categories = await db.getCategories()
      state.selectedCategory = state.categories[0]
      state.ui = await langSwitch(state.config.lang)
      thisWindow.show()
    },
    async loadConfig({state}){
      state.configRaw = await db.loadConfig()
      state.config = state.configRaw.config
    },
    async saveConfig({state}){
      db.saveConfig(state.configRaw)
    },
    async langSwitch(store:any, lang:string){
      store.state.config.lang = lang
      store.state.ui = await langSwitch(lang)
      store.dispatch('saveConfig')
    },
    async selectTheme(store:any, theme:string){
      store.state.config.theme = theme
      store.dispatch('saveConfig')
      switchTheme(theme)
    },
    updateItemsOrder({state}, newOrders:Array<Item>):void{
      state.items = newOrders
      newOrders.forEach((o, i)=>{
        o.sort = i
        db.items.update(o.id, {'sort':o.sort})
      })
    },
    updateCategoriesOrder({state}, newOrders:Array<Category>):void{
      state.categories = newOrders
      newOrders.forEach((o, i)=>{
        o.sort = i
        db.categories.update(o.id, {'sort':o.sort})
      })
    },
    updateCategoryName({state}, cate:Category){
      db.categories.update(cate.id, {name:cate.name})
    },
    async addNewCategory({state}, categoryName:string){
      const cate:Category = await db.addCategory(categoryName)
      state.categories.push(cate)
      state.selectedCategory = cate
      Vue.nextTick(()=>hub.$emit('adjust'))
    },
    async removeCategory({state}, cate:Category){
      await db.removeCategory(cate)
      const removeIndex = state.categories.findIndex(c=> c === cate)
      Vue.delete(state.categories, removeIndex)
      if(state.selectedCategory === cate){
        state.items = []
      }
      Vue.nextTick(()=>hub.$emit('adjust'))
    },
    async getItems({state},cateId:number){
      const items = await db.getItems(cateId)
      state.items = items
      Vue.nextTick(()=>hub.$emit('adjust'))
    },
    openHP(){
      shell.openExternal(globals.HP_URL)
    },
    async removeItem({state}, item:Item){
      await db.removeItem(item)
      const removeIndex = state.items.findIndex((i:any)=> i === item)
      Vue.delete(state.items, removeIndex)
      Vue.nextTick(()=>hub.$emit('adjust'))
    },
    async addFile({state}, {filepath}){
      const cateId = state.selectedCategory.id
      const items = state.items
      const fileInfo = await getFileInfo(filepath)
      fileInfo.cateId = cateId
      const fileItem = await db.addItem(fileInfo)
      items.push(fileItem)
      Vue.nextTick(()=>hub.$emit('adjust'))
    },
    async addUrl({state}, {url}){
      if(!isUrl.test(url)){
        hub.$emit('notify', state.ui.INVALID_URL)
        return
      }
      const urlItem = await db.addUrlItem(url, state.selectedCategory.id)
      state.items.push(urlItem)
      Vue.nextTick(()=>hub.$emit('adjust'))
    },
    async copyItemPath(_:void, item:Item){
      clipboard.writeText(item.path)
    },
    async showItemDetail(_:void, item:Item){
      hub.$emit('show-item-detail', item)
    },
    updateItem(_:void, item:Item){
      db.items.update(item.id, item)
    },
    async importJson({state}){
      const targetJsonFiles = remote.dialog.showOpenDialog(thisWindow, {
        title:'Select Myl save data json.',
        defaultPath:join(remote.app.getPath('desktop'), DEFAULT_JSON_NAME),
        filters:[
          {
            name:'Json',
            extensions:['json']
          }
        ]
      })
      if(!targetJsonFiles || targetJsonFiles.length === 0){
        return
      }
      const [targetJson] = targetJsonFiles
      if(!existsSync(targetJson)){
        return eventHub.$emit('notify', state.ui.FILE_NOT_FOUND, 'warn')
      }
      try{
        const jsonTxt = await new Promise<string>(r=>readFile(targetJson, 'utf8', (_e:Error, d:any)=>r(d)))
        const importData = JSON.parse(jsonTxt)
        await importData.reduce(async (b:Promise<void>,d:any)=>{
          await b
          const {category, items} = d
          const cate:Category = await db.addCategory(category.name)
          await items.reduce(async (ib:Promise<void>, i:any)=>{
            await ib
            i.cateId = cate.id
            await db.addItem(i)
          }, Promise.resolve())
          state.categories.push(cate)
        }, Promise.resolve())
        eventHub.$emit('notify', state.ui.IMPORT_DONE)
      }catch(e){
        console.error(e)
        eventHub.$emit('notify', state.ui.FILE_IS_INVALID, 'error')
      }
    },
    async exportJson({state}){
      const savePath = remote.dialog.showSaveDialog(thisWindow,{
        title:'Select save filepath.',
        defaultPath:join(remote.app.getPath('desktop'), DEFAULT_JSON_NAME)
      })
      if(!savePath || savePath.length === 0){
        return
      }
      const exportData = await db.exportAll(savePath)
      await new Promise(r=> writeFile(savePath, JSON.stringify(exportData), 'utf8' ,r))
      eventHub.$emit('notify', state.ui.EXPORT_DONE)
    }
  }
}

class MylClass extends Store<object>{
  constructor(storeData){
    super(storeData)
  }
}
const mylClass = new MylClass(storeData)
mylClass.watch((state:any)=>{
  return state.config.lang
},(v,old)=>{
  mylClass.dispatch('langSwitch', v)
})
mylClass.watch((state:any)=>{
  return state.config.theme
}, (v,old)=>{
  mylClass.dispatch('selectTheme', v)
})
export default mylClass
