/**
 * Módulo AJAX Handler - Manejo de peticiones AJAX
 */
import $ from 'jquery';

// Objeto global para el carrito
window.snap_sidebar_cart = window.snap_sidebar_cart || {};

/**
 * Actualiza un elemento del carrito
 */
export function updateCartItem(cartItemKey, quantity) {
    console.log('Actualizando cantidad:', cartItemKey, quantity);
    
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
                updateCartContent(response.data);
            } else {
                hideAllLoaders();
                if (response.data && response.data.message) {
                    alert(response.data.message);
                }
            }
        },
        error: function() {
            hideAllLoaders();
            alert('Error al comunicarse con el servidor');
        }
    });
}

/**
 * Elimina un elemento del carrito
 */
export function removeCartItem(cartItemKey) {
    console.log('Eliminando producto:', cartItemKey);
    
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
                updateCartContent(response.data);
            } else {
                hideAllLoaders();
                if (response.data && response.data.message) {
                    alert(response.data.message);
                }
            }
        },
        error: function() {
            hideAllLoaders();
            alert('Error al comunicarse con el servidor');
        }
    });
}

/**
 * Actualiza el contenido del carrito
 */
export function updateCartContent(data) {
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
    hideAllLoaders();
    
    // Disparar evento personalizado para que otros scripts puedan reaccionar
    $(document.body).trigger('snap_sidebar_cart_updated', [data]);
}

/**
 * Oculta todos los preloaders
 */
function hideAllLoaders() {
    if (window.snap_sidebar_cart.hideAllLoaders) {
        window.snap_sidebar_cart.hideAllLoaders();
    }
}

// Exportar funciones para uso global
window.snap_sidebar_cart.updateCartItem = updateCartItem;
window.snap_sidebar_cart.removeCartItem = removeCartItem;
window.snap_sidebar_cart.updateCartContent = updateCartContent;