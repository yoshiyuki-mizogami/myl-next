import ja from '../../lang/ja.json'
import en from '../../lang/en.json'
import globals from '../globals'
const {ROOTDIR} = globals
const LANG = 'lang'
const JSONSUFF = '.json'
const UTF8 = 'utf8'

const langs = {
  ja,en
}
type Langs = keyof typeof langs
export type LangUI = typeof ja
export default function langSwitch(type:Langs):LangUI{
    return langs[type]
}
