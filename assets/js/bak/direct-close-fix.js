/**
 * Fix directo para el botón de cierre y botones de cantidad
 */
jQuery(document).ready(function($) {
    'use strict';
    
    console.log('Aplicando fix directo para botones');
    
    // Fix para botón de cierre
    $(document).on('click', '.snap-sidebar-cart__close, #snap-sidebar-cart-close', function() {
        console.log('Botón de cierre clickeado - Fix directo');
        $('.snap-sidebar-cart').removeClass('open');
        $('.snap-sidebar-cart__overlay').hide();
        $('body').removeClass('snap-sidebar-cart-open');
        return false;
    });
    
    // Fix para overlay
    $(document).on('click', '.snap-sidebar-cart__overlay', function() {
        console.log('Overlay clickeado - Fix directo');
        $('.snap-sidebar-cart').removeClass('open');
        $('.snap-sidebar-cart__overlay').hide();
        $('body').removeClass('snap-sidebar-cart-open');
        return false;
    });
    
    // Fix para botón incrementar cantidad
    $(document).on('click', '.notabutton.quantity-up', function() {
        console.log('Botón incrementar clickeado - Fix directo');
        var $input = $(this).siblings('input.cart-item__quantity-input');
        var currentVal = parseInt($input.val() || 0);
        var cartItemKey = $(this).closest('[data-key]').data('key');
        
        if (cartItemKey) {
            var newVal = currentVal + 1;
            $input.val(newVal);
            
            // Hacer la llamada AJAX directo
            $.ajax({
                type: 'POST',
                url: snap_sidebar_cart_params.ajax_url,
                data: {
                    action: 'snap_sidebar_cart_update',
                    cart_item_key: cartItemKey,
                    quantity: newVal,
                    nonce: snap_sidebar_cart_params.nonce
                },
                success: function(response) {
                    if (response.success) {
                        // Recargar la página para simplificar
                        location.reload();
                    }
                }
            });
        }
        
        return false;
    });
    
    // Fix para botón decrementar cantidad
    $(document).on('click', '.notabutton.quantity-down', function() {
        console.log('Botón decrementar clickeado - Fix directo');
        var $input = $(this).siblings('input.cart-item__quantity-input');
        var currentVal = parseInt($input.val() || 0);
        var cartItemKey = $(this).closest('[data-key]').data('key');
        
        if (cartItemKey && currentVal > 0) {
            var newVal = currentVal - 1;
            $input.val(newVal);
            
            // Hacer la llamada AJAX directo
            $.ajax({
                type: 'POST',
                url: snap_sidebar_cart_params.ajax_url,
                data: {
                    action: 'snap_sidebar_cart_update',
                    cart_item_key: cartItemKey,
                    quantity: newVal,
                    nonce: snap_sidebar_cart_params.nonce
                },
                success: function(response) {
                    if (response.success) {
                        // Recargar la página para simplificar
                        location.reload();
                    }
                }
            });
        }
        
        return false;
    });
    
    // Reintentar cierre por ESC
    $(document).on('keyup', function(e) {
        if (e.key === 'Escape' || e.keyCode === 27) {
            console.log('ESC presionado - Fix directo');
            if ($('.snap-sidebar-cart').hasClass('open')) {
                $('.snap-sidebar-cart').removeClass('open');
                $('.snap-sidebar-cart__overlay').hide();
                $('body').removeClass('snap-sidebar-cart-open');
            }
        }
    });
});
