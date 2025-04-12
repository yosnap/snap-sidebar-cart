/**
 * JavaScript para el funcionamiento del carrito lateral
 */
(function($) {
    'use strict';

    $(document).ready(function() {
        var $body = $('body');
        var $sidebar = $('.snap-sidebar-cart');
        var $overlay = $('.snap-sidebar-cart__overlay');
        var $close = $('.snap-sidebar-cart__close');
        var $container = $('.snap-sidebar-cart__products');
        var activationSelectors = snap_sidebar_cart_params.activation_selectors;
        
        // Abrir el carrito - selectors específicos
        $body.on('click', activationSelectors, function(e) {
            e.preventDefault();
            openSidebar();
            console.log('Activator clicked:', this);
        });
        
        // Forzar la detección del icono ti-shopping-cart
        $body.on('click', '.ti-shopping-cart', function(e) {
            e.preventDefault();
            openSidebar();
            console.log('Ti-shopping-cart clicked');
        });
        
        // También abrir cuando se añade un producto al carrito (evento propio de WooCommerce)
        $body.on('added_to_cart', function(event, fragments, cart_hash, $button) {
            openSidebar();
            
            // Si tenemos el producto ID, obtener los productos relacionados
            if ($button && $button.data('product_id')) {
                loadRelatedProducts($button.data('product_id'));
            }
        });
        
        // Cerrar el carrito
        $body.on('click', '.snap-sidebar-cart__close', function(e) {
            e.preventDefault();
            closeSidebar();
            console.log('Close button clicked');
        });
        
        $overlay.on('click', closeSidebar);
        
        // Cerrar con Escape
        $(document).on('keyup', function(e) {
            if (e.key === 'Escape' && $sidebar.hasClass('open')) {
                closeSidebar();
            }
        });
        
        // Añadir productos relacionados al carrito
        $body.on('click', '.snap-sidebar-cart__add-related-product', function(e) {
            e.preventDefault();
            
            var $button = $(this);
            var productId = $button.data('product-id');
            
            $button.addClass('loading');
            
            $.ajax({
                type: 'POST',
                url: snap_sidebar_cart_params.ajax_url,
                data: {
                    action: 'snap_sidebar_cart_add',
                    nonce: snap_sidebar_cart_params.nonce,
                    product_id: productId,
                    quantity: 1
                },
                success: function(response) {
                    if (response.success) {
                        // Actualizar el contenido del carrito
                        updateCartContent(response.data);
                        
                        // Agregar animación al nuevo producto
                        var $newItem = $('.snap-sidebar-cart__product:first-child');
                        $newItem.addClass('new-item');
                        
                        // Eliminar la clase después de la animación
                        setTimeout(function() {
                            $newItem.removeClass('new-item');
                        }, 600);
                    }
                },
                complete: function() {
                    $button.removeClass('loading');
                }
            });
        });
        
        // Actualizar cantidad
        $body.on('click', '.snap-sidebar-cart__quantity-up, .snap-sidebar-cart__quantity-down', function() {
            var $button = $(this);
            var $product = $button.closest('.snap-sidebar-cart__product');
            var $input = $product.find('.snap-sidebar-cart__quantity-input');
            var cartItemKey = $product.data('key');
            var currentVal = parseInt($input.val(), 10);
            
            if ($button.hasClass('snap-sidebar-cart__quantity-up')) {
                var newVal = currentVal + 1;
            } else {
                var newVal = currentVal > 0 ? currentVal - 1 : 0;
            }
            
            $input.val(newVal);
            
            // Mostrar loader
            $product.find('.snap-sidebar-cart__product-loader').show();
            
            updateCartItemQuantity(cartItemKey, newVal);
        });
        
        // Actualizar cantidad con input
        $body.on('change', '.snap-sidebar-cart__quantity-input', function() {
            var $input = $(this);
            var $product = $input.closest('.snap-sidebar-cart__product');
            var cartItemKey = $product.data('key');
            var newVal = parseInt($input.val(), 10);
            
            if (isNaN(newVal) || newVal < 0) {
                newVal = 0;
                $input.val(newVal);
            }
            
            // Mostrar loader
            $product.find('.snap-sidebar-cart__product-loader').show();
            
            updateCartItemQuantity(cartItemKey, newVal);
        });
        
        // Eliminar producto
        $body.on('click', '.snap-sidebar-cart__remove-product', function() {
            var $button = $(this);
            var $product = $button.closest('.snap-sidebar-cart__product');
            var cartItemKey = $product.data('key');
            
            // Mostrar loader
            $product.find('.snap-sidebar-cart__product-loader').show();
            
            removeCartItem(cartItemKey);
        });
        
        // Función para abrir el sidebar
        function openSidebar() {
            $sidebar.addClass('open');
            $overlay.show();
            $body.addClass('snap-sidebar-cart-open');
        }
        
        // Función para cerrar el sidebar
        function closeSidebar() {
            $sidebar.removeClass('open');
            $overlay.hide();
            $body.removeClass('snap-sidebar-cart-open');
            console.log('Sidebar closed');
        }
        
        // Función para cargar productos relacionados
        function loadRelatedProducts(productId) {
            var $relatedContainer = $('.snap-sidebar-cart__related-products-container');
            
            if ($relatedContainer.length === 0) {
                return;
            }
            
            $.ajax({
                type: 'POST',
                url: snap_sidebar_cart_params.ajax_url,
                data: {
                    action: 'snap_sidebar_cart_get_related',
                    nonce: snap_sidebar_cart_params.nonce,
                    product_id: productId
                },
                success: function(response) {
                    if (response.success && response.data.html) {
                        $relatedContainer.html(response.data.html);
                        initSlider();
                    }
                }
            });
        }
        
        // Función para inicializar el slider (si se necesita)
        function initSlider() {
            // Aquí se podría implementar un slider si se requiere
            // Por ahora solo usamos flexbox
        }
        
        // Función para actualizar la cantidad de un item
        function updateCartItemQuantity(cartItemKey, quantity) {
            $.ajax({
                type: 'POST',
                url: snap_sidebar_cart_params.ajax_url,
                data: {
                    action: 'snap_sidebar_cart_update',
                    nonce: snap_sidebar_cart_params.nonce,
                    cart_item_key: cartItemKey,
                    quantity: quantity
                },
                success: function(response) {
                    if (response.success) {
                        updateCartContent(response.data);
                    }
                }
            });
        }
        
        // Función para eliminar un item del carrito
        function removeCartItem(cartItemKey) {
            $.ajax({
                type: 'POST',
                url: snap_sidebar_cart_params.ajax_url,
                data: {
                    action: 'snap_sidebar_cart_remove',
                    nonce: snap_sidebar_cart_params.nonce,
                    cart_item_key: cartItemKey
                },
                success: function(response) {
                    if (response.success) {
                        updateCartContent(response.data);
                    }
                }
            });
        }
        
        // Función para actualizar el contenido del carrito
        function updateCartContent(data) {
            // Actualizar el HTML del carrito
            $('.snap-sidebar-cart__products').html(data.cart_html);
            
            // Actualizar el contador
            $('.snap-sidebar-cart__count').text(data.cart_count);
            
            // Actualizar los totales
            $('.snap-sidebar-cart__shipping-price').html(data.shipping_total);
            $('.snap-sidebar-cart__subtotal-price').html(data.subtotal);
            
            // Disparar un evento personalizado
            $(document.body).trigger('snap_sidebar_cart_updated');
        }
    });
})(jQuery);
