/**
 * Módulo Core - Funcionalidad principal del carrito
 */
import $ from 'jquery';

// Objeto global para el carrito
window.snap_sidebar_cart = window.snap_sidebar_cart || {};

// Configuración predeterminada
const defaults = {
    autoOpen: true,
    animationDuration: 300,
    animationDelay: 200
};

/**
 * Abre el carrito lateral
 */
export function openSidebar() {
    console.log('Abriendo carrito lateral');
    $('.snap-sidebar-cart').addClass('open');
    $('.snap-sidebar-cart__overlay').css('display', 'block');
    $('body').addClass('snap-sidebar-cart-open');
    
    // Cargar productos relacionados si es necesario
    const $activeContainer = $('.snap-sidebar-cart__related-container.active');
    if ($activeContainer.length) {
        const tabType = $activeContainer.data('content');
        const $slider = $activeContainer.find('.snap-sidebar-cart__related-slider');
        
        if ($slider.length && $slider.children().length === 0) {
            const $firstProduct = $('.snap-sidebar-cart__product').first();
            if ($firstProduct.length) {
                const productId = $firstProduct.data('product-id');
                if (productId && window.snap_sidebar_cart.loadRelatedProducts) {
                    window.snap_sidebar_cart.loadRelatedProducts(productId, tabType);
                }
            }
        }
    }
}

/**
 * Cierra el carrito lateral
 */
export function closeSidebar() {
    console.log('Cerrando carrito lateral');
    $('.snap-sidebar-cart').removeClass('open');
    $('.snap-sidebar-cart__overlay').css('display', 'none');
    $('body').removeClass('snap-sidebar-cart-open');
}

/**
 * Inicializa el carrito lateral
 */
function initSidebarCart() {
    console.log('Inicializando Snap Sidebar Cart Core');
    
    // Configurar eventos para abrir el carrito
    if (snap_sidebar_cart_params && snap_sidebar_cart_params.activation_selectors) {
        $(document).on('click', snap_sidebar_cart_params.activation_selectors, function(e) {
            e.preventDefault();
            e.stopPropagation();
            openSidebar();
        });
    }
    
    // Evento cuando se añade un producto al carrito
    $(document.body).on('added_to_cart', function(event, fragments, cart_hash, $button) {
        console.log('Producto añadido al carrito', fragments);
        
        // Actualizar el contenido del carrito con los fragmentos recibidos
        if (fragments) {
            $.each(fragments, function(key, value) {
                $(key).replaceWith(value);
            });
            
            // Actualizar el contenido del carrito lateral
            if (fragments['div.widget_shopping_cart_content']) {
                // Extraer productos del fragmento
                const $content = $(fragments['div.widget_shopping_cart_content']);
                const $products = $content.find('.cart_list');
                
                if ($products.length) {
                    $('.snap-sidebar-cart__products').html($products);
                    
                    // Actualizar totales
                    if ($content.find('.total').length) {
                        $('.snap-sidebar-cart__totals').html($content.find('.total').html());
                    }
                    
                    // Actualizar contador
                    const count = $content.find('.cart-items-count').text() || '0';
                    $('.snap-sidebar-cart__count').text(count);
                    $('.cart-contents-count').text(count);
                    $('.cart-count').text(count);
                    
                    // Disparar evento para que otros módulos puedan reaccionar
                    $(document.body).trigger('snap_sidebar_cart_updated');
                }
            }
        }
        
        // Abrir el carrito si está configurado para abrirse automáticamente
        if (snap_sidebar_cart_params && 
            (snap_sidebar_cart_params.auto_open === '1' || 
             snap_sidebar_cart_params.auto_open === true)) {
            openSidebar();
            
            // Mostrar preloader global
            if (window.snap_sidebar_cart.showGlobalLoader) {
                window.snap_sidebar_cart.showGlobalLoader();
                
                // Ocultar preloader después de un tiempo
                setTimeout(function() {
                    if (window.snap_sidebar_cart.hideGlobalLoader) {
                        window.snap_sidebar_cart.hideGlobalLoader();
                    }
                    
                    // Cargar productos relacionados para el primer producto
                    const $firstProduct = $('.snap-sidebar-cart__product').first();
                    if ($firstProduct.length) {
                        const productId = $firstProduct.data('product-id');
                        if (productId && window.snap_sidebar_cart.loadRelatedProducts) {
                            // Obtener el tipo de pestaña activa
                            const $activeTab = $('.snap-sidebar-cart__tab.active');
                            const tabType = $activeTab.length ? $activeTab.data('content') : 'related';
                            
                            console.log('Cargando productos relacionados para el producto #' + productId + ' (tipo: ' + tabType + ')');
                            window.snap_sidebar_cart.loadRelatedProducts(productId, tabType);
                        }
                    }
                }, 800);
            }
        }
    });
    
    // Eventos para cerrar el carrito
    $(document).on('click', '.snap-sidebar-cart__close, .snap-sidebar-cart__overlay', function(e) {
        e.preventDefault();
        e.stopPropagation();
        closeSidebar();
    });
    
    // Cerrar con la tecla Escape
    $(document).on('keyup', function(e) {
        if (e.key === 'Escape' && $('.snap-sidebar-cart').hasClass('open')) {
            closeSidebar();
        }
    });
}

// Exportar funciones para uso global
window.snap_sidebar_cart.openSidebar = openSidebar;
window.snap_sidebar_cart.closeSidebar = closeSidebar;

// Inicializar cuando el DOM esté listo
$(document).ready(function() {
    initSidebarCart();
});