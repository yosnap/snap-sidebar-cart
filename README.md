# Snap Sidebar Cart for WooCommerce

Un carrito lateral para WooCommerce que se muestra cuando los usuarios agregan productos al carrito o cuando se hace clic en selectores específicos.

## Características principales

- **Carrito lateral automático**: Se muestra al agregar productos o al hacer clic en los selectores configurados.
- **Productos relacionados**: Muestra productos relacionados en un slider configurable.
- **Personalización completa**: Opciones para configurar estilos del carrito, productos y botones.
- **Animaciones suaves**: Efectos visuales al agregar o eliminar productos.
- **Eliminación inteligente**: Los productos se eliminan cuando la cantidad llega a 0.
- **Información de precio**: Muestra precio de envío y subtotal con IVA incluido.
- **Título dinámico**: Muestra "Carrito de compra ([número-de-items])"
- **Preloaders visuales**: Indicadores durante operaciones AJAX.
- **Imágenes en hover**: Al pasar el cursor sobre productos relacionados, muestra una imagen de la galería.

## Requisitos

- WordPress 5.0 o superior
- WooCommerce 4.0 o superior
- PHP 7.3 o superior

## Instalación

1. Sube la carpeta `snap-sidebar-cart` al directorio `/wp-content/plugins/`
2. Activa el plugin a través del menú 'Plugins' en WordPress
3. Configura las opciones del plugin en Ajustes > Snap Sidebar Cart

## Configuración

### Pestaña General

- **Título del carrito**: Personaliza el título que aparece en el encabezado del carrito.
- **Selector del contenedor**: ID del contenedor donde se mostrará el carrito.
- **Selectores de activación**: Selectores CSS que al hacer clic activarán la apertura del carrito.
- **Mostrar costo de envío**: Opción para mostrar u ocultar el costo de envío en el carrito.

### Pestaña Estilos

Personaliza la apariencia del carrito con opciones para:
- Ancho del sidebar
- Color de fondo
- Color de fondo del encabezado
- Color de texto
- Color de botones
- Y más...

### Pestaña Productos Relacionados

- **Mostrar productos relacionados**: Activa o desactiva esta función.
- **Número de productos**: Cuántos productos relacionados mostrar.
- **Columnas**: Define el número de columnas para el slider.
- **Ordenar por**: Criterio para ordenar los productos (precio, fecha, popularidad, aleatorio).

### Pestaña Shortcodes

Información sobre los shortcodes disponibles:
- `[snap_sidebar_cart_button]`: Muestra un botón para abrir el carrito.
- `[snap_sidebar_cart_count]`: Muestra el número de productos en el carrito.

## Registro de cambios

### 1.0.0
- Versión inicial

## Resolución de problemas

Si el carrito no se muestra al hacer clic en los selectores configurados:

1. Verifica que los selectores CSS son correctos y existen en tu tema.
2. Comprueba si hay conflictos con otros plugins de JavaScript.
3. Asegúrate de que WooCommerce está configurado correctamente.
4. Revisa la consola del navegador para ver si hay errores de JavaScript.

## Desarrollo

### Estructura de archivos

- `snap-sidebar-cart.php`: Archivo principal del plugin
- `includes/`: Contiene las clases principales
  - `class-snap-sidebar-cart.php`: Clase principal
  - `class-snap-sidebar-cart-admin.php`: Funcionalidad de administración
  - `class-snap-sidebar-cart-public.php`: Funcionalidad pública
  - `class-snap-sidebar-cart-ajax.php`: Manejo de peticiones AJAX
- `admin/`: Archivos para el área de administración
- `public/`: Archivos para el área pública
- `assets/`: CSS, JavaScript e imágenes

### Hooks y filtros disponibles

El plugin proporciona varios hooks para extender su funcionalidad:

- `snap_sidebar_cart_before_product`: Se ejecuta antes de mostrar cada producto
- `snap_sidebar_cart_after_product`: Se ejecuta después de mostrar cada producto
- `snap_sidebar_cart_before_footer`: Se ejecuta antes del pie del carrito
- `snap_sidebar_cart_after_footer`: Se ejecuta después del pie del carrito
- `snap_sidebar_cart_related_products_args`: Permite modificar los argumentos para obtener productos relacionados
