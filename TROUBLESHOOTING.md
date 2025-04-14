# Solución de Problemas - Snap Sidebar Cart

## Problemas conocidos y soluciones

### El sidebar no se cierra al hacer clic fuera o en el botón X

Si tienes problemas con el cierre del sidebar, puedes intentar las siguientes soluciones:

1. **Limpieza de caché**:
   - Limpia la caché de tu navegador
   - Si usas un plugin de caché en WordPress, limpia también esa caché
   - Prueba en un navegador en modo incógnito

2. **Conflictos de JavaScript**:
   - Temporalmente desactiva otros plugins que puedan estar afectando al funcionamiento del JavaScript
   - Verifica la consola de desarrollador del navegador (F12) para buscar errores de JavaScript

3. **Selección manual del botón de cierre**:
   - En la consola del navegador puedes ejecutar:
     ```javascript
     jQuery('.snap-sidebar-cart__close').on('click', function() {
         jQuery('.snap-sidebar-cart').removeClass('open');
         jQuery('.snap-sidebar-cart__overlay').css('display', 'none');
         jQuery('body').removeClass('snap-sidebar-cart-open');
     });
     ```

4. **Cierre de emergencia con tecla ESC**:
   - Si el sidebar está abierto, presiona la tecla ESC para cerrarlo

### El slider de productos relacionados no se muestra correctamente

Si el slider de productos relacionados no está funcionando:

1. **Verificar si se están cargando los productos**:
   - Revisa la consola de desarrollador para ver si hay errores AJAX
   - Asegúrate de que la configuración de productos relacionados esté activa en las opciones

2. **Ajustar el CSS**:
   - Si el slider se ve pero no tiene el aspecto deseado, puedes modificar las propiedades CSS personalizadas
   - Las propiedades principales se pueden configurar desde el panel de administración

3. **Recrear sliders manualmente**:
   - En la consola del navegador puedes ejecutar:
     ```javascript
     if (window.SnapSidebarCartRelated && window.SnapSidebarCartRelated.loadRelatedProductsIfEmpty) {
         window.SnapSidebarCartRelated.loadRelatedProductsIfEmpty();
     }
     ```

### Las imágenes de hover en productos relacionados no funcionan

Si las imágenes alternativas no aparecen al hacer hover:

1. **Verificar que los productos tengan galería de imágenes**:
   - Las imágenes de hover provienen de la galería de cada producto
   - Si un producto no tiene imágenes de galería, no aparecerá el efecto hover

2. **Revisar CSS**:
   - Asegúrate de que los selectores CSS `.product-gallery-image` estén definidos correctamente
   - Comprueba que no haya conflictos con otros estilos

## Scripts de depuración incluidos

Para ayudar a diagnosticar problemas, hemos incluido scripts de depuración:

1. **Debug general**: Información completa sobre la carga de módulos
   - Datos visibles en la consola al cargar la página

2. **Test de botón de cierre**: Prueba específica del funcionamiento del botón X
   - Agrega un botón rojo flotante para probar el cierre del sidebar

## Contacto para soporte adicional

Si después de intentar estas soluciones sigues teniendo problemas, por favor contacta con el desarrollador proporcionando:

1. Capturas de pantalla del problema
2. Logs de la consola JavaScript (F12 > Consola)
3. Lista de plugins activos en tu WordPress
4. Versión de WordPress y WooCommerce que estás utilizando
