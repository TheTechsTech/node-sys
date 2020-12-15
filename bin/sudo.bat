@echo off
setlocal
set cmd=%*
powershell -command Start-Process -Verb RunAs -FilePath $env:comspec -ArgumentList """/c $Env:cmd"""
