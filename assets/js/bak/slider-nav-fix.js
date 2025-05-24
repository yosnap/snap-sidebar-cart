/**
 * Corrección para la navegación del slider
 * Este script se carga al final para garantizar que las flechas del slider funcionen correctamente
 */
(function($) {
    "use strict";
    
    $(document).ready(function() {
        console.log('Inicializando navegación mejorada para slider de productos relacionados');
        
        // Función para actualizar la navegación del slider
        function updateSliderNavigation($track) {
            // Validar que el track exista
            if (!$track.length || !$track[0]) {
                console.warn('Track del slider no válido');
                return;
            }
            
            var maxScrollLeft = $track[0].scrollWidth - $track.outerWidth();
            var currentScrollLeft = $track.scrollLeft();
            
            var $slider = $track.closest(".snap-sidebar-cart__slider");
            var $prevButton = $slider.find(".snap-sidebar-cart__slider-prev");
            var $nextButton = $slider.find(".snap-sidebar-cart__slider-next");
            
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
            
            // Verificar si se necesitan botones de navegación (si hay suficientes productos)
            var $items = $track.children('.snap-sidebar-cart__related-product');
            if ($items.length === 0 || $track[0].scrollWidth <= $track.outerWidth()) {
                $prevButton.hide();
                $nextButton.hide();
            } else {
                $prevButton.show();
                $nextButton.show();
            }
        }
        
        // Inicializar todos los sliders
        function initializeAllSliders() {
            console.log('Inicializando todos los sliders');
            $('.snap-sidebar-cart__slider-track').each(function() {
                var $track = $(this);
                
                // Desvincular eventos anteriores para evitar duplicados
                $track.off('scroll.sliderNav');
                
                // Agregar evento de scroll para actualizar la navegación
                $track.on('scroll.sliderNav', function() {
                    updateSliderNavigation($(this));
                });
                
                // Actualizar navegación inicial
                updateSliderNavigation($track);
                
                // Verificar visibilidad del carousel
                checkCarouselVisibility($track);
            });
        }
        
        // Función para verificar si el carousel tiene suficientes elementos para mostrar navegación
        function checkCarouselVisibility($track) {
            var $items = $track.children('.snap-sidebar-cart__related-product');
            var $slider = $track.closest('.snap-sidebar-cart__slider');
            var $prevButton = $slider.find('.snap-sidebar-cart__slider-prev');
            var $nextButton = $slider.find('.snap-sidebar-cart__slider-next');
            
            // Ocultar navegación si no hay suficientes productos
            if ($items.length === 0) {
                console.log('No hay productos en el slider, ocultando navegación');
                $prevButton.hide();
                $nextButton.hide();
                return;
            }
            
            // Calcular si los elementos ocupan más ancho que el contenedor
            var totalItemsWidth = 0;
            $items.each(function() {
                totalItemsWidth += $(this).outerWidth(true);
            });
            
            var containerWidth = $track.width();
            
            console.log('Ancho total de items:', totalItemsWidth, 'Ancho de contenedor:', containerWidth);
            
            if (totalItemsWidth <= containerWidth) {
                console.log('Los productos caben en el contenedor, ocultando navegación');
                $prevButton.hide();
                $nextButton.hide();
            } else {
                console.log('Se necesita navegación, mostrando flechas');
                $prevButton.show();
                $nextButton.show();
            }
        }
        
        // Re-vincular eventos click de navegación con manejo mejorado de items
        $(document).off('click.sliderPrev', '.snap-sidebar-cart__slider-prev').on('click.sliderPrev', '.snap-sidebar-cart__slider-prev', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Clic en botón anterior del slider');
            
            var $track = $(this).closest('.snap-sidebar-cart__related-container.active').find('.snap-sidebar-cart__slider-track');
            if (!$track.length) {
                console.error('No se encontró el track del slider');
                return;
            }
            
            // Calcular desplazamiento basado en items visibles
            var $item = $track.find('.snap-sidebar-cart__related-product').first();
            if (!$item.length) {
                console.warn('No hay productos para desplazar');
                return;
            }
            
            // Calcular cuántos items son visibles completamente
            var itemWidth = $item.outerWidth(true);
            var visibleItems = Math.floor($track.width() / itemWidth);
            // Usar al menos 1 item o la cantidad visible
            var itemsToScroll = Math.max(1, visibleItems - 1);
            var scrollAmount = itemWidth * itemsToScroll;
            
            console.log('Desplazando slider ' + itemsToScroll + ' items (' + scrollAmount + 'px) a la izquierda');
            $track.stop().animate({
                scrollLeft: $track.scrollLeft() - scrollAmount
            }, 300, function() {
                updateSliderNavigation($track);
            });
        });
        
        $(document).off('click.sliderNext', '.snap-sidebar-cart__slider-next').on('click.sliderNext', '.snap-sidebar-cart__slider-next', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Clic en botón siguiente del slider');
            
            var $track = $(this).closest('.snap-sidebar-cart__related-container.active').find('.snap-sidebar-cart__slider-track');
            if (!$track.length) {
                console.error('No se encontró el track del slider');
                return;
            }
            
            // Calcular desplazamiento basado en items visibles
            var $item = $track.find('.snap-sidebar-cart__related-product').first();
            if (!$item.length) {
                console.warn('No hay productos para desplazar');
                return;
            }
            
            // Calcular cuántos items son visibles completamente
            var itemWidth = $item.outerWidth(true);
            var visibleItems = Math.floor($track.width() / itemWidth);
            // Usar al menos 1 item o la cantidad visible
            var itemsToScroll = Math.max(1, visibleItems - 1);
            var scrollAmount = itemWidth * itemsToScroll;
            
            console.log('Desplazando slider ' + itemsToScroll + ' items (' + scrollAmount + 'px) a la derecha');
            $track.stop().animate({
                scrollLeft: $track.scrollLeft() + scrollAmount
            }, 300, function() {
                updateSliderNavigation($track);
            });
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