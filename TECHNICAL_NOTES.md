# Notas Técnicas - Snap Sidebar Cart

## Sincronización Automática entre Página del Carrito y Sidebar

### Versión 1.2.8 (2025-05-13)

#### Implementación de Sincronización del Carrito

Se ha implementado una funcionalidad para mantener sincronizado el sidebar del carrito con los cambios realizados en la página del carrito de WooCommerce. Los cambios principales incluyen:

1. **Detección de Eventos**:
   - Escucha de eventos de WooCommerce como `updated_cart_totals`, `wc_fragments_refreshed` y `removed_from_cart`
   - Detección automática de cambios en el carrito sin necesidad de recargar la página

2. **Endpoint AJAX Específico**:
   - Creación de un nuevo endpoint AJAX `snap_sidebar_cart_get_cart` para obtener el contenido actualizado del carrito
   - Implementación del método `get_sidebar_cart()` en la clase AJAX para manejar la solicitud

3. **Actualización en Tiempo Real**:
   - Actualización del contenido del sidebar cuando se detectan cambios en la página del carrito
   - Actualización de contadores, subtotales y productos relacionados

4. **Archivos Modificados**:
   - `includes/class-snap-sidebar-cart-ajax.php`: Añadido nuevo método para manejar la sincronización
   - `includes/class-snap-sidebar-cart.php`: Registrados nuevos endpoints AJAX
   - `includes/class-snap-sidebar-cart-public.php`: Cargado nuevo script de sincronización
   - `assets/js/cart-page-sync.js`: Nuevo archivo para manejar la sincronización

5. **Mejora de Experiencia de Usuario**:
   - Mayor coherencia entre diferentes vistas del carrito
   - Eliminación de la necesidad de recargar la página para ver los cambios
   - Feedback visual inmediato de las acciones realizadas en la página del carrito

## Múltiples Queries Personalizadas para Productos Relacionados

### Versión 1.2.7 (2025-05-13)

#### Implementación de Múltiples Queries Personalizadas

Se ha implementado la funcionalidad para permitir a los usuarios añadir múltiples queries personalizadas en la pestaña "Productos relacionados". Los cambios principales incluyen:

1. **Estructura de Datos**:
   - Migración de la estructura de datos de una única query personalizada (`custom_query`) a un array de queries personalizadas (`custom_queries`)
   - Cada query personalizada incluye un nombre (etiqueta de pestaña) y código PHP
   - Compatibilidad con versiones anteriores para mantener la funcionalidad con configuraciones existentes
   - Mantenimiento de todas las pestañas estándar (Más vendidos, Destacados, etc.)

2. **Interfaz de Administración**:
   - Implementación de una interfaz dinámica para añadir/eliminar queries personalizadas
   - Cada query personalizada tiene su propia etiqueta y código PHP integrado (sin campos separados)
   - Eliminación del campo redundante de etiqueta de pestaña personalizada
   - Restauración de todos los checkboxes para pestañas estándar
   - Botones para añadir nuevas queries o eliminar las existentes
   - Estilos CSS para mejorar la usabilidad de la interfaz

3. **Lógica de Frontend**:
   - Generación dinámica de pestañas basadas en las queries personalizadas configuradas
   - Identificación de cada query personalizada con un ID único (`custom_X`)
   - Manejo de la selección de pestañas y carga de productos según la query seleccionada
   - Verificación de código válido antes de mostrar una pestaña personalizada

4. **Archivos Modificados**:
   - `includes/class-snap-sidebar-cart-admin.php`: Actualizada la interfaz de administración y la validación de opciones
   - `includes/class-snap-sidebar-cart-ajax.php`: Modificada la lógica de recuperación de productos para usar múltiples queries
   - `public/partials/snap-sidebar-cart-public-display.php`: Actualizada la generación de pestañas en el frontend
   - `admin/js/snap-sidebar-cart-admin.js`: Añadida lógica para manejar la adición/eliminación de queries
   - `admin/css/snap-sidebar-cart-admin.css`: Añadidos estilos para la interfaz de queries personalizadas

5. **Ejemplo de Uso**:
   - Los usuarios pueden crear diferentes queries personalizadas, por ejemplo:
     - "Precios similares" para mostrar productos con precios cercanos al actual
     - "Misma marca" para mostrar productos de la misma marca
     - "Accesorios compatibles" para mostrar accesorios que funcionan con el producto actualueries personalizadas como "Precios similares", "Misma marca", etc.
   - Cada query aparecerá como una pestaña separada en el carrito lateral
   - El código PHP de cada query puede acceder a variables como `$current_product`, `$product_id`, etc.

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
