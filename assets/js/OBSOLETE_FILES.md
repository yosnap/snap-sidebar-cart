# Archivos JavaScript Obsoletos

## Archivos Activos (Necesarios)
Los siguientes archivos son los únicos necesarios para el funcionamiento del plugin:

- **snap-sidebar-cart-public.js**: Script principal del plugin
- **snap-sidebar-cart-core.js**: Funcionalidad principal del carrito lateral
- **snap-sidebar-cart-ajax.js**: Controlador de peticiones AJAX
- **quantity-handler-unified.js**: Manejador unificado de cantidades

## Archivos Obsoletos (No Utilizados)
Los siguientes archivos son obsoletos y se mantienen solo como referencia. No se cargan en el frontend:

- ajax-update-handler.js (reemplazado por snap-sidebar-cart-ajax.js)
- buttons-direct-fix.js
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
- quantity-preloader.js
- remove-button-fix-enhanced.js
- remove-button-fix-simple.js
- remove-button-fix.js
- simple-preloader.js
- slider-nav-fix.js
- snap-sidebar-cart-combined.js
- snap-sidebar-cart-debug.js
- snap-sidebar-cart-main.js
- stock-and-remove-handler.js
- swiper-init.js
- tabs-fix.js
- tabs-loader.js

## Plan de Limpieza
En futuras actualizaciones, se planea eliminar completamente los archivos obsoletos para reducir el tamaño del plugin y mejorar el rendimiento.

## Notas para Desarrolladores
- Se recomienda no modificar directamente los archivos obsoletos.
- Para realizar cambios en la funcionalidad, modificar únicamente los archivos activos.
- Si se necesita añadir nueva funcionalidad, crear nuevos archivos con nombres descriptivos.