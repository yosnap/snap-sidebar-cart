=== Snap Sidebar Cart for WooCommerce ===
Contributors: paulodev
Tags: woocommerce, cart, sidebar, ajax, minicart, slide-cart
Requires at least: 5.0
Tested up to: 6.4
Requires PHP: 7.3
Stable tag: 1.2.4
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

Un carrito lateral elegante y personalizable para WooCommerce con productos relacionados y animaciones suaves.

== Description ==

Snap Sidebar Cart mejora la experiencia de compra en tu tienda WooCommerce añadiendo un carrito lateral interactivo que se abre cuando los usuarios agregan productos o hacen clic en selectores específicos.

= Características principales =

* **Carrito lateral interactivo**: Se muestra suavemente desde el lateral cuando se agregan productos o se hace clic en los botones configurados.
* **Productos relacionados**: Muestra productos relacionados en un slider configurable debajo del carrito.
* **Animaciones suaves**: Efectos de fade-in cuando se agregan productos y preloader durante las actualizaciones.
* **Personalización completa**: Configuración de colores, anchos, y estilos desde el panel de administración.
* **Experiencia mejorada**: Los productos se eliminan automáticamente cuando la cantidad llega a 0.
* **Efecto hover en productos relacionados**: Muestra imágenes alternativas de la galería al pasar el cursor.
* **Información detallada**: Muestra el precio del envío y el subtotal con IVA incluido.
* **Totalmente responsive**: Se adapta perfectamente a dispositivos móviles y tablets.

= Para desarrolladores =

* Estructura de código modular y orientada a objetos
* Numerosos filtros y acciones para extender la funcionalidad
* Posibilidad de sobreescribir plantillas desde el tema
* Documentación detallada para integraciones personalizadas

== Installation ==

1. Sube la carpeta `snap-sidebar-cart` a la carpeta `/wp-content/plugins/` de tu sitio WordPress
2. Activa el plugin a través del menú 'Plugins' en WordPress
3. Ve a Ajustes > Carrito Lateral para configurar las opciones
4. ¡Disfruta de tu nuevo carrito lateral!

Para una guía de instalación más detallada, consulta el archivo INSTALL.md incluido con el plugin.

== Frequently Asked Questions ==

= ¿Es compatible con mi tema de WooCommerce? =

Sí, el plugin está diseñado para funcionar con cualquier tema que soporte WooCommerce correctamente. Hemos probado con los temas más populares como Storefront, Astra, OceanWP, Flatsome y GeneratePress.

= ¿Cómo puedo cambiar qué botones activan el carrito lateral? =

En la configuración del plugin (Ajustes > Carrito Lateral), puedes especificar los selectores CSS que al hacer clic abrirán el carrito. Por defecto, se incluyen `.add_to_cart_button, .ti-shopping-cart, i.ti-shopping-cart`.

= ¿Puedo personalizar los colores y estilos? =

¡Absolutamente! El plugin incluye un panel de configuración completo donde puedes personalizar el ancho del carrito, colores de fondo, textos, encabezados y botones para que coincidan con el diseño de tu tienda.

= ¿Cómo funcionan los productos relacionados? =

El plugin muestra automáticamente productos relacionados basados en categorías y etiquetas similares al producto añadido al carrito. Puedes configurar el número de productos, columnas y orden de visualización desde el panel de administración.

= ¿El plugin afecta al rendimiento de mi sitio? =

Snap Sidebar Cart está optimizado para el rendimiento. Los estilos y scripts solo se cargan en páginas relacionadas con WooCommerce, y utiliza técnicas como carga asíncrona para minimizar el impacto en la velocidad de carga.

= ¿Puedo usar el plugin en un sitio multilingüe? =

Sí, el plugin es compatible con WPML y Polylang. Todos los textos son traducibles mediante archivos .po/.mo estándar.

== Screenshots ==

1. El carrito lateral con productos y sección de relacionados
2. Panel de configuración - Opciones generales
3. Panel de configuración - Personalización de estilos
4. Panel de configuración - Productos relacionados
5. Vista en dispositivo móvil

== Changelog ==

= 1.2.9 =
* Corrección crítica: ahora los botones + y - y el botón eliminar funcionan correctamente usando la clave hash real de WooCommerce.
* Los totales de cantidad y subtotal del carrito se actualizan dinámicamente tras cada cambio.
* Refactor: los handlers JS ahora son robustos ante recarga dinámica del HTML del carrito.
* Mejoras menores de estabilidad y depuración.

= 1.2.8 =
* Corrección: El orden de los productos en el sidebar ahora respeta la configuración de "Arriba/Abajo" tanto al agregar productos como al recargar la página. Se reindexa el array tras ordenar para asegurar consistencia visual.

= 1.2.4 =
* Mejora: Optimización del rendimiento en dispositivos móviles
* Mejora: Actualizada compatibilidad con WooCommerce 8.5
* Corrección: Solucionado problema con la visualización de productos variables
* Corrección: Arreglado error en el cálculo de descuentos para productos en oferta
* Nuevo: Añadido soporte para productos virtuales y descargables
* Mejora: Mejorada la accesibilidad del carrito lateral

= 1.0.0 =
* Versión inicial

Para ver el registro completo de cambios, consulta el archivo CHANGELOG.md incluido con el plugin.

== Upgrade Notice ==

= 1.2.4 =
Esta actualización incluye mejoras de rendimiento, mejor compatibilidad con WooCommerce 8.5, soporte para productos virtuales y descargables, y correcciones importantes.

= 1.0.0 =
Versión inicial del plugin Snap Sidebar Cart para WooCommerce.

== Credits ==

* Desarrollado por Paulo para Brass Market.

== Uso ==
- Los botones de cantidad (+ y -) y el botón eliminar funcionan correctamente y actualizan los totales del carrito en tiempo real.
- El sistema es compatible con recarga dinámica del HTML del carrito (AJAX).
