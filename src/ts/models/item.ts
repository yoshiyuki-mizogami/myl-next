import {shell} from 'electron'
import {spawn} from 'child_process'
import Sortable from './sortable'
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
    shell.openExternal(cmd)
  }
  openParent(){
    shell.showItemInFolder(this.path)
  }
}