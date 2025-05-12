# Notas Técnicas - Snap Sidebar Cart

## Correcciones Implementadas (Mayo 2025)

### 1. Visualización del Sidebar al Añadir Productos a un Carrito Vacío

**Problema:** Cuando se añadía un producto a un carrito vacío, el sidebar no mostraba correctamente el producto añadido, el footer y la sección de productos relacionados.

**Solución implementada:**
- Modificado el manejador del evento `added_to_cart` en `auto-open-fix.js` para abrir primero el sidebar y luego realizar las verificaciones necesarias.
- Mejorada la función `handleAddedProduct` para verificar y crear el contenedor de productos si no existe.
- Implementada lógica para eliminar el mensaje de carrito vacío y asegurar que los botones del footer estén presentes.

**Archivos modificados:**
- `/assets/js/auto-open-fix.js`

### 2. Ocultación de la Sección de Productos Relacionados al Vaciar el Carrito

**Problema:** Cuando se eliminaban todos los productos del carrito, el footer se ocultaba correctamente pero la sección de productos relacionados seguía visible, especialmente al usar el botón de papelera.

**Soluciones implementadas:**

#### 2.1 Corrección en `remove-button-fix.js`
- Mejorada la función `removeCartItem` para aplicar múltiples métodos de ocultación a la sección de productos relacionados.
- Añadida una clase `cart-is-empty` al contenedor principal para facilitar la selección con CSS.
- Implementado un retraso para asegurar que la ocultación se aplique después de cualquier actualización del DOM.

#### 2.2 Corrección en `auto-open-fix.js`
- Añadida verificación adicional al final de la función `updateCartContent` para asegurar que la sección de productos relacionados se oculte cuando el carrito esté vacío.

#### 2.3 Corrección en `remove-top-button-handler.js`
- Modificado el manejador de eliminación con botón de papelera para ocultar explícitamente la sección de productos relacionados.
- Implementados múltiples métodos de ocultación para garantizar la compatibilidad entre navegadores.

#### 2.4 Nuevo script `empty-cart-fix.js`
- Creado un script dedicado que verifica si el carrito está vacío y oculta la sección de productos relacionados.
- Implementada verificación periódica mientras el sidebar está abierto.
- Añadidas reglas CSS dinámicas para asegurar la ocultación.

#### 2.5 Reglas CSS adicionales
- Añadidas reglas CSS para ocultar la sección de productos relacionados cuando existe el elemento `.snap-sidebar-cart__empty`.

**Archivos modificados:**
- `/assets/js/remove-button-fix.js`
- `/assets/js/auto-open-fix.js`
- `/assets/js/remove-top-button-handler.js`
- `/assets/css/snap-sidebar-cart-public.css`

**Archivos creados:**
- `/assets/js/empty-cart-fix.js`

### 3. Mejora del Manejo del Preloader

**Problema:** El preloader configurado en el backend no se estaba utilizando correctamente en todas las situaciones.

**Solución implementada:**
- Mejorada la función `setupAndShowPreloader` para utilizar correctamente la configuración del preloader desde el backend.
- Añadido soporte para color personalizado y tamaño del preloader.
- Implementados diferentes tipos de preloader (dots, spinner, circle).

**Archivos modificados:**
- `/assets/js/auto-open-fix.js`

## Notas para Desarrolladores

### Eventos Personalizados

El plugin utiliza los siguientes eventos personalizados que pueden ser útiles para extensiones o personalizaciones:

- `snap_sidebar_cart_updated`: Se dispara cuando el contenido del carrito se actualiza.
- `snap_sidebar_cart_empty`: Se dispara cuando el carrito queda vacío.
- `snap_sidebar_cart_opened`: Se dispara cuando el sidebar se abre.

### Clases CSS Importantes

- `.cart-is-empty`: Se añade al contenedor principal cuando el carrito está vacío.
- `.snap-sidebar-cart__empty`: Elemento que muestra el mensaje de carrito vacío.
- `.snap-sidebar-cart__related-section`: Contenedor de la sección de productos relacionados.
- `.snap-sidebar-cart__footer`: Contenedor del footer con subtotal y botones.

### Consideraciones para Futuras Actualizaciones

1. Considerar refactorizar el código para centralizar la lógica de manejo del carrito vacío.
2. Implementar un sistema de eventos más robusto para comunicación entre componentes.
3. Mejorar la documentación de las funciones y eventos disponibles.