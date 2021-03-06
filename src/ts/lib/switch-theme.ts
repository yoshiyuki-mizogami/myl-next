import {join} from 'path'
const themeCssDir = './css/theme/'
const theme = document.documentElement.querySelector('#theme')
export default function themeSwitch(themeName:string){
  theme.setAttribute('href', join(themeCssDir, `${themeName}.css`))
}