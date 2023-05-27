import Dexie from 'dexie'
import Category from '../models/category'
import Item from '../models/item'
import { getIcon } from './get-file-info'
import Config from '../models/config'
import { Sortable } from '../models/sortable'
import { URL } from '../consts'
function sortFunc(a: Sortable, b: Sortable): number {
  return a.sort - b.sort
}
interface ExportForm {
  category: Category
  items: Item[]
}
export default class MylDB extends Dexie {
  categories!: Dexie.Table<Category, number>
  items!: Dexie.Table<Item, number>
  config!: Dexie.Table<Config, number>
  constructor() {
    super('myl-db')
    this.version(2).stores({
      categories: '++id,name,sort,color',
      items: '++id,*cateId,name,path,type,by,cmd,icon,sc,sort,cwd',
      config: '++id, config'
    })
    this.categories.mapToClass(Category)
    this.items.mapToClass(Item)
    this.config.mapToClass(Config)
  }
  async loadConfig(): Promise<Config> {
    let conf = await this.config.toCollection().last()
    if (!conf) {
      conf = new Config()
      await this.config.add(conf)
    }
    return conf
  }
  async exportAll(): Promise<ExportForm[]> {
    const categories = await this.categories.toArray()
    const items = await this.items.toArray()
    const categoriesMap = categories.reduce((b, c) => {
      b[c.id] = {
        category: c,
        items: []
      } as ExportForm
      return b
    }, {} as { [key: string]: ExportForm })
    items.forEach((i) => {
      const cateId = i.cateId
      categoriesMap[cateId].items.push(i)
    })
    const exportCategories = Object.keys(categoriesMap).reduce((ary, idx) => {
      const cursorItem = categoriesMap[idx]
      ary.push(cursorItem)
      return ary
    }, [] as ExportForm[])
    return exportCategories
  }
  async saveConfig(config: Config): Promise<void> {
    this.config.update(config.id as number, config)
  }
  async getCategories(): Promise<Category[]> {
    const categories = await this.categories.toArray()
    categories.sort(sortFunc)
    return categories
  }
  async getItems(cateId: number): Promise<Item[]> {
    const items = await this.items.where('cateId').equals(cateId).toArray()
    items.sort(sortFunc)
    return items
  }
  async addCategory(name: string): Promise<Category> {
    const allCates = await this.getCategories()
    const maxSort =
      allCates.reduce((m, c) => {
        return Math.max(m, c.sort)
      }, 0) + 1
    const newCategory = new Category(name, maxSort)
    await this.categories.add(newCategory)
    return newCategory
  }
  async removeCategory(cate: Category): Promise<void> {
    await this.transaction('rw', this.categories, this.items, async () => {
      await this.categories.delete(cate.id)
      await this.items.where({ cateId: cate.id }).delete()
    })
  }
  getMaxId(id: number): Promise<number> {
    return this.getItems(id).then((cateItems) => {
      return (
        cateItems.reduce((m, c) => {
          return Math.max(m, c.sort)
        }, 0) + 1
      )
    })
  }
  async addItem(itemProps: FileInfo): Promise<Item> {
    const { cateId } = itemProps
    itemProps.sort = await this.getMaxId(cateId as number)
    const newItem = new Item(itemProps)
    await this.items.add(newItem)
    return newItem
  }
  async addUrlItem(name: string, urlString: string, cateId: number): Promise<Item> {
    const { origin, host } = new window.URL(urlString)
    const icon = await getFavicon(origin)
    let iconDataUrl!: string
    if (icon === undefined) {
      iconDataUrl = await getIcon(location.href)
    } else {
      iconDataUrl = icon
    }
    const sort = await this.getMaxId(cateId)
    const newItem = new Item({
      name: name || host,
      icon: iconDataUrl,
      sort,
      cateId,
      path: urlString,
      type: URL
    })
    await this.items.add(newItem)
    return newItem
  }
  async moveItem(item: Item, cateId: number): Promise<boolean> {
    const { id } = item
    const maxSortNumber = await this.getMaxId(cateId)
    await this.items.update(id, { cateId, sort: maxSortNumber })
    return true
  }
  async removeItem(item: Item): Promise<void> {
    return this.items.delete(item.id)
  }
}

async function getFavicon(origin: string): Promise<string | undefined> {
  const faviconUrl = `${origin}/favicon.ico`
  const res = (await fetch(faviconUrl)
    .then((r) => r.blob())
    .catch((e) => {
      console.warn(e)
      return undefined
    })) as undefined | Blob
  if (res === undefined) {
    return undefined
  }
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.addEventListener('load', () => {
      if (!(reader.result as string).includes('image/')) {
        return resolve(getIcon('something.html'))
      }
      resolve(reader.result as string)
    })
    reader.readAsDataURL(res)
  })
}
