/**
 * Manejador de solicitudes CORS para Snap Sidebar Cart
 * Este archivo proporciona soluciones para problemas de CORS en entornos de desarrollo local
 */
(function($) {
    "use strict";

    // Objeto global para el manejador CORS
    window.snap_sidebar_cart = window.snap_sidebar_cart || {};
    
    // Función para realizar solicitudes AJAX seguras
    window.snap_sidebar_cart.safeAjax = function(options) {
        // Opciones por defecto
        var defaults = {
            type: 'POST',
            url: snap_sidebar_cart_params.ajax_url,
            data: {},
            dataType: 'json',
            cache: false,
            success: function() {},
            error: function() {},
            complete: function() {}
        };
        
        // Combinar opciones
        var settings = $.extend({}, defaults, options);
        
        // Verificar si es una URL externa
        var isExternalUrl = settings.url.indexOf(window.location.hostname) === -1;
        
        // Si es una URL externa y estamos en desarrollo local, usar un proxy o método alternativo
        if (isExternalUrl && window.location.hostname.indexOf('local') !== -1) {
            console.log('Detectada solicitud externa en entorno local:', settings.url);
            
            // Usar el endpoint de AJAX de WordPress como proxy
            var originalUrl = settings.url;
            settings.url = snap_sidebar_cart_params.ajax_url;
            settings.data.action = 'snap_sidebar_cart_proxy_request';
            settings.data.target_url = originalUrl;
            
            console.log('Redirigiendo solicitud a través del proxy de WordPress');
        }
        
        // Realizar la solicitud AJAX
        return $.ajax(settings);
    };
    
    // Sobrescribir métodos problemáticos para usar nuestra versión segura
    $(document).ready(function() {
        // Guardar una referencia al método original de carga de productos relacionados
        if (window.snap_sidebar_cart.loadRelatedProducts) {
            var originalLoadRelated = window.snap_sidebar_cart.loadRelatedProducts;
            
            // Sobrescribir con nuestra versión segura
            window.snap_sidebar_cart.loadRelatedProducts = function(productId, type) {
                console.log('Usando método seguro para cargar productos relacionados');
                
                // Mostrar un indicador de carga
                var $container = $('.snap-sidebar-cart__related-container[data-content="' + type + '"]');
                var $slider = $container.find('.snap-sidebar-cart__related-slider');
                
                if (!$slider.children().length) {
                    $slider.html('<div class="snap-sidebar-cart__loading-products">Cargando productos...</div>');
                }
                
                // Usar el método seguro para la solicitud AJAX
                window.snap_sidebar_cart.safeAjax({
                    data: {
                        action: 'snap_sidebar_cart_get_related',
                        nonce: snap_sidebar_cart_params.nonce,
                        product_id: productId,
                        type: type
                    },
                    success: function(response) {
                        if (response.success) {
                            $slider.html(response.data.html);
                            
                            // Inicializar el slider después de cargar los productos
                            setTimeout(function() {
                                if (typeof initRelatedProductsSlider === 'function') {
                                    initRelatedProductsSlider($container);
                                }
                            }, 100);
                        } else {
                            $slider.html('<div class="snap-sidebar-cart__no-products">No se encontraron productos relacionados</div>');
                        }
                    },
                    error: function() {
                        $slider.html('<div class="snap-sidebar-cart__no-products">Error al cargar productos</div>');
                    }
                });
            };
        }
    });
    
})(jQuery);