/**
 * Solución específica para los botones de cambio de cantidad
 * Este script garantiza que los botones de cantidad funcionen correctamente
 */
jQuery(function($) {
    'use strict';
    
    console.log('=== QUANTITY BUTTONS FIX CARGADO ===');
    
    // Función para vincular eventos a los botones de cantidad
    function fixQuantityButtons() {
        console.log('Aplicando solución para botones de cantidad');
        
        // Eliminar cualquier manejador de eventos existente para evitar duplicados
        $(document).off('click', '.snap-sidebar-cart__quantity-up, .notabutton.quantity-up');
        $(document).off('click', '.snap-sidebar-cart__quantity-down, .notabutton.quantity-down');
        $('.snap-sidebar-cart__quantity-up, .snap-sidebar-cart__quantity-down, .notabutton.quantity-up, .notabutton.quantity-down').off('click');
        
        // Vincular evento para incrementar cantidad
        $('.snap-sidebar-cart__quantity-up, .notabutton.quantity-up').on('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            var $button = $(this);
            console.log('Botón de incremento clickeado:', $button);
            
            // Buscar el contenedor de cantidad y el input
            var $quantityWrapper = $button.closest('.quantity, .snap-sidebar-cart__quantity');
            var $input = $quantityWrapper.find('input.cart-item__quantity-input, input.snap-sidebar-cart__quantity-input');
            var $product = $button.closest('.snap-sidebar-cart__product');
            
            // Obtener la clave del producto
            var cartItemKey = $quantityWrapper.data('key') || $input.data('key');
            if (!cartItemKey && $product.length) {
                cartItemKey = $product.data('key');
            }
            
            if (!cartItemKey) {
                console.error('Error: No se pudo encontrar la clave del producto');
                return;
            }
            
            // Obtener valores actuales
            var currentVal = parseInt($input.val(), 10) || 1;
            var maxQty = parseInt($quantityWrapper.data('max-qty'), 10);
            
            // Verificar si va a exceder el stock disponible
            if (!isNaN(maxQty) && currentVal >= maxQty) {
                console.log('Stock máximo alcanzado:', maxQty);
                return;
            }
            
            // Calcular nuevo valor (incrementar de 1 en 1)
            var newVal = currentVal + 1;
            console.log('Aumentando cantidad de', currentVal, 'a', newVal);
            
            // Actualizar valor del input
            $input.val(newVal);
            
            // Mostrar preloader
            showProductLoader($product);
            
            // Actualizar carrito usando la función del archivo principal
            if (typeof window.updateCartItemQuantity === 'function') {
                window.updateCartItemQuantity(cartItemKey, newVal, currentVal);
            } else {
                // Fallback si la función no está disponible
                updateCartItemQuantityFallback(cartItemKey, newVal, currentVal, $product);
            }
        });
        
        // Vincular evento para decrementar cantidad
        $('.snap-sidebar-cart__quantity-down, .notabutton.quantity-down').on('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            var $button = $(this);
            console.log('Botón de decremento clickeado:', $button);
            
            // Buscar el contenedor de cantidad y el input
            var $quantityWrapper = $button.closest('.quantity, .snap-sidebar-cart__quantity');
            var $input = $quantityWrapper.find('input.cart-item__quantity-input, input.snap-sidebar-cart__quantity-input');
            var $product = $button.closest('.snap-sidebar-cart__product');
            
            // Obtener la clave del producto
            var cartItemKey = $quantityWrapper.data('key') || $input.data('key');
            if (!cartItemKey && $product.length) {
                cartItemKey = $product.data('key');
            }
            
            if (!cartItemKey) {
                console.error('Error: No se pudo encontrar la clave del producto');
                return;
            }
            
            // Obtener valor actual
            var currentVal = parseInt($input.val(), 10) || 1;
            
            // Calcular nuevo valor (decrementar de 1 en 1, mínimo 0 para eliminar)
            var newVal = currentVal > 1 ? currentVal - 1 : 0;
            console.log('Disminuyendo cantidad de', currentVal, 'a', newVal);
            
            // Actualizar valor del input
            $input.val(newVal);
            
            // Mostrar preloader
            showProductLoader($product);
            
            // Actualizar carrito usando la función del archivo principal
            if (typeof window.updateCartItemQuantity === 'function') {
                window.updateCartItemQuantity(cartItemKey, newVal, currentVal);
            } else {
                // Fallback si la función no está disponible
                updateCartItemQuantityFallback(cartItemKey, newVal, currentVal, $product);
            }
        });
        
        console.log('Eventos de botones de cantidad vinculados correctamente');
    }
    
    // Función para mostrar el preloader en un producto
    function showProductLoader($product) {
        if (!$product || $product.length === 0) return;
        
        // Verificar si ya existe un loader
        var $existingLoader = $product.find('.snap-sidebar-cart__product-loader');
        
        if ($existingLoader.length === 0) {
            // Crear y añadir el loader
            var $loader = $('<div class="snap-sidebar-cart__product-loader"><div class="snap-sidebar-cart__loader-spinner"></div></div>');
            $product.append($loader);
        } else {
            // Mostrar el loader existente
            $existingLoader.show();
        }
    }
    
    // Función de respaldo para actualizar la cantidad de un producto en el carrito
    function updateCartItemQuantityFallback(cartItemKey, quantity, oldQuantity, $product) {
        console.log('Usando función de respaldo para actualizar cantidad');
        
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
                console.log('Respuesta de actualización:', response);
                
                if (response.success && response.data) {
                    // Actualizar el contenido del carrito
                    if (response.data.cart_content) {
                        $('.snap-sidebar-cart__products-list').html(response.data.cart_content);
                    }
                    
                    // Actualizar subtotal
                    if (response.data.subtotal) {
                        $('.snap-sidebar-cart__subtotal-price').html(response.data.subtotal);
                    }
                }
                
                // Ocultar loader
                if ($product) {
                    $product.find('.snap-sidebar-cart__product-loader').hide();
                }
            },
            error: function() {
                console.error('Error al actualizar el carrito');
                
                // Ocultar loader
                if ($product) {
                    $product.find('.snap-sidebar-cart__product-loader').hide();
                }
            }
        });
    }
    
    // Aplicar la solución inmediatamente
    fixQuantityButtons();
    
    // Volver a aplicar la solución cuando se actualiza el carrito
    $(document.body).on('snap_sidebar_cart_updated', function() {
        setTimeout(fixQuantityButtons, 300);
    });
    
    // Volver a aplicar la solución cuando se abre el sidebar
    $(document.body).on('snap_sidebar_cart_opened', function() {
        setTimeout(fixQuantityButtons, 300);
    });
});