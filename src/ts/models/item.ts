import {shell} from 'electron'
import {spawn,exec} from 'child_process'
import {dirname, basename} from 'path'
import Sortable from './sortable'
import {URL} from '../consts'
import url from 'url'
export default class Item implements Sortable{
  id:number
  cateId:number
  name:string = ''
  path:string = ''
  type:string = 'file'
  by:string = ''
  cmd:string = ''
  icon:string = ''
  sc:string = ''
  sort:number
  cwd:string = ''
  constructor(obj: any){
    Object.assign(this,obj)
  }
  call(){
    if(this.by){
      spawn(this.by, [this.path], {detached:true})
      return
    }
    if(this.cmd){
      return exec(`"${this.path}" ${this.cmd}`,{
        windowsHide:true
      },()=>{})
    }
    this.openItem(this.path)
  }
  openParent(){
    if(this.type === URL){
      return shell.openExternal(getTopUrl(this.path))
    }
    let parent = dirname(this.path)
    if(!parent){
      parent = this.path
    }
    this.openItem(parent)
  }
  openItem(path: string){
    console.log(path)
    shell.openPath(path)
  }
}

function getTopUrl(urlstring:string){
  const thisUrl = new url.URL(urlstring)
  return `${thisUrl.protocol}//${thisUrl.host}/`
}
