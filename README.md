# Snap Sidebar Cart para WooCommerce

Un carrito lateral elegante y personalizable para WooCommerce con productos relacionados y animaciones suaves.

## Descripción

Snap Sidebar Cart mejora la experiencia de compra en tu tienda WooCommerce añadiendo un carrito lateral interactivo que se abre cuando los usuarios agregan productos o hacen clic en selectores específicos.

### Características principales

* **Carrito lateral interactivo**: Se muestra suavemente desde el lateral cuando se agregan productos o se hace clic en los botones configurados.
* **Sincronización automática**: El carrito lateral se actualiza automáticamente cuando se realizan cambios en la página del carrito de WooCommerce.
* **Productos relacionados**: Muestra productos relacionados en un slider configurable debajo del carrito.
* **Animaciones suaves**: Efectos de fade-in cuando se agregan productos y preloader durante las actualizaciones.
* **Personalización completa**: Configuración de colores, anchos, y estilos desde el panel de administración.
* **Experiencia mejorada**: Los productos se eliminan automáticamente cuando la cantidad llega a 0.
* **Efecto hover en productos relacionados**: Muestra imágenes alternativas de la galería al pasar el cursor.
* **Información detallada**: Muestra el precio del envío y el subtotal con IVA incluido.
* **Totalmente responsive**: Se adapta perfectamente a dispositivos móviles y tablets.

## Instalación

1. Sube los archivos del plugin al directorio `/wp-content/plugins/snap-sidebar-cart`, o instala el plugin a través del panel de plugins de WordPress.
2. Activa el plugin a través del menú 'Plugins' en WordPress.
3. Configura las opciones del plugin en Ajustes > Carrito Lateral.

## Configuración

### Configuración General
* **Título del carrito**: Personaliza el título que aparece en la parte superior del carrito.
* **ID del contenedor**: Identificador único para el contenedor del carrito.
* **Selectores de activación**: Selectores CSS que, al hacer clic, abrirán el carrito.
* **Texto de tiempo de entrega**: Mensaje que se muestra debajo de cada producto.
* **Abrir automáticamente al añadir productos**: Habilita la apertura automática del carrito cuando se añade un producto.
* **Icono de eliminación rápida**: Opción para mostrar un icono de eliminación rápida para cada producto.
* **Personalización del icono**: Selección del tipo de icono (papelera, X, menos), tamaño y colores.

### Personalización de Estilos
* **Ancho del carrito lateral**: Define el ancho del carrito en px, em, rem o %.
* **Colores de fondo**: Personaliza los colores para distintas secciones del carrito.
* **Colores de texto**: Define colores para títulos, productos y botones.
* **Colores de botones**: Personaliza los colores de los botones principales.

### Configuración del Preloader
* **Tipo de preloader**: Elige entre diferentes estilos visuales (círculo, puntos).
* **Tamaño**: Define el tamaño del preloader en px, em o rem.
* **Colores**: Personaliza los colores principal y secundario con selector de color.
* **Posición**: Selecciona dónde aparecerá el preloader dentro del contenedor (centro, arriba, abajo).
* **Aplicación global**: La configuración del preloader se aplica automáticamente en todos los lugares donde se utiliza (productos relacionados, carga de productos, actualizaciones AJAX).

### Configuración de Animaciones
* **Duración de la animación**: Define la velocidad de las animaciones en milisegundos.
* **Delay de actualización**: Tiempo de espera antes de mostrar cambios de cantidad.
* **Posición de nuevos productos**: Decide si los nuevos productos se añaden al inicio o al final de la lista.

### Configuración del Icono de Eliminación Rápida
* **Tipo de icono**: Elige entre diferentes estilos (papelera, X, menos).
* **Color**: Personaliza el color del icono con selector de color.
* **Tamaño**: Define el tamaño del icono (pequeño, mediano, grande).
* **Posición**: Selecciona la ubicación del icono en el producto (superior derecha, superior izquierda, inferior derecha, inferior izquierda).

### Productos Relacionados
* **Mostrar productos relacionados**: Activa/desactiva la sección de productos relacionados.
* **Número de productos**: Define cuántos productos relacionados mostrar.
* **Columnas**: Define el número de columnas para los productos relacionados.
* **Orden**: Configura cómo ordenar los productos relacionados.
* **Badge de última oportunidad**: Muestra un indicador para productos con stock limitado.

## Solución de problemas

Si encuentras algún problema con el plugin, puedes usar la página de diagnóstico integrada para ayudarte a identificar y resolver problemas comunes:

1. Ve a Ajustes > Diagnóstico de Carrito.
2. La página mostrará información sobre tu configuración actual y posibles problemas.
3. Sigue las recomendaciones proporcionadas para solucionar los problemas detectados.

También puedes consultar el archivo de log del plugin para obtener información más detallada sobre cualquier error que pueda estar ocurriendo.

## Para desarrolladores

