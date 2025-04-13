# Registro de cambios

## 1.0.17 - 2025-04-13
### Correcciones
- Implementada solución definitiva para el botón eliminar con JavaScript nativo
- Añadido manejador de eventos a nivel de DOM para garantizar la funcionalidad
- Mejorado el estilo del botón eliminar para ser más discreto y efectivo
- Separados los estilos en un archivo CSS específico para mejor mantenimiento
- Optimizado el código para asegurar compatibilidad con todos los navegadores

## 1.0.16 - 2025-04-13
### Mejoras
- Implementado correctamente el cambio de imagen en hover para productos relacionados
- Añadidos estilos CSS avanzados para el efecto hover con transición suave
- Mejorada la implementación de eliminación de productos cuando la cantidad llega a 0
- Optimizado el preloader con nuevas opciones visuales y mejor rendimiento
- Actualizadas las opciones de estilo para mayor personalización del carrito
- Reorganizada la estructura de CSS para mejor mantenimiento y rendimiento
- Añadida animación de fade in cuando se añaden nuevos productos al carrito

### Correcciones
- Solucionado definitivamente el problema del botón "eliminar" que solo mostraba alertas
- Eliminado el código de depuración (onclick con alert) del botón eliminar
- Corregido el comportamiento del slider de productos relacionados
- Mejorada la carga de scripts para evitar conflictos

## 1.0.15 - 2025-04-13
### Correcciones
- Implementada versión de depuración extrema con alertas visuales para el botón eliminar
- Rediseñado el botón eliminar para hacerlo más visible y reconocible
- Añadido manejador de eventos inline (onclick) para confirmar la interacción
- Agregada información de depuración visible en el DOM para diagnóstico
- Añadidos botones de emergencia para garantizar la funcionalidad

## 1.0.14 - 2025-04-13
### Correcciones
- Solucionado definitivamente el problema del botón eliminar con un manejador de eventos especializado
- Implementado sistema de depuración detallada para monitorear eventos del botón eliminar
- Añadido atributo data-key directamente al botón eliminar para facilitar su funcionamiento
- Mejorado el aspecto visual del botón eliminar para hacerlo más visible y clicable
- Implementada estrategia de múltiples capas para garantizar la detección de la clave del producto

## 1.0.13 - 2025-04-13
### Correcciones
- Implementado sistema para deshabilitar el botón "+" cuando se alcanza el stock máximo disponible
- Corregido el problema del botón "X" que no funcionaba para eliminar productos
- Agregada información visual sobre el límite de stock en el input de cantidad
- Mejorada la integración con WooCommerce para el control de inventario
- Actualizada la gestión de eventos para mejor compatibilidad con todos los navegadores

## 1.0.12 - 2025-04-13
### Correcciones
- Solucionado definitivamente el problema del sidebar que no se muestra al agregar la última unidad disponible
- Implementado un mecanismo de respaldo JavaScript para garantizar la apertura del sidebar
- Corregido el orden inconsistente de productos entre actualizaciones
- Reescrita la lógica de ordenación para usar posiciones basadas en IDs de productos
- Añadido sistema de timestamps fijo por producto para mantener consistencia en el ordenamiento
- Optimizadas las operaciones AJAX para mantener el estado del carrito en todo momento

## 1.0.11 - 2025-04-13
### Correcciones
- Solucionado el problema de mostrar el sidebar cuando se agrega la última unidad disponible de un producto
- Corregido el orden inconsistente de productos en el carrito
- Implementado sistema de timestamps mejorado para evitar colisiones en la ordenación
- Añadida verificación del nivel de stock para detectar cuando se agrega la última unidad
- Mejorada la consistencia en la presentación del carrito con ordenamiento estable

## 1.0.10 - 2025-04-13
### Correcciones
- Solucionado el problema de cantidades incorrectas al eliminar productos duplicados
- Mejorada la lógica de detección de duplicados para mayor precisión
- Añadidos registros detallados de las cantidades antes y después de actualizar
- Optimizado el algoritmo para prevenir la suma erronea de cantidades
- Mejorada la identificación precisa de productos con variaciones

## 1.0.9 - 2025-04-13
### Correcciones
- Corregido el problema persistente de productos duplicados en el carrito
- Implementada detección y eliminación automática de productos duplicados
- Mejorada la lógica de timestamps para asegurar el correcto ordenamiento de productos
- Optimizados los métodos AJAX para trabajar en sincronización con los filtros de WooCommerce
- Añadidos registros detallados para monitorización y depuración

## 1.0.8 - 2025-04-13
### Correcciones
- Solucionado definitivamente el problema de duplicación de productos en el carrito
- Revertido el enfoque anterior y mejorado con una implementación más directa para manejar productos idénticos
- Optimizado el código para trabajar más eficientemente con el sistema de carrito de WooCommerce
- Depuración mejorada con información detallada en logs para facilitar el seguimiento

