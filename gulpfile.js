import {type} from 'os'
import gulp from 'gulp'
import {spawn} from'child_process'
import webpack from 'webpack'
import wpConfig from './webpack.config.js'
import electron from 'electron'
import del from 'del'

import {readFileSync} from 'fs'

const {task,series, parallel} = gulp
const {version} = JSON.parse(readFileSync('./app/package.json'))

console.log(`::set-env name=APP_VERSION::${version}`)

let npmCmd = 'npm'
if(type().toLowerCase().includes('windows')){
  npmCmd += '.cmd'
}

task('buildMainProd', (clbk)=>{
  const ps = spawn(npmCmd, ['run', 'build-main-prod'], {stdio:'inherit'})
  ps.on('close', clbk)
})


task('buildMainDev', (clbk)=>{
  spawn(npmCmd, ['run','build-main-dev'], {stdio:'inherit'})
  clbk()
})

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

task('dev',series(parallel('webpack', 'buildMainDev'), 'boot'))

task('packProduction', parallel('buildMainProd',
  function packProduction(clbk){
    process.env.NODE_ENV = 'production'
    wpConfig.devtool = false
    wpConfig.mode = 'production'
    const comp = webpack(wpConfig)
    comp.run((er, stat)=>{
      console.log(stat.toString({colors:true}))
      clbk()
    })
})
)

async function clearDist(){
  return del(['dist/**'],{force:true})
}

task('clearDist',clearDist)