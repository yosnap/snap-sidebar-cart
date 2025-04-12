# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-04-12

### Añadido
- Nuevo diseño moderno para el carrito lateral basado en interfaces de e-commerce premium
- Sistema de pestañas para productos relacionados con cuatro categorías: relacionados, misma categoría, más vendidos y accesorios
- Slider mejorado para productos relacionados con botones de navegación
- Visualización de descuentos con porcentajes para productos con precios rebajados
- Indicador "Last Chance" para productos con inventario bajo
- Información de tiempo estimado de entrega para cada producto
- Visualización de variantes y colores de producto en el listado del carrito

### Mejorado
- Estructura del HTML completamente rediseñada para mejorar la accesibilidad y facilitar la personalización
- Optimización del rendimiento en la carga de productos relacionados mediante AJAX
- Sistema de animaciones más suave y nativo
- Mayor compatibilidad con dispositivos móviles
- Gestión mejorada de productos relacionados con múltiples fuentes de datos

## [1.0.0] - 2025-04-12

### Añadido
- Versión inicial del plugin
- Funcionalidad de carrito lateral que se activa con selectores específicos o al añadir productos
- Integración de productos relacionados en un slider configurable
- Panel de administración con opciones para personalizar todos los aspectos del carrito
- Animaciones de carga y transición para mejorar la experiencia de usuario
- Preloader durante las actualizaciones de productos
- Efecto hover en productos relacionados que muestra una imagen alternativa de la galería
- Información de precio de envío y subtotal con IVA incluido en el footer
- Estilo responsive que se adapta a diferentes tamaños de pantalla

### Correcciones
- Solución para los errores de "Trying to access array offset on value of type null" en varias partes del plugin
- Validación mejorada de configuraciones para evitar errores cuando faltan opciones
- Corrección de interacción con la caché de WooCommerce para asegurar que el conteo de productos se muestre correctamente

### Cambios técnicos importantes
- Estructura modular para facilitar extensiones y personalizaciones
- Implementación de ajustes de rendimiento para minimizar el impacto en la velocidad del sitio
- Separación clara entre la lógica del plugin y la presentación
- Carga condicional de estilos y scripts solo en páginas de WooCommerce
