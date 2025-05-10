/**
 * Controlador de pestañas para productos relacionados
 * Este archivo gestiona la navegación entre pestañas y la carga de productos relacionados
 */
(function($) {
    "use strict";

    $(document).ready(function() {
        // Aplicar solución directa para las pestañas
        $(document).on('click', '.snap-sidebar-cart__related-tab', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            var tabType = $(this).data('tab');
            
            // Actualizar UI
            $('.snap-sidebar-cart__related-tab').removeClass('active');
            $(this).addClass('active');
            
            $('.snap-sidebar-cart__related-container').removeClass('active');
            var $activeContainer = $('.snap-sidebar-cart__related-container[data-content="' + tabType + '"]');
            $activeContainer.addClass('active');
            
            // Mostrar preloader en el contenedor activo
            if (window.snap_sidebar_cart && typeof window.snap_sidebar_cart.showPreloader === 'function') {
                window.snap_sidebar_cart.showPreloader($activeContainer);
            }
            
            // Intentar encontrar el contenedor del slider
            var $container = $('#snap-sidebar-cart-related-' + tabType);
            
            // Si no encontramos el contenedor por ID, intentamos buscarlo por el atributo data-content
            if (!$container || !$container.length) {
                $container = $activeContainer.find('.snap-sidebar-cart__related-slider-container');
                if (!$container || !$container.length) {
                    // Ocultar preloader si no se encuentra el contenedor
                    if (window.snap_sidebar_cart && typeof window.snap_sidebar_cart.hidePreloader === 'function') {
                        window.snap_sidebar_cart.hidePreloader($activeContainer);
                    }
                    return;
                }
            }
            
            // Buscar el slider dentro del contenedor
            var $slider = $container.find('.snap-sidebar-cart__related-slider');
            if (!$slider || !$slider.length) {
                // Ocultar preloader si no se encuentra el slider
                if (window.snap_sidebar_cart && typeof window.snap_sidebar_cart.hidePreloader === 'function') {
                    window.snap_sidebar_cart.hidePreloader($activeContainer);
                }
                return;
            }
            
            // Comprobar si hay slides y si necesitamos cargar productos
            var $slides = $slider.children();
            if (!$slides || !$slides.length || ($slides.first() && $slides.first().hasClass('snap-sidebar-cart__loading-products')) || ($slides.first() && $slides.first().hasClass('snap-sidebar-cart__no-products'))) {
                // Obtener el primer producto del carrito
                var $firstProduct = $('.snap-sidebar-cart__product').first();
                if ($firstProduct && $firstProduct.length) {
                    var productId = $firstProduct.data('product-id');
                    if (productId && window.snap_sidebar_cart && typeof window.snap_sidebar_cart.loadRelatedProducts === 'function') {
                        window.snap_sidebar_cart.loadRelatedProducts(productId, tabType);
                        
                        // El preloader se ocultará cuando los productos se carguen completamente
                        // Esto se maneja en la respuesta AJAX de loadRelatedProducts
                    }
                }
            } else {
                // Si ya hay slides, ocultamos el preloader después de un breve retraso
                setTimeout(function() {
                    var $activeContainer = $('.snap-sidebar-cart__related-container[data-content="' + tabType + '"]');
                    if (window.snap_sidebar_cart && typeof window.snap_sidebar_cart.hidePreloader === 'function') {
                        window.snap_sidebar_cart.hidePreloader($activeContainer);
                    }
                }, 500);
            }
        });
        
        // Aplicar solución directa para los botones de navegación
        $(document).on('click', '.snap-sidebar-cart__slider-prev', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            var $track = $(this).siblings('.snap-sidebar-cart__slider-track');
            if (!$track || !$track.length) return;
            
            $track.animate({
                scrollLeft: Math.max(0, $track.scrollLeft() - $track.width() * 0.8)
            }, 300);
        });
        
        $(document).on('click', '.snap-sidebar-cart__slider-next', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            var $track = $(this).siblings('.snap-sidebar-cart__slider-track');
            if (!$track || !$track.length) return;
            
            var maxScroll = $track[0].scrollWidth - $track.width();
            
            $track.animate({
                scrollLeft: Math.min(maxScroll, $track.scrollLeft() + $track.width() * 0.8)
            }, 300);
        });
        
        // Aplicar solución directa para los botones de navegación en scroll-snap
        $(document).on('click', '.snap-sidebar-cart__related-prev', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            var $slider = $(this).closest('.snap-sidebar-cart__related-slider-container').find('.snap-sidebar-cart__related-slider');
            if (!$slider || !$slider.length) return;
            
            $slider.animate({
                scrollLeft: Math.max(0, $slider.scrollLeft() - $slider.width() * 0.8)
            }, 300);
        });
        
        $(document).on('click', '.snap-sidebar-cart__related-next', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            var $slider = $(this).closest('.snap-sidebar-cart__related-slider-container').find('.snap-sidebar-cart__related-slider');
            if (!$slider || !$slider.length) return;
            
            var maxScroll = $slider[0].scrollWidth - $slider.width();
            
            $slider.animate({
                scrollLeft: Math.min(maxScroll, $slider.scrollLeft() + $slider.width() * 0.8)
            }, 300);
        });
    });

})(jQuery);