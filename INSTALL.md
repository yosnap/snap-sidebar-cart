# Guía de Instalación y Configuración de Snap Sidebar Cart

Esta guía proporcionará instrucciones detalladas para instalar, configurar y optimizar el plugin Snap Sidebar Cart en tu tienda WooCommerce.

## Requisitos previos

Antes de instalar el plugin, asegúrate de que tu sistema cumple con los siguientes requisitos:

- WordPress 5.0 o superior
- WooCommerce 4.0 o superior
- PHP 7.3 o superior
- Un tema compatible con WooCommerce
- Permisos para instalar plugins (rol de administrador)

## Instalación

### Método 1: Instalación directa desde el directorio de WordPress

1. Inicia sesión en tu panel de administración de WordPress
2. Ve a Plugins > Añadir nuevo
3. Busca "Snap Sidebar Cart"
4. Haz clic en "Instalar ahora" junto al plugin Snap Sidebar Cart
5. Una vez instalado, haz clic en "Activar"

### Método 2: Instalación manual mediante subida de archivos

1. Descarga el archivo ZIP del plugin desde [GitHub](https://github.com/username/snap-sidebar-cart/releases)
2. Inicia sesión en tu panel de administración de WordPress
3. Ve a Plugins > Añadir nuevo > Subir plugin
4. Haz clic en "Examinar..." y selecciona el archivo ZIP descargado
5. Haz clic en "Instalar ahora"
6. Una vez instalado, haz clic en "Activar plugin"

### Método 3: Instalación mediante FTP

1. Descarga y descomprime el archivo ZIP del plugin
2. Conéctate a tu servidor mediante FTP
3. Sube la carpeta `snap-sidebar-cart` descomprimida a la carpeta `/wp-content/plugins/` de tu sitio WordPress
4. Inicia sesión en tu panel de administración de WordPress
5. Ve a Plugins y activa "Snap Sidebar Cart"

## Configuración inicial

Una vez activado el plugin, es importante configurarlo para adaptarlo a las necesidades de tu tienda:

1. Ve a Ajustes > Carrito Lateral en tu panel de administración
2. En la sección "Configuración General":
   - Define un título para el carrito (por defecto es "Carrito de compra")
   - Configura los selectores CSS para activar el carrito (por defecto incluye `.add_to_cart_button, .ti-shopping-cart, i.ti-shopping-cart`)
   - Decide si el carrito debe abrirse automáticamente cuando se añade un producto
   - Configura si quieres mostrar la información de envío

3. En la sección "Personalización de Estilos":
   - Ajusta el ancho del carrito lateral (por defecto es 400px)
   - Personaliza los colores de fondo, encabezado, texto y botones según tu tema

4. En la sección "Productos Relacionados":
   - Activa o desactiva la visualización de productos relacionados
   - Configura el número de productos a mostrar
   - Define el número de columnas para la visualización
   - Selecciona cómo ordenar los productos relacionados

5. Haz clic en "Guardar cambios"

## Personalización avanzada

### Integrando con temas personalizados

Si tu tema tiene un diseño personalizado, puede que necesites ajustar los selectores CSS:

1. Identifica los botones o iconos que deseas usar para activar el carrito lateral
2. Observa sus clases CSS usando las herramientas de desarrollador del navegador
3. Añade estos selectores en la configuración del plugin, separados por comas

### Optimización para dispositivos móviles

El plugin está diseñado para ser responsive, pero puedes hacer ajustes adicionales:

1. Considera reducir el número de productos relacionados y columnas en móviles
2. Prueba diferentes anchos para el carrito en la configuración
3. Verifica la apariencia en varios dispositivos después de personalizar

## Solución de problemas comunes

### El carrito no se abre al hacer clic en los botones

- Verifica que los selectores CSS configurados coincidan con los elementos de tu tema
- Asegúrate de que jQuery está cargado correctamente en tu sitio
- Comprueba la consola de desarrollador del navegador para posibles errores JavaScript

### Los productos relacionados no se muestran

- Verifica que la opción esté activada en la configuración
- Comprueba que los productos tengan categorías o etiquetas relacionadas
- Asegúrate de que haya suficientes productos en tu tienda para crear relaciones

### Conflictos con otros plugins

Si experimentas conflictos con otros plugins:

1. Desactiva temporalmente otros plugins relacionados con el carrito para identificar el conflicto
2. Intenta cambiar el orden de carga de los plugins
3. Contacta con el soporte si los problemas persisten

## Actualizaciones

Para mantener el plugin actualizado:

1. Verifica regularmente las notificaciones de actualización en tu panel de WordPress
2. Antes de actualizar, realiza una copia de seguridad completa de tu sitio
3. Si has personalizado archivos del plugin, ten en cuenta que podrían ser sobrescritos durante una actualización

## Soporte adicional

Si necesitas ayuda adicional, puedes:

- Consultar la documentación completa en el archivo README.md
- Revisar o reportar problemas en GitHub: [https://github.com/username/snap-sidebar-cart/issues](https://github.com/username/snap-sidebar-cart/issues)
- Contactar directamente con el desarrollador para soporte personalizado
