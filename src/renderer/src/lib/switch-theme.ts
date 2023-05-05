import { joinPath } from './native_fnc_proxy'

const themeCssDir = './css/theme/'
const theme = document.documentElement.querySelector('#theme') as HTMLAnchorElement
export default function themeSwitch(themeName: string): void {
  theme.setAttribute('href', joinPath(themeCssDir, `${themeName}.css`))
}
