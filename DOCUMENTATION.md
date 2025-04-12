# Documentación para Desarrolladores - Snap Sidebar Cart

Esta documentación técnica está destinada a desarrolladores que deseen extender, personalizar o integrar el plugin Snap Sidebar Cart con otros componentes de WordPress o WooCommerce.

## Estructura del Plugin

```
snap-sidebar-cart/
├── admin/                 # Archivos para el área de administración
│   ├── css/               # Estilos CSS para la administración
│   │   └── snap-sidebar-cart-admin.css
│   ├── js/                # Scripts JS para la administración
│   │   └── snap-sidebar-cart-admin.js
│   └── partials/          # Plantillas para vistas de administración
│       └── snap-sidebar-cart-admin-display.php
├── assets/                # Recursos principales
│   ├── css/               # Estilos CSS para el frontend
│   │   └── snap-sidebar-cart-public.css
│   └── js/                # Scripts JS para el frontend
│       └── snap-sidebar-cart-public.js
├── includes/              # Clases principales del plugin
│   ├── class-snap-sidebar-cart.php             # Clase principal
│   ├── class-snap-sidebar-cart-admin.php       # Clase para administración
│   ├── class-snap-sidebar-cart-public.php      # Clase para frontend
│   └── class-snap-sidebar-cart-ajax.php        # Manejador de peticiones AJAX
├── languages/             # Archivos de traducción
├── public/                # Archivos públicos para el frontend
│   └── partials/          # Plantillas para vistas del frontend
│       ├── snap-sidebar-cart-public-display.php    # Plantilla principal del carrito
│       ├── snap-sidebar-cart-product.php           # Plantilla para productos en el carrito
│       └── snap-sidebar-cart-related-product.php   # Plantilla para productos relacionados
├── README.md              # Documentación principal
├── CHANGELOG.md           # Registro de cambios
├── INSTALL.md             # Guía de instalación
├── DOCUMENTATION.md       # Este archivo
└── snap-sidebar-cart.php  # Archivo principal del plugin
```

## Flujo de Funcionamiento

1. **Inicialización**
   - `snap-sidebar-cart.php` carga las dependencias principales
   - Se verifica la presencia de WooCommerce
   - Se instancia la clase principal `Snap_Sidebar_Cart`

2. **Carga de Opciones**
   - Se cargan las opciones guardadas o se aplican valores por defecto
   - Las opciones se pasan a los componentes de administración y frontend

3. **Renderizado del Carrito**
   - El carrito se renderiza en el footer mediante `wp_footer`
   - Está inicialmente oculto y se muestra con JavaScript

4. **Interacción del Usuario**
   - Al añadir productos o hacer clic en activadores, el carrito se abre
   - Las actualizaciones de cantidad y eliminación se manejan vía AJAX
   - Los productos relacionados se cargan dinámicamente

## Clases Principales

### `Snap_Sidebar_Cart`
Clase principal que inicializa el plugin y gestiona sus componentes.

**Métodos importantes:**
- `__construct()`: Inicializa el plugin
- `load_dependencies()`: Carga las clases necesarias
- `load_options()`: Carga las opciones del plugin
- `run()`: Ejecuta el plugin
- `get_options()`: Devuelve las opciones configuradas

### `Snap_Sidebar_Cart_Public`
Gestiona la funcionalidad del frontend.

**Métodos importantes:**
- `enqueue_styles()`: Registra los estilos CSS
- `enqueue_scripts()`: Registra los scripts JS
- `render_sidebar_cart()`: Renderiza el carrito en el frontend
- `generate_custom_css()`: Genera CSS personalizado basado en las opciones

### `Snap_Sidebar_Cart_Ajax`
Maneja todas las peticiones AJAX.

**Métodos importantes:**
- `add_to_cart()`: Añade productos al carrito
- `remove_from_cart()`: Elimina productos del carrito
- `update_cart()`: Actualiza cantidades en el carrito
- `get_related_products()`: Obtiene productos relacionados

### `Snap_Sidebar_Cart_Admin`
Gestiona la interfaz y funcionalidad del área de administración.

**Métodos importantes:**
- `add_plugin_admin_menu()`: Añade el menú de administración
- `register_settings()`: Registra las opciones del plugin
- `validate_options()`: Valida las opciones antes de guardarlas

## Hooks disponibles

### Filtros

#### `snap_sidebar_cart_default_options`
Permite modificar las opciones por defecto del plugin.

```php
add_filter('snap_sidebar_cart_default_options', 'my_custom_default_options');

function my_custom_default_options($defaults) {
    $defaults['styles']['sidebar_width'] = '450px';
    $defaults['auto_open'] = false;
    return $defaults;
}
```

#### `snap_sidebar_cart_related_products`
Permite modificar los productos relacionados antes de mostrarlos.

```php
add_filter('snap_sidebar_cart_related_products', 'my_custom_related_products', 10, 2);

function my_custom_related_products($related_products, $product_id) {
    // Personalizar la lógica de productos relacionados
    return $related_products;
}
```

#### `snap_sidebar_cart_product_html`
Permite modificar el HTML de cada producto en el carrito.

```php
add_filter('snap_sidebar_cart_product_html', 'my_custom_product_html', 10, 2);

function my_custom_product_html($html, $cart_item) {
    // Modificar el HTML del producto
    return $html;
}
```

### Acciones

#### `snap_sidebar_cart_before_product_list`
Se ejecuta antes de mostrar la lista de productos en el carrito.

```php
add_action('snap_sidebar_cart_before_product_list', 'my_custom_before_products');

function my_custom_before_products() {
    echo '<div class="my-custom-notice">¡Oferta especial!</div>';
}
```

#### `snap_sidebar_cart_after_product_list`
Se ejecuta después de mostrar la lista de productos en el carrito.

```php
add_action('snap_sidebar_cart_after_product_list', 'my_custom_after_products');

function my_custom_after_products() {
    echo '<div class="my-custom-notice">¡Envío gratis en pedidos superiores a 50€!</div>';
}
```

#### `snap_sidebar_cart_before_footer`
Se ejecuta antes del footer del carrito.

```php
add_action('snap_sidebar_cart_before_footer', 'my_custom_before_footer');

function my_custom_before_footer() {
    echo '<div class="my-custom-coupon-form">Código promocional: <input type="text"></div>';
}
```

## Sobreescribir Plantillas

Puedes sobreescribir las plantillas del plugin en tu tema. Para ello:

1. Crea una carpeta `snap-sidebar-cart` en tu tema.
2. Copia los archivos de `public/partials/` que quieras modificar a esta carpeta.
3. Realiza tus modificaciones. El plugin buscará primero en tu tema antes de usar sus plantillas por defecto.

Estructura recomendada en tu tema:

```
tu-tema/
└── snap-sidebar-cart/
    ├── snap-sidebar-cart-public-display.php
    ├── snap-sidebar-cart-product.php
    └── snap-sidebar-cart-related-product.php
```

## Integración con tema personalizado

### 1. Modificar los selectores de activación

En la configuración del plugin, ajusta los "Selectores de activación" para que coincidan con los botones o iconos de tu tema. Ejemplos comunes:

- `.cart-icon`
- `#mini-cart-trigger`
- `.header-cart-icon`

### 2. Ajustar estilos mediante CSS personalizado

Si necesitas personalizaciones más allá de las opciones disponibles, puedes añadir CSS personalizado a tu tema:

```css
/* Personalizar aspecto del carrito */
.snap-sidebar-cart__header {
    border-bottom: 2px solid #yourcolor !important;
}

/* Personalizar botones */
.snap-sidebar-cart__button--checkout {
    border-radius: 0 !important;
}
```

### 3. Integración con JavaScript personalizado

Puedes interactuar con el carrito lateral desde tu propio JavaScript:

```javascript
// Abrir el carrito programáticamente
jQuery(document).on('click', '.my-custom-trigger', function() {
    jQuery('.snap-sidebar-cart').addClass('open');
    jQuery('.snap-sidebar-cart__overlay').css('display', 'block');
    jQuery('body').addClass('snap-sidebar-cart-open');
});

// Detectar cuando el carrito se ha actualizado
jQuery(document).on('snap_sidebar_cart_updated', function() {
    console.log('El carrito ha sido actualizado');
    // Tu código aquí
});
```

## Consideraciones de Rendimiento

- Los estilos y scripts se cargan únicamente en páginas relacionadas con WooCommerce
- Utiliza cache de transients para productos relacionados
- Minimiza las solicitudes AJAX combinando operaciones cuando sea posible

## Depuración

Para activar el modo de depuración, añade esta línea a tu archivo `wp-config.php`:

```php
define('SNAP_SIDEBAR_CART_DEBUG', true);
```

Esto habilitará mensajes detallados en la consola y registrará operaciones AJAX para facilitar la depuración.

## Compatibilidad

### Temas probados
- Storefront
- Astra
- OceanWP
- Flatsome
- GeneratePress

### Plugins compatibles
- WooCommerce (4.0+)
- WPML
- Polylang
- Elementor
- WP Rocket

## Preguntas Frecuentes para Desarrolladores

### ¿Cómo puedo modificar el comportamiento de apertura del carrito?
Utiliza el filtro `snap_sidebar_cart_should_open` para personalizar la lógica:

```php
add_filter('snap_sidebar_cart_should_open', 'my_custom_open_logic', 10, 2);

function my_custom_open_logic($should_open, $added_product_id) {
    // Personalizar lógica basada en el ID del producto o condiciones personalizadas
    return $should_open;
}
```

### ¿Cómo puedo añadir campos personalizados a cada producto en el carrito?
Modifica la plantilla `snap-sidebar-cart-product.php` en tu tema o usa el filtro `snap_sidebar_cart_product_html`.

### ¿Cómo puedo cambiar el algoritmo de productos relacionados?
Utiliza el filtro `snap_sidebar_cart_related_products` para implementar tu propia lógica de selección.

## Soporte y Contribuciones

Para reportar errores, sugerir características o contribuir con código, visita el [repositorio en GitHub](https://github.com/username/snap-sidebar-cart/).

Este plugin sigue los estándares de codificación de WordPress y está desarrollado con un enfoque orientado a objetos para facilitar el mantenimiento y extensiones.
