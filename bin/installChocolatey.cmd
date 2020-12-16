@echo off
SET DIR=%~dp0%

powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "((new-object net.webclient).DownloadFile('https://chocolatey.org/install.ps1','install.ps1'))"
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "& '%DIR%install.ps1' %*"
SET PATH=%PATH%;%ALLUSERSPROFILE%\chocolatey\bin