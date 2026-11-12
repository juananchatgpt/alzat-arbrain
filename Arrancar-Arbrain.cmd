@echo off
rem Arranca Arbrain en modo servidor y abre el navegador con tu sesion.
rem Si ya esta corriendo, solo abre el navegador. Si no, lo arranca: esta ventana ES Arbrain;
rem si la cierras, Arbrain se apaga.
title Arbrain (no cierres esta ventana)
cd /d "%~dp0arbrain"
call "C:\Program Files\nodejs\npm.cmd" run servidor -- abrir
