/**
 * Controlador de preloader para Snap Sidebar Cart
 * Maneja la visualización y ocultación de los preloaders
 */
(function($) {
    "use strict";
    
    // Objeto global para el carrito
    window.snap_sidebar_cart = window.snap_sidebar_cart || {};
    
    $(document).ready(function() {
        console.log('Inicializando controlador de preloader');
        
        // Función para mostrar el preloader global
        window.snap_sidebar_cart.showGlobalLoader = function() {
            $('.snap-sidebar-cart__loader').addClass('active').css('display', 'flex');
        };
        
        // Función para ocultar el preloader global
        window.snap_sidebar_cart.hideGlobalLoader = function() {
            $('.snap-sidebar-cart__loader').removeClass('active').hide();
        };
        
        // Función para mostrar el preloader de un producto específico
        window.snap_sidebar_cart.showPreloader = function($product) {
            if (!$product || !$product.length) return;
            
            $product.addClass('updating');
            var $loader = $product.find('.snap-sidebar-cart__product-loader');
            
            if (!$loader.length) {
                $loader = $('<div class="snap-sidebar-cart__product-loader"><div class="snap-sidebar-cart__loader-spinner"></div></div>');
                $product.append($loader);
            }
            
            $loader.css('display', 'flex').addClass('active');
        };
        
        // Función para ocultar el preloader de un producto específico
        window.snap_sidebar_cart.hidePreloader = function($product) {
            if (!$product || !$product.length) return;
            
            $product.removeClass('updating');
            $product.find('.snap-sidebar-cart__product-loader').removeClass('active').hide();
        };
    });
})(jQuery);