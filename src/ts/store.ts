import Vue from 'vue'
import {remote, nativeImage, FileIconOptions, ResizeOptions} from 'electron'
import {basename} from 'path'
import {stat, Stats} from 'fs'
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
    themes:Themes,
    categories:[],
    items:[],
    showNewCategoryDialog:false,
    selectedCategory:null,
    config,
    configRaw:null as any,
    loading:false,
    ui:{},
    dragItem:null as object | unknown
  },
  mutations:{
    setNewCategoryDialog(state, tf:boolean){
      state.showNewCategoryDialog = tf
    },
    setLoading(state, tf:boolean){
      state.loading = tf
    },
    setSelectedCategory(state, c:Category){
      state.selectedCategory = c
    },
    toggleAOT(state){
      state.config.aot = !state.config.aot
    },
    setDragItem(state, item:object){
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
    async init(store){
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
    async langSwitch(store, lang:string){
      store.state.config.lang = lang
      store.state.ui = await langSwitch(lang)
      store.dispatch('saveConfig')
    },
    async selectTheme(store, theme:string){
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
    updateCategoryName({state}, cate){
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
    async removeItem({state}, item:Item){
      await db.removeItem(item)
      const removeIndex = state.items.findIndex(i=> i === item)
      Vue.delete(state.items, removeIndex)
      Vue.nextTick(()=>hub.$emit('adjust'))
    },
    async addFile({state}, {filepath, trackLink}){
      const cateId = state.selectedCategory.id
      const items = state.items
      const fileInfo = await getFileInfo(filepath, trackLink)
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
    async showItemDetail(_, item){
      hub.$emit('show-item-detail', item)
    },
    updateItem(_, item){
      db.items.update(item.id, item)
    },
    importJson(){

    },
    exportJson(){

    }
  }
}

class MylClass extends Store<object>{
  constructor(){
    super(storeData)
  }
}
const mylClass = new MylClass()
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
