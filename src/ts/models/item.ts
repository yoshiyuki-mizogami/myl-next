import {shell} from 'electron'
import {spawn} from 'child_process'
import {dirname} from 'path'
import Sortable from './sortable'
import {URL} from '../consts'
import url from 'url'
const EXPLORER = 'explorer'
export default class Item implements Sortable{
  id:number
  cateId:number
  name:string
  path:string
  type:string
  by:string
  cmd:string
  icon:string
  sc:string
  sort:number
  cwd:string
  constructor(obj){
    Object.assign(this,obj)
  }
  call(){
    let cmd:string = this.path
    if(this.by){
      cmd = this.by
      const process = spawn(cmd, [this.path])
      process.on('close', console.log)
      return
    }
    explorer(cmd)
  }
  openParent(){
    if(this.type === URL){
      return shell.openExternal(getTopUrl(this.path))
    }
    let parent = dirname(this.path)
    if(!parent){
      parent = this.path
    }
    explorer(parent)
  }
}

function getTopUrl(urlstring:string){
  const thisUrl = new url.URL(urlstring)
  return `${thisUrl.protocol}//${thisUrl.host}/`
}

function explorer(path){
  spawn(EXPLORER, [path], {
    detached:true
  })
}