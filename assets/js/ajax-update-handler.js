/**
 * Controlador de actualización por AJAX para Snap Sidebar Cart
 * 
 * Este archivo maneja la actualización dinámica del carrito sin recargar la página
 */
(function($) {
    'use strict';
    
    var AjaxUpdateHandler = {
        init: function() {
            this.bindEvents();
        },
        
        bindEvents: function() {
            var self = this;
            
            // Manejar eventos de click delegados para los botones de cantidad
            $(document).on('click', '.notabutton.quantity-up', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                var $button = $(this);
                var $wrapper = $button.closest('.quantity.buttoned-input');
                var $input = $wrapper.find('input.cart-item__quantity-input');
                var cartItemKey = $wrapper.data('cart-item-key') || $input.data('cart-item-key');
                var currentVal = parseInt($input.val(), 10) || 0;
                var $product = $button.closest('.snap-sidebar-cart__product');
                
                if (!cartItemKey && $product.length) {
                    cartItemKey = $product.data('cart-item-key');
                }
                
                if (!cartItemKey) {
                    console.error('No se pudo obtener la clave del producto');
                    return;
                }
                
                var newVal = currentVal + 1;
                $input.val(newVal);
                
                // Mostrar preloader
                if (window.snap_sidebar_cart && typeof window.snap_sidebar_cart.showPreloader === 'function') {
                    window.snap_sidebar_cart.showPreloader($product);
                }
                
                self.updateCartItem(cartItemKey, newVal);
            });
            
            $(document).on('click', '.notabutton.quantity-down', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                var $button = $(this);
                var $wrapper = $button.closest('.quantity.buttoned-input');
                var $input = $wrapper.find('input.cart-item__quantity-input');
                var cartItemKey = $wrapper.data('cart-item-key') || $input.data('cart-item-key');
                var currentVal = parseInt($input.val(), 10) || 0;
                var $product = $button.closest('.snap-sidebar-cart__product');
                
                if (!cartItemKey && $product.length) {
                    cartItemKey = $product.data('cart-item-key');
                }
                
                if (!cartItemKey) {
                    console.error('No se pudo obtener la clave del producto');
                    return;
                }
                
                var newVal = Math.max(1, currentVal - 1);
                $input.val(newVal);
                
                // Si la nueva cantidad es 0, eliminamos el producto
                if (newVal === 0) {
                    self.removeCartItem(cartItemKey);
                    return;
                }
                
                // Mostrar preloader
                if (window.snap_sidebar_cart && typeof window.snap_sidebar_cart.showPreloader === 'function') {
                    window.snap_sidebar_cart.showPreloader($product);
                }
                
                self.updateCartItem(cartItemKey, newVal);
            });
            
            $(document).on('change', 'input.cart-item__quantity-input', function(e) {
                var $input = $(this);
                var $wrapper = $input.closest('.quantity.buttoned-input');
                var cartItemKey = $wrapper.data('cart-item-key') || $input.data('cart-item-key');
                var newVal = parseInt($input.val(), 10) || 1;
                var $product = $input.closest('.snap-sidebar-cart__product');
                
                if (!cartItemKey && $product.length) {
                    cartItemKey = $product.data('cart-item-key');
                }
                
                if (!cartItemKey) {
                    console.error('No se pudo obtener la clave del producto');
                    return;
                }
                
                // Asegurarse de que la cantidad sea al menos 1
                if (newVal < 1) {
                    newVal = 1;
                    $input.val(newVal);
                }
                
                // Mostrar preloader
                if (window.snap_sidebar_cart && typeof window.snap_sidebar_cart.showPreloader === 'function') {
                    window.snap_sidebar_cart.showPreloader($product);
                }
                
                self.updateCartItem(cartItemKey, newVal);
            });
            
            // Manejar eventos de click delegados para el botón de eliminar
            $(document).on('click', '.snap-sidebar-cart__product-remove', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                var $button = $(this);
                var $product = $button.closest('.snap-sidebar-cart__product');
                var cartItemKey = $product.data('cart-item-key');
                
                if (!cartItemKey) {
                    console.error('No se pudo obtener la clave del producto');
                    return;
                }
                
                // Mostrar preloader
                if (window.snap_sidebar_cart && typeof window.snap_sidebar_cart.showPreloader === 'function') {
                    window.snap_sidebar_cart.showPreloader($product);
                }
                
                self.removeCartItem(cartItemKey);
            });
        },
        
        updateCartItem: function(cartItemKey, quantity) {
            var self = this;
            
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
                        self.updateCartContent(response.data);
                    } else {
                        self.hideLoaders();
                        
                        if (response.data && response.data.message) {
                            alert(response.data.message);
                        }
                    }
                },
                error: function() {
                    self.hideLoaders();
                    alert('Error al comunicarse con el servidor');
                }
            });
        },
        
        removeCartItem: function(cartItemKey) {
            var self = this;
            
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
                        self.updateCartContent(response.data);
                    } else {
                        self.hideLoaders();
                        
                        if (response.data && response.data.message) {
                            alert(response.data.message);
                        }
                    }
                },
                error: function() {
                    self.hideLoaders();
                    alert('Error al comunicarse con el servidor');
                }
            });
        },
        
        updateCartContent: function(data) {
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
            
            this.hideLoaders();
            
            // Disparar evento personalizado para que otros scripts puedan reaccionar
            $(document.body).trigger('snap_sidebar_cart_updated', [data]);
        },
        
        hideLoaders: function() {
            // Ocultar preloader global
            if (window.snap_sidebar_cart && typeof window.snap_sidebar_cart.hideGlobalLoader === 'function') {
                window.snap_sidebar_cart.hideGlobalLoader();
            }
            
            // Ocultar preloaders de productos
            $('.snap-sidebar-cart__product').each(function() {
                if (window.snap_sidebar_cart && typeof window.snap_sidebar_cart.hidePreloader === 'function') {
                    window.snap_sidebar_cart.hidePreloader($(this));
                }
            });
        }
    };
    
    $(document).ready(function() {
        AjaxUpdateHandler.init();
    });
})(jQuery);