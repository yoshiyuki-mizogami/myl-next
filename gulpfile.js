const {spawn} = require('child_process')
const {series} = require('gulp')
const webpack = require('webpack')

exports.webpack = function doWebpack(clbk){
  let compiled = false
  const wpConfig = require('./webpack.config')
  const comp = webpack(wpConfig)
  comp.watch({}, (er, stat)=>{
    console.log(stat.toString({colors:true}))
    if(compiled){
      return
    }
    compiled = true
    clbk()
  })
}

function bootElectron(){
  const c = spawn(require('electron'), ['app'], {stdio:'inherit'})
  c.on('close',bootElectron)
}
exports.boot = bootElectron

exports.dev = series(exports.webpack, bootElectron)

exports.packProduction = function packProduction(clbk){
  const wpConfig = require('./webpack.config')
  process.env.NODE_ENV = 'production'
  wpConfig.forEach(c=>{
    c.devtool = false
    c.mode = 'production'
  })
  const comp = webpack(wpConfig)
  comp.run((er, stat)=>{
    console.log(stat.toString({colors:true}))
    clbk()
  })
}

exports.build = series(exports.packProduction,clearDist, async ()=>{
  const builder = require('electron-builder')
  return builder.build({
    config:{
      appId:'yoshiyuki.mizogami.mylnext',
      productName:'MylNext',
      directories:{
        app:'app',
        output:'dist'
      },
      copyright:'Copyright 2018 Yoshiyuki Mizogami',
      mac:{
        category:'public.app-category.eveloper-tools',
        target:['dmg'],
        icon:'app/imgs/icon.icns'
      },
      dmg:{
        icon:'app/imgs/icon.icns',
        title:'MylNext',
      },
      win:{
        target:['nsis'],
        icon:'app/imgs/icon.ico'
      },
      nsis:{
        oneClick:true,
        shortcutName:'MylNext',
        installerIcon:'app/imgs/icon.ico',
        uninstallerIcon:'app/imgs/icon.ico'
      }
    }
  })
})

const del = require('del')
async function clearDist(){
  return del(['dist/**'],{force:true})
}

exports.clearDist = clearDist