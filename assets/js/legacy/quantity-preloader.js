/**
 * Controlador específico para el preloader en cambios de cantidad
 * Este archivo SOLO se encarga de mostrar el preloader visual sin interferir con la lógica de actualización
 */
(function($) {
    "use strict";

    $(document).ready(function() {
        console.log('Inicializando controlador visual de preloader para cambios de cantidad');
        
        // Función para mostrar el preloader en un producto específico
        function showProductPreloader($product) {
            if (!$product || !$product.length) return;
            
            // Obtener o crear el elemento del preloader
            var $loader = $product.find('.snap-sidebar-cart__product-loader');
            
            if (!$loader.length) {
                $loader = $('<div class="snap-sidebar-cart__product-loader"><div class="snap-sidebar-cart__loader-spinner"></div></div>');
                $product.append($loader);
            }
            
            // Configurar el tipo de preloader
            var preloaderType = 'circle';
            if (typeof snap_sidebar_cart_params !== 'undefined' && snap_sidebar_cart_params.preloader) {
                preloaderType = snap_sidebar_cart_params.preloader.type || 'circle';
            }
            
            var $spinner = $loader.find('.snap-sidebar-cart__loader-spinner');
            $spinner.attr('class', 'snap-sidebar-cart__loader-spinner preloader-' + preloaderType);
            
            // Para preloader de tipo dots
            if (preloaderType === 'dots' && $spinner.children().length === 0) {
                $spinner.html('<span></span><span></span><span></span>');
            }
            
            // Asegurarse de que el preloader sea visible y permanezca así hasta que la actualización se complete
            $loader.addClass('active').css({
                'display': 'flex !important',
                'opacity': '1 !important',
                'visibility': 'visible !important',
                'z-index': '9999 !important'
            });
            
            // Marcar el producto como actualizándose
            $product.addClass('updating');
        }
        
        // Solo interceptamos los eventos de clic en los botones de cantidad para mostrar el preloader
        // No interferimos con la lógica de actualización existente
        $(document).on('click', '.notabutton.quantity-up, .notabutton.quantity-down', function() {
            var $button = $(this);
            var $product = $button.closest('.snap-sidebar-cart__product');
            showProductPreloader($product);
        });
        
        // También mostramos el preloader cuando se cambia manualmente el valor del input
        $(document).on('change', '.cart-item__quantity-input', function() {
            var $input = $(this);
            var $product = $input.closest('.snap-sidebar-cart__product');
            showProductPreloader($product);
        });
    });
})(jQuery);