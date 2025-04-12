# Snap Sidebar Cart para WooCommerce

Un plugin de WordPress que añade un carrito lateral (sidebar) interactivo y personalizable para WooCommerce, con productos relacionados y animaciones.

## Características principales

- **Carrito lateral interactivo**: Se muestra cuando los usuarios agregan productos al carrito o hacen clic en selectores específicos.
- **Múltiples tipos de productos relacionados**:
  - Productos relacionados definidos por el usuario
  - Productos de la misma categoría
  - Productos más vendidos
  - Accesorios
- **Animaciones suaves**: Efectos de fade-in cuando se agregan productos y preloader durante las actualizaciones.
- **Personalización completa**: Configuración de colores, anchos, y estilos desde el panel de administración.
- **Experiencia mejorada**: Los productos se eliminan automáticamente cuando la cantidad llega a 0.
- **Efecto hover en productos relacionados**: Muestra imágenes alternativas de la galería al pasar el cursor.
- **Información detallada**: Muestra el precio del envío y el subtotal con IVA incluido.
- **Sistema de pestañas**: Permite navegar entre diferentes tipos de productos recomendados.
- **Diseño moderno**: Interfaz limpia y atractiva basada en tendencias actuales de diseño web.

## Instalación

1. Descarga el plugin y descomprímelo.
2. Sube la carpeta `snap-sidebar-cart` a la carpeta `/wp-content/plugins/` de tu sitio WordPress.
3. Activa el plugin a través del menú 'Plugins' en WordPress.
4. Configura las opciones del plugin en Ajustes > Carrito Lateral.

## Requisitos

- WordPress 5.0 o superior
- WooCommerce 4.0 o superior
- PHP 7.3 o superior

## Configuración

### Opciones generales

- **Título del carrito**: Personaliza el título que se muestra en la parte superior del carrito lateral.
- **Selectores de activación**: Define qué elementos HTML, al hacer clic, activarán la apertura del carrito lateral.
- **Apertura automática**: Configura si el carrito debe abrirse automáticamente cuando se añade un producto.

### Personalización de estilos

- **Ancho del carrito**: Define el ancho del carrito lateral.
- **Colores**: Personaliza los colores de fondo, textos, encabezados y botones.

### Productos relacionados

- **Mostrar productos relacionados**: Activa o desactiva la sección de productos relacionados.
- **Número de productos**: Define cuántos productos relacionados se mostrarán.
- **Columnas**: Configura el número de columnas para mostrar los productos relacionados.
- **Orden**: Selecciona cómo ordenar los productos relacionados (aleatorio, fecha, precio, popularidad, valoración).

## Sistema de productos relacionados

El plugin ofrece un avanzado sistema de productos relacionados con 4 tipos diferentes:

1. **Productos relacionados**: Muestra productos definidos manualmente como relacionados o upsells, o calcula automáticamente productos similares basados en categorías y etiquetas.

2. **Misma categoría**: Muestra productos que pertenecen a la misma categoría que el producto añadido al carrito.

3. **Más vendidos**: Muestra los productos más populares de la tienda basados en el número de ventas.

4. **Accesorios**: Muestra productos marcados como accesorios o complementos, ideales para aumentar el valor medio del pedido.

Estos productos se cargan dinámicamente mediante AJAX y se muestran en un slider navegable, con un elegante efecto hover que muestra imágenes alternativas del producto.

## Desarrollo y personalización

### Estructura de archivos

```
snap-sidebar-cart/
├── admin/                 # Archivos para el área de administración
│   ├── css/               # Estilos CSS para la administración
│   ├── js/                # Scripts JS para la administración
│   └── partials/          # Plantillas para vistas de administración
├── assets/                # Recursos principales
│   ├── css/               # Estilos CSS para el frontend
│   └── js/                # Scripts JS para el frontend
├── includes/              # Clases principales del plugin
├── languages/             # Archivos de traducción
├── public/                # Archivos públicos para el frontend
│   └── partials/          # Plantillas para vistas del frontend
├── README.md              # Documentación principal
├── CHANGELOG.md           # Registro de cambios
└── snap-sidebar-cart.php  # Archivo principal del plugin
```

### Filtros y acciones

Para desarrolladores que quieran extender la funcionalidad, el plugin ofrece varios hooks:

```php
// Modificar opciones por defecto
add_filter('snap_sidebar_cart_default_options', 'my_custom_default_options');

// Añadir contenido personalizado al carrito
add_action('snap_sidebar_cart_before_footer', 'my_custom_cart_content');

// Modificar productos relacionados
add_filter('snap_sidebar_cart_related_products', 'my_custom_related_products', 10, 2);

// Personalizar tipos de productos relacionados
add_filter('snap_sidebar_cart_related_types', 'my_custom_related_types');
```

### Plantillas personalizadas

Puedes sobreescribir las plantillas del plugin copiándolas a tu tema:

1. Crea una carpeta `snap-sidebar-cart` en tu tema
2. Copia los archivos de `public/partials/` que quieras modificar a esta carpeta
3. Personaliza los archivos según tus necesidades

## Compatibilidad

- Probado con los principales temas de WooCommerce
- Compatible con plugins de optimización de caché
- Diseño responsive que se adapta a dispositivos móviles

## Soporte

Para soporte, preguntas o sugerencias, por favor contacta a través de:

- GitHub: [Reportar un problema](https://github.com/username/snap-sidebar-cart/issues)
- Email: soporte@ejemplo.com

## Licencia

Este plugin está licenciado bajo GPL v2 o posterior.

## Créditos

Desarrollado por Paulo para Brass Market.
