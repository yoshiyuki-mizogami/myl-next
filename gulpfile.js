const {spawn} = require('child_process')
const {series} = require('gulp')
const webpack = require('webpack')

const {version} = require('./app/package.json')
console.log(`::set-env name=APP_VERSION::${version}`)

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

const del = require('del')
async function clearDist(){
  return del(['dist/**'],{force:true})
}

exports.clearDist = clearDist