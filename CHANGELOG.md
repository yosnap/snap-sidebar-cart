# Registro de cambios

## 1.0.18 - 2025-04-13
### Mejoras
- Actualizado el ancho por defecto del sidebar a 540px para una mejor visualización
- Rediseñados los campos de cantidad para tener un tamaño más pequeño y sin bordes
- Eliminados estilos innecesarios para una apariencia más limpia

### Correcciones
- Solucionado problema con los estilos del sidebar que no respetaban la configuración guardada
- Eliminado completamente el botón de eliminar productos del template y CSS
- Corregido el problema con los campos de cantidad que tenían bordes no deseados
- Mejorada la prioridad de los estilos para garantizar que se apliquen correctamente

## 1.0.17 - 2025-04-13
### Nuevas características
- Añadida función para bloquear el botón de incremento de cantidad cuando se alcanza el límite de stock del producto
- Implementado sistema para evitar duplicados visuales de productos en el carrito

### Mejoras
- Mejorado el sistema de actualización del carrito para consolidar productos duplicados
- Optimizada la detección y manejo del stock disponible
- Añadidos estilos visuales para el botón de incremento deshabilitado cuando se alcanza el stock máximo
- Implementado sistema para verificar el stock al cargar la página y después de cada actualización

### Correcciones
- Solucionado problema donde los productos no se sumaban correctamente al agregar más unidades
- Corregido comportamiento para asegurar que el sidebar se muestre cuando se agrega un producto al carrito
- Implementada solución definitiva para el botón eliminar con JavaScript nativo
- Añadido manejador de eventos a nivel de DOM para garantizar la funcionalidad

## 1.0.16 - 2025-04-13
### Mejoras
- Implementado correctamente el cambio de imagen en hover para productos relacionados
- Añadidos estilos CSS avanzados para el efecto hover con transición suave
- Mejorada la implementación de eliminación de productos cuando la cantidad llega a 0
- Optimizado el preloader con nuevas opciones visuales y mejor rendimiento

### Correcciones
- Solucionado definitivamente el problema del botón "eliminar" que solo mostraba alertas
- Eliminado el código de depuración (onclick con alert) del botón eliminar
- Corregido el comportamiento del slider de productos relacionados

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
