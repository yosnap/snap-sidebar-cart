# Documentación de Cambios en la Versión 1.1.1

Fecha: 15 de abril de 2025

## Resumen de Cambios

En esta actualización se han corregido dos problemas principales:

1. **Eliminación del efecto blur en los productos del carrito**
2. **Corrección de la configuración del preloader para que se aplique correctamente**

## Detalles de los Cambios

### 1. Eliminación del Efecto Blur

Se identificó que en la visualización de productos del carrito aparecía un efecto blur que dificultaba su correcta visualización. Este problema era causado por la propiedad CSS `backdrop-filter: blur(1px)` que estaba aplicada al contenedor del preloader.

**Archivos modificados:**
- `/assets/css/snap-sidebar-cart-public.css`

**Cambios realizados:**
- Se eliminó la propiedad `backdrop-filter: blur(1px)` del selector `.snap-sidebar-cart__product-loader`

### 2. Corrección de la Configuración del Preloader

Se detectaron inconsistencias en cómo se aplicaban las configuraciones del preloader definidas en el panel de administración. El problema era causado por conflictos de especificidad CSS y múltiples fuentes de estilos que se sobreescribían entre sí.

**Archivos modificados:**
- `/includes/class-snap-sidebar-cart-public.php`
- `/assets/js/preloader-fix.js`
- `/assets/css/snap-sidebar-cart-public.css`

**Cambios realizados:**

1. **En class-snap-sidebar-cart-public.php:**
   - Se mejoró la función `generate_preloader_css()` para generar CSS con mayor especificidad
   - Se añadieron selectores más específicos para evitar conflictos
   - Se utilizaron directivas `!important` en propiedades clave para asegurar que tengan prioridad

2. **En preloader-fix.js:**
   - Se mejoró la función `applyPreloaderStyles()` para aplicar variables CSS con prioridad
   - Se implementó la aplicación directa de estilos a los elementos existentes
   - Se añadió mejor soporte para diferentes tipos de preloader
   - Se agregaron event listeners para asegurar que los estilos se apliquen cuando se actualiza el carrito

3. **CSS general:**
   - Se mejoró la forma en que se aplican los estilos al preloader
   - Se aseguró que el contenedor del preloader siempre sea visible cuando debe mostrarse

## Implicaciones Técnicas

Estos cambios garantizan una mejor experiencia de usuario al:

1. **Mejorar la visibilidad** de los productos en el carrito al eliminar el efecto blur no deseado
2. **Respetar las configuraciones del administrador** para el preloader (tipo, tamaño, color y posición)
3. **Mejorar la compatibilidad** con diferentes navegadores y temas
4. **Optimizar la experiencia** durante las operaciones de carga y actualización del carrito

## Recomendaciones para Futuras Versiones

Para futuras actualizaciones, se recomienda:

1. Implementar un sistema más robusto de gestión de estilos que utilice clases específicas en lugar de depender tanto de sobreescribir propiedades
2. Considerar el uso de una arquitectura CSS más modular (como BEM o CSS Modules) para evitar conflictos de estilos
3. Consolidar las diferentes fuentes de configuración de estilos para reducir duplicación y conflictos
