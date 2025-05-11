/**
 * Módulo Preloader - Manejo de preloaders
 */
import $ from 'jquery';

// Objeto global para el carrito
window.snap_sidebar_cart = window.snap_sidebar_cart || {};

/**
 * Crea el HTML del preloader según la configuración
 */
function createPreloaderHTML() {
    // Obtener configuración del preloader
    const preloaderType = snap_sidebar_cart_params && 
                         snap_sidebar_cart_params.preloader && 
                         snap_sidebar_cart_params.preloader.type ? 
                         snap_sidebar_cart_params.preloader.type : 'circle';
    
    const preloaderColor = snap_sidebar_cart_params && 
                          snap_sidebar_cart_params.preloader && 
                          snap_sidebar_cart_params.preloader.color ? 
                          snap_sidebar_cart_params.preloader.color : '#3498db';
    
    const preloaderColor2 = snap_sidebar_cart_params && 
                           snap_sidebar_cart_params.preloader && 
                           snap_sidebar_cart_params.preloader.color2 ? 
                           snap_sidebar_cart_params.preloader.color2 : '#e74c3c';
    
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
            loaderHTML = '<div class="snap-sidebar-cart__loader-dots" style="width: ' + preloaderSize + '; height: ' + preloaderSize + ';"><span style="background-color: ' + preloaderColor + ';"></span><span style="background-color: ' + preloaderColor2 + ';"></span><span style="background-color: ' + preloaderColor + ';"></span></div>';
            break;
        case 'dual-ring':
            loaderHTML = '<div class="snap-sidebar-cart__loader-dual-ring" style="width: ' + preloaderSize + '; height: ' + preloaderSize + '; border-color: ' + preloaderColor + ' ' + preloaderColor2 + ' ' + preloaderColor + ' ' + preloaderColor2 + ';"></div>';
            break;
        default:
            loaderHTML = '<div class="snap-sidebar-cart__loader-spinner" style="border-color: ' + preloaderColor + ' transparent transparent transparent; width: ' + preloaderSize + '; height: ' + preloaderSize + ';"></div>';
    }
    
    return loaderHTML;
}

/**
 * Muestra el preloader global
 */
export function showGlobalLoader() {
    const $loader = $('.snap-sidebar-cart__loader');
    
    // Si no existe el preloader, crearlo
    if (!$loader.length) {
        const loaderHTML = createPreloaderHTML();
        $('<div class="snap-sidebar-cart__loader">' + loaderHTML + '</div>').appendTo('.snap-sidebar-cart');
    } else {
        // Actualizar el HTML del preloader
        $loader.html(createPreloaderHTML());
    }
    
    $('.snap-sidebar-cart__loader').addClass('active').css('display', 'flex');
    console.log('Preloader global mostrado');
}

/**
 * Oculta el preloader global
 */
export function hideGlobalLoader() {
    $('.snap-sidebar-cart__loader').removeClass('active').hide();
    console.log('Preloader global ocultado');
}

/**
 * Muestra el preloader para un producto específico
 */
export function showProductLoader($product) {
    if (!$product || !$product.length) return;
    
    $product.addClass('updating');
    let $loader = $product.find('.snap-sidebar-cart__product-loader');
    
    // Crear el HTML del preloader
    const loaderHTML = createPreloaderHTML();
    
    if (!$loader.length) {
        $loader = $('<div class="snap-sidebar-cart__product-loader">' + loaderHTML + '</div>');
        $product.append($loader);
    } else {
        $loader.html(loaderHTML);
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

/**
 * Inicializa el controlador de preloader
 */
function initPreloader() {
    console.log('Inicializando controlador de preloader');
    
    // Aplicar estilos CSS adicionales para los preloaders
    const preloaderCSS = `
        .snap-sidebar-cart__loader-dots {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .snap-sidebar-cart__loader-dots span {
            width: 25%;
            height: 25%;
            border-radius: 50%;
            animation: snap-sidebar-cart-loader-dots 1.4s infinite ease-in-out both;
        }
        
        .snap-sidebar-cart__loader-dots span:nth-child(1) {
            animation-delay: -0.32s;
        }
        
        .snap-sidebar-cart__loader-dots span:nth-child(2) {
            animation-delay: -0.16s;
        }
        
        @keyframes snap-sidebar-cart-loader-dots {
            0%, 80%, 100% { transform: scale(0); }
            40% { transform: scale(1); }
        }
        
        .snap-sidebar-cart__loader-dual-ring {
            display: inline-block;
            border-style: solid;
            border-width: 5px;
            border-radius: 50%;
            animation: snap-sidebar-cart-loader-dual-ring 1.2s linear infinite;
        }
        
        @keyframes snap-sidebar-cart-loader-dual-ring {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    
    // Agregar estilos al head
    $('<style>').text(preloaderCSS).appendTo('head');
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