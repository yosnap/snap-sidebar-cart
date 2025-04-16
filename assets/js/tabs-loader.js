/**
 * Script específico para cargar las pestañas al inicializar el carrito
 * Este script se carga al final para garantizar que las pestañas funcionen correctamente
 */
(function($) {
    "use strict";
    
    $(document).ready(function() {
        console.log('Inicializando cargador de pestañas...');
        
        // Iniciar carga retrasada para asegurar que todo el DOM esté disponible
        setTimeout(function() {
            console.log('Forzando inicialización de pestañas...');
            
            // Cargar la primera pestaña activa o la primera disponible
            var $activeTab = $('.snap-sidebar-cart__related-tab.active');
            if (!$activeTab.length) {
                $activeTab = $('.snap-sidebar-cart__related-tab').first();
            }
            
            if ($activeTab.length) {
                console.log('Forzando click en pestaña:', $activeTab.text(), 'tipo:', $activeTab.data('tab'));
                
                // Aplicar evento click directamente
                $activeTab.click();
                
                // También intentar trigger directo si el click no funciona
                setTimeout(function() {
                    $activeTab.trigger('click');
                }, 300);
            } else {
                console.log('No se encontraron pestañas para activar');
            }
            
            // Inicializar eventos de navegación para sliders
            $('.snap-sidebar-cart__slider-prev, .snap-sidebar-cart__slider-next').on('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                console.log('Click directo en botón de navegación:', $(this).hasClass('snap-sidebar-cart__slider-prev') ? 'ANTERIOR' : 'SIGUIENTE');
                
                var isNext = $(this).hasClass('snap-sidebar-cart__slider-next');
                var $track = $(this).siblings('.snap-sidebar-cart__slider-track');
                
                if (!$track.length) {
                    console.error('No se encontró el track del slider');
                    return;
                }
                
                // Calcular desplazamiento basado en items visibles
                var $items = $track.find('.snap-sidebar-cart__related-product');
                if ($items.length === 0) {
                    console.warn('No hay productos para desplazar');
                    return;
                }
                
                // Calcular cuántos items son visibles completamente
                var itemWidth = $items.first().outerWidth(true) || 150; // Valor por defecto si no se puede calcular
                var visibleItems = Math.floor($track.width() / itemWidth);
                // Usar al menos 1 item o la cantidad visible
                var itemsToScroll = Math.max(1, visibleItems - 1);
                var scrollAmount = itemWidth * itemsToScroll;
                
                console.log('Desplazando slider ' + itemsToScroll + ' items (' + scrollAmount + 'px) ' + 
                          (isNext ? 'a la derecha' : 'a la izquierda'));
                
                $track.stop().animate({
                    scrollLeft: $track.scrollLeft() + (isNext ? scrollAmount : -scrollAmount)
                }, 300);
            });
        }, 800);
    });
    
    // También inicializar cuando se abre el carrito
    $(document).on('click', function(e) {
        // Si se hace click en algún selector que abre el carrito
        if ($(e.target).is(snap_sidebar_cart_params.activation_selectors) || 
            $(e.target).closest(snap_sidebar_cart_params.activation_selectors).length) {
            
            console.log('Se detectó click en activador del carrito');
            
            // Esperar a que se abra el carrito
            setTimeout(function() {
                if ($('.snap-sidebar-cart').hasClass('active')) {
                    console.log('Carrito activado - inicializando pestañas');
                    
                    // Activar la primera pestaña
                    var $activeTab = $('.snap-sidebar-cart__related-tab.active');
                    if (!$activeTab.length) {
                        $activeTab = $('.snap-sidebar-cart__related-tab').first();
                    }
                    
                    if ($activeTab.length) {
                        $activeTab.click();
                    }
                }
            }, 500);
        }
    });
})(jQuery);
