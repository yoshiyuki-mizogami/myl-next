import {remote} from 'electron'
import {join} from 'path'
const ROOTDIR = remote.getGlobal('ROOTDIR')
const IMGDIR = join(ROOTDIR, 'imgs')
const mainWindow = remote.getCurrentWindow()
export default {
  ROOTDIR,
  IMGDIR,
  mainWindow
}