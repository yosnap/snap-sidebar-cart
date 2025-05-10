@echo off
REM Script para compilar los archivos JavaScript con Webpack en Windows

REM Comprobar si Node.js está instalado
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Node.js no está instalado. Por favor, instálalo desde https://nodejs.org/
    exit /b 1
)

REM Comprobar si npm está instalado
where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo npm no está instalado. Por favor, instálalo junto con Node.js desde https://nodejs.org/
    exit /b 1
)

REM Directorio del plugin
cd /d "%~dp0"

REM Instalar dependencias si no existen
if not exist "node_modules" (
    echo Instalando dependencias...
    call npm install
)

REM Compilar con Webpack
echo Compilando archivos JavaScript con Webpack...
call npm run build

REM Verificar si la compilación fue exitosa
if %ERRORLEVEL% equ 0 (
    echo Compilación completada con éxito!
    echo Los archivos compilados se encuentran en:
    echo   - assets/js/dist/snap-sidebar-cart.js
    echo   - assets/js/dist/admin.js
) else (
    echo Error durante la compilación. Por favor, revisa los mensajes de error.
    exit /b 1
)

echo Proceso finalizado.