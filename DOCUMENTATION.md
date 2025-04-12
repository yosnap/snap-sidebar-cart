# Snap Sidebar Cart - Documentación Técnica

## Descripción General

Snap Sidebar Cart es un plugin para WooCommerce que proporciona un carrito lateral dinámico y totalmente personalizable. El plugin implementa un carrito flotante que se abre automáticamente cuando los usuarios añaden productos, mostrando productos relacionados y permitiendo al cliente gestionar su compra sin abandonar la página actual.

## Características Principales

1. **Carrito lateral personalizable**
   - Apertura automática al añadir productos
   - Activación mediante selectores CSS personalizables
   - Diseño totalmente personalizable (colores, ancho, etc.)

2. **Gestión dinámica del carrito**
   - Actualización AJAX del contenido
   - Preloader durante las operaciones
   - Animaciones al añadir/eliminar productos
   - Productos que desaparecen cuando la cantidad llega a 0

3. **Productos relacionados**
   - Slider configurable con productos relacionados
   - Efecto hover que muestra imágenes de la galería
   - Añadir productos directamente desde el carrito lateral

4. **Información de costos**
   - Muestra el subtotal con IVA incluido
   - Muestra el costo de envío
   - Actualiza precios en tiempo real

## Estructura Técnica

### Clases Principales

#### `Snap_Sidebar_Cart`
Clase principal que inicializa el plugin y carga las demás clases.

#### `Snap_Sidebar_Cart_Admin`
Gestiona la interfaz administrativa del plugin, incluyendo la página de configuración.

#### `Snap_Sidebar_Cart_Frontend`
Maneja toda la funcionalidad del front-end, incluyendo la visualización del carrito, interacciones AJAX y la gestión de productos relacionados.

### Sistema de Plantillas

El plugin utiliza un sistema de plantillas para separar la lógica de la presentación:

- `sidebar-cart.php`: Estructura principal del carrito lateral
- `cart-content.php`: Contenido del carrito (productos)
- `related-products.php`: Plantilla para el slider de productos relacionados

### JavaScript y Estilos

- `frontend.js`: Maneja todas las interacciones de usuario y peticiones AJAX
- `admin.js`: Controla la funcionalidad del panel de administración
- `frontend.css`: Estilos para el carrito lateral
- `admin.css`: Estilos para el panel de administración

### Slick Slider

Se utiliza la librería Slick Slider (v1.8.1) para implementar el carrusel de productos relacionados.

## Hooks y Filtros

El plugin proporciona varios hooks y filtros para extensibilidad:

### Actions

- `snap_sidebar_cart_before_content`: Ejecutado antes del contenido del carrito
- `snap_sidebar_cart_after_content`: Ejecutado después del contenido del carrito

### Filters

- `snap_sidebar_cart_product_price_html`: Permite modificar el HTML del precio del producto
- `snap_sidebar_cart_custom_css`: Permite añadir o modificar el CSS personalizado

## Shortcodes

- `[sidebar_cart id="mi-carrito" class="mi-clase"]`: Inserta el contenedor del carrito
- `[sidebar_cart_button text="Ver carrito" class="mi-boton"]`: Inserta un botón para abrir el carrito

## Configuración

### Opciones Principales

- **Título del carrito**: Personaliza el texto del título del carrito
- **Selector del contenedor**: ID del contenedor donde se mostrará el carrito
- **Selectores de activación**: Lista de selectores CSS que activan la apertura del carrito
- **Colores**: Personaliza los colores primario y secundario
- **Ancho del carrito**: Define el ancho del carrito lateral (px o %)
- **Productos relacionados**: Activa/desactiva la visualización de productos relacionados
- **Cantidad de productos relacionados**: Define cuántos productos relacionados mostrar
- **Costo de envío**: Muestra/oculta la información de envío

## Proceso de Desarrollo

### Actualizaciones Futuras

1. Soporte para múltiples monedas
2. Opciones avanzadas de estilo
3. Integración con plugins de puntos de fidelidad
4. Opciones de descuento directamente desde el carrito
5. Vista previa en tiempo real de las personalizaciones

## Solución de Problemas

### Conflictos Comunes

- **Conflictos con otros plugins de carrito**: Deshabilitar otros plugins de carrito lateral
- **Problemas con el slider**: Verificar que no hay conflictos con otras librerías jQuery
- **Problemas con AJAX**: Comprobar que el nonce está correctamente configurado

### Optimización de Rendimiento

- Caché de productos relacionados
- Minimización de peticiones AJAX
- Carga diferida de imágenes

## Compatibilidad

- WordPress 5.6+
- WooCommerce 5.0+
- PHP 7.3+
- Navegadores modernos (Chrome, Firefox, Safari, Edge)

## Contribuciones

Las contribuciones son bienvenidas. Por favor, sigue estos pasos:

1. Haz fork del repositorio
2. Crea una rama para tu funcionalidad (`git checkout -b feature/nueva-funcionalidad`)
3. Haz commit de tus cambios (`git commit -am 'Añadir nueva funcionalidad'`)
4. Haz push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crea un Pull Request
