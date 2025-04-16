/**
 * Fix directo para los problemas de tabs y navegación del slider
 * Este script anula cualquier otro manejador de eventos y aplica soluciones directas
 */
jQuery(document).ready(function($) {
    console.log('Direct Fix cargado - Solucionando tabs y navegación');
    
    // Solución inmediata - Retrasar para asegurar que el DOM esté completamente cargado
    setTimeout(function() {
        fixTabs();
        fixSliderNavigation();
    }, 500);
    
    /**
     * Arreglar las pestañas de productos relacionados
     */
    function fixTabs() {
        console.log('Aplicando fix para tabs');
        
        // Quitar todos los handlers de click existentes
        $('.snap-sidebar-cart__related-tab').off('click');
        
        // Aplicar nuevos handlers
        $('.snap-sidebar-cart__related-tab').on('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            var $clickedTab = $(this);
            var tabType = $clickedTab.data('tab');
            
            console.log('Tab clickeado:', tabType);
            
            // 1. Cambiar estado activo de tabs
            $('.snap-sidebar-cart__related-tab').removeClass('active');
            $clickedTab.addClass('active');
            
            // 2. Mostrar el contenedor correspondiente
            $('.snap-sidebar-cart__related-container').removeClass('active');
            var $targetContainer = $('.snap-sidebar-cart__related-container[data-content="' + tabType + '"]');
            $targetContainer.addClass('active');
            
            var $track = $targetContainer.find('.snap-sidebar-cart__slider-track');
            
            // 3. Cargar productos si el contenedor está vacío
            if ($track.children('.snap-sidebar-cart__related-product').length === 0) {
                loadRelatedProducts(tabType, $track);
            }
        });
        
        // Activar la primera pestaña por defecto
        var $activeTab = $('.snap-sidebar-cart__related-tab.active');
        if (!$activeTab.length) {
            $('.snap-sidebar-cart__related-tab').first().addClass('active').trigger('click');
        } else {
            $activeTab.trigger('click');
        }
    }
    
    /**
     * Cargar productos relacionados para una pestaña
     */
    function loadRelatedProducts(tabType, $targetTrack) {
        // Mostrar loader
        $targetTrack.html(
            '<div class="snap-sidebar-cart__loading">' +
            '<div class="snap-sidebar-cart__loader"></div>' +
            '<p>Cargando productos...</p>' +
            '</div>'
        );
        
        // Obtener ID del primer producto en el carrito
        var productId = '';
        $('.snap-sidebar-cart__product').each(function() {
            var pid = $(this).data('product-id');
            if (pid) {
                productId = pid;
                return false; // break
            }
        });
        
        if (!productId) {
            $targetTrack.html('<p>No hay productos en el carrito para mostrar recomendaciones.</p>');
            return;
        }
        
        // Hacer la petición AJAX
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
                    $targetTrack.html(response.data.html);
                    
                    // Inicializar navegación
                    setTimeout(fixSliderNavigation, 100);
                } else {
                    $targetTrack.html('<p>No se encontraron productos para mostrar.</p>');
                }
            },
            error: function() {
                $targetTrack.html('<p>Error al cargar productos. <a href="#" class="retry-load">Reintentar</a></p>');
                
                // Agregar handler para reintentar
                $targetTrack.find('.retry-load').on('click', function(e) {
                    e.preventDefault();
                    loadRelatedProducts(tabType, $targetTrack);
                });
            }
        });
    }
    
    /**
     * Arreglar la navegación del slider
     */
    function fixSliderNavigation() {
        console.log('Aplicando fix para navegación del slider');
        
        // Quitar todos los handlers de click existentes
        $('.snap-sidebar-cart__slider-nav').off('click');
        
        // Aplicar nuevos handlers
        $('.snap-sidebar-cart__slider-prev').on('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Botón PREV clickeado');
            
            var $track = $(this).siblings('.snap-sidebar-cart__slider-track');
            if (!$track.length) return;
            
            // Calcular scroll
            var scrollDistance = $track.width() * 0.8; // 80% del ancho visible
            
            // Animar scroll
            $track.animate({
                scrollLeft: Math.max(0, $track.scrollLeft() - scrollDistance)
            }, 300);
        });
        
        $('.snap-sidebar-cart__slider-next').on('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Botón NEXT clickeado');
            
            var $track = $(this).siblings('.snap-sidebar-cart__slider-track');
            if (!$track.length) return;
            
            // Calcular scroll máximo posible
            var maxScroll = $track[0].scrollWidth - $track.width();
            
            // Calcular scroll
            var scrollDistance = $track.width() * 0.8; // 80% del ancho visible
            
            // Animar scroll
            $track.animate({
                scrollLeft: Math.min(maxScroll, $track.scrollLeft() + scrollDistance)
            }, 300);
        });
        
        // Mostrar/ocultar flechas según contenido
        $('.snap-sidebar-cart__slider-track').each(function() {
            var $track = $(this);
            var $prevBtn = $track.siblings('.snap-sidebar-cart__slider-prev');
            var $nextBtn = $track.siblings('.snap-sidebar-cart__slider-next');
            
            // Si no tiene suficiente contenido para hacer scroll, ocultar las flechas
            if ($track[0].scrollWidth <= $track.width()) {
                $prevBtn.hide();
                $nextBtn.hide();
            } else {
                $prevBtn.show();
                $nextBtn.show();
            }
            
            // Agregar evento de scroll para actualizar visibilidad
            $track.on('scroll', function() {
                if ($track.scrollLeft() <= 0) {
                    $prevBtn.addClass('disabled');
                } else {
                    $prevBtn.removeClass('disabled');
                }
                
                if ($track.scrollLeft() >= $track[0].scrollWidth - $track.width() - 5) {
                    $nextBtn.addClass('disabled');
                } else {
                    $nextBtn.removeClass('disabled');
                }
            });
            
            // Disparar evento de scroll para inicializar estado
            $track.trigger('scroll');
        });
    }
    
    // Manejar actualizaciones del carrito
    $(document.body).on('snap_sidebar_cart_updated', function(e, data) {
        console.log('Evento de actualización detectado:', data);
        
        // Solo volver a cargar si se ha añadido un nuevo producto (no si solo se ha actualizado cantidad)
        var shouldReload = true;
        
        if (data && data.updated_key && data.quantity_changed === true) {
            console.log('Solo cambió la cantidad, no recargar productos relacionados');
            shouldReload = false;
        }
        
        if (shouldReload) {
            // Recargar las pestañas activas
            setTimeout(function() {
                fixTabs();
                fixSliderNavigation();
            }, 300);
        } else {
            // Solo asegurar que la navegación funcione
            setTimeout(fixSliderNavigation, 300);
        }
    });
    
    // También aplicar fix cuando se abre el carrito
    $(document).on('click', snap_sidebar_cart_params.activation_selectors, function() {
        setTimeout(function() {
            fixTabs();
            fixSliderNavigation();
        }, 500);
    });
});