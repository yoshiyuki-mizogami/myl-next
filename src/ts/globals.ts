import {join} from 'path'
const ROOTDIR = window['ROOTDIR']
const IMGDIR = join(ROOTDIR, 'imgs')
const VERSION = window['VERSOIN']
const mainWindow = window
const DEFAULT_JSON_NAME = 'myl-data.json'
const HP_URL = 'https://github.com/yoshiyuki-mizogami/myl-next/releases'
export default {
  HP_URL,
  VERSION,
  ROOTDIR,
  IMGDIR,
  mainWindow,
  DEFAULT_JSON_NAME
}