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
    $(document).on('click', '.notabutton.quantity-up, .snap-sidebar-cart__quantity-up', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const $button = $(this);
        const $wrapper = $button.closest('.quantity.buttoned-input, .snap-sidebar-cart__quantity');
        const $input = $wrapper.find('input.cart-item__quantity-input, input.snap-sidebar-cart__quantity-input');
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
        showProductPreloader($product);
        
        // Actualizar cantidad
        updateCartItem(cartItemKey, newVal);
    });
    
    // Evento para decrementar cantidad
    $(document).on('click', '.notabutton.quantity-down, .snap-sidebar-cart__quantity-down', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const $button = $(this);
        const $wrapper = $button.closest('.quantity.buttoned-input, .snap-sidebar-cart__quantity');
        const $input = $wrapper.find('input.cart-item__quantity-input, input.snap-sidebar-cart__quantity-input');
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
            removeCartItem(cartItemKey, $product);
            return;
        }
        
        // Mostrar preloader
        showProductPreloader($product);
        
        // Actualizar cantidad
        updateCartItem(cartItemKey, newVal);
    });
    
    // Evento para cambio manual de cantidad
    $(document).on('change', 'input.cart-item__quantity-input, input.snap-sidebar-cart__quantity-input', function(e) {
        const $input = $(this);
        const $wrapper = $input.closest('.quantity.buttoned-input, .snap-sidebar-cart__quantity');
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
        showProductPreloader($product);
        
        // Actualizar cantidad
        updateCartItem(cartItemKey, newVal);
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
        
        // Mostrar preloader y eliminar producto
        removeCartItem(cartItemKey, $product);
    });
}

/**
 * Muestra el preloader para un producto específico
 */
function showProductPreloader($product) {
    if (!$product || !$product.length) return;
    
    console.log('Mostrando preloader para producto');
    $product.addClass('updating');
    
    // Usar el preloader configurado
    const preloaderType = snap_sidebar_cart_params && 
                         snap_sidebar_cart_params.preloader && 
                         snap_sidebar_cart_params.preloader.type ? 
                         snap_sidebar_cart_params.preloader.type : 'circle';
    
    const preloaderColor = snap_sidebar_cart_params && 
                          snap_sidebar_cart_params.preloader && 
                          snap_sidebar_cart_params.preloader.color ? 
                          snap_sidebar_cart_params.preloader.color : '#3498db';
    
    const preloaderSize = snap_sidebar_cart_params && 
                         snap_sidebar_cart_params.preloader && 
                         snap_sidebar_cart_params.preloader.size ? 
                         snap_sidebar_cart_params.preloader.size : '40px';
    
    // Crear el HTML del preloader según el tipo configurado
    let loaderHTML = '';
    switch (preloaderType) {
        case 'circle':
            loaderHTML = '<div class="snap-sidebar-cart__loader-spinner" style="border-color: ' + preloaderColor + ' transparent transparent transparent; width: ' + preloaderSize + '; height: ' + preloaderSize + ';"></div>';
            break;
        case 'dots':
            loaderHTML = '<div class="snap-sidebar-cart__loader-dots" style="width: ' + preloaderSize + '; height: ' + preloaderSize + ';"><span style="background-color: ' + preloaderColor + ';"></span><span style="background-color: ' + preloaderColor + ';"></span><span style="background-color: ' + preloaderColor + ';"></span></div>';
            break;
        default:
            loaderHTML = '<div class="snap-sidebar-cart__loader-spinner" style="border-color: ' + preloaderColor + ' transparent transparent transparent; width: ' + preloaderSize + '; height: ' + preloaderSize + ';"></div>';
    }
    
    let $loader = $product.find('.snap-sidebar-cart__product-loader');
    
    if (!$loader.length) {
        $loader = $('<div class="snap-sidebar-cart__product-loader">' + loaderHTML + '</div>');
        $product.append($loader);
    } else {
        $loader.html(loaderHTML);
    }
    
    $loader.css('display', 'flex').addClass('active');
}

/**
 * Actualiza un elemento del carrito
 */
function updateCartItem(cartItemKey, quantity) {
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
function removeCartItem(cartItemKey, $product) {
    console.log('Eliminando producto:', cartItemKey);
    
    // Mostrar preloader
    showProductPreloader($product);
    
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
function updateCartContent(data) {
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
    // Ocultar preloader global
    $('.snap-sidebar-cart__loader').removeClass('active').hide();
    
    // Ocultar preloaders de productos
    $('.snap-sidebar-cart__product').each(function() {
        $(this).removeClass('updating');
        $(this).find('.snap-sidebar-cart__product-loader').removeClass('active').hide();
    });
}

// Exportar funciones para uso global
window.snap_sidebar_cart = window.snap_sidebar_cart || {};
window.snap_sidebar_cart.updateCartItem = updateCartItem;
window.snap_sidebar_cart.removeCartItem = removeCartItem;
window.snap_sidebar_cart.updateCartContent = updateCartContent;
window.snap_sidebar_cart.showProductLoader = showProductPreloader;
window.snap_sidebar_cart.hideAllLoaders = hideAllLoaders;

// Inicializar cuando el DOM esté listo
$(document).ready(function() {
    initQuantityHandlers();
});