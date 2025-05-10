/**
 * Módulo Quantity Handler - Manejo de cantidades de productos
 */
import $ from 'jquery';

// Objeto global para el carrito
window.snap_sidebar_cart = window.snap_sidebar_cart || {};

/**
 * Inicializa los manejadores de cantidades
 */
function initQuantityHandlers() {
    console.log('Inicializando manejadores de cantidades');
    
    // Evento para incrementar cantidad
    $(document).on('click', '.notabutton.quantity-up', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const $button = $(this);
        const $wrapper = $button.closest('.quantity.buttoned-input');
        const $input = $wrapper.find('input.cart-item__quantity-input');
        let cartItemKey = $wrapper.data('cart-item-key') || $input.data('cart-item-key');
        const currentVal = parseInt($input.val(), 10) || 0;
        const $product = $button.closest('.snap-sidebar-cart__product');
        
        if (!cartItemKey && $product.length) {
            cartItemKey = $product.data('cart-item-key');
        }
        
        if (!cartItemKey) {
            console.error('No se pudo obtener la clave del producto');
            return;
        }
        
        const newVal = currentVal + 1;
        $input.val(newVal);
        
        // Mostrar preloader
        if (window.snap_sidebar_cart.showPreloader) {
            window.snap_sidebar_cart.showPreloader($product);
        }
        
        // Actualizar cantidad
        if (window.snap_sidebar_cart.updateCartItem) {
            window.snap_sidebar_cart.updateCartItem(cartItemKey, newVal);
        }
    });
    
    // Evento para decrementar cantidad
    $(document).on('click', '.notabutton.quantity-down', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const $button = $(this);
        const $wrapper = $button.closest('.quantity.buttoned-input');
        const $input = $wrapper.find('input.cart-item__quantity-input');
        let cartItemKey = $wrapper.data('cart-item-key') || $input.data('cart-item-key');
        const currentVal = parseInt($input.val(), 10) || 0;
        const $product = $button.closest('.snap-sidebar-cart__product');
        
        if (!cartItemKey && $product.length) {
            cartItemKey = $product.data('cart-item-key');
        }
        
        if (!cartItemKey) {
            console.error('No se pudo obtener la clave del producto');
            return;
        }
        
        const newVal = Math.max(1, currentVal - 1);
        $input.val(newVal);
        
        // Si la nueva cantidad es 0, eliminamos el producto
        if (newVal === 0) {
            if (window.snap_sidebar_cart.removeCartItem) {
                window.snap_sidebar_cart.removeCartItem(cartItemKey);
            }
            return;
        }
        
        // Mostrar preloader
        if (window.snap_sidebar_cart.showPreloader) {
            window.snap_sidebar_cart.showPreloader($product);
        }
        
        // Actualizar cantidad
        if (window.snap_sidebar_cart.updateCartItem) {
            window.snap_sidebar_cart.updateCartItem(cartItemKey, newVal);
        }
    });
    
    // Evento para cambio manual de cantidad
    $(document).on('change', 'input.cart-item__quantity-input', function(e) {
        const $input = $(this);
        const $wrapper = $input.closest('.quantity.buttoned-input');
        let cartItemKey = $wrapper.data('cart-item-key') || $input.data('cart-item-key');
        let newVal = parseInt($input.val(), 10) || 1;
        const $product = $input.closest('.snap-sidebar-cart__product');
        
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
        if (window.snap_sidebar_cart.showPreloader) {
            window.snap_sidebar_cart.showPreloader($product);
        }
        
        // Actualizar cantidad
        if (window.snap_sidebar_cart.updateCartItem) {
            window.snap_sidebar_cart.updateCartItem(cartItemKey, newVal);
        }
    });
    
    // Evento para eliminar un producto del carrito
    $(document).on('click', '.snap-sidebar-cart__product-remove', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const $button = $(this);
        const $product = $button.closest('.snap-sidebar-cart__product');
        const cartItemKey = $product.data('cart-item-key');
        
        if (!cartItemKey) {
            console.error('No se pudo obtener la clave del producto');
            return;
        }
        
        // Mostrar preloader
        if (window.snap_sidebar_cart.showPreloader) {
            window.snap_sidebar_cart.showPreloader($product);
        }
        
        // Eliminar producto
        if (window.snap_sidebar_cart.removeCartItem) {
            window.snap_sidebar_cart.removeCartItem(cartItemKey);
        }
    });
}

// Inicializar cuando el DOM esté listo
$(document).ready(function() {
    initQuantityHandlers();
});