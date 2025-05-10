/**
 * Módulo Tabs - Manejo de pestañas para productos relacionados
 */
import $ from 'jquery';

// Objeto global para el carrito
window.snap_sidebar_cart = window.snap_sidebar_cart || {};

/**
 * Inicializa el sistema de pestañas
 */
function initTabs() {
    console.log('Inicializando sistema de pestañas');
    
    // Evento para cambiar entre pestañas
    $(document).on('click', '.snap-sidebar-cart__related-tab', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const tabType = $(this).data('tab');
        console.log('Cambiando a pestaña:', tabType);
        
        // Actualizar UI
        $('.snap-sidebar-cart__related-tab').removeClass('active');
        $(this).addClass('active');
        
        $('.snap-sidebar-cart__related-container').removeClass('active');
        const $activeContainer = $('.snap-sidebar-cart__related-container[data-content="' + tabType + '"]');
        $activeContainer.addClass('active');
        
        // Mostrar preloader en el contenedor activo
        if (window.snap_sidebar_cart.showPreloader) {
            window.snap_sidebar_cart.showPreloader($activeContainer);
        }
        
        // Intentar encontrar el contenedor del slider
        let $container = $('#snap-sidebar-cart-related-' + tabType);
        
        // Si no encontramos el contenedor por ID, intentamos buscarlo por el atributo data-content
        if (!$container || !$container.length) {
            $container = $activeContainer.find('.snap-sidebar-cart__related-slider-container');
            if (!$container || !$container.length) {
                // Ocultar preloader si no se encuentra el contenedor
                if (window.snap_sidebar_cart.hidePreloader) {
                    window.snap_sidebar_cart.hidePreloader($activeContainer);
                }
                return;
            }
        }
        
        // Buscar el slider dentro del contenedor
        const $slider = $container.find('.snap-sidebar-cart__related-slider');
        if (!$slider || !$slider.length) {
            // Ocultar preloader si no se encuentra el slider
            if (window.snap_sidebar_cart.hidePreloader) {
                window.snap_sidebar_cart.hidePreloader($activeContainer);
            }
            return;
        }
        
        // Comprobar si hay slides y si necesitamos cargar productos
        const $slides = $slider.children();
        if (!$slides.length || $slides.first().hasClass('snap-sidebar-cart__loading-products') || $slides.first().hasClass('snap-sidebar-cart__no-products')) {
            // Obtener el primer producto del carrito
            const $firstProduct = $('.snap-sidebar-cart__product').first();
            if ($firstProduct.length) {
                const productId = $firstProduct.data('product-id');
                if (productId && window.snap_sidebar_cart.loadRelatedProducts) {
                    window.snap_sidebar_cart.loadRelatedProducts(productId, tabType);
                } else {
                    if (window.snap_sidebar_cart.hidePreloader) {
                        window.snap_sidebar_cart.hidePreloader($activeContainer);
                    }
                }
            } else {
                if (window.snap_sidebar_cart.hidePreloader) {
                    window.snap_sidebar_cart.hidePreloader($activeContainer);
                }
            }
        } else {
            if (window.snap_sidebar_cart.hidePreloader) {
                window.snap_sidebar_cart.hidePreloader($activeContainer);
            }
        }
    });
}

// Inicializar cuando el DOM esté listo
$(document).ready(function() {
    initTabs();
});