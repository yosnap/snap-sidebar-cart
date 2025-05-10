/**
 * Manejador unificado de cantidades para Snap Sidebar Cart
 * Este archivo gestiona todas las operaciones relacionadas con cambios de cantidad
 */
(function($) {
    "use strict";

    $(document).ready(function() {
        console.log('Inicializando manejador unificado de cantidades');
        
        // Usar las funciones de preloader del sistema global
        function showPreloader($product) {
            if (!$product || !$product.length) return;
            
            console.log('Mostrando preloader para producto:', $product.data('cart-item-key'));
            
            // Usar la función global si está disponible
            if (window.snap_sidebar_cart && typeof window.snap_sidebar_cart.showProductLoader === 'function') {
                window.snap_sidebar_cart.showProductLoader($product);
                return;
            }
            
            // Fallback en caso de que la función global no esté disponible
            var $loader = $product.find('.snap-sidebar-cart__product-loader');
            
            if (!$loader.length) {
                $loader = $('<div class="snap-sidebar-cart__product-loader"><div class="snap-sidebar-cart__loader-spinner"></div></div>');
                $product.append($loader);
            }
            
            $product.addClass('updating');
            $loader.css('display', 'flex').addClass('active');
        }
        
        // Función para ocultar el preloader
        function hidePreloader($product) {
            if (!$product || !$product.length) return;
            
            // Usar la función global si está disponible
            if (window.snap_sidebar_cart && typeof window.snap_sidebar_cart.hideProductLoader === 'function') {
                window.snap_sidebar_cart.hideProductLoader($product);
                return;
            }
            
            // Fallback en caso de que la función global no esté disponible
            $product.removeClass('updating');
            $product.find('.snap-sidebar-cart__product-loader').removeClass('active').hide();
        }
        
        // Función para actualizar la cantidad de un producto
        function updateQuantity(cartItemKey, newQuantity) {
            if (!cartItemKey) {
                console.error('No se pudo obtener la clave del producto');
                return;
            }
            
            console.log('Actualizando cantidad:', cartItemKey, newQuantity);
            
            // Usar la función global si está disponible
            if (window.snap_sidebar_cart && typeof window.snap_sidebar_cart.updateCartItem === 'function') {
                window.snap_sidebar_cart.updateCartItem(cartItemKey, newQuantity);
                return;
            }
            
            // Fallback en caso de que la función global no esté disponible
            var $product = $('.snap-sidebar-cart__product[data-cart-item-key="' + cartItemKey + '"]');
            if ($product.length) {
                showPreloader($product);
            }
            
            $.ajax({
                type: 'POST',
                url: snap_sidebar_cart_params.ajax_url,
                data: {
                    action: 'snap_sidebar_cart_update',
                    cart_item_key: cartItemKey,
                    quantity: newQuantity,
                    nonce: snap_sidebar_cart_params.nonce
                },
                success: function(response) {
                    if (response.success) {
                        // Actualizar el contenido del carrito
                        if (response.data.cart_html) {
                            $('.snap-sidebar-cart__products').html(response.data.cart_html);
                        } else if (response.data.cart_content) {
                            $('.snap-sidebar-cart__products').html(response.data.cart_content);
                        }
                        
                        // Actualizar contadores
                        var cartCount = response.data.cart_count || 0;
                        $('.snap-sidebar-cart__count').text(cartCount);
                        $('.cart-contents-count').text(cartCount);
                        
                        // Actualizar totales
                        if (response.data.shipping_total) {
                            $('.snap-sidebar-cart__shipping-price').html(response.data.shipping_total);
                        }
                        if (response.data.subtotal) {
                            $('.snap-sidebar-cart__subtotal-price').html(response.data.subtotal);
                        }
                        if (response.data.total) {
                            $('.snap-sidebar-cart__total-price').html(response.data.total);
                        }
                        
                        // Actualizar fragmentos de WooCommerce si están disponibles
                        if (typeof wc_cart_fragments_params !== 'undefined') {
                            $.ajax({
                                url: wc_cart_fragments_params.wc_ajax_url.toString().replace('%%endpoint%%', 'get_refreshed_fragments'),
                                type: 'POST',
                                success: function(data) {
                                    if (data && data.fragments) {
                                        $.each(data.fragments, function(key, value) {
                                            $(key).replaceWith(value);
                                        });
                                        
                                        if (typeof sessionStorage !== 'undefined') {
                                            sessionStorage.setItem(wc_cart_fragments_params.fragment_name, JSON.stringify(data.fragments));
                                            sessionStorage.setItem('wc_cart_hash', data.cart_hash);
                                        }
                                        
                                        $(document.body).trigger('wc_fragments_refreshed');
                                    }
                                }
                            });
                        }
                        
                        // Ocultar preloaders
                        if ($product.length) {
                            hidePreloader($product);
                        }
                    } else {
                        // Ocultar preloader
                        if ($product.length) {
                            hidePreloader($product);
                        } else {
                            $('.snap-sidebar-cart__product-loader').hide();
                            $('.snap-sidebar-cart__product').removeClass('updating');
                        }
                        
                        if (response.data && response.data.message) {
                            alert(response.data.message);
                        }
                    }
                },
                error: function() {
                    // Ocultar preloader
                    if ($product.length) {
                        hidePreloader($product);
                    } else {
                        $('.snap-sidebar-cart__product-loader').hide();
                        $('.snap-sidebar-cart__product').removeClass('updating');
                    }
                    
                    alert('Error al comunicarse con el servidor');
                }
            });
        }
        
        // Evento para incrementar cantidad
        $(document).on('click', '.notabutton.quantity-up', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            var $button = $(this);
            
            // Si el botón está deshabilitado, no hacer nada
            if ($button.hasClass('disabled') || $button.attr('disabled')) {
                console.log("Botón de incremento deshabilitado - Stock máximo alcanzado");
                return;
            }
            
            var $wrapper = $button.closest('.quantity.buttoned-input');
            var $input = $wrapper.find('input.cart-item__quantity-input');
            var cartItemKey = $wrapper.data('key') || $input.data('key');
            var currentVal = parseInt($input.val(), 10) || 0;
            var $product = $button.closest('.snap-sidebar-cart__product');
            
            if (!cartItemKey && $product.length) {
                cartItemKey = $product.data('key');
            }
            
            // Verificar límite de stock
            var maxQty = parseInt($wrapper.data('max-qty'), 10);
            if (!isNaN(maxQty) && currentVal >= maxQty) {
                console.log("Stock máximo alcanzado:", maxQty);
                return;
            }
            
            var newVal = currentVal + 1;
            $input.val(newVal);
            
            // Mostrar preloader
            showPreloader($product);
            
            // Actualizar cantidad
            updateQuantity(cartItemKey, newVal);
        });
        
        // Evento para decrementar cantidad
        $(document).on('click', '.notabutton.quantity-down', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            var $button = $(this);
            var $wrapper = $button.closest('.quantity.buttoned-input');
            var $input = $wrapper.find('input.cart-item__quantity-input');
            var cartItemKey = $wrapper.data('key') || $input.data('key');
            var currentVal = parseInt($input.val(), 10) || 0;
            var $product = $button.closest('.snap-sidebar-cart__product');
            
            if (!cartItemKey && $product.length) {
                cartItemKey = $product.data('key');
            }
            
            if (!cartItemKey || currentVal <= 0) {
                return;
            }
            
            var newVal = currentVal - 1;
            $input.val(newVal);
            
            if (newVal === 0) {
                $product.addClass('removing');
            }
            
            // Mostrar preloader
            showPreloader($product);
            
            // Actualizar cantidad
            updateQuantity(cartItemKey, newVal);
        });
        
        // Evento para cambio manual de cantidad
        $(document).on('change', '.cart-item__quantity-input', function() {
            var $input = $(this);
            var $product = $input.closest('.snap-sidebar-cart__product');
            var cartItemKey = $product.data('key') || $input.data('key');
            var newVal = parseInt($input.val(), 10) || 0;
            
            if (!cartItemKey) {
                return;
            }
            
            if (newVal === 0) {
                $product.addClass('removing');
            }
            
            // Mostrar preloader
            showPreloader($product);
            
            // Actualizar cantidad
            updateQuantity(cartItemKey, newVal);
        });
    });
})(jQuery);