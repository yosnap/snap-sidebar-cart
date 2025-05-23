/**
 * Fix directo para los botones de incremento/decremento
 * 
 * Este script aplica un manejador directo a los botones
 * independiente de los otros manejadores
 */
jQuery(document).ready(function($) {
    'use strict';

    // Funciones para actualizar el carrito
    function updateQuantity(cartItemKey, newQuantity) {
        // Mostrar loader
        var $product = $('li[data-key="' + cartItemKey + '"]');
        if ($product.length) {
            $product.find('.snap-sidebar-cart__product-loader').show();
        }
        
        // Actualizar mediante AJAX
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
                    // Actualizar el HTML del carrito
                    $('.snap-sidebar-cart__products').html(response.data.cart_html);
                    
                    // Actualizar otros elementos
                    $('.snap-sidebar-cart__shipping-price').html(response.data.shipping_total);
                    $('.snap-sidebar-cart__subtotal-price').html(response.data.subtotal);
                    
                    // Volver a aplicar los eventos a los nuevos botones
                    bindDirectEvents();
                } else {
                    // Si hay un error, ocultar el loader
                    if ($product.length) {
                        $product.find('.snap-sidebar-cart__product-loader').hide();
                    }
                }
            },
            error: function() {
                // Ocultar el loader si hay un error
                if ($product.length) {
                    $product.find('.snap-sidebar-cart__product-loader').hide();
                }
            }
        });
    }
    
    // Función para vincular eventos directamente a los botones
    function bindDirectEvents() {
        // Incrementar cantidad (botón +)
        $('.notabutton.quantity-up').each(function() {
            var $button = $(this);
            // Eliminar eventos previos para evitar duplicados
            $button.off('click.directfix');
            
            // Añadir nuevo evento directo
            $button.on('click.directfix', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                var $input = $(this).siblings('input.cart-item__quantity-input');
                var currentVal = parseInt($input.val(), 10) || 0;
                var newVal = currentVal + 1;
                var $wrapper = $(this).closest('[data-key]');
                var cartItemKey = $wrapper.data('key');
                
                // Actualizar valor visual inmediatamente
                $input.val(newVal);
                
                // Actualizar en el servidor
                updateQuantity(cartItemKey, newVal);
                
                return false;
            });
        });
        
        // Decrementar cantidad (botón -)
        $('.notabutton.quantity-down').each(function() {
            var $button = $(this);
            // Eliminar eventos previos para evitar duplicados
            $button.off('click.directfix');
            
            // Añadir nuevo evento directo
            $button.on('click.directfix', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                var $input = $(this).siblings('input.cart-item__quantity-input');
                var currentVal = parseInt($input.val(), 10) || 0;
                if (currentVal <= 0) return false;
                
                var newVal = currentVal - 1;
                var $wrapper = $(this).closest('[data-key]');
                var cartItemKey = $wrapper.data('key');
                
                // Actualizar valor visual inmediatamente
                $input.val(newVal);
                
                // Si es 0, aplicar clase para animación
                if (newVal === 0) {
                    $wrapper.addClass('removing');
                }
                
                // Actualizar en el servidor
                updateQuantity(cartItemKey, newVal);
                
                return false;
            });
        });
        
        // Manejar actualización de cantidad con teclado + ENTER
        $('.cart-item__quantity-input').each(function() {
            var $input = $(this);
            // Eliminar eventos previos para evitar duplicados
            $input.off('keypress.directfix change.directfix');
            
            // Evento para tecla ENTER
            $input.on('keypress.directfix', function(e) {
                if (e.which === 13) { // Código de tecla ENTER
                    e.preventDefault();
                    e.stopPropagation();
                    
                    var newVal = parseInt($(this).val(), 10) || 0;
                    var $wrapper = $(this).closest('[data-key]');
                    var cartItemKey = $wrapper.data('key');
                    
                    // Si es 0, aplicar clase para animación
                    if (newVal === 0) {
                        $wrapper.addClass('removing');
                    }
                    
                    // Actualizar en el servidor
                    updateQuantity(cartItemKey, newVal);
                    
                    return false;
                }
            });
            
            // Evento para cambios en el campo (blur)
            $input.on('change.directfix', function(e) {
                e.preventDefault();
                
                var newVal = parseInt($(this).val(), 10) || 0;
                var $wrapper = $(this).closest('[data-key]');
                var cartItemKey = $wrapper.data('key');
                
                // Si es 0, aplicar clase para animación
                if (newVal === 0) {
                    $wrapper.addClass('removing');
                }
                
                // Actualizar en el servidor
                updateQuantity(cartItemKey, newVal);
            });
        });
    }
    
    // Aplicar los eventos inmediatamente
    bindDirectEvents();
    
    // Aplicar eventos después de cualquier actualización del carrito
    $(document).on('snap_sidebar_cart_updated', function() {
        bindDirectEvents();
    });
});