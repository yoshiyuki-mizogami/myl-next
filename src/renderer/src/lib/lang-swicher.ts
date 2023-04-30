import ja from '../lang/ja.json'
import en from '../lang/en.json'
const langs = {
  ja,en
}
type Langs = keyof typeof langs
export type LangUI = typeof ja
export default function langSwitch(type:Langs):LangUI{
    return langs[type]
}
