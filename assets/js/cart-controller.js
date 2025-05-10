/**
 * Controlador del carrito lateral
 * Este archivo gestiona la apertura, cierre y comportamiento del carrito lateral
 */
(function($) {
    "use strict";

    $(document).ready(function() {
        console.log('Inicializando corrección para apertura del carrito lateral');
        
        // Función para abrir el carrito lateral
        function openSidebar() {
            console.log('Abriendo carrito lateral (desde cart-controller.js)');
            $('.snap-sidebar-cart').addClass('open');
            $('.snap-sidebar-cart__overlay').css('display', 'block');
            $('body').addClass('snap-sidebar-cart-open');
            
            // Cargar productos relacionados si es necesario
            var $activeContainer = $('.snap-sidebar-cart__related-container.active');
            if ($activeContainer.length) {
                var tabType = $activeContainer.data('content');
                var $slider = $activeContainer.find('.snap-sidebar-cart__related-slider');
                
                if ($slider.length && $slider.children().length === 0) {
                    var $firstProduct = $('.snap-sidebar-cart__product').first();
                    if ($firstProduct.length) {
                        var productId = $firstProduct.data('product-id');
                        if (productId && window.snap_sidebar_cart && typeof window.snap_sidebar_cart.loadRelatedProducts === 'function') {
                            window.snap_sidebar_cart.loadRelatedProducts(productId, tabType);
                        }
                    }
                }
            }
        }
        
        // Restaurar el evento de clic en los activadores del carrito
        if (snap_sidebar_cart_params && snap_sidebar_cart_params.activation_selectors) {
            console.log('Configurando evento de clic para selectores:', snap_sidebar_cart_params.activation_selectors);
            
            $(document).on('click', snap_sidebar_cart_params.activation_selectors, function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Clic en activador del carrito detectado');
                openSidebar();
            });
        }
        
        // Restaurar apertura automática cuando se añade un producto al carrito
        $(document.body).on('added_to_cart', function(event, fragments, cart_hash, $button) {
            console.log('Evento added_to_cart detectado');
            
            // Mostrar preloader en el carrito
            if (window.snap_sidebar_cart && typeof window.snap_sidebar_cart.showCartPreloader === 'function') {
                window.snap_sidebar_cart.showCartPreloader();
            }
            
            if (snap_sidebar_cart_params && 
                (snap_sidebar_cart_params.auto_open === '1' || 
                 snap_sidebar_cart_params.auto_open === true)) {
                console.log('Auto-apertura activada, abriendo carrito');
                openSidebar();
            }
            
            // Ocultar el preloader después de un breve retraso
            setTimeout(function() {
                if (window.snap_sidebar_cart && typeof window.snap_sidebar_cart.hideCartPreloader === 'function') {
                    window.snap_sidebar_cart.hideCartPreloader();
                }
            }, 800);
        });
        
        // Cerrar el carrito lateral
        $(document).on('click', '.snap-sidebar-cart__close, .snap-sidebar-cart__overlay', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Cerrando carrito lateral');
            $('.snap-sidebar-cart').removeClass('open');
            $('.snap-sidebar-cart__overlay').css('display', 'none');
            $('body').removeClass('snap-sidebar-cart-open');
        });
        
        // Cerrar con la tecla Escape
        $(document).on('keyup', function(e) {
            if (e.key === 'Escape' && $('.snap-sidebar-cart').hasClass('open')) {
                $('.snap-sidebar-cart').removeClass('open');
                $('.snap-sidebar-cart__overlay').css('display', 'none');
                $('body').removeClass('snap-sidebar-cart-open');
            }
        });
    });
})(jQuery);