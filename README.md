# Snap Sidebar Cart

Plugin de WooCommerce que proporciona un carrito lateral con funcionalidades avanzadas.

## Estructura del Proyecto

El proyecto ha sido reorganizado para utilizar Webpack como sistema de compilación de JavaScript, lo que permite una mejor organización del código y optimización de recursos.

### Estructura de Directorios

```
snap-sidebar-cart/
├── assets/
│   ├── css/
│   ├── js/
│   │   ├── dist/           # Archivos compilados por Webpack
│   │   ├── legacy/         # Archivos JavaScript originales (obsoletos)
│   │   └── ...             # Archivos JavaScript actuales
├── includes/               # Clases PHP del plugin
├── src/                    # Código fuente para Webpack
│   ├── modules/            # Módulos JavaScript
│   ├── admin.js            # Punto de entrada para el admin
│   └── index.js            # Punto de entrada principal
├── package.json            # Dependencias npm
├── webpack.config.js       # Configuración de Webpack
└── ...
```

## Archivos JavaScript Activos

Los siguientes archivos JavaScript son los que están actualmente en uso:

- `assets/js/dist/snap-sidebar-cart.js` - Archivo principal compilado por Webpack
- `assets/js/dist/admin.js` - Archivo de administración compilado por Webpack

## Archivos JavaScript Obsoletos

Los siguientes archivos JavaScript son obsoletos y se mantienen solo por compatibilidad:

- `assets/js/snap-sidebar-cart-ajax.js`
- `assets/js/snap-sidebar-cart-core.js`
- `assets/js/scroll-snap.js`
- `assets/js/tab-controller.js`
- `assets/js/preloader-controller.js`

## Desarrollo

### Requisitos

- Node.js 14+
- npm 6+

### Instalación

```bash
# Instalar dependencias
npm install
```

### Compilación

```bash
# Compilación para producción
npm run build

# Compilación para desarrollo con watch
npm run dev
```

## Funcionalidades

- Carrito lateral que se abre automáticamente al añadir productos
- Actualización de cantidades mediante AJAX
- Productos relacionados con navegación por pestañas
- Sliders con scroll snap para productos relacionados
- Preloaders durante las operaciones AJAX

## Notas de Implementación

- El código ha sido reorganizado para utilizar un sistema modular con Webpack
- Todos los módulos se importan en el archivo principal `src/index.js`
- Se mantiene compatibilidad con el código existente mediante el objeto global `window.snap_sidebar_cart`
- Las funciones principales están disponibles tanto como módulos ES6 como métodos del objeto global