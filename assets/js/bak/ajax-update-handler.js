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
                var cartItemKey = $wrapper.data('key') || $input.data('key');
                var currentVal = parseInt($input.val(), 10) || 0;
                var $product = $button.closest('.snap-sidebar-cart__product');
                
                if (!cartItemKey && $product.length) {
                    cartItemKey = $product.data('key');
                }
                
                if (!cartItemKey) {
                    console.error('No se pudo obtener la clave del producto');
                    return;
                }
                
                var newVal = currentVal + 1;
                $input.val(newVal);
                
                self.showLoader($product);
                self.updateCartItem(cartItemKey, newVal);
            });
            
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
                
                self.showLoader($product);
                self.updateCartItem(cartItemKey, newVal);
            });
            
            // Input de cantidad
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
                
                self.showLoader($product);
                self.updateCartItem(cartItemKey, newVal);
            });
        },
        
        showLoader: function($product) {
            if (!$product || !$product.length) return;
            
            // Obtener configuración del preloader desde parámetros
            var preloaderType = 'circle';
            var preloaderPosition = 'center';
            
            if (window.snap_sidebar_cart_params && window.snap_sidebar_cart_params.preloader) {
                preloaderType = window.snap_sidebar_cart_params.preloader.type || 'circle';
                preloaderPosition = window.snap_sidebar_cart_params.preloader.position || 'center';
            }
            
            // Preparar el preloader según configuración
            var $loader = $product.find('.snap-sidebar-cart__loader-spinner');
            $loader.attr('class', 'snap-sidebar-cart__loader-spinner');
            $loader.addClass('preloader-' + preloaderType);
            $loader.addClass('preloader-position-' + preloaderPosition);
            
            // Contenido específico según tipo de preloader
            if (preloaderType === 'dots') {
                $loader.html('<span></span><span></span><span></span>');
            } else {
                $loader.html('');
            }
            
            $product.find('.snap-sidebar-cart__product-loader').show();
        },
        
        hideLoaders: function() {
            $('.snap-sidebar-cart__product-loader').hide();
        },
        
        updateCartItem: function(cartItemKey, quantity) {
            var self = this;
            
            // Animación especial para productos que se eliminan
            if (quantity === 0) {
                var $product = $('[data-key="' + cartItemKey + '"]');
                if ($product.length) {
                    $product.addClass('removing');
                    
                    // Reproducir animación de eliminación antes de enviar la solicitud
                    setTimeout(function() {
                        self.sendUpdateRequest(cartItemKey, quantity);
                    }, 300); // Dar tiempo para que se muestre la animación
                } else {
                    self.sendUpdateRequest(cartItemKey, quantity);
                }
            } else {
                // Para actualizaciones normales de cantidad
                self.sendUpdateRequest(cartItemKey, quantity);
            }
        },
        
        sendUpdateRequest: function(cartItemKey, quantity) {
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
                        window.SnapSidebarCartUI.updateCartContent(response.data);
                        
                        // Actualizar también los fragmentos de carrito de WooCommerce si están disponibles
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
        
        // Reemplazar cualquier llamada a updateCartContent por window.SnapSidebarCartUI.updateCartContent(data)
    };
    
    // Inicializar cuando el DOM esté listo
    $(document).ready(function() {
        AjaxUpdateHandler.init();
    });
    
    // Exportar para uso en otros scripts
    window.SnapSidebarCartAjaxHandler = AjaxUpdateHandler;
    
})(jQuery);
