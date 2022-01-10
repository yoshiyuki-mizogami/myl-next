import ja from '../../lang/ja.json'
import en from '../../lang/en.json'
import globals from '../globals'
const {ROOTDIR} = globals
const LANG = 'lang'
const JSONSUFF = '.json'
const UTF8 = 'utf8'
type Langs = 'en'|'ja'
const langs = {
  ja,en
}
export default function langSwitch(type:Langs):Promise<object>{
    return (langs as any)[type]
}
