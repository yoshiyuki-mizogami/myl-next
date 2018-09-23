import Vue from 'vue'
import {remote, nativeImage, FileIconOptions, ResizeOptions} from 'electron'
import {basename} from 'path'
import {stat, Stats} from 'fs'
import Category from '../ts/models/category'
import Item from '../ts/models/item'
import getFileInfo from './utils/get-file-info'
import MylDB from './utils/scheme'
import hub from './event-hub'
import {Store} from 'vuex'
import langSwitch from './lang/lang-swicher'
const thisWindow = remote.getCurrentWindow()
enum Themes{
  NORMAL = 'normal'
}
enum Langs{
  EN = 'en',
  JA = 'ja'
}
interface Config{
  lang:Langs,
  theme:Themes,
  AOT:boolean
}
const config:Config = {
  lang:Langs.EN,
  theme:Themes.NORMAL,
  AOT:false
}
const db = new MylDB()
const isUrl = /^https?:\/\//
const storeData = {
  state:{
    categories:[],
    items:[],
    showNewCategoryDialog:false,
    selectedCategory:null,
    config,
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
      state.config.AOT = !state.config.AOT
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
    async init({state}){
      state.categories = await db.getCategories()
      state.selectedCategory = state.categories[0]
      state.ui = await langSwitch(state.config.lang)
      thisWindow.show()
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
export default MylClass