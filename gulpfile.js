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