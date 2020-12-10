@echo off
setlocal
set cmd=%*
if not defined cmd set cmd=%ComSpec%
powershell iex """start -v runas $Env:cmd"""
