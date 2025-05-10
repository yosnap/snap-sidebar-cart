#!/bin/bash

# Script para compilar los archivos JavaScript con Webpack

# Comprobar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "Node.js no está instalado. Por favor, instálalo desde https://nodejs.org/"
    exit 1
fi

# Comprobar si npm está instalado
if ! command -v npm &> /dev/null; then
    echo "npm no está instalado. Por favor, instálalo junto con Node.js desde https://nodejs.org/"
    exit 1
fi

# Directorio del plugin
PLUGIN_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$PLUGIN_DIR"

# Instalar dependencias si no existen
if [ ! -d "node_modules" ]; then
    echo "Instalando dependencias..."
    npm install
fi

# Compilar con Webpack
echo "Compilando archivos JavaScript con Webpack..."
npm run build

# Verificar si la compilación fue exitosa
if [ $? -eq 0 ]; then
    echo "Compilación completada con éxito!"
    echo "Los archivos compilados se encuentran en:"
    echo "  - assets/js/dist/snap-sidebar-cart.js"
    echo "  - assets/js/dist/admin.js"
else
    echo "Error durante la compilación. Por favor, revisa los mensajes de error."
    exit 1
fi

echo "Proceso finalizado."