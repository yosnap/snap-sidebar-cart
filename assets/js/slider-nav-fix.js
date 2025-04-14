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
            
            // Obtener productos para esta pestaña si el contenedor está vacío
            var $targetContainer = $('.snap-sidebar-cart__related-container[data-content="' + tabType + '"] .snap-sidebar-cart__slider-track');
            
            if ($targetContainer.length && $targetContainer.children().length === 0) {
                // Mostrar loader mientras cargamos
                $targetContainer.html(
                    '<div class="snap-sidebar-cart__loading-products">' +
                    '<div class="snap-sidebar-cart__loader-spinner preloader-circle"></div>' +
                    '<span>Cargando productos...</span>' +
                    '</div>'
                );
                
                // Obtener todos los productos del carrito
                var productIds = [];
                $('.snap-sidebar-cart__product').each(function() {
                    var productId = $(this).data('product-id');
                    if (productId) {
                        productIds.push(productId);
                    }
                });
                
                if (productIds.length > 0) {
                    // Usar el primer producto como referencia
                    var productId = productIds[0];
                    
                    // Hacer la solicitud AJAX para cargar los productos relacionados
                    $.ajax({
                        type: 'POST',
                        url: snap_sidebar_cart_params.ajax_url,
                        data: {
                            action: 'snap_sidebar_cart_get_related',
                            nonce: snap_sidebar_cart_params.nonce,
                            product_id: productId,
                            type: tabType
                        },
                        success: function(response) {
                            if (response.success && response.data && response.data.html) {
                                $targetContainer.html(response.data.html);
                            } else {
                                $targetContainer.html('<div class="snap-sidebar-cart__no-products">No se encontraron productos.</div>');
                            }
                            
                            // Inicializar navegación
                            initializeAllSliders();
                        },
                        error: function() {
                            $targetContainer.html('<div class="snap-sidebar-cart__no-products">Error al cargar productos.</div>');
                        }
                    });
                } else {
                    $targetContainer.html('<div class="snap-sidebar-cart__no-products">No hay productos en el carrito.</div>');
                }
            } else {
                // Solo inicializar sliders si ya hay contenido
                setTimeout(function() {
                    initializeAllSliders();
                }, 100);
            }
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
