/**
 * Módulo Preloader - Manejo de preloaders
 */
import $ from 'jquery';

// Objeto global para el carrito
window.snap_sidebar_cart = window.snap_sidebar_cart || {};

/**
 * Muestra el preloader global
 */
export function showGlobalLoader() {
    $('.snap-sidebar-cart__loader').addClass('active').css('display', 'flex');
}

/**
 * Oculta el preloader global
 */
export function hideGlobalLoader() {
    $('.snap-sidebar-cart__loader').removeClass('active').hide();
}

/**
 * Muestra el preloader para un producto específico
 */
export function showProductLoader($product) {
    if (!$product || !$product.length) return;
    
    $product.addClass('updating');
    let $loader = $product.find('.snap-sidebar-cart__product-loader');
    
    if (!$loader.length) {
        $loader = $('<div class="snap-sidebar-cart__product-loader"><div class="snap-sidebar-cart__loader-spinner"></div></div>');
        $product.append($loader);
    }
    
    $loader.css('display', 'flex').addClass('active');
    console.log('Preloader mostrado para producto');
}

/**
 * Oculta el preloader para un producto específico
 */
export function hideProductLoader($product) {
    if (!$product || !$product.length) return;
    
    $product.removeClass('updating');
    $product.find('.snap-sidebar-cart__product-loader').removeClass('active').hide();
    console.log('Preloader ocultado para producto');
}

/**
 * Oculta todos los preloaders
 */
export function hideAllLoaders() {
    hideGlobalLoader();
    $('.snap-sidebar-cart__product').each(function() {
        hideProductLoader($(this));
    });
}

// Inicialización
function initPreloader() {
    console.log('Inicializando controlador de preloader');
}

// Exportar funciones para uso global
window.snap_sidebar_cart.showGlobalLoader = showGlobalLoader;
window.snap_sidebar_cart.hideGlobalLoader = hideGlobalLoader;
window.snap_sidebar_cart.showProductLoader = showProductLoader;
window.snap_sidebar_cart.hideProductLoader = hideProductLoader;
window.snap_sidebar_cart.showPreloader = showProductLoader; // Alias para compatibilidad
window.snap_sidebar_cart.hidePreloader = hideProductLoader; // Alias para compatibilidad
window.snap_sidebar_cart.hideAllLoaders = hideAllLoaders;

// Inicializar cuando el DOM esté listo
$(document).ready(function() {
    initPreloader();
});