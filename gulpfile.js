const g = require('gulp')
const {spawn} = require('child_process')
const webpack = require('webpack')
g.task('webpack', clbk=>{
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
})
function bootElectron(){
  const c = spawn(require('electron'), ['app'], {stdio:'inherit'})
  c.on('close',bootElectron)
}
g.task('boot', ()=>{
  bootElectron()
})
g.task('dev', ['webpack'], ()=>{
  bootElectron()
})

g.task('pack-production', clbk=>{
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
})
g.task('build',['pack-production'],()=>{
  const builder = require('electron-builder')
  return builder.build({
    arch:'ia32',
    config:{
      productName:'MylNext',
      directories:{
        app:'app',
        output:'dist'
      },
      copyright:'Copyright 2018 Yoshiyuki Mizogami',
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