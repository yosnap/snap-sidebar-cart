# Changelog

## 1.2.0 - 2025-05-11
### Cambios Importantes
- **Reemplazo de Swiper.js con CSS Scroll Snap**: Mejora significativa en rendimiento y experiencia de usuario
- **Corrección de apertura del sidebar**: Ahora respeta correctamente la configuración guardada en el backend
- **Mejora en botones de cantidad**: Funcionan correctamente incrementando/decrementando de 1 en 1
- **Actualización de precios con AJAX**: El precio total se actualiza correctamente sin recargar la página

### Mejoras
- Optimización general de rendimiento
- Reducción de dependencias externas
- Transiciones más suaves en la interfaz de usuario
- Mejor compatibilidad con dispositivos móviles

### Correcciones
- Solucionado problema con la apertura automática del sidebar
- Corregida la actualización del precio total al cambiar cantidades
- Solucionado problema con la carga de productos en las pestañas
- Mejorada la navegación entre pestañas

### Archivos Modificados
- `snap-sidebar-cart-public.js`: Actualización de funciones principales
- `scroll-snap-init.js`: Nuevo archivo para inicializar Scroll Snap
- `sidebar-opener-fix.js`: Solución para la apertura del sidebar
- `quantity-buttons-fix.js`: Solución para los botones de cantidad
- `snap-sidebar-cart-public.css`: Actualización de estilos para Scroll Snap

## 1.1.0 - 2025-04-15
### Características
- Implementación inicial de Swiper.js para sliders de productos
- Soporte para pestañas de productos relacionados
- Funcionalidad de apertura automática del sidebar

### Mejoras
- Interfaz de usuario mejorada
- Soporte para dispositivos móviles
- Opciones de configuración en el backend

## 1.0.0 - 2025-03-01
### Lanzamiento inicial
- Funcionalidad básica del sidebar de carrito
- Integración con WooCommerce
- Soporte para productos relacionados
- Opciones de personalización