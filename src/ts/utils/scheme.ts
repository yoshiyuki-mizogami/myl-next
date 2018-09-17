import Dexie from 'dexie'
import Category from '../models/category'
import Item from '../models/item'
import {getIcon,RESIZE_OPT, ICON_OPT} from '../../ts/utils/get-file-info'
import Config from '../models/config'
import Sortable from '../models/sortable'
import url from 'url'
function sortFunc(a:Sortable, b:Sortable){
  return a.sort - b.sort
}
export default class MylDB extends Dexie{
  categories:Dexie.Table<Category, number>
  items:Dexie.Table<Item, number>
  config:Dexie.Table<Config, number>
  constructor(){
    super('myl-db')
    this.version(1).stores({
      categories:'++id,name,sort',
      items:'++id,*cateId,name,path,type,by,cmd,icon,sc,sort,cwd',
      config:'++id, config'
    })
    this.categories.mapToClass(Category)
    this.items.mapToClass(Item)
    this.config.mapToClass(Config)
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
    console.log('add category done')
    return newCategory
  }
  async removeCategory(cate:Category){
    await this.transaction('rw', this.categories, this.items,async ()=>{
      await this.categories.delete(cate.id)
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
  async addUrlItem(urlString:string, cateId:number):Promise<Item>{
    const webIcon = await getIcon(location.href)
    const {host} = url.parse(urlString)
    const resizedIcon = webIcon.resize(RESIZE_OPT)
    const dateUrl = resizedIcon.toDataURL()
    const sort = await this.getMaxId(cateId)
    const newItem = new Item({
      name:host,
      icon:dateUrl,
      sort,
      cateId,
      path:urlString,
      type:'url'
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