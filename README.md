# Snap Sidebar Cart para WooCommerce

Un carrito lateral elegante y funcional para WooCommerce con animaciones personalizables, slider de productos relacionados y muchas otras características.

## Versión 1.1.0

## Características

- Sidebar que se muestra cuando los usuarios agregan productos al carrito
- Se abre al hacer clic en selectores configurables (botones de "Añadir al carrito", iconos de carrito, etc.)
- Cierre mediante botón X, clic fuera del sidebar o tecla ESC
- Slider de productos relacionados configurable
- Opción para configurar los estilos del listado de productos y del sidebar
- Los productos se eliminan automáticamente cuando la cantidad llega a 0
- Muestra el precio del envío y el subtotal con IVA incluido
- Título del carrito con contador de productos
- Animación de inserción de nuevos productos con preloader
- Gestión inteligente de cantidades (suma productos existentes en lugar de duplicarlos)
- Bloqueo de botón de incremento cuando se alcanza el límite de stock
- Efecto hover en el slider de productos relacionados que muestra imágenes alternativas
- El sidebar solo se abre con productos simples, no con los que tienen variaciones

## Actualizaciones recientes (v1.1.0)

- **Arquitectura modular mejorada**: Código JavaScript reorganizado en módulos separados para mejor mantenimiento.
- **Múltiples imágenes en hover**: Ahora los productos relacionados muestran las imágenes de la galería al pasar el ratón.
- **Animaciones más fluidas**: Transiciones mejoradas para añadir/eliminar productos y actualizar cantidades.
- **Control de stock avanzado**: El botón de incremento ahora se bloquea automáticamente cuando se alcanza el límite de stock disponible, mostrando una notificación visual.
- **Animación de actualización de cantidad mejorada**: Cuando se agrega un producto que ya existe en el carrito, la cantidad parpadea con un color destacado para indicar el cambio.
- **Cierre mejorado del sidebar**: Se ha mejorado la detección de clic fuera del sidebar y el cierre con la tecla ESC.
- **Preloader personalizable**: Ahora se pueden configurar diferentes estilos y posiciones para el preloader.
- **Mejor rendimiento**: Optimización general del código para un rendimiento más rápido.
- **Compatibilidad actualizada**: Verificada compatibilidad con WooCommerce 8.5.

## Instalación

1. Sube el plugin a la carpeta `/wp-content/plugins/` de tu instalación de WordPress.
2. Activa el plugin a través del menú 'Plugins' en WordPress.
3. Configura las opciones en el menú 'Snap Sidebar Cart' en la administración de WordPress.

## Configuración

### Opciones generales
- **Título del carrito**: Personaliza el título que se muestra en la parte superior del sidebar.
- **Selector de contenedor**: ID del contenedor HTML del sidebar.
- **Selectores de activación**: Selectores CSS para los elementos que abrirán el sidebar al hacer clic.
- **Mostrar precio de envío**: Activa/desactiva la visualización del precio de envío.
- **Apertura automática**: Define si el sidebar se abre automáticamente al añadir un producto al carrito.

### Productos relacionados
- **Mostrar productos relacionados**: Activa/desactiva la sección de productos relacionados.
- **Número de productos**: Cantidad de productos relacionados a mostrar.
- **Columnas**: Número de columnas en el slider.
- **Ordenar por**: Criterio de ordenación de los productos relacionados.

### Estilos
- **Ancho del sidebar**: Define el ancho del sidebar.
- **Color de fondo del sidebar**: Color de fondo principal.
- **Color de fondo del encabezado**: Color de fondo para el encabezado.
- **Color de texto del encabezado**: Color para el texto del encabezado.
- **Color de texto de productos**: Color para el texto de los productos.
- **Color de fondo de botones**: Color de fondo para los botones principales.
- **Color de texto de botones**: Color para el texto de los botones.

### Animaciones
- **Duración de la animación**: Tiempo en milisegundos para las animaciones.
- **Retraso en actualización de cantidad**: Tiempo de espera antes de mostrar cambios de cantidad.
- **Posición de nuevos productos**: Define si los nuevos productos se añaden al inicio o al final de la lista.

## Soporte

Para soporte técnico, por favor contacta con el desarrollador.
