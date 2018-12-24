import {remote} from 'electron'
import {join} from 'path'
const ROOTDIR = remote.getGlobal('ROOTDIR')
const IMGDIR = join(ROOTDIR, 'imgs')
const mainWindow = remote.getCurrentWindow()
const DEFAULT_JSON_NAME = 'myl-data.json'
export default {
  ROOTDIR,
  IMGDIR,
  mainWindow,
  DEFAULT_JSON_NAME
}