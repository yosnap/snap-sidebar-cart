# Notas Técnicas - Snap Sidebar Cart

## Sistema de Preloader

### Versión 1.2.5 (2025-05-12)

#### Implementación del Preloader Configurable

El sistema de preloader ha sido completamente rediseñado para utilizar siempre la configuración establecida en el panel de administración. Los cambios principales incluyen:

1. **Unificación del Preloader**:
   - Eliminadas todas las referencias hardcodeadas al preloader de tipo círculo
   - Implementada lectura consistente de la configuración desde `snap_sidebar_cart_params.preloader`
   - Aplicación de estilos inline según la configuración (color, tamaño, tipo)

2. **Archivos Modificados**:
   - `snap-sidebar-cart-public.js` (múltiples instancias)
   - `cart-ajax-handler.js`
   - `immediate-fix.js`
   - `tabs-fix.js`
   - `legacy-files/swiper-init.js`
   - `auto-open-fix.js`
   - `snap-sidebar-cart-combined.js`
   - `scroll-snap-init.js`

3. **Estructura del Preloader**:
   ```javascript
   // Obtener configuración del preloader
   var preloaderType = snap_sidebar_cart_params.preloader.type || 'circle';
   var preloaderPosition = snap_sidebar_cart_params.preloader.position || 'center';
   var preloaderColor = snap_sidebar_cart_params.preloader.color || '#3498db';
   var preloaderColor2 = snap_sidebar_cart_params.preloader.color2 || '#e74c3c';
   var preloaderSize = snap_sidebar_cart_params.preloader.size || '40px';
   
   // Crear clases y estilos
   var preloaderClasses = 'snap-sidebar-cart__loader-spinner ' + 
                         'preloader-' + preloaderType + ' ' +
                         'preloader-position-' + preloaderPosition;
   
   // Aplicar estilos según el tipo
   if (preloaderType === 'circle') {
       // Estilos para círculo
   } else if (preloaderType === 'dots') {
       // Estilos para puntos
   }
   ```

4. **Tipos de Preloader Soportados**:
   - `circle`: Preloader circular con animación de rotación
   - `dots`: Preloader de tres puntos con animación de rebote

## Personalización del Icono de Eliminación Rápida

### Versión 1.2.5 (2025-05-12)

Se ha implementado un sistema completo de personalización para el icono de eliminación rápida de productos en el carrito:

1. **Opciones de Personalización**:
   - **Tipo de Icono**: Papelera, X, Menos
   - **Color**: Selector de color personalizado
   - **Tamaño**: Pequeño, Mediano, Grande
   - **Posición**: Superior derecha, Superior izquierda, Inferior derecha, Inferior izquierda

2. **Implementación**:
   - Nuevos campos en el panel de administración
   - Aplicación de clases CSS dinámicas según la configuración
   - Estilos inline para color y tamaño

3. **Archivos Modificados**:
   - `class-snap-sidebar-cart-admin.php`
   - `snap-sidebar-cart-admin-display.php`
   - `snap-sidebar-cart-product.php`
   - `snap-sidebar-cart-public.css`
