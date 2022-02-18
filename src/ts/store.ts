import {clipboard, shell, ipcRenderer} from 'electron'
import {join} from 'path'
import Category from '../ts/models/category'
import Item from '../ts/models/item'
import getFileInfo from './utils/get-file-info'
import MylDB from './utils/scheme'
import langSwitchFn, {LangUI} from './lib/lang-swicher'
import switchTheme from './lib/switch-theme'
import {Themes} from './consts'
import Config from './models/config'
import globals from './globals'
import {writeFile, existsSync, readFile} from 'fs'
import eventHub from './event-hub'
import { reactive, nextTick, watch, toRaw } from 'vue'

const {DEFAULT_JSON_NAME} = globals


export enum Langs{
  EN = 'en',
  JA = 'ja'
}
const config = new Config()
const db = new MylDB()
export const isUrl = /^https?:\/\//
export const state = reactive({
  version:'',
  themes:Themes,
  categories:[] as Category[],
  items:[] as Item[],
  showNewCategoryDialog:false,
  selectedCategory:null as null|Category,
  config,
  configRaw:null as Config,
  loading:false,
  ui:{} as LangUI,
  sortMode:false,
  dragItem:null as null | Item
})
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
export function setDragItem(item:Item){
  state.dragItem = item
}
export async function moveItem(destCategory:Category){
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
  state.version = await ipcRenderer.invoke('getVersion')
  state.categories = await db.getCategories()
  state.selectedCategory = state.categories[0]
  state.ui = await langSwitchFn(state.config.lang)
  ipcCommunicate('showWindow')
}
function ipcCommunicate(channel:string, data:unknown = undefined){
  ipcRenderer.send(channel, data)
}
async function ipcHandleCommunicate(channel:string, data:unknown = undefined){
  return await ipcRenderer.invoke(channel, data)
}

export async function loadConfig(){
  try{
    const configRaw = await db.loadConfig()
    if(!configRaw.aot === undefined || configRaw.lang === undefined || configRaw.theme === undefined){
      throw configRaw.id
    }
    state.configRaw = configRaw
    state.config = state.configRaw
  }catch(id){
    state.config.id = id
    state.configRaw = state.config
  }
}
export async function saveConfig(){
  db.saveConfig(state.configRaw)
}
export async function langSwitch(lang:Langs){
  state.config.lang = lang
  state.ui = langSwitchFn(lang)
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
    db.categories.update(o.id, {'sort':o.sort})
  })
}
export function updateCategoryName(cate:Category, newName:string){
  cate.name = newName
  return db.categories.update(cate.id, {name:cate.name})
}
export function updateCategoryColor(cate:Category){
  return db.categories.update(cate.id, {color:toRaw(cate.color)})
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
  const removeIndex = state.items.findIndex((i)=> i === item)
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
export async function addUrl({url, name}:{url:string, name:string}){
  if(!isUrl.test(url)){
    eventHub.emit('notify', state.ui.INVALID_URL)
    return
  }
  const urlItem = await db.addUrlItem(name, url, state.selectedCategory?.id)
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
    return eventHub.emit('notify', state.ui.FILE_NOT_FOUND)
  }
  try{
    const jsonTxt = await new Promise<string>(r=>readFile(targetJson,'utf8',(_e, d)=>r(d) ))
    const importData = JSON.parse(jsonTxt)
    await importData.reduce(async (b:Promise<void>,d:unknown)=>{
      await b
      const {category, items} = d as {category:Category,items:Item[]}
      const cate:Category = await db.addCategory(category.name)
      await items.reduce(async (ib:Promise<void>, i)=>{
        await ib
        i.cateId = cate.id
        await db.addItem(i)
      }, Promise.resolve())
      state.categories.push(cate)
    }, Promise.resolve())
    eventHub.emit('notify', state.ui.IMPORT_DONE)
  }catch(e){
    console.error(e)
    eventHub.emit('notify', state.ui.FILE_IS_INVALID)
  }
}

export function setSize(h:number, w:number){
  ipcCommunicate('setSize', [h, w])
}
export function setAlwaysOnTop(tf:boolean){
  ipcCommunicate('setAlwaysOnTop', tf)
}

export async function exportJson(){
  const savePath = await ipcHandleCommunicate('showSaveDialog',{
    title:'Select save filepath.',
    defaultPath:join(getDesktopPath(), DEFAULT_JSON_NAME)
  })
  if(!savePath.filePath){
    return
  }
  const exportData = await db.exportAll()
  await new Promise(r=> writeFile(savePath.filePath, JSON.stringify(exportData), 'utf8' ,r))
  eventHub.emit('notify', state.ui.EXPORT_DONE)
}

watch(()=>state.config.lang,()=>langSwitchFn(state.config.lang))
watch(()=>state.config.theme,()=>selectTheme(state.config.theme))


export function openColorSetter(c:Category){
  eventHub.emit('openColorSetter', c)
}


const getActivateCategoryStr = (()=>{
  const clearTime = 250
  let findTmpStr = ''
  let evId = null as null
  return function(s:string){
    clearTimeout(evId as number)
    evId = setTimeout(()=>{
      findTmpStr = ''
    }, clearTime) as any
    return findTmpStr += s
  }
})()
export function activateCategoryBykeydown(ev:KeyboardEvent){
  const {key} = ev
  if(key.length !== 1){
    return
  }
  const keyReg = new RegExp(`^${getActivateCategoryStr(key)}`, 'i')
  const finds = [] as number[]
  let current = null as null|number
  state.categories.forEach((c ,ind)=>{
    if(keyReg.test(c.name)){
      finds.push(ind)
    }
    if(state.selectedCategory === c){
      current = ind
    }
  })

  if(finds.length === 0){
    return
  }
  let pos = 0
  if(current !== null){
    pos = finds.find((p)=>current < p)
    if(pos === undefined){
      pos = finds[0]
    }
  }
  state.selectedCategory = state.categories[pos]
}