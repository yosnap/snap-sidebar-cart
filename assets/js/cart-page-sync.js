/**
 * Sincronización entre la página del carrito y el sidebar
 * 
 * Este script escucha los eventos de actualización del carrito de WooCommerce
 * y actualiza el sidebar del carrito cuando estos ocurren.
 */
(function($) {
    'use strict';

    // Función para actualizar el sidebar del carrito
    function updateSidebarCart() {
        console.log('Actualizando sidebar del carrito después de cambios en la página del carrito');
        
        // Mostrar preloader
        $('.snap-sidebar-cart__loader').fadeIn(200);
        
        // Realizar petición AJAX para obtener el contenido actualizado del carrito
        $.ajax({
            type: 'POST',
            url: snap_sidebar_cart_params.ajax_url,
            data: {
                action: 'snap_sidebar_cart_get_cart',
                nonce: snap_sidebar_cart_params.nonce
            },
            success: function(response) {
                if (response.success) {
                    console.log('Sidebar del carrito actualizado correctamente');
                    
                    // Actualizar el contenido del carrito
                    if (response.data.cart_content) {
                        $('.snap-sidebar-cart__content').html(response.data.cart_content);
                    }
                    
                    // Actualizar el contador del carrito
                    if (response.data.cart_count !== undefined) {
                        updateCartCount(response.data.cart_count);
                    }
                    
                    // Actualizar el subtotal del carrito
                    if (response.data.cart_subtotal !== undefined) {
                        updateCartSubtotal(response.data.cart_subtotal);
                    }
                    
                    // Actualizar el precio total
                    updateTotalPrice();
                    
                    // Verificar si hay productos en el carrito
                    var hasProducts = $('.snap-sidebar-cart__products-list .snap-sidebar-cart__product').length > 0;
                    
                    // Actualizar visibilidad del footer
                    updateFooterVisibility(hasProducts ? 1 : 0);
                    
                    // Recargar productos relacionados si es necesario
                    var $activeTab = $('.snap-sidebar-cart__related-tab.active');
                    if ($activeTab.length > 0) {
                        var tabType = $activeTab.data('tab');
                        var $targetContainer = $('.snap-sidebar-cart__related-container[data-content="' + tabType + '"] .swiper-wrapper');
                        
                        if ($targetContainer.length > 0 && $targetContainer.children('.snap-sidebar-cart__related-product').length === 0) {
                            loadTabProducts(tabType, $targetContainer);
                        }
                    }
                } else {
                    console.error('Error al actualizar el sidebar del carrito:', response.data);
                }
            },
            error: function(xhr, status, error) {
                console.error('Error en la petición AJAX:', error);
            },
            complete: function() {
                // Ocultar preloader
                $('.snap-sidebar-cart__loader').fadeOut(200);
            }
        });
    }

    // Escuchar eventos de actualización del carrito de WooCommerce
    $(document.body).on('updated_cart_totals', function() {
        console.log('Evento updated_cart_totals detectado');
        updateSidebarCart();
    });

    // Escuchar eventos adicionales que podrían indicar cambios en el carrito
    $(document.body).on('wc_fragments_refreshed wc_fragments_loaded', function() {
        console.log('Evento de fragmentos de WooCommerce detectado');
        updateSidebarCart();
    });

    // También podemos escuchar el evento de eliminación de productos
    $(document.body).on('removed_from_cart', function(event, fragments, cart_hash, $button) {
        console.log('Evento removed_from_cart detectado');
        updateSidebarCart();
    });

    console.log('Sincronización entre página del carrito y sidebar inicializada');

})(jQuery);
