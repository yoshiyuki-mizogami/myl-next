import {readFile} from 'fs'
import {promisify} from 'util'
import {join} from 'path'
import globals from '../globals'
const {ROOTDIR} = globals
const LANG = 'lang'
const JSONSUFF = '.json'
const UTF8 = 'utf8'
const readFileP = promisify(readFile)
export default function langSwitch(type:string):Promise<object>{
    return readFileP(join(ROOTDIR, LANG,  type + JSONSUFF),UTF8)
      .then(JSON.parse)
}