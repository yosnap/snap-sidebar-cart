# Archivos JavaScript de Snap Sidebar Cart

## Archivos Activos (Necesarios)
Los siguientes archivos son los únicos necesarios para el funcionamiento del plugin:

- **snap-sidebar-cart-public.js**: Script principal del plugin (parámetros y configuración)
- **snap-sidebar-cart-unified.js**: Script unificado con toda la funcionalidad

## Archivos Obsoletos (No Utilizados)
Los siguientes archivos son obsoletos y se mantienen solo como referencia. No se cargan en el frontend:

- ajax-update-handler.js
- buttons-direct-fix.js
- cart-controller.js
- close-button-test.js
- close-sidebar-fix.js
- cors-handler.js
- direct-close-fix.js
- direct-fix.js
- direct-remove-button-fix.js
- frontend.js
- immediate-fix.js
- last-unit-handler.js
- preloader-controller.js
- preloader-fix.js
- quantity-handler-unified.js
- quantity-preloader.js
- remove-button-fix-enhanced.js
- remove-button-fix-simple.js
- remove-button-fix.js
- scroll-snap.js
- simple-preloader.js
- slider-nav-fix.js
- snap-sidebar-cart-combined.js
- snap-sidebar-cart-core.js
- snap-sidebar-cart-debug.js
- snap-sidebar-cart-main.js
- stock-and-remove-handler.js
- swiper-init.js
- tab-controller.js
- tabs-fix.js
- tabs-loader.js

## Reorganización del Código

El código JavaScript del plugin ha sido completamente reorganizado para mejorar el rendimiento y la mantenibilidad:

1. **Consolidación de archivos**: Todo el código JavaScript ha sido consolidado en un único archivo `snap-sidebar-cart-unified.js`.

2. **Mejoras en la estructura**: El código está organizado en secciones lógicas (inicialización, carrito, preloader, pestañas, etc.).

3. **Optimización del rendimiento**: Menos solicitudes HTTP al servidor (solo 2 archivos en lugar de 30+).

## Notas para Desarrolladores

- Para realizar cambios en la funcionalidad, modificar únicamente los archivos activos.
- Si se necesita añadir nueva funcionalidad, hacerlo en el archivo `snap-sidebar-cart-unified.js`.
- Los archivos obsoletos se mantienen como referencia, pero no se utilizan en el plugin.

## Plan de Limpieza

En futuras actualizaciones, se recomienda eliminar completamente los archivos obsoletos para reducir el tamaño del plugin y mejorar el rendimiento.