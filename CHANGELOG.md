# Changelog

## 1.2.9 - 2025-05-14
* **Corrección**: Solucionado problema de sincronización entre la página del carrito y el sidebar
* **Corrección**: Corregida la actualización de cantidades individuales de productos en el sidebar
* **Corrección**: Arreglada la actualización del subtotal en el sidebar cuando se modifica el carrito
* **Mejora**: Implementados logs detallados para facilitar la depuración
* **Corrección**: Corregida la ruta del template para la generación del HTML del carrito

## 1.2.8 - 2025-05-13
* **Nuevo**: Implementada sincronización automática entre la página del carrito y el sidebar
* **Mejora**: El sidebar del carrito se actualiza automáticamente cuando se realizan cambios en la página del carrito
* **Mejora**: No es necesario recargar la página para ver los cambios reflejados en el sidebar
* **Mejora**: Mejor experiencia de usuario al mantener ambas vistas del carrito sincronizadas

## 1.2.7 - 2025-05-13
* **Nuevo**: Implementada funcionalidad para añadir múltiples queries personalizadas en productos relacionados
* **Mejora**: Interfaz dinámica para añadir/eliminar queries personalizadas con etiquetas propias
* **Mejora**: Cada query personalizada aparece como una pestaña independiente en el carrito lateral
* **Mejora**: Restauradas pestañas estándar (Más vendidos, Destacados, etc.) en la configuración
* **Mejora**: Eliminado campo redundante de etiqueta de pestaña personalizada
* **Mejora**: Compatibilidad con versiones anteriores para mantener la funcionalidad con configuraciones existentes

## 1.2.6 - 2025-05-13
* **Corrección**: Solucionado problema de persistencia de checkboxes al cambiar entre pestañas
* **Nuevo**: Añadida personalización completa del icono de eliminación rápida
* **Mejora**: Implementada selección de tipo de icono (papelera, X, menos)
* **Mejora**: Añadida configuración de tamaño para el icono de eliminación
* **Mejora**: Añadida personalización de color para el icono de eliminación
* **Mejora**: Añadida personalización de color al pasar el ratón sobre el icono

## 1.2.5 - 2025-05-12
* **Corrección**: Aplicada configuración del preloader desde el admin en todos los lugares donde se usa
* **Mejora**: Unificado el sistema de preloader para usar siempre la configuración del panel de administración
* **Corrección**: Eliminadas todas las referencias hardcodeadas al preloader de tipo círculo
* **Mejora**: Implementada aplicación de estilos inline para el preloader según configuración (color, tamaño, tipo)
* **Mejora**: Añadido soporte para diferentes tipos de preloader (círculo, puntos) en todas las partes del plugin

## 1.2.4 - 2025-05-12
* **Mejora**: Optimización del rendimiento en dispositivos móviles
* **Mejora**: Actualizada compatibilidad con WooCommerce 8.5
* **Corrección**: Solucionado problema con la visualización de productos variables
* **Corrección**: Arreglado error en el cálculo de descuentos para productos en oferta
* **Corrección**: Solucionado problema con la visualización del sidebar al añadir productos a un carrito vacío
* **Corrección**: Solucionado problema donde la sección de productos relacionados no se ocultaba al eliminar todos los productos del carrito
* **Corrección**: Corregido comportamiento del efecto hover en imágenes de productos sin galería para evitar espacios vacíos
* **Mejora**: Implementada detección de productos sin galería desde el servidor para optimizar la experiencia de usuario
* **Mejora**: Mejorado efecto de transición en hover de productos con animación de desplazamiento vertical
* **Mejora**: Desactivado efecto de cambio de imagen en hover para productos sin galería
* **Nuevo**: Añadido soporte para productos virtuales y descargables
* **Mejora**: Mejorada la accesibilidad del carrito lateral
* **Mejora**: Implementado manejo consistente del preloader configurado en el backend

