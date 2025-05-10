/**
 * Controlador directo de preloader para Snap Sidebar Cart
 * Este archivo implementa una solución directa para mostrar el preloader
 * durante las actualizaciones de cantidad sin interferir con la funcionalidad existente
 */
jQuery(function($) {
    "use strict";
    
    // Función para mostrar el preloader directamente en el DOM
    function showPreloaderDirectly(productKey) {
        // Buscar el producto por su clave
        var $product = $('[data-key="' + productKey + '"]');
        if (!$product.length) return;
        
        // Crear o actualizar el preloader
        var $loader = $product.find('.snap-sidebar-cart__product-loader');
        if (!$loader.length) {
            $loader = $('<div class="snap-sidebar-cart__product-loader"><div class="snap-sidebar-cart__loader-spinner"></div></div>');
            $product.append($loader);
        }
        
        // Configurar el tipo de preloader
        var preloaderType = 'circle';
        var $spinner = $loader.find('.snap-sidebar-cart__loader-spinner');
        $spinner.attr('class', 'snap-sidebar-cart__loader-spinner preloader-' + preloaderType);
        
        // Mostrar el preloader inmediatamente
        $loader.show();
    }
    
    // Función para ocultar el preloader
    function hidePreloaderDirectly(productKey) {
        var $product = $('[data-key="' + productKey + '"]');
        if (!$product.length) return;
        
        var $loader = $product.find('.snap-sidebar-cart__product-loader');
        if ($loader.length) {
            $loader.hide();
        }
    }
    
    // Interceptar directamente los eventos AJAX de actualización de cantidad
    $(document).ajaxSend(function(event, jqXHR, settings) {
        // Verificar si es una solicitud de actualización de carrito
        if (settings.data && settings.data.indexOf('snap_sidebar_cart_update') > -1) {
            // Extraer la clave del producto de los datos de la solicitud
            var match = settings.data.match(/cart_item_key=([^&]+)/);
            if (match && match[1]) {
                var cartItemKey = decodeURIComponent(match[1]);
                showPreloaderDirectly(cartItemKey);
            }
        }
    });
    
    // Interceptar la finalización de las solicitudes AJAX
    $(document).ajaxComplete(function(event, jqXHR, settings) {
        // Verificar si es una solicitud de actualización de carrito
        if (settings.data && settings.data.indexOf('snap_sidebar_cart_update') > -1) {
            // Extraer la clave del producto de los datos de la solicitud
            var match = settings.data.match(/cart_item_key=([^&]+)/);
            if (match && match[1]) {
                var cartItemKey = decodeURIComponent(match[1]);
                hidePreloaderDirectly(cartItemKey);
            }
        }
    });
    
    // Interceptar los eventos de actualización de WooCommerce
    $(document.body).on('updated_cart_totals updated_checkout wc_fragments_refreshed', function() {
        $('.snap-sidebar-cart__product-loader').hide();
    });
});