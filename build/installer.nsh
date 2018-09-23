!macro customInstall
  CreateShortCut "$SMSTARTUP\MylNext.lnk" "$INSTDIR\MylNext.exe" ""
!macroend
!macro customUnInstall
  Delete "$SMSTARTUP\MylNext.lnk"
!macroend