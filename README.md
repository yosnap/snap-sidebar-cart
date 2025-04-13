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

### Versión 1.0.16 (Última versión)
- Solucionado el problema del botón "eliminar" que solo mostraba alertas y no eliminaba productos
- Implementado correctamente el slider de productos relacionados con cambio de imagen en hover
- Añadida funcionalidad de eliminación automática de productos cuando la cantidad llega a 0
- Mejorado el preloader para nuevos productos y durante el proceso de eliminación
- Optimizadas las opciones de estilo en el panel de administración
- Revisado y mejorado el código CSS para mejor apariencia y rendimiento

### Versión 1.0.15
- Corregidos errores en la gestión de eventos de botones de cantidad
- Mejorado el manejo del stock y límites de cantidad
- Optimizadas las animaciones para agregar nuevos productos
- Implementado soporte completo para productos con variaciones

### Versión 1.0.14
- Implementada solución definitiva para el botón de eliminar productos
- Añadido sistema de depuración avanzado con registro detallado de eventos
- Mejorada la interfaz del botón eliminar para mayor visibilidad y usabilidad
- Incorporada lógica multi-capa para asegurar el funcionamiento en todos los casos

### Versión 1.0.13
- Implementada limitación de stock en los controles de cantidad
- Corregido el botón de eliminar productos del carrito
- Mejorada la gestión de inventario y visualización de disponibilidad
- Añadido soporte para deshabilitar automáticamente el botón "+" cuando se alcanza el stock máximo

### Versión 1.0.12
- Solucionado definitivamente el problema de visualización del sidebar con la última unidad disponible
- Implementado script de respaldo para garantizar la apertura del sidebar en todos los casos
- Corregido el orden inconsistente de productos con una nueva implementación de ordenación
- Mejorado sistema de timestamps para un ordenamiento estable y predecible

### Versión 1.0.11
- Corregido el problema de visualización del sidebar cuando se agrega la última unidad disponible
- Solucionado el orden inconsistente de productos en el carrito después de actualizaciones
- Mejorado el sistema de timestamps para mantener un orden consistente
- Implementada detección de stock para manejar correctamente la última unidad disponible

### Versión 1.0.10
- Corregido el problema con las cantidades incorrectas al eliminar productos duplicados
- Implementada lógica de detección mejorada para identificar productos idénticos
- Optimizado el manejo de variaciones para garantizar identificación precisa
- Mejorados los registros de depuración para facilitar el seguimiento

### Versión 1.0.9
- Eliminada definitivamente la duplicación de productos en el carrito
- Implementada detección y corrección automática de duplicados durante la presentación del carrito
- Mejorada sincronización entre AJAX y filtros de WooCommerce para operaciones del carrito
- Optimizada la lógica de timestamps para un correcto ordenamiento de los productos

### Versión 1.0.8
- Solucionado definitivamente el problema de productos duplicados en el carrito con una implementación optimizada
- Mejorado el manejo de productos idénticos para actualizar cantidades en lugar de crear duplicados
- Aplicada una solución que mantiene la compatibilidad con todas las funcionalidades existentes

### Versión 1.0.7
- Solucionado el problema crítico de productos duplicados en el carrito
- Implementado sistema robusto para identificar productos idénticos y actualizar cantidades
- Mantenida la funcionalidad de ordenación configurable para productos nuevos

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
