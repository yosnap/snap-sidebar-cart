/**
 * Corrección para la navegación del slider
 * Este script se carga al final para garantizar que las flechas del slider funcionen correctamente
 */
(function($) {
    "use strict";
    
    $(document).ready(function() {
        console.log('Inicializando fix de navegación para slider de productos relacionados');
        
        // Función para actualizar la navegación del slider
        function updateSliderNavigation($track) {
            var maxScrollLeft = $track[0].scrollWidth - $track.outerWidth();
            var currentScrollLeft = $track.scrollLeft();
            
            var $prevButton = $track.siblings(".snap-sidebar-cart__slider-prev");
            var $nextButton = $track.siblings(".snap-sidebar-cart__slider-next");
            
            // Mostrar u ocultar botones según la posición del scroll
            if (currentScrollLeft <= 0) {
                $prevButton.addClass('disabled').css('opacity', '0.5');
            } else {
                $prevButton.removeClass('disabled').css('opacity', '1');
            }
            
            if (currentScrollLeft >= maxScrollLeft - 5) { // 5px de margen para evitar problemas de redondeo
                $nextButton.addClass('disabled').css('opacity', '0.5');
            } else {
                $nextButton.removeClass('disabled').css('opacity', '1');
            }
        }
        
        // Inicializar todos los sliders
        function initializeAllSliders() {
            console.log('Inicializando todos los sliders');
            $('.snap-sidebar-cart__slider-track').each(function() {
                var $track = $(this);
                updateSliderNavigation($track);
                
                // Agregar evento de scroll para actualizar la navegación
                $track.off('scroll').on('scroll', function() {
                    updateSliderNavigation($(this));
                });
            });
        }
        
        // Re-vincular eventos click de navegación
        $(document).off('click', '.snap-sidebar-cart__slider-prev').on('click', '.snap-sidebar-cart__slider-prev', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Clic en botón anterior del slider');
            
            var $track = $(this).siblings('.snap-sidebar-cart__slider-track');
            if (!$track.length) {
                console.error('No se encontró el track del slider');
                return;
            }
            
            // Calcular desplazamiento - mover por items, no por ancho
            var $item = $track.find('.snap-sidebar-cart__related-product').first();
            var itemWidth = $item.length ? $item.outerWidth(true) : 0;
            var scrollAmount = itemWidth > 0 ? itemWidth : $track.width() * 0.5;
            
            console.log('Desplazando slider: ' + scrollAmount + 'px a la izquierda');
            $track.stop().animate({
                scrollLeft: $track.scrollLeft() - scrollAmount
            }, 300, function() {
                updateSliderNavigation($track);
            });
        });
        
        $(document).off('click', '.snap-sidebar-cart__slider-next').on('click', '.snap-sidebar-cart__slider-next', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Clic en botón siguiente del slider');
            
            var $track = $(this).siblings('.snap-sidebar-cart__slider-track');
            if (!$track.length) {
                console.error('No se encontró el track del slider');
                return;
            }
            
            // Calcular desplazamiento - mover por items, no por ancho
            var $item = $track.find('.snap-sidebar-cart__related-product').first();
            var itemWidth = $item.length ? $item.outerWidth(true) : 0;
            var scrollAmount = itemWidth > 0 ? itemWidth : $track.width() * 0.5;
            
            console.log('Desplazando slider: ' + scrollAmount + 'px a la derecha');
            $track.stop().animate({
                scrollLeft: $track.scrollLeft() + scrollAmount
            }, 300, function() {
                updateSliderNavigation($track);
            });
        });
        
        // Re-vincular eventos para cambiar de pestaña
        $(document).off('click', '.snap-sidebar-cart__related-tab').on('click', '.snap-sidebar-cart__related-tab', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            var $tab = $(this);
            var tabType = $tab.data('tab');
            
            console.log('Cambiando a pestaña:', tabType);
            
            // Actualizar UI
            $('.snap-sidebar-cart__related-tab').removeClass('active');
            $tab.addClass('active');
            
            $('.snap-sidebar-cart__related-container').removeClass('active');
            $('.snap-sidebar-cart__related-container[data-content="' + tabType + '"]').addClass('active');
            
            // Inicializar slider para esta pestaña
            setTimeout(function() {
                initializeAllSliders();
            }, 100);
        });
        
        // Inicializar sliders al cargar
        initializeAllSliders();
        
        // Reinicializar sliders cuando se actualiza el carrito
        $(document.body).on('snap_sidebar_cart_updated', function() {
            console.log('Evento de actualización de carrito detectado - reinicializando sliders');
            setTimeout(function() {
                initializeAllSliders();
            }, 300);
        });
        
        // Volver a inicializar cuando se abre el carrito
        $(document).on('click', snap_sidebar_cart_params.activation_selectors, function() {
            console.log('Carrito abierto - reinicializando sliders');
            setTimeout(function() {
                initializeAllSliders();
            }, 500);
        });
    });
    
})(jQuery);
