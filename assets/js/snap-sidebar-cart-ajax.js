/**
 * Controlador AJAX para Snap Sidebar Cart
 * Maneja todas las operaciones AJAX relacionadas con el carrito
 */
(function($) {
    "use strict";
    
    // Objeto global para el carrito
    window.snap_sidebar_cart = window.snap_sidebar_cart || {};
    
    $(document).ready(function() {
        console.log('Inicializando Snap Sidebar Cart AJAX Handler');
        
        // Función para mostrar el preloader global
        window.snap_sidebar_cart.showGlobalLoader = function() {
            $('.snap-sidebar-cart__loader').addClass('active').css('display', 'flex');
        };
        
        // Función para ocultar el preloader global
        window.snap_sidebar_cart.hideGlobalLoader = function() {
            $('.snap-sidebar-cart__loader').removeClass('active').hide();
        };
        
        // Función para mostrar el preloader de un producto específico
        window.snap_sidebar_cart.showProductLoader = function($product) {
            if (!$product || !$product.length) return;
            
            $product.addClass('updating');
            var $loader = $product.find('.snap-sidebar-cart__product-loader');
            
            if (!$loader.length) {
                $loader = $('<div class="snap-sidebar-cart__product-loader"><div class="snap-sidebar-cart__loader-spinner"></div></div>');
                $product.append($loader);
            }
            
            $loader.css('display', 'flex').addClass('active');
            console.log('Preloader mostrado para producto');
        };
        
        // Función para ocultar el preloader de un producto específico
        window.snap_sidebar_cart.hideProductLoader = function($product) {
            if (!$product || !$product.length) return;
            
            $product.removeClass('updating');
            $product.find('.snap-sidebar-cart__product-loader').removeClass('active').hide();
            console.log('Preloader ocultado para producto');
        };
        
        // Alias para compatibilidad con tab-controller.js y otros scripts
        window.snap_sidebar_cart.showPreloader = window.snap_sidebar_cart.showProductLoader;
        window.snap_sidebar_cart.hidePreloader = window.snap_sidebar_cart.hideProductLoader;
        
        // Función para ocultar todos los preloaders
        window.snap_sidebar_cart.hideAllLoaders = function() {
            window.snap_sidebar_cart.hideGlobalLoader();
            $('.snap-sidebar-cart__product').each(function() {
                window.snap_sidebar_cart.hideProductLoader($(this));
            });
        };
        
        // Función para actualizar el contenido del carrito
        window.snap_sidebar_cart.updateCartContent = function(data) {
            if (data.cart_content) {
                $('.snap-sidebar-cart__products').html(data.cart_content);
            }
            
            if (data.cart_totals) {
                $('.snap-sidebar-cart__totals').html(data.cart_totals);
            }
            
            if (data.cart_count !== undefined) {
                $('.snap-sidebar-cart__count').text(data.cart_count);
                
                // Actualizar también otros contadores de carrito en la página
                $('.cart-contents-count').text(data.cart_count);
                $('.cart-count').text(data.cart_count);
            }
            
            // Ocultar todos los preloaders
            window.snap_sidebar_cart.hideAllLoaders();
            
            // Disparar evento personalizado para que otros scripts puedan reaccionar
            $(document.body).trigger('snap_sidebar_cart_updated', [data]);
        };
        
        // Función para actualizar un elemento del carrito
        window.snap_sidebar_cart.updateCartItem = function(cartItemKey, quantity) {
            // Mostrar preloader global
            window.snap_sidebar_cart.showGlobalLoader();
            
            // Mostrar preloader en el producto específico
            var $product = $('.snap-sidebar-cart__product[data-cart-item-key="' + cartItemKey + '"]');
            if ($product.length) {
                window.snap_sidebar_cart.showProductLoader($product);
            }
            
            // Realizar solicitud AJAX
            $.ajax({
                type: 'POST',
                url: snap_sidebar_cart_params.ajax_url,
                data: {
                    action: 'snap_sidebar_cart_update',
                    cart_item_key: cartItemKey,
                    quantity: quantity,
                    nonce: snap_sidebar_cart_params.nonce
                },
                success: function(response) {
                    if (response.success) {
                        window.snap_sidebar_cart.updateCartContent(response.data);
                    } else {
                        window.snap_sidebar_cart.hideAllLoaders();
                        console.error('Error al actualizar el carrito:', response.data.message);
                    }
                },
                error: function(xhr, status, error) {
                    window.snap_sidebar_cart.hideAllLoaders();
                    console.error('Error AJAX al actualizar el carrito:', error);
                }
            });
        };
        
        // Función para eliminar un elemento del carrito
        window.snap_sidebar_cart.removeCartItem = function(cartItemKey) {
            // Mostrar preloader global
            window.snap_sidebar_cart.showGlobalLoader();
            
            // Mostrar preloader en el producto específico
            var $product = $('.snap-sidebar-cart__product[data-cart-item-key="' + cartItemKey + '"]');
            if ($product.length) {
                window.snap_sidebar_cart.showProductLoader($product);
            }
            
            // Realizar solicitud AJAX
            $.ajax({
                type: 'POST',
                url: snap_sidebar_cart_params.ajax_url,
                data: {
                    action: 'snap_sidebar_cart_remove',
                    cart_item_key: cartItemKey,
                    nonce: snap_sidebar_cart_params.nonce
                },
                success: function(response) {
                    if (response.success) {
                        window.snap_sidebar_cart.updateCartContent(response.data);
                    } else {
                        window.snap_sidebar_cart.hideAllLoaders();
                        console.error('Error al eliminar el producto:', response.data.message);
                    }
                },
                error: function(xhr, status, error) {
                    window.snap_sidebar_cart.hideAllLoaders();
                    console.error('Error AJAX al eliminar el producto:', error);
                }
            });
        };
        
        // Evento para eliminar un producto del carrito
        $(document).on('click', '.snap-sidebar-cart__product-remove', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            var $product = $(this).closest('.snap-sidebar-cart__product');
            var cartItemKey = $product.data('cart-item-key');
            
            if (cartItemKey) {
                window.snap_sidebar_cart.removeCartItem(cartItemKey);
            }
        });
    });
})(jQuery);