## 1.2.3 - 2025-05-12
* **Mejora**: Optimizado el manejo de la apertura automática del carrito
* **Mejora**: Añadida configuración más consistente para la posición de nuevos productos
* **Mejora**: Mejoradas las animaciones de agregado y eliminación de productos
* **Corrección**: Solucionados problemas de apertura automática del carrito
* **Corrección**: Solucionados problemas con la posición de nuevos productos
* **Nuevo**: Añadido sistema de logging para facilitar la depuración
* **Nuevo**: Añadida página de diagnóstico para ayudar a solucionar problemas
* **Mejora**: Implementado mejor manejo de preloaders durante operaciones AJAX

## 1.2.2 - 2024-12-10
* **Mejora**: Implementado soporte para tiempos de entrega personalizados por producto
* **Mejora**: Optimización de rendimiento general
* **Corrección**: Solucionados problemas de compatibilidad con WooCommerce 8.x

## 1.2.1 - 2024-10-15
* **Corrección**: Solucionado problema de compatibilidad con versiones recientes de WooCommerce
* **Mejora**: Mejoras en la usabilidad y accesibilidad
* **Corrección**: Solucionado problema con productos duplicados en el carrito
* **Mejora**: Rendimiento optimizado en la carga de productos relacionados

## 1.2.0 - 2024-08-20
* **Nuevo**: Añadido soporte para pestañas en productos relacionados
* **Nuevo**: Implementada función de "Última oportunidad" para productos con stock limitado
* **Mejora**: Optimizaciones en el CSS para mejor compatibilidad con temas
* **Corrección**: Solucionados problemas de compatibilidad con WooCommerce 7.x

## 1.1.5 - 2024-06-15
* **Nuevo**: Añadida opción para configurar el número de slides a desplazar
* **Mejora**: Mejorado el sistema de navegación de productos relacionados
* **Corrección**: Solucionado problema con la carga de productos relacionados

## 1.1.0 - 2024-04-10
* **Nuevo**: Implementadas pestañas para productos relacionados (upsells, crosssells, misma categoría)
* **Nuevo**: Añadida opción para productos destacados
* **Mejora**: Optimizado el rendimiento general

## 1.0.9 - 2024-02-25
* **Mejora**: Implementada carga optimizada del carrito
* **Corrección**: Solucionado problema con el contador de productos

## 1.0.8 - 2024-01-20
* **Nuevo**: Añadido timestamp a los productos para controlar el orden
* **Mejora**: Mejorada la gestión de productos idénticos

## 1.0.6 - 2023-11-15
* **Nuevo**: Añadidas configuraciones para duración de animaciones
* **Mejora**: Convertir colores hexadecimales a RGB para animaciones

## 1.0.0 - 2023-10-01
* Versión inicial del plugin

## 1.2.10 - 2025-05-15
* **Corrección**: Eliminado el footer duplicado que aparecía dentro del listado de productos en el sidebar.
* **Mejora**: Ahora los productos relacionados se cargan automáticamente al agregar el primer producto al carrito, sin necesidad de recargar ni cerrar el sidebar.
* **Mejora**: El slider de productos relacionados se oculta automáticamente al vaciar el carrito.

## 1.2.11 - 2025-05-15
* **Fix**: El footer del sidebar ahora aparece correctamente al agregar el primer producto al carrito sin recargar ni cerrar el sidebar. Se asegura la visibilidad dinámica vía JS tras cada actualización del carrito.

## [Versión X.X.X] - YYYY-MM-DD
* Mejora: El footer del carrito ahora permanece siempre visible y fuera del área de scroll, mejorando la experiencia de usuario en todas las posiciones (izquierda, derecha, popup).
* Fix: El scroll solo afecta a los productos y productos relacionados, nunca al header ni al footer.

## [Unreleased]
### Mejoras
- El preloader de cantidad ahora solo se muestra y actualiza la cantidad cuando el usuario termina de editar (al perder el foco o presionar Enter), evitando peticiones AJAX y animaciones en cada dígito escrito manualmente.
- Se añade fallback (valor por defecto) de 300ms en todas las transiciones CSS que usan --cart-animation-duration para evitar errores si la variable no está definida o se guarda vacía desde los ajustes.
