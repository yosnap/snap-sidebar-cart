/**
 * Soluciones inmediatas para tabs y slider en Snap Sidebar Cart
 */
(function($) {
    "use strict";
    
    $(document).ready(function() {
        console.log('Inicializando soluciones inmediatas para tabs y slider');
        
        // Aplicar solución directa para las pestañas
        $(document).on('click', '.snap-sidebar-cart__related-tab', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            var tabType = $(this).data('tab');
            console.log('Click en pestaña:', tabType);
            
            // Actualizar UI
            $('.snap-sidebar-cart__related-tab').removeClass('active');
            $(this).addClass('active');
            
            $('.snap-sidebar-cart__related-container').removeClass('active');
            $('.snap-sidebar-cart__related-container[data-content="' + tabType + '"]').addClass('active');
            
            // Intentar encontrar el contenedor del slider
            var $container = $('#snap-sidebar-cart-related-' + tabType);
            
            // Si no encontramos el contenedor por ID, intentamos buscarlo por el atributo data-content
            if (!$container.length) {
                $container = $('.snap-sidebar-cart__related-container[data-content="' + tabType + '"]').find('.snap-sidebar-cart__related-slider-container');
                if (!$container.length) {
                    console.log('No se pudo encontrar el contenedor para la pestaña:', tabType);
                    return;
                }
            }
            
            // Buscar el slider dentro del contenedor
            var $slider = $container.find('.snap-sidebar-cart__related-slider');
            if (!$slider.length) {
                console.log('No se pudo encontrar el slider dentro del contenedor');
                return;
            }
            
            // Comprobar si hay slides y si necesitamos cargar productos
            var $slides = $slider.children();
            if (!$slides.length || $slides.first().hasClass('snap-sidebar-cart__loading-products') || $slides.first().hasClass('snap-sidebar-cart__no-products')) {
                // Obtener el primer producto del carrito
                var firstProduct = $('.snap-sidebar-cart__product').first();
                if (firstProduct.length) {
                    var productId = firstProduct.data('product-id');
                    if (productId && window.snap_sidebar_cart && typeof window.snap_sidebar_cart.loadRelatedProducts === 'function') {
                        window.snap_sidebar_cart.loadRelatedProducts(productId, tabType);
                    }
                }
            }
        });
        
        // Aplicar solución directa para los botones de navegación
        $(document).on('click', '.snap-sidebar-cart__slider-prev', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            var $track = $(this).siblings('.snap-sidebar-cart__slider-track');
            if (!$track.length) return;
            
            $track.animate({
                scrollLeft: Math.max(0, $track.scrollLeft() - $track.width() * 0.8)
            }, 300);
        });
        
        $(document).on('click', '.snap-sidebar-cart__slider-next', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            var $track = $(this).siblings('.snap-sidebar-cart__slider-track');
            if (!$track.length) return;
            
            var maxScroll = $track[0].scrollWidth - $track.width();
            $track.animate({
                scrollLeft: Math.min(maxScroll, $track.scrollLeft() + $track.width() * 0.8)
            }, 300);
        });
    });
})(jQuery);