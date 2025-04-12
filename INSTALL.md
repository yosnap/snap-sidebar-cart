# Instrucciones de Instalación y Uso

## Instalación

### Método 1: Instalación desde el repositorio

1. Clona este repositorio en la carpeta `/wp-content/plugins/` de tu instalación de WordPress:
   ```
   git clone https://github.com/yosnap/snap-sidebar-cart.git
   ```

2. Activa el plugin a través del menú 'Plugins' en WordPress.

3. Configura el carrito en WooCommerce > Carrito Lateral.

### Método 2: Instalación manual

1. Descarga el archivo ZIP del repositorio.

2. Ve a la sección de Plugins > Añadir nuevo > Subir plugin en tu panel de administración de WordPress.

3. Selecciona el archivo ZIP descargado y haz clic en "Instalar ahora".

4. Activa el plugin y confíguralo en WooCommerce > Carrito Lateral.

## Requisitos

- WordPress 5.6 o superior
- WooCommerce 5.0 o superior
- PHP 7.3 o superior

## Configuración

### Opciones Básicas

1. **Título del carrito**: Personaliza el texto que aparece en la cabecera del carrito.

2. **Selector del contenedor**: ID del elemento HTML donde se insertará el carrito. Utilízalo si quieres colocar el carrito en un lugar específico de tu sitio.

3. **Selectores de activación**: Lista de selectores CSS (separados por comas) que al hacer clic abrirán el carrito. Por defecto, se usará `.add_to_cart_button`.

### Estilos

1. **Color primario**: Define el color principal del carrito (cabecera, pie, botones).

2. **Color secundario**: Define el color complementario (generalmente para textos).

3. **Ancho del carrito**: Establece el ancho del carrito lateral en píxeles o porcentaje.

### Productos Relacionados

1. **Mostrar productos relacionados**: Activa o desactiva la sección de productos relacionados.

2. **Cantidad de productos relacionados**: Define cuántos productos relacionados mostrar en el slider.

### Información Adicional

1. **Mostrar costo de envío**: Activa o desactiva la información de envío en el pie del carrito.

## Uso de Shortcodes

### Contenedor del Carrito

Puedes insertar el contenedor del carrito en cualquier parte de tu sitio con el shortcode:

```
[sidebar_cart id="mi-carrito" class="mi-clase"]
```

Parámetros:
- `id`: ID personalizado para el contenedor (opcional)
- `class`: Clases CSS adicionales (opcional)

### Botón del Carrito

Puedes insertar un botón para abrir el carrito con el shortcode:

```
[sidebar_cart_button text="Ver carrito" class="mi-boton"]
```

Parámetros:
- `text`: Texto personalizado para el botón (opcional)
- `class`: Clases CSS adicionales (opcional)

## Personalización Avanzada

### Hooks y Filtros

El plugin proporciona varios hooks y filtros para desarrolladores:

```php
// Añadir contenido antes del listado de productos
add_action('snap_sidebar_cart_before_content', 'mi_funcion_personalizada');
function mi_funcion_personalizada() {
    echo '<div class="mi-banner">Oferta especial!</div>';
}

// Modificar el precio mostrado
add_filter('snap_sidebar_cart_product_price_html', 'modificar_precio', 10, 2);
function modificar_precio($price_html, $product) {
    // Modificar el precio
    return $price_html . ' <small>+impuestos</small>';
}

// Añadir estilos personalizados
add_filter('snap_sidebar_cart_custom_css', 'mis_estilos_personalizados');
function mis_estilos_personalizados($css) {
    $css .= '.snap-sidebar-cart-header { font-family: "Montserrat", sans-serif; }';
    return $css;
}
```

## Solución de Problemas

### El carrito no se abre al hacer clic en "Añadir al carrito"

1. Verifica que el selector de activación (`.add_to_cart_button`) coincida con el selector de tu botón de "Añadir al carrito".
2. Comprueba que no haya conflictos con otros plugins que modifiquen el comportamiento del carrito.

### Los estilos no se aplican correctamente

1. Verifica que no haya conflictos de CSS con tu tema.
2. Comprueba la consola del navegador para ver si hay errores JavaScript.

### Los productos relacionados no se muestran

1. Verifica que la opción "Mostrar productos relacionados" esté activada.
2. Comprueba que tus productos tengan productos relacionados configurados en WooCommerce.

## Soporte

Si necesitas ayuda con el plugin, puedes:

1. Abrir un issue en el [repositorio de GitHub](https://github.com/yosnap/snap-sidebar-cart/issues).
2. Contactar al desarrollador a través de la página de soporte del plugin.

## Colaboración

Las contribuciones son bienvenidas. Si deseas mejorar el plugin, sigue estos pasos:

1. Haz fork del repositorio
2. Crea una rama para tu funcionalidad (`git checkout -b feature/nueva-funcionalidad`)
3. Haz commit de tus cambios (`git commit -am 'Añadir nueva funcionalidad'`)
4. Haz push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crea un Pull Request
