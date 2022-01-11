import {join} from 'path'
function getRootDir(){
  return ''
}
function getVersion(){
  return ''
}
const ROOTDIR = getRootDir()
const IMGDIR = join(ROOTDIR, 'imgs')
const VERSION = getVersion()
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