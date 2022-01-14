import Dexie from 'dexie'
import Category from '../models/category'
import Item from '../models/item'
import {getIcon,RESIZE_OPT, ICON_OPT} from '../../ts/utils/get-file-info'
import Config from '../models/config'
import {Sortable} from '../models/sortable'
import { URL } from '../consts'
import { ipcRenderer, nativeImage, NativeImage } from 'electron'
import { join } from 'path'
import { unlink, writeFile } from 'fs/promises'
function sortFunc(a:Sortable, b:Sortable){
  return a.sort - b.sort
}
interface ExportForm {
  category:Category,
  items:Item[]
}
export default class MylDB extends Dexie{
  categories!:Dexie.Table<Category, number>
  items!:Dexie.Table<Item, number>
  config!:Dexie.Table<Config, number>
  constructor(){
    super('myl-db')
    this.version(2).stores({
      categories:'++id,name,sort,color',
      items:'++id,*cateId,name,path,type,by,cmd,icon,sc,sort,cwd',
      config:'++id, config'
    })
    this.categories.mapToClass(Category)
    this.items.mapToClass(Item)
    this.config.mapToClass(Config)
  }
  async loadConfig(){
    let conf = await this.config.toCollection().last()
    if(!conf){
      conf = new Config()
      await this.config.add(conf)
    }
    return conf
  }
  async exportAll(_:string){
    const categories  = await this.categories.toArray()
    const items = await this.items.toArray()
    const categoriesMap = categories.reduce((b, c:any)=>{
      b[c.id] = {
        category:c,
        items:[]
      } as ExportForm
      return b
    },{} as {[key:string]:any})
    items.forEach((i:any)=>{
      const cateId = i.cateId
      i.cateId = i.id = void 0
      categoriesMap[cateId].items.push(i)
    })
    const exportCategories = Object.keys(categoriesMap).reduce((ary:any,idx)=>{
      const cursorItem = categoriesMap[idx]
      ary.push(cursorItem)
      return ary
    },[])
    return exportCategories
  }
  async saveConfig(config:Config){
    this.config.update(config.id as any, config)
  }
  async getCategories(){
    const categories = await this.categories.toArray()
    categories.sort(sortFunc)
    return categories
  }
  async getItems(cateId:number):Promise<Item[]>{
    const items = await this.items.where('cateId').equals(cateId).toArray()
    items.sort(sortFunc)
    return items
  }
  async addCategory(name:string){
    const allCates = await this.getCategories()
    const maxSort = allCates.reduce((m, c)=>{
      return Math.max(m, c.sort)
    }, 0) + 1
    const newCategory = new Category(name, maxSort)
    await this.categories.add(newCategory)
    return newCategory
  }
  async removeCategory(cate:Category){
    await this.transaction('rw', this.categories, this.items,async ()=>{
      await this.categories.delete(cate.id as any)
      await this.items.where({cateId:cate.id}).delete()
    })
  }
  getMaxId(id:number){
    return this.getItems(id)
      .then(cateItems=>{
        return cateItems.reduce((m, c)=>{
          return Math.max(m, c.sort)
        }, 0) + 1
      })
  }
  async addItem(itemProps:any):Promise<Item>{
    const {cateId} = itemProps
    itemProps.sort = await this.getMaxId(cateId)
    const newItem = new Item(itemProps)
    await this.items.add(newItem)
    return newItem
  }
  async addUrlItem(name:string, urlString:string, cateId:number):Promise<Item>{
    const {origin,host} = new window.URL(urlString)
    let icon = await getFavicon(origin)
    if(icon === undefined){
      icon = await getIcon(location.href)
    }
    const resizedIcon = icon.resize(RESIZE_OPT)
    const dateUrl = resizedIcon.toDataURL()
    const sort = await this.getMaxId(cateId)
    const newItem = new Item({
      name:name || host,
      icon:dateUrl,
      sort,
      cateId,
      path:urlString,
      type:URL
    })
    await this.items.add(newItem)
    return newItem
  }
  async moveItem(item:any, cateId:number){
    const {id} = item
    const maxSortNumber = await this.getMaxId(cateId)
    await this.items.update(id , {cateId, sort:maxSortNumber})
    return true
  }
  async removeItem(item:Item):Promise<void>{
    return this.items.delete(item.id)
  }
}


async function getFavicon(origin:string):Promise<NativeImage|undefined>{
  const faviconUrl = `${origin}/favicon.ico`
  const res = await fetch(faviconUrl)
    .then(r=>r.arrayBuffer())
    .catch(e=>{
      return undefined
    }) as undefined|ArrayBuffer
  if(res === undefined){
    return undefined
  }
  const tmpDir = await ipcRenderer.invoke('getTmpDir')
  const iconname = `_myl_icon_${Date.now()}.ico`
  const tmpIconFilepath = join(tmpDir, iconname)
  await writeFile(tmpIconFilepath, Buffer.from(res))
  const icon = await nativeImage.createFromPath(tmpIconFilepath)
  unlink(tmpIconFilepath)
  if(icon.isEmpty()){
    return undefined
  }
  return icon
}
