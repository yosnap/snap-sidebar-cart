# Migración a Webpack - Snap Sidebar Cart

Este documento describe el proceso de migración del plugin Snap Sidebar Cart a una estructura basada en Webpack.

## Estado actual

El plugin ha sido migrado a una estructura modular con Webpack, pero mantiene compatibilidad con la versión anterior para garantizar un funcionamiento sin interrupciones.

### Estructura de archivos

```
snap-sidebar-cart/
├── assets/
│   ├── css/
│   ├── js/
│   │   ├── dist/           # Archivos compilados por Webpack (NUEVOS)
│   │   ├── legacy/         # Archivos JavaScript obsoletos (MANTENER POR COMPATIBILIDAD)
│   │   └── ...             # Archivos JavaScript actuales (MANTENER POR COMPATIBILIDAD)
├── includes/               # Clases PHP del plugin
├── src/                    # Código fuente para Webpack (NUEVO)
│   ├── modules/            # Módulos JavaScript
│   ├── admin.js            # Punto de entrada para el admin
│   └── index.js            # Punto de entrada principal
├── package.json            # Dependencias npm (NUEVO)
├── webpack.config.js       # Configuración de Webpack (NUEVO)
└── ...
```

## Archivos que se pueden eliminar en el futuro

Una vez que estemos seguros de que todo funciona correctamente con la versión compilada por Webpack, se podrán eliminar los siguientes archivos:

1. **Archivos JavaScript individuales en `assets/js/`:**
   - `ajax-update-handler.js`
   - `cart-controller.js`
   - `immediate-fix.js`
   - `preloader-controller.js`
   - `quantity-handler-unified.js`
   - `scroll-snap.js`
   - `simple-preloader.js`
   - `snap-sidebar-cart-ajax.js`
   - `snap-sidebar-cart-core.js`
   - `snap-sidebar-cart-public.js`
   - `snap-sidebar-cart-unified.js`
   - `tab-controller.js`

2. **Archivos de documentación redundantes:**
   - `OBSOLETE_FILES.md` (una vez que se haya completado la migración)

## Proceso de migración completo

Para completar la migración a Webpack:

1. Verificar que todo funciona correctamente con la versión compilada por Webpack
2. Actualizar `class-snap-sidebar-cart-public.php` para usar exclusivamente los archivos compilados
3. Eliminar los archivos JavaScript individuales listados anteriormente
4. Actualizar la documentación para reflejar la nueva estructura

## Desarrollo con Webpack

Para desarrollar con Webpack:

```bash
# Instalar dependencias
npm install

# Modo desarrollo con watch (detecta cambios automáticamente)
npm run dev

# Compilación para producción
npm run build
```

Los archivos compilados se generarán en `assets/js/dist/`.