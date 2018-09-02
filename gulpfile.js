const g = require('gulp')
const {spawn} = require('child_process')
g.task('webpack', ()=>{
  spawn('webpack.cmd', ['-w'], {stdio:'inherit'})
})
function bootElectron(){
  const c = spawn('electron.cmd', ['app'], {stdio:'inherit'})
  c.on('close',bootElectron)
}
g.task('boot', ()=>{
  bootElectron()
})
g.task('dev', ['webpack', 'boot'], ()=>{

})