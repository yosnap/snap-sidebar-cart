/**
 * Solución inmediata para los problemas con tabs y navegación del slider
 * Este script se ejecuta en línea después de la carga de la página
 */
jQuery(function($) {
    'use strict';

    console.log('Aplicando solución inmediata para las pestañas y navegación');

    // Esperar a que todo el DOM esté disponible
    $(window).on('load', function() {
        setTimeout(function() {
            // 1. Corregir las pestañas
            fixTabs();
            
            // 2. Corregir navegación del slider
            fixSliderNavigation();
            
            console.log('Soluciones aplicadas');
        }, 500);
    });

    // SOLUCIÓN PARA LAS PESTAÑAS
    function fixTabs() {
        console.log('Arreglando las pestañas');
        
        // Eliminar cualquier manejador de eventos existente
        $('.snap-sidebar-cart__related-tab').off('click');
        
        // Añadir manejador de eventos directo con prioridad alta
        $('.snap-sidebar-cart__related-tab').on('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            var $tab = $(this);
            var tabType = $tab.data('tab');
            
            console.log('Pestaña clickeada:', tabType);
            
            // Cambiar las clases activas
            $('.snap-sidebar-cart__related-tab').removeClass('active');
            $tab.addClass('active');
            
            // Mostrar el contenedor correspondiente
            $('.snap-sidebar-cart__related-container').removeClass('active');
            $('.snap-sidebar-cart__related-container[data-content="' + tabType + '"]').addClass('active');
            
            var $targetContainer = $('.snap-sidebar-cart__related-container[data-content="' + tabType + '"] .snap-sidebar-cart__slider-track');
            
            // Si no hay productos y el contenedor está vacío, cargarlos
            if ($targetContainer.length && $targetContainer.children('.snap-sidebar-cart__related-product').length === 0) {
                loadTabProducts(tabType, $targetContainer);
            }
        });
        
        // Activar la primera pestaña si ninguna está activa
        if ($('.snap-sidebar-cart__related-tab.active').length === 0) {
            $('.snap-sidebar-cart__related-tab').first().trigger('click');
        }
    }

    // SOLUCIÓN PARA LA NAVEGACIÓN DEL SLIDER
    function fixSliderNavigation() {
        console.log('Arreglando la navegación del slider');
        
        // Eliminar cualquier manejador de eventos existente
        $('.snap-sidebar-cart__slider-prev, .snap-sidebar-cart__slider-next').off('click');
        
        // Añadir manejador para el botón anterior
        $('.snap-sidebar-cart__slider-prev').on('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('Botón anterior clickeado');
            
            var $button = $(this);
            var $track = $button.siblings('.snap-sidebar-cart__slider-track');
            
            if (!$track.length) {
                console.error('No se encontró el track del slider');
                return;
            }
            
            // Determinar cuántos elementos desplazar
            var slidesToScroll = parseInt(snap_sidebar_cart_params.slides_to_scroll) || 2;
            var $items = $track.find('.snap-sidebar-cart__related-product');
            
            // Si hay items, usamos su ancho para calcular el desplazamiento
            if ($items.length > 0) {
                var itemWidth = $items.first().outerWidth(true);
                var scrollValue = itemWidth * slidesToScroll;
                
                $track.animate({
                    scrollLeft: Math.max(0, $track.scrollLeft() - scrollValue)
                }, 300, function() {
                    updateNavButtonsState($track);
                });
            } else {
                // Fallback si no hay items
                var scrollValue = $track.width() * 0.8;
                $track.animate({
                    scrollLeft: Math.max(0, $track.scrollLeft() - scrollValue)
                }, 300, function() {
                    updateNavButtonsState($track);
                });
            }
        });
        
        // Añadir manejador para el botón siguiente
        $('.snap-sidebar-cart__slider-next').on('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('Botón siguiente clickeado');
            
            var $button = $(this);
            var $track = $button.siblings('.snap-sidebar-cart__slider-track');
            
            if (!$track.length) {
                console.error('No se encontró el track del slider');
                return;
            }
            
            // Calcular el máximo desplazamiento posible
            var maxScroll = $track[0].scrollWidth - $track.width();
            
            // Determinar cuántos elementos desplazar
            var slidesToScroll = parseInt(snap_sidebar_cart_params.slides_to_scroll) || 2;
            var $items = $track.find('.snap-sidebar-cart__related-product');
            
            // Si hay items, usamos su ancho para calcular el desplazamiento
            if ($items.length > 0) {
                var itemWidth = $items.first().outerWidth(true);
                var scrollValue = itemWidth * slidesToScroll;
                
                $track.animate({
                    scrollLeft: Math.min(maxScroll, $track.scrollLeft() + scrollValue)
                }, 300, function() {
                    updateNavButtonsState($track);
                });
            } else {
                // Fallback si no hay items
                var scrollValue = $track.width() * 0.8;
                $track.animate({
                    scrollLeft: Math.min(maxScroll, $track.scrollLeft() + scrollValue)
                }, 300, function() {
                    updateNavButtonsState($track);
                });
            }
        });
        
        // Inicializar el estado de los botones para todos los sliders
        $('.snap-sidebar-cart__slider-track').each(function() {
            updateNavButtonsState($(this));
            
            // Añadir evento scroll para actualizar el estado de los botones
            $(this).off('scroll').on('scroll', function() {
                updateNavButtonsState($(this));
            });
        });
    }
    
    // Actualizar el estado visual de los botones de navegación
    function updateNavButtonsState($track) {
        if (!$track.length || !$track[0]) return;
        
        var $prevButton = $track.siblings('.snap-sidebar-cart__slider-prev');
        var $nextButton = $track.siblings('.snap-sidebar-cart__slider-next');
        
        // Mostrar/ocultar botones según el contenido
        var totalItemsWidth = 0;
        var $items = $track.children('.snap-sidebar-cart__related-product');
        
        if ($items.length === 0) {
            $prevButton.hide();
            $nextButton.hide();
            return;
        }
        
        $items.each(function() {
            totalItemsWidth += $(this).outerWidth(true);
        });
        
        var containerWidth = $track.width();
        
        // Si los elementos caben completamente en el contenedor, ocultar botones
        if (totalItemsWidth <= containerWidth) {
            $prevButton.hide();
            $nextButton.hide();
            return;
        }
        
        // Mostrar botones y actualizar su estado
        $prevButton.show();
        $nextButton.show();
        
        var currentScrollLeft = $track.scrollLeft();
        var maxScrollLeft = $track[0].scrollWidth - $track.width();
        
        // Actualizar estado del botón anterior
        if (currentScrollLeft <= 0) {
            $prevButton.addClass('disabled').css('opacity', '0.5');
        } else {
            $prevButton.removeClass('disabled').css('opacity', '1');
        }
        
        // Actualizar estado del botón siguiente
        if (currentScrollLeft >= maxScrollLeft - 5) {
            $nextButton.addClass('disabled').css('opacity', '0.5');
        } else {
            $nextButton.removeClass('disabled').css('opacity', '1');
        }
    }
    
    // Cargar productos para la pestaña seleccionada
    function loadTabProducts(tabType, $container) {
        console.log('Cargando productos para la pestaña:', tabType);
        
        // Mostrar preloader
        $container.html(
            '<div class="snap-sidebar-cart__loading-products">' +
            '<div class="snap-sidebar-cart__loader-spinner preloader-circle"></div>' +
            '<span>Cargando productos...</span>' +
            '</div>'
        );
        
        // Obtener ID del primer producto en el carrito
        var productId = null;
        $('.snap-sidebar-cart__product').each(function() {
            var pid = $(this).data('product-id');
            if (pid) {
                productId = pid;
                return false; // Salir del bucle
            }
        });
        
        if (!productId) {
            $container.html('<div class="snap-sidebar-cart__no-products">No hay productos en el carrito para mostrar recomendaciones.</div>');
            return;
        }
        
        // Cargar productos vía AJAX
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
                if (response.success && response.data && response.data.html && response.data.html.trim() !== '') {
                    $container.html(response.data.html);
                    
                    // Verificar si es necesario mostrar navegación
                    setTimeout(function() {
                        updateNavButtonsState($container);
                    }, 100);
                } else {
                    // Intentar con otro producto si está disponible
                    tryNextProduct(tabType, $container, [productId]);
                }
            },
            error: function() {
                tryNextProduct(tabType, $container, [productId]);
            }
        });
    }
    
    // Intentar con otro producto si el primero no devuelve resultados
    function tryNextProduct(tabType, $container, triedProductIds) {
        // Buscar otro producto que no se haya intentado
        var nextProductId = null;
        
        $('.snap-sidebar-cart__product').each(function() {
            var pid = $(this).data('product-id');
            if (pid && triedProductIds.indexOf(pid) === -1) {
                nextProductId = pid;
                return false; // Salir del bucle
            }
        });
        
        if (nextProductId) {
            // Intentar con este nuevo producto
            $.ajax({
                type: 'POST',
                url: snap_sidebar_cart_params.ajax_url,
                data: {
                    action: 'snap_sidebar_cart_get_related',
                    nonce: snap_sidebar_cart_params.nonce,
                    product_id: nextProductId,
                    type: tabType
                },
                success: function(response) {
                    if (response.success && response.data && response.data.html && response.data.html.trim() !== '') {
                        $container.html(response.data.html);
                        setTimeout(function() {
                            updateNavButtonsState($container);
                        }, 100);
                    } else {
                        // Añadir este producto a los intentados
                        triedProductIds.push(nextProductId);
                        
                        // Si quedan productos por probar, intentar con el siguiente
                        if (triedProductIds.length < $('.snap-sidebar-cart__product').length) {
                            tryNextProduct(tabType, $container, triedProductIds);
                        } else {
                            $container.html('<div class="snap-sidebar-cart__no-products">No se encontraron productos relacionados para esta categoría.</div>');
                        }
                    }
                },
                error: function() {
                    $container.html('<div class="snap-sidebar-cart__no-products">Error al cargar productos. Por favor, inténtalo más tarde.</div>');
                }
            });
        } else {
            $container.html('<div class="snap-sidebar-cart__no-products">No se encontraron productos relacionados para esta categoría.</div>');
        }
    }
    
    // También aplicar estas correcciones cuando se actualiza el carrito
    $(document.body).on('snap_sidebar_cart_updated', function(e, data) {
        setTimeout(function() {
            fixSliderNavigation();
        }, 300);
    });
    
    // Ejecutar inmediatamente las correcciones
    setTimeout(function() {
        fixTabs();
        fixSliderNavigation();
    }, 500);
});
