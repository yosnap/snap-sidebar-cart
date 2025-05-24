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
        console.log('DEBUG: Actualizando sidebar del carrito después de cambios en la página del carrito');
        
        // Obtener las cantidades actuales de la página del carrito para debugging
        var cartPageQuantities = {};
        $('.woocommerce-cart-form__cart-item').each(function() {
            var key = $(this).find('.remove').data('cart_item_key') || $(this).find('.remove').attr('data-cart_item_key');
            var qty = parseInt($(this).find('.qty').val(), 10);
            if (key && !isNaN(qty)) {
                cartPageQuantities[key] = qty;
                console.log('DEBUG: Producto en página del carrito - Key:', key, 'Cantidad:', qty);
            }
        });
        
        // Mostrar preloader
        $('.snap-sidebar-cart__loader').fadeIn(200);
        
        // Realizar petición AJAX para obtener el contenido actualizado del carrito
        $.ajax({
            type: 'POST',
            url: snap_sidebar_cart_params.ajax_url,
            data: {
                action: 'snap_sidebar_cart_get_cart',
                nonce: snap_sidebar_cart_params.nonce,
                debug: true // Añadir flag para debugging
            },
            success: function(response) {
                console.log('DEBUG: Respuesta AJAX completa:', response);
                
                if (response.success) {
                    console.log('DEBUG: Sidebar del carrito actualizado correctamente');
                    
                    // Verificar si tenemos datos de productos individuales
                    if (response.data.cart_items && Array.isArray(response.data.cart_items)) {
                        console.log('DEBUG: Datos de productos individuales recibidos:', response.data.cart_items.length);
                        
                        // Actualizar cada producto individualmente
                        response.data.cart_items.forEach(function(item) {
                            console.log('DEBUG: Actualizando producto individual - Key:', item.key, 'Cantidad:', item.quantity);
                            
                            var $product = $('.snap-sidebar-cart__product[data-key="' + item.key + '"]');
                            if ($product.length) {
                                console.log('DEBUG: Producto encontrado en el sidebar, actualizando cantidad');
                                $product.find('.cart-item__quantity-input').val(item.quantity);
                                $product.find('.snap-sidebar-cart__product-quantity-value').text(item.quantity);
                            } else {
                                console.log('DEBUG: Producto no encontrado en el sidebar, selector:', '.snap-sidebar-cart__product[data-key="' + item.key + '"]');
                            }
                        });
                    } else {
                        console.log('DEBUG: No se recibieron datos de productos individuales');
                    }
                    
                    // Actualizar SIEMPRE el HTML del carrito con el recibido del backend
                    if (response.data.cart_html) {
                        if (window.SnapSidebarCartUI && typeof window.SnapSidebarCartUI.updateCartContent === 'function') {
                            window.SnapSidebarCartUI.updateCartContent(response.data);
                        } else {
                            $('.snap-sidebar-cart__products').html(response.data.cart_html);
                            if (response.data.cart_count !== undefined) {
                                $('.snap-sidebar-cart__count, .snap-sidebar-cart-opener__count').text(response.data.cart_count);
                            }
                            if (response.data.cart_subtotal !== undefined) {
                                $('.snap-sidebar-cart__subtotal-value').html(response.data.cart_subtotal);
                                $('.snap-sidebar-cart__subtotal-price').html(response.data.cart_subtotal);
                                $('.snap-sidebar-cart__footer-subtotal-value').html(response.data.cart_subtotal);
                                $('.snap-sidebar-cart-subtotal').html(response.data.cart_subtotal);
                            }
                        }
                    }
                    
                    // Verificar si hay productos en el carrito
                    var hasProducts = $('.snap-sidebar-cart__products-list .snap-sidebar-cart__product').length > 0;
                    $('.snap-sidebar-cart').toggleClass('cart-is-empty', !hasProducts);
                    $('.snap-sidebar-cart').attr('data-is-empty', hasProducts ? 0 : 1);
                    
                    // Verificar si las cantidades se actualizaron correctamente
                    console.log('DEBUG: Verificando cantidades actualizadas en el sidebar');
                    $('.snap-sidebar-cart__product').each(function() {
                        var key = $(this).data('key');
                        var sidebarQty = parseInt($(this).find('.cart-item__quantity-input').val(), 10);
                        var cartPageQty = cartPageQuantities[key];
                        
                        console.log('DEBUG: Producto en sidebar - Key:', key, 'Cantidad en sidebar:', sidebarQty, 'Cantidad en página del carrito:', cartPageQty);
                        
                        if (cartPageQty !== undefined && sidebarQty !== cartPageQty) {
                            console.log('DEBUG: ¡DISCREPANCIA! La cantidad en el sidebar no coincide con la página del carrito');
                        }
                    });
                } else {
                    console.error('DEBUG: Error al actualizar el sidebar del carrito:', response.data);
                }
            },
            error: function(xhr, status, error) {
                console.error('DEBUG: Error en la petición AJAX:', error);
                console.error('DEBUG: Estado:', status);
                console.error('DEBUG: Respuesta XHR:', xhr.responseText);
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

    // Escuchar el botón de actualizar carrito
    $(document).on('click', 'button[name="update_cart"]', function() {
        console.log('Botón de actualizar carrito pulsado');
        // Esperar un poco para que WooCommerce actualice el carrito primero
        setTimeout(updateSidebarCart, 500);
    });

    // Escuchar eventos adicionales que podrían indicar cambios en el carrito
    $(document.body).on('wc_fragments_refreshed wc_fragments_loaded', function() {
        console.log('Evento de fragmentos de WooCommerce detectado');
        updateSidebarCart();
    });

    // También escuchar el evento de eliminación de productos
    $(document.body).on('removed_from_cart', function(event, fragments, cart_hash, $button) {
        console.log('Evento removed_from_cart detectado');
        updateSidebarCart();
    });

    // Si estamos en la página del carrito, actualizar el sidebar al cargar
    $(document).ready(function() {
        if ($('.woocommerce-cart-form').length) {
            console.log('Página del carrito detectada, actualizando sidebar');
            setTimeout(updateSidebarCart, 1000);
        }
    });

})(jQuery);