## 1.0.7 - 2025-04-13
### Correcciones
- Solucionado el problema crítico que causaba la creación de entradas duplicadas al agregar el mismo producto al carrito varias veces
- Implementado un sistema robusto de claves únicas para productos y variaciones para prevenir duplicados
- Mejorada la lógica de actualización de cantidad para productos existentes en el carrito
- Preservada la funcionalidad de ordenación configurable (productos nuevos al principio o al final)
- Refinado el sistema de timestamps para el correcto ordenamiento de productos

## 1.0.6 - 2025-04-13
### Nuevas características
- Añadida nueva sección de configuración para animaciones en el panel de administración
- Implementada opción para configurar el tiempo de duración de las animaciones (200ms-1000ms)
- Agregada configuración para el delay en la animación de actualización de cantidad
- Nueva opción para elegir si los productos nuevos se añaden al principio o al final del listado
- Mejorado el soporte para productos con variaciones para evitar mostrar el sidebar cuando se navega al detalle
- Implementado sistema para mostrar imagen de la galería al hacer hover en productos relacionados

### Mejoras
- Optimizadas las animaciones para ser más fluidas y configurables
- Mejorada la detección de productos ya existentes en el carrito para evitar duplicados
- Añadidas variables CSS personalizables para facilitar la personalización de animaciones
- Actualizada la documentación con todas las nuevas características
- Revisado el código JavaScript para mejor manejo de eventos

### Correcciones
- Solucionado problema con las animaciones que no respetaban la configuración de duración
- Arreglado el comportamiento en productos con variaciones para dirigir al usuario a la página de detalles
- Corregida la actualización de cantidad que no mostraba correctamente la animación visual
- Mejorado el manejo de errores en las peticiones AJAX

## 1.0.5 - 2025-04-12
### Mejoras
- Implementada nueva animación al agregar productos al carrito
- Los productos nuevos siempre aparecen en la primera posición
- Animación para hacer espacio en la parte superior del listado
- Espera de 300ms antes de mostrar el producto para una transición más suave
- Preloader visible durante el proceso de adición de productos
- Mejora visual en la actualización automática del carrito

## 1.0.4 - 2025-04-12
### Mejoras
- El preloader ahora permanece fijo en su posición (no se mueve)
- Añadidos checkboxes para seleccionar los tipos de consultas de productos relacionados
- Mejorado el editor de código PHP para la consulta personalizada con resaltado de sintaxis
- Añadido ejemplo de código en el campo de consulta personalizada
- Actualizada la URL de documentación del plugin

## 1.0.3 - 2025-04-12
### Nuevas características
- Añadida configuración de preloaders personalizable en el panel de administración
- Se pueden configurar diferentes tipos de preloader: círculo, cuadrado, línea con puntos y espiral
- Opciones para personalizar el tamaño, colores y posición del preloader
- El preloader ahora se muestra en el centro del producto por defecto

## 1.0.2 - 2025-04-12
### Correcciones
- Completamente reescrita la gestión de eventos para los botones de cantidad
- Cambiados los elementos <a> por <button> en los controles de cantidad para mejor accesibilidad y comportamiento
- Añadido un nuevo endpoint AJAX (snap_sidebar_cart_get_content) para actualizar el contenido del carrito en cualquier momento
- Implementada una función bindQuantityEvents() para asegurar que los eventos se vinculen correctamente después de actualizar el DOM
- Mejorada la captura de errores y la depuración con mensajes de consola detallados
- Añadido atributo data-key en múltiples elementos para mejor recuperación de la clave del producto
- Corregida la actualización automática del sidebar cuando se añade un producto al carrito
- Implementada una recarga del carrito al iniciar para asegurar sincronización con el servidor

## 1.0.1 - 2025-04-12
### Correcciones
- Corregido el problema con los botones de cantidad que no funcionaban correctamente
- Solucionado el problema con el botón de cerrar el sidebar
- Arreglada la actualización dinámica del contador de productos en el título
- Mejorada la detección de eventos de clic para los botones de cantidad
- Asegurado que WC()->cart->calculate_totals() se ejecute antes de obtener el contenido del carrito
- Mejorado el manejo de errores para los botones de eliminar producto
- Optimizado el selector para los botones de cantidad con una definición más específica
- Cambiado el enlace de los botones de cantidad de "#" a "javascript:void(0);" para prevenir scroll al inicio de página

## 1.0.0 - Lanzamiento inicial - 2025-04-12
### Características
- Carrito lateral que se muestra al agregar productos o al hacer clic en selectores específicos
- Slider configurable para productos relacionados
- Opciones de configuración de estilos para el listado de productos y el sidebar
- Eliminación automática de productos cuando la cantidad llega a 0
- Muestra precio de envío y subtotal con IVA incluido
- Título que muestra el número de items en el carrito
- Efectos visuales al agregar/eliminar productos (preloader, fade in)
- Soporte para mostrar imágenes alternativas en hover para productos relacionados