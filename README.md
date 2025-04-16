# Snap Sidebar Cart para WooCommerce

Un carrito lateral elegante y funcional para WooCommerce con animaciones personalizables, slider de productos relacionados y muchas otras características.

## Versión 1.2.0

## Características

- Sidebar que se muestra cuando los usuarios agregan productos al carrito
- Se abre al hacer clic en selectores configurables (botones de "Añadir al carrito", iconos de carrito, etc.)
- Cierre mediante botón X, clic fuera del sidebar o tecla ESC
- Slider de productos relacionados basado en Swiper.js con navegación mejorada
- Opción para configurar los estilos del listado de productos y del sidebar
- Los productos se eliminan automáticamente cuando la cantidad llega a 0
- Muestra el precio del envío y el subtotal con IVA incluido
- Título del carrito con contador de productos
- Animación de inserción de nuevos productos con preloader
- Gestión inteligente de cantidades (suma productos existentes en lugar de duplicarlos)
- Bloqueo de botón de incremento cuando se alcanza el límite de stock
- Efecto hover en el slider de productos relacionados que muestra imágenes alternativas
- El sidebar solo se abre con productos simples, no con los que tienen variaciones
- Badge "Última oportunidad" totalmente personalizable para productos con stock limitado

## Actualizaciones recientes (v1.2.0)

- **Implementación de Swiper.js**: Ahora los sliders de productos relacionados utilizan Swiper.js para una experiencia más fluida y profesional.
- **Navegación mejorada en sliders**: Los botones de navegación ahora se posicionan juntos en la parte superior derecha de cada slider.
- **Badge "Última oportunidad" personalizable**: Nuevas opciones para personalizar el texto, color de fondo y color de texto del badge que se muestra en productos con stock limitado.
- **Configuración avanzada de slides**: Ahora puedes configurar cuántos slides se desplazan a la vez al hacer clic en los botones de navegación.
- **Compatibilidad mejorada con temas**: Se ha mejorado la compatibilidad con diversos temas de WordPress para evitar conflictos de estilos.
- **Rendimiento optimizado**: Carga y renderizado de productos relacionados más rápido y eficiente.
- **Compatibilidad actualizada**: Verificada compatibilidad con WooCommerce 8.5 y WordPress 6.4.

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
- **Número de slides a desplazar**: Cuántos productos se desplazan a la vez en el slider al hacer clic en los botones de navegación.
- **Mostrar badge de última oportunidad**: Activa/desactiva el badge en productos con stock limitado.
- **Límite de stock para última oportunidad**: Stock por debajo del cual se muestra el badge.
- **Título del badge**: Texto personalizable que se muestra en el badge.
- **Color de fondo del badge**: Color de fondo personalizable.
- **Color de texto del badge**: Color del texto personalizable.

### Estilos
- **Ancho del sidebar**: Define el ancho del sidebar.
- **Color de fondo del listado de productos**: Color de fondo para el área de productos.
- **Color de fondo de productos relacionados**: Color de fondo para la sección de productos relacionados.
- **Color de fondo del footer**: Color de fondo para el área inferior del carrito.
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
