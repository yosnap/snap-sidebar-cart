/**
 * Controlador del preloader para Snap Sidebar Cart
 * Este archivo gestiona la visualización del preloader en diferentes situaciones
 */
(function($) {
    "use strict";

    // Objeto global para el preloader
    window.snap_sidebar_cart = window.snap_sidebar_cart || {};
    
    // Función para mostrar el preloader en un contenedor específico
    window.snap_sidebar_cart.showPreloader = function(container) {
        if (!container || !container.length) {
            console.error('No se pudo encontrar el contenedor para mostrar el preloader');
            return;
        }
        
        console.log('Mostrando preloader en contenedor:', container);
        
        // Verificar si ya existe un preloader
        var $loader = container.find('.snap-sidebar-cart__product-loader');
        
        // Si no existe, creamos uno
        if (!$loader.length) {
            console.log('Creando nuevo preloader');
            $loader = $('<div class="snap-sidebar-cart__product-loader"><div class="snap-sidebar-cart__loader-spinner"></div></div>');
            container.append($loader);
        } else {
            console.log('Usando preloader existente');
        }
        
        // Aplicar el tipo de preloader configurado
        var preloaderType = 'circle';
        if (typeof snap_sidebar_cart_params !== 'undefined' && snap_sidebar_cart_params.preloader) {
            preloaderType = snap_sidebar_cart_params.preloader.type || 'circle';
        }
        
        var $spinner = $loader.find('.snap-sidebar-cart__loader-spinner');
        $spinner.attr('class', 'snap-sidebar-cart__loader-spinner preloader-' + preloaderType);
        
        // Si el preloader es de tipo dots, añadir los elementos necesarios
        if (preloaderType === 'dots') {
            if ($spinner.children().length === 0) {
                $spinner.append('<span></span><span></span><span></span>');
            }
        }
        
        // Asegurarse de que el preloader sea visible con estilos importantes
        $loader.css({
            'display': 'flex !important',
            'opacity': '1 !important',
            'visibility': 'visible !important',
            'z-index': '9999 !important'
        });
        
        console.log('Estado del preloader después de mostrar:', $loader.css('display'));
        
        return $loader;
    };
    
    // Función para ocultar el preloader
    window.snap_sidebar_cart.hidePreloader = function(container) {
        if (!container || !container.length) return;
        
        var $loader = container.find('.snap-sidebar-cart__product-loader');
        if ($loader.length) {
            $loader.css('display', 'none');
        }
    };
    
    // Función para mostrar el preloader en todo el carrito
    window.snap_sidebar_cart.showCartPreloader = function() {
        var $cart = $('.snap-sidebar-cart__body');
        return window.snap_sidebar_cart.showPreloader($cart);
    };
    
    // Función para ocultar el preloader del carrito
    window.snap_sidebar_cart.hideCartPreloader = function() {
        var $cart = $('.snap-sidebar-cart__body');
        window.snap_sidebar_cart.hidePreloader($cart);
    };
    
    $(document).ready(function() {
        console.log('Inicializando controlador de preloader');
    });
    
})(jQuery);