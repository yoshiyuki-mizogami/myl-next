import {readFile} from 'fs'
import {join} from 'path'
import globals from '../globals'
const {ROOTDIR} = globals
const LANG = 'lang'
const JSONSUFF = '.json'
const UTF8 = 'utf8'
export default function langSwitch(type:string):Promise<string>{
  return new Promise(resolve=>{
    readFile(join(ROOTDIR, LANG,  type + JSONSUFF),UTF8,(er, content:string)=>{
      resolve(JSON.parse(content))
    })
  })
}