const {spawn, execSync} = require('child_process')
const {series} = require('gulp')
const dotenv = require('dotenv')

const webpack = require('webpack')



dotenv.config()

console.log('github access token %s....', process.env.GH_TOKEN.substr(0,5))

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
      publish:[
        {
          provider:'github'
        }
      ],
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
        publish:'github',
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

exports.publish = async function publish(done){
  const ghToken = process.env.GH_TOKEN
  execSync(`set GH_TOKEN=${ghToken} `)
  const cp = spawn('electron-builder',['--mac', '--win', '--publish', 'always'], {stdio:'inherit'})
  cp.on('close', ()=>done())
}

const del = require('del')
async function clearDist(){
  return del(['dist/**'],{force:true})
}

exports.clearDist = clearDist