### Estructura de código
El plugin está organizado con una estructura modular y orientada a objetos para facilitar su extensión:

```
snap-sidebar-cart/
├── admin/                     # Funcionalidad del área de administración
│   ├── css/                   # Estilos de administración
│   ├── js/                    # Scripts de administración
│   └── partials/              # Plantillas parciales para el admin
├── assets/                    # Recursos compartidos
│   ├── css/                   # Estilos públicos
│   └── js/                    # Scripts públicos
├── includes/                  # Clases principales del plugin
│   ├── class-snap-sidebar-cart.php                 # Clase principal
│   ├── class-snap-sidebar-cart-admin.php           # Funcionalidad de admin
│   ├── class-snap-sidebar-cart-public.php          # Funcionalidad pública
│   ├── class-snap-sidebar-cart-ajax.php            # Manejador de AJAX
│   └── class-snap-sidebar-cart-logger.php          # Sistema de logging
├── logs/                      # Registros de depuración
├── public/                    # Funcionalidad del área pública
│   └── partials/              # Plantillas para el frontend
└── templates/                 # Plantillas que pueden ser sobreescritas por el tema
```

### Filtros y acciones disponibles
El plugin proporciona varios hooks para extender o modificar su funcionalidad:

#### Filtros
* `snap_sidebar_cart_product_html` - Modifica el HTML de un producto en el carrito.
* `snap_sidebar_cart_related_products` - Filtra los productos relacionados mostrados.
* `snap_sidebar_cart_options` - Modifica las opciones del plugin.

#### Acciones
* `snap_sidebar_cart_before_products` - Se ejecuta antes de listar los productos del carrito.
* `snap_sidebar_cart_after_products` - Se ejecuta después de listar los productos del carrito.
* `snap_sidebar_cart_before_related` - Se ejecuta antes de mostrar los productos relacionados.
* `snap_sidebar_cart_after_related` - Se ejecuta después de mostrar los productos relacionados.
* `snap_sidebar_cart_updated` - Se ejecuta cuando el carrito se actualiza.

### Sobreescribir plantillas
Las plantillas del plugin pueden ser sobreescritas desde tu tema. Para hacerlo, crea un directorio `snap-sidebar-cart` en tu carpeta de tema y copia las plantillas que deseas modificar. Por ejemplo:

```
tu-tema/
└── snap-sidebar-cart/
    ├── snap-sidebar-cart-product.php          # Sobreescribe la plantilla de producto
    └── snap-sidebar-cart-related-product.php  # Sobreescribe la plantilla de producto relacionado
```

## Preguntas frecuentes

### ¿Es compatible con mi tema de WooCommerce?
Sí, el plugin está diseñado para funcionar con cualquier tema que soporte WooCommerce correctamente. Hemos probado con los temas más populares como Storefront, Astra, OceanWP, Flatsome y GeneratePress.

### ¿Puedo personalizar los colores y estilos?
¡Absolutamente! El plugin incluye un panel de configuración completo donde puedes personalizar el ancho del carrito, colores de fondo, textos, encabezados y botones para que coincidan con el diseño de tu tienda.

### ¿Cómo funcionan los productos relacionados?
El plugin muestra automáticamente productos relacionados basados en categorías y etiquetas similares al producto añadido al carrito. Puedes configurar el número de productos, columnas y orden de visualización desde el panel de administración.

### ¿El plugin afecta al rendimiento de mi sitio?
Snap Sidebar Cart está optimizado para el rendimiento. Los estilos y scripts solo se cargan en páginas relacionadas con WooCommerce, y utiliza técnicas como carga asíncrona para minimizar el impacto en la velocidad de carga.

### ¿Puedo usar el plugin en un sitio multilingüe?
Sí, el plugin es compatible con WPML y Polylang. Todos los textos son traducibles mediante archivos .po/.mo estándar.

## Soporte

Si necesitas ayuda con el plugin, consulta primero la página de Diagnóstico incluida en el plugin. Si sigues experimentando problemas, puedes contactar con el desarrollador a través de la página del plugin o mediante la sección de soporte en WordPress.org.

## Changelog

Para ver los cambios recientes de la versión 1.2.11, consulta el archivo [CHANGELOG.md](CHANGELOG.md) incluido con el plugin.

## Cambios recientes
- El preloader de cantidad ahora solo aparece y actualiza la cantidad al perder el foco o presionar Enter, evitando AJAX en cada dígito escrito manualmente.
- Se añadió un valor por defecto (fallback) de 300ms en todas las transiciones CSS que usan --cart-animation-duration para evitar errores si la variable no está definida o se guarda vacía desde los ajustes.
- **Corrección:** El modal ahora respeta el tiempo de transición y la animación de apertura/cierre funciona correctamente en todas las posiciones. Se corrigió la sintaxis de las transiciones CSS para máxima compatibilidad entre navegadores.

## Licencia

Snap Sidebar Cart se distribuye bajo la licencia GPL v2 o posterior.
