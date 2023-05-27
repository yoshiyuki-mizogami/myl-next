import { joinPath } from './native_fnc_proxy'

import { BASIC } from '@renderer/themes/BASIC'
import { DARK } from '@renderer/themes/DARK'
import { EVIL } from '@renderer/themes/EVIL'
import { LIGHT } from '@renderer/themes/LIGHT'
import { MONO } from '@renderer/themes/MONO'
import { PASTEL } from '@renderer/themes/PASTEL'


const themes = {
  BASIC,
  DARK,
  EVIL,
  LIGHT,
  MONO,
  PASTEL
}
export type ThemeName = keyof typeof themes
const theme = document.documentElement.querySelector('#theme') as HTMLAnchorElement
export default function themeSwitch(themeName: ThemeName): void {
  theme.innerHTML = ''
  theme.appendChild(document.createTextNode(themes[themeName]))
}
