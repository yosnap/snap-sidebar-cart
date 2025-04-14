# Resumen de logs implementados para depuración de las tabs

Fecha: 15 de abril de 2025

## Archivos modificados

1. `/assets/js/snap-sidebar-cart-public.js`
   - Se añadieron logs detallados para el evento de clic en las tabs
   - Se mejoró la función `loadRelatedProducts()` con logs detallados para cada paso del proceso
   - Se mejoró la función `tryAlternativeProduct()` para proporcionar más información sobre el proceso de carga alternativa

2. `/includes/class-snap-sidebar-cart-ajax.php`
   - Se añadieron logs detallados al método `get_related_products()` para rastrear el proceso de solicitudes AJAX
   - Se mejoró el método `get_same_category_products()` con logs exhaustivos para el proceso de obtención de productos de la misma categoría

3. `/public/partials/snap-sidebar-cart-related-product.php`
   - Se añadieron logs detallados para la renderización de cada producto relacionado
   - Se registra información sobre el producto, imágenes, precios y atributos

## Cómo utilizar estos logs

1. **Panel de WordPress**: Accede a tu instalación de WordPress y realiza acciones en las tabs para generar eventos
2. **Archivo de log de WordPress**: Revisa el archivo de log de WordPress (normalmente en `/wp-content/debug.log` o en la ubicación configurada en `wp-config.php`)
3. **Consola del navegador**: Abre la consola del navegador (F12 o Cmd+Option+I) para ver los logs JavaScript

## Información que se registra

### En el lado del cliente (JavaScript)

- Evento de clic en tabs:
  - Tab que se ha hecho clic
  - Valor del atributo `data-tab`
  - Estado actual y cambios en la UI
  
- Proceso de carga de productos:
  - Parámetros enviados a la solicitud AJAX
  - Respuesta recibida
  - Cantidad de productos encontrados
  - Configuración de la navegación del slider

### En el lado del servidor (PHP)

- Procesamiento de solicitudes AJAX:
  - Validación del nonce
  - ID del producto recibido
  - Tipo de tab solicitado
  - Configuración de pestañas activas
  
- Consultas de productos:
  - Categorías del producto
  - Parámetros de las consultas
  - Productos encontrados en cada etapa
  - Conversión de productos a objetos WC_Product
  
- Renderización de productos:
  - Datos básicos de cada producto
  - Estado del stock
  - Información de precios
  - Imágenes disponibles

## Posibles problemas que se podrían detectar

1. **Problema de configuración de tabs activas**: Si el tipo de tab solicitado no está en la lista de pestañas activas
2. **Problema de obtención de categorías**: Si no se pueden encontrar categorías para el producto base
3. **Problema en consultas de productos**: Si las consultas no devuelven ningún producto o hay errores
4. **Problema en la renderización**: Si hay excepciones al procesar los datos de productos
5. **Problema con las respuestas AJAX**: Si las respuestas están vacías o tienen un formato incorrecto

## Cómo solucionar problemas comunes

- **Tab no cambia o no carga productos**: Verificar que el valor de `data-tab` coincide con los tipos definidos en el servidor
- **No se encuentran productos**: Verificar las categorías del producto y las consultas de productos relacionados
- **Error en la respuesta AJAX**: Verificar los parámetros enviados y la estructura de la respuesta
- **Productos no se muestran correctamente**: Revisar los logs de renderización de productos para detectar errores

## Siguientes pasos recomendados

1. Verificar que la configuración de tabs activas incluya todos los tipos que se están utilizando
2. Comprobar la consistencia entre los valores de `data-tab` en el HTML y los tipos esperados en el servidor
3. Asegurarse de que los productos tengan categorías asignadas
4. Verificar los criterios de búsqueda para productos relacionados
