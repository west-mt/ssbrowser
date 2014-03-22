@echo off

rem Start "Launcher" "C:\Program Files (x86)\Mozilla Firefox\firefox.exe" -app application.ini -no-remote -P default -launcher
rem Start "Launcher" "C:\Program Files\Mozilla Firefox\firefox.exe" -app application.ini -no-remote -P default -launcher

for %%i in ("C:\Program Files (x86)\Mozilla Firefox\firefox.exe" "C:\Program Files\Mozilla Firefox\firefox.exe") do (
  if exist %%i  echo Start "Launcher" %%i -app application.ini -no-remote -P default -launcher
)
pause
exit
