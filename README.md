# Snap Sidebar Cart para WooCommerce

Un plugin para WordPress que proporciona un carrito lateral (sidebar) personalizable para WooCommerce con animaciones, productos relacionados y más.

## Características Principales

- **Carrito lateral** que se muestra al agregar productos o hacer click en selectores configurados
- **Listado de productos** con cantidades ajustables y opción de eliminar
- **Animaciones personalizables** para agregar/eliminar productos y actualizar cantidades
- **Slider de productos relacionados** con múltiples opciones
- **Mostrar imágenes de galería** en hover de productos relacionados
- **Preloader personalizable** que aparece al actualizar o eliminar productos
- **Estilos totalmente configurables** desde el panel de administración
- **Eliminación automática** de productos cuando la cantidad llega a 0
- **Detalle de precios** con precio de envío y subtotal (IVA incluido)
- **Múltiples opciones de visualización** para nuevos productos

## Requisitos

- WordPress 5.0 o superior
- WooCommerce 4.0 o superior
- PHP 7.3 o superior

## Instalación

1. Sube la carpeta `snap-sidebar-cart` a tu directorio `/wp-content/plugins/`
2. Activa el plugin a través del menú 'Plugins' en WordPress
3. Ve a Ajustes > Carrito Lateral para configurar el plugin

## Configuración

### Ajustes Básicos

- **Título del carrito**: Personaliza el título que se muestra en la parte superior del carrito
- **ID del contenedor**: ID HTML para el contenedor del carrito lateral (sin el símbolo #)
- **Selectores de activación**: Selectores CSS separados por comas que, al hacer clic, abrirán el carrito lateral
- **Mostrar información de envío**: Activa/desactiva la información de costes de envío en el pie del carrito
- **Abrir automáticamente**: Abre automáticamente el carrito lateral cuando se añade un producto

### Apariencia Visual

- **Ancho del carrito lateral**: Define el ancho del carrito (px, em, rem, %)
- **Color de fondo del carrito**: Color de fondo principal del carrito
- **Color de fondo del encabezado**: Color de fondo de la sección superior del carrito
- **Color del texto del encabezado**: Color del texto en la sección superior del carrito
- **Color del texto de productos**: Color del texto para la lista de productos
- **Color de fondo de botones**: Color de fondo para los botones principales
- **Color del texto de botones**: Color del texto para los botones principales

### Configuración del Preloader

- **Tipo de preloader**: Elige entre círculo, cuadrado, puntos o espiral
- **Tamaño del preloader**: Define el tamaño del preloader en px, em o rem
- **Color principal**: Color principal para el preloader
- **Color secundario**: Color secundario para algunos tipos de preloader
- **Posición del preloader**: Posición del preloader en el contenedor del producto

### Configuración de Animaciones

- **Duración de la animación**: Tiempo en milisegundos para las animaciones
- **Delay de actualización de cantidad**: Tiempo de espera antes de mostrar la animación de actualización
- **Posición de nuevos productos**: Define si los nuevos productos aparecen al inicio o al final del listado

### Productos Relacionados

- **Mostrar productos relacionados**: Activa/desactiva la sección de productos relacionados
- **Número de productos relacionados**: Número máximo de productos a mostrar
- **Columnas de productos relacionados**: Número de columnas para la visualización
- **Ordenar productos relacionados por**: Criterio de ordenación (aleatorio, fecha, precio, etc.)
- **Pestañas de productos relacionados**: Tipos de productos relacionados a mostrar
- **Etiqueta personalizada**: Etiqueta para la pestaña de productos relacionados personalizada
- **Código personalizado para queries**: Código PHP para personalizar la consulta de productos

## Comportamiento con Variaciones

- Para productos con variaciones, el sidebar **no se muestra** cuando el usuario hace clic en el botón "Seleccionar opciones", dirigiéndolo a la página del producto para elegir las variaciones.
- Cuando se agrega un producto con variación directamente al carrito, se muestra con las opciones seleccionadas.

## Funcionalidades Especiales

- **Posición de nuevos productos**: Los nuevos productos se pueden añadir al inicio o final del listado según la configuración.
- **Animación de actualización de cantidad**: Muestra una animación visual al actualizar la cantidad de un producto.
- **Efecto hover en productos relacionados**: Muestra una imagen alternativa de la galería al pasar el ratón sobre un producto relacionado.
- **Eliminación con animación**: Los productos se eliminan con una animación de desvanecimiento cuando la cantidad llega a 0.

## Cambios importantes

### Versión 1.0.6
- Añadida configuración de animaciones con opciones personalizables
- Implementado sistema inteligente para manejar productos con variaciones
- Agregada función para mostrar imagen de galería en hover para productos relacionados
- Mejorada la animación al actualizar cantidades con delay configurable
- Añadida opción para elegir donde se agregan los nuevos productos (inicio/final)

## Licencia

Este plugin está licenciado bajo GPL v2 o posterior.

## Soporte

Para soporte o consultas, por favor contacta a través de [correo electrónico] o [sitio web].
