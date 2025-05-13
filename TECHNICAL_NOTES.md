# Notas Técnicas - Snap Sidebar Cart

## Personalización del Icono de Eliminación Rápida

### Versión 1.2.6 (2025-05-13)

#### Implementación de la Personalización del Icono

Se ha implementado una funcionalidad completa para personalizar el icono de eliminación rápida en el carrito lateral. Los cambios principales incluyen:

1. **Opciones de Personalización**:
   - Selección del tipo de icono (papelera, X, menos)
   - Configuración del tamaño del icono
   - Personalización del color del icono
   - Personalización del color al pasar el ratón sobre el icono

2. **Archivos Modificados**:
   - `admin/partials/general-settings.php`: Añadidas opciones de configuración en la interfaz de administración
   - `admin/js/snap-sidebar-cart-admin.js`: Implementada funcionalidad para mostrar/ocultar opciones según el estado del checkbox
   - `includes/class-snap-sidebar-cart-admin.php`: Actualizada función `validate_options()` para manejar las nuevas opciones
   - `includes/class-snap-sidebar-cart-public.php`: Añadida generación de estilos CSS dinámicos para el icono
   - `public/partials/snap-sidebar-cart-product.php`: Implementada lógica para mostrar el tipo de icono seleccionado
   - `admin/partials/snap-sidebar-cart-admin-display.php`: Mejorada persistencia de opciones entre pestañas

3. **Estructura del Selector de Iconos**:
   ```php
   <select id="snap_cart_delete_icon_type" name="snap_sidebar_cart_options[delete_icon_type]">
       <option value="trash">Papelera</option>
       <option value="times">X (Cruz)</option>
       <option value="minus">Menos (-)</option>
   </select>
   ```

4. **Renderizado Condicional del Icono**:
   ```php
   <?php if ($icon_type === 'trash') : ?>
       <!-- SVG del icono de papelera -->
   <?php elseif ($icon_type === 'times') : ?>
       <!-- SVG del icono de X -->
   <?php elseif ($icon_type === 'minus') : ?>
       <!-- SVG del icono de menos -->
   <?php endif; ?>
   ```

5. **Aplicación de Estilos Dinámicos**:
   ```php
   echo "<style>
       .snap-sidebar-cart__product-remove-top svg {
           width: {$delete_icon_size};
           height: {$delete_icon_size};
           stroke: {$delete_icon_color};
           transition: stroke 0.3s ease;
       }
       .snap-sidebar-cart__product-remove-top:hover svg {
           stroke: {$delete_icon_hover_color};
       }
   </style>";
   ```

## Corrección de Persistencia de Checkboxes

### Versión 1.2.6 (2025-05-13)

#### Solución al Problema de Persistencia

Se ha corregido un problema que impedía que los checkboxes mantuvieran su estado al cambiar entre pestañas en la configuración del plugin. Los cambios incluyen:

1. **Identificación del Problema**:
   - Discrepancia entre el nombre del grupo de opciones utilizado en diferentes partes del código
   - Falta de campos ocultos para preservar el estado de los checkboxes entre pestañas

2. **Solución Implementada**:
   - Unificación del nombre del grupo de opciones a `snap_sidebar_cart_options`
   - Implementación de campos ocultos para preservar el estado de los checkboxes cuando se cambia de pestaña
   - Mejora del sistema de validación de opciones para manejar correctamente los checkboxes desmarcados

3. **Archivos Modificados**:
   - `admin/partials/snap-sidebar-cart-admin-display.php`: Corregido nombre del grupo de opciones y añadidos campos ocultos
   - `includes/class-snap-sidebar-cart-admin.php`: Actualizada función `register_settings()` para usar el nombre correcto del grupo de opciones

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
