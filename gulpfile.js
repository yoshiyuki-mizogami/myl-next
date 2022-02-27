import gulp from 'gulp'
import {spawn} from'child_process'
import webpack from 'webpack'
import wpConfig from './webpack.config.js'
import electron from 'electron'
import del from 'del'

import {readFileSync} from 'fs'

const {task,series} = gulp
const {version} = JSON.parse(readFileSync('./app/package.json'))

console.log(`::set-env name=APP_VERSION::${version}`)

task('webpack',function doWebpack(clbk){
  let compiled = false
  const comp = webpack(wpConfig)
  comp.watch({}, (er, stat)=>{
    console.log(stat.toString({colors:true}))
    if(compiled){
      return
    }
    compiled = true
    clbk()
  })
})

function bootElectron(){
  const c = spawn(electron, ['app', '--trace-warnings'], {stdio:'inherit'})
  c.on('close',bootElectron)
}
task('boot', bootElectron)

task('dev',series('webpack', 'boot'))

task('packProduction', function packProduction(clbk){
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
})

async function clearDist(){
  return del(['dist/**'],{force:true})
}

task('clearDist',clearDist)