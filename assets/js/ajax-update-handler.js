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
                        self.updateCartContent(response.data);
                        
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
        
        updateCartContent: function(data) {
            // Actualizar el HTML del carrito
            $('.snap-sidebar-cart__products').html(data.cart_html);
            
            // Actualizar todos los contadores del carrito en la página
            $('.snap-sidebar-cart__count').text(data.cart_count);
            $('.cart-contents-count').text(data.cart_count);
            
            // Actualizar título con contador (formato "Carrito de compra (X)")
            var title = $('.snap-sidebar-cart__title').first().contents().filter(function() {
                return this.nodeType === 3; // nodos de texto
            }).text().trim();
            
            // Extraer el título base sin el contador
            var baseTitle = title.replace(/\s*\(\d+\)$/, '');
            $('.snap-sidebar-cart__title').first().contents().filter(function() {
                return this.nodeType === 3;
            }).first()[0].textContent = baseTitle + ' ';
            
            // Actualizar los totales
            $('.snap-sidebar-cart__shipping-price').html(data.shipping_total);
            $('.snap-sidebar-cart__subtotal-price').html(data.subtotal);
            $('.snap-sidebar-cart__total-price').html(data.total);
            
            // Actualizar botones según el estado del carrito
            if (data.cart_count > 0) {
                if ($('.snap-sidebar-cart__buttons').length === 0) {
                    var cartUrl = '';
                    var checkoutUrl = '';
                    
                    if (typeof wc_cart_fragments_params !== 'undefined') {
                        cartUrl = wc_cart_fragments_params.cart_url;
                        checkoutUrl = wc_cart_fragments_params.checkout_url;
                    } else {
                        cartUrl = '/cart/';
                        checkoutUrl = '/checkout/';
                    }
                    
                    var buttonsHtml = 
                        '<div class="snap-sidebar-cart__buttons">' +
                            '<a href="' + cartUrl + '" class="snap-sidebar-cart__button snap-sidebar-cart__button--cart">Ver carrito</a>' +
                            '<a href="' + checkoutUrl + '" class="snap-sidebar-cart__button snap-sidebar-cart__button--checkout">Finalizar pedido</a>' +
                        '</div>';
                    
                    $('.snap-sidebar-cart__footer').append(buttonsHtml);
                }
                
                // Si hay productos relacionados pero no están cargados, intentar cargarlos
                if ($('.snap-sidebar-cart__related-section').length && 
                    $('.snap-sidebar-cart__related-container.active .snap-sidebar-cart__slider-track').children().length === 0) {
                    if (window.SnapSidebarCartRelated && typeof window.SnapSidebarCartRelated.loadRelatedProductsIfEmpty === 'function') {
                        window.SnapSidebarCartRelated.loadRelatedProductsIfEmpty();
                    }
                }
            } else {
                // Si no hay productos
                $('.snap-sidebar-cart__buttons').remove();
                
                // Limpiar productos relacionados si no hay productos en el carrito
                $('.snap-sidebar-cart__related-container .snap-sidebar-cart__slider-track').empty();
            }
            
            // Comprobar límites de stock después de actualizar
            if (window.SnapSidebarCartQuantity && typeof window.SnapSidebarCartQuantity.checkStockLimits === 'function') {
                window.SnapSidebarCartQuantity.checkStockLimits();
            }
            
            // Ocultar loaders
            this.hideLoaders();
            
            // Disparar evento para que otros scripts puedan responder
            $(document.body).trigger('snap_sidebar_cart_updated');
        }
    };
    
    // Inicializar cuando el DOM esté listo
    $(document).ready(function() {
        AjaxUpdateHandler.init();
    });
    
    // Exportar para uso en otros scripts
    window.SnapSidebarCartAjaxHandler = AjaxUpdateHandler;
    
})(jQuery);
