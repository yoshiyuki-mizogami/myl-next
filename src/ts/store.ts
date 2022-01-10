import {clipboard, shell, ipcRenderer} from 'electron'
import {join} from 'path'
import Category from '../ts/models/category'
import Item from '../ts/models/item'
import getFileInfo from './utils/get-file-info'
import MylDB from './utils/scheme'
import langSwitchFn from './lib/lang-swicher'
import switchTheme from './lib/switch-theme'
import {Themes} from './consts'
import Config from './models/config';
import globals from './globals'
import {writeFile, existsSync, readFile} from 'fs';
import eventHub from './event-hub';
import { reactive, nextTick, watch } from 'vue'

const {DEFAULT_JSON_NAME} = globals


export enum Langs{
  EN = 'en',
  JA = 'ja'
}
const config = new Config()
const db = new MylDB()
const isUrl = /^https?:\/\//
export const state = reactive({
    version:globals.VERSION,
    themes:Themes,
    categories:[] as Category[],
    items:[] as any[],
    showNewCategoryDialog:false,
    selectedCategory:null as null|Category,
    config,
    configRaw:null as any,
    loading:false,
    ui:{} as any,
    sortMode:false,
    dragItem:null as object | unknown
  }
)
export function switchSortMode(){
  state.sortMode = !state.sortMode
}
export function setNewCategoryDialog(tf:boolean){
  state.showNewCategoryDialog = tf
}
export function setLoading(tf:boolean){
  state.loading = tf
}
export function setSelectedCategory(c:Category){
  state.selectedCategory = c
}
export function toggleAOT(){
  state.config.aot = !state.config.aot
}
export function setDragItem(item:object){
  state.dragItem = item
}
export async function moveItem(destCategory:any){
  if(destCategory === state.selectedCategory){
    return
  }
  const {dragItem} = state
  state.dragItem = null
  const ind = state.items.indexOf(dragItem)
  state.items.splice(ind, 1)
  await db.moveItem(dragItem, destCategory.id)
}
export async function init(){
  loadConfig()
  state.categories = await db.getCategories()
  state.selectedCategory = state.categories[0]
  state.ui = await langSwitchFn(state.config.lang)
  ipcCommunicate('showWindow')
}
function ipcCommunicate(channel:string, data:any = undefined){
  ipcRenderer.send(channel, data)
}
async function ipcHandleCommunicate(channel:string, data:any = undefined){
  return await ipcRenderer.invoke(channel, data)
}

export async function loadConfig(){
  state.configRaw = await db.loadConfig()
  state.config = state.configRaw.config
}
export async function saveConfig(){
  db.saveConfig(state.configRaw)
}
export async function langSwitch(lang:string){
  state.config.lang = lang as any
  state.ui = await langSwitchFn(lang as any)
  saveConfig()
}
export async function selectTheme(theme:string){
  state.config.theme = theme
  saveConfig()
  switchTheme(theme)
}
export function updateItemsOrder(newOrders:Array<Item>):void{
  state.items = newOrders
  newOrders.forEach((o, i)=>{
    o.sort = i
    db.items.update(o.id, {'sort':o.sort})
  })
}
export function updateCategoriesOrder(newOrders:Array<Category>):void{
  state.categories = newOrders
  newOrders.forEach((o, i)=>{
    o.sort = i
    db.categories.update(o.id as any, {'sort':o.sort})
  })
}
export function updateCategoryName(cate:Category){
  db.categories.update(cate.id as any, {name:cate.name})
}
export async function addNewCategory( categoryName:string){
  const cate:Category = await db.addCategory(categoryName)
  state.categories.push(cate)
  state.selectedCategory = cate
  nextTick(()=>eventHub.emit('adjust'))
}
export async function removeCategory(cate:Category){
  await db.removeCategory(cate)
  const removeIndex = state.categories.findIndex(c=> c === cate)
  state.categories.splice(removeIndex, 1)
  if(state.selectedCategory === cate){
    state.items = []
  }
  nextTick(()=>eventHub.emit('adjust'))
}
export async function getItems(cateId:number){
  const items = await db.getItems(cateId)
  state.items = items
  nextTick(()=>eventHub.emit('adjust'))
}
export function openHP(){
  shell.openExternal(globals.HP_URL)
}
export async function removeItem(item:Item){
  await db.removeItem(item)
  const removeIndex = state.items.findIndex((i:any)=> i === item)
  state.items.splice(removeIndex, 1)
  nextTick(()=>eventHub.emit('adjust'))
}
export async function addFile({filepath} :{filepath:string}){
  const cateId = state.selectedCategory?.id
  const items = state.items
  const fileInfo = await getFileInfo(filepath)
  fileInfo.cateId = cateId
  const fileItem = await db.addItem(fileInfo)
  items.push(fileItem)
  nextTick(()=>eventHub.emit('adjust'))
}
export async function addUrl({url}:{url:string}){
  if(!isUrl.test(url)){
    eventHub.emit('notify', (state.ui as any).INVALID_URL)
    return
  }
  const urlItem = await db.addUrlItem(url, state.selectedCategory?.id as any)
  state.items.push(urlItem)
  nextTick(()=>eventHub.emit('adjust'))
}
export async function copyItemPath(item:Item){
  clipboard.writeText(item.path)
}
export async function showItemDetail(item:Item){
  eventHub.emit('show-item-detail', item)
}
export async function updateItem(item:Item){
  db.items.update(item.id, item)
}
//TODO
function getDesktopPath(){
  return ''
}
export async function importJson(){
  const desktopPath = await ipcHandleCommunicate('getDesktopPath')
  const targetJsonFiles = await ipcHandleCommunicate('showOpenDialog', {
    title:'Select Myl save data json.',
    defaultPath:join(getDesktopPath(), DEFAULT_JSON_NAME),
    filters:[
      {
        name:'Json',
        extensions:['json']
      }
    ]
  })
  if(targetJsonFiles.filePaths.length === 0){
    return
  }
  const [targetJson] = targetJsonFiles.filePaths
  if(!existsSync(targetJson)){
    return eventHub.emit('notify', (state.ui as any).FILE_NOT_FOUND)
  }
  try{
    const jsonTxt = await new Promise<string>(r=>readFile(targetJson, (_e:any, d:any)=>r(d) ))
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
    eventHub.emit('notify', (state.ui as any).IMPORT_DONE)
  }catch(e){
    console.error(e)
    eventHub.emit('notify', (state.ui as any).FILE_IS_INVALID)
  }
}

export function setSize(h:number, w:number){
  ipcCommunicate('setSize', [h, w])
}

export async function exportJson(){
  const savePath = await ipcHandleCommunicate('showSaveDialog',{
    title:'Select save filepath.',
    defaultPath:join(getDesktopPath(), DEFAULT_JSON_NAME)
  })
  if(!savePath.filePath){
    return
  }
  const exportData = await db.exportAll(savePath.filePath)
  await new Promise(r=> writeFile(savePath.filePath, JSON.stringify(exportData), 'utf8' ,r))
  eventHub.emit('notify', (state.ui as any).EXPORT_DONE)
}

watch(state.config.lang as any,(to:string, from:string)=>{
  langSwitchFn(to as any)
})
watch(state.config.theme as any,(to:string, from:string)=>{
  selectTheme(to)
})