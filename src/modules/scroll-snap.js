/**
 * Módulo Scroll Snap - Manejo de sliders con scroll snap
 */
import $ from 'jquery';

// Objeto global para el carrito
window.snap_sidebar_cart = window.snap_sidebar_cart || {};

/**
 * Inicializa el sistema de scroll snap para sliders
 */
function initScrollSnap() {
    console.log("Inicializando sistema de Scroll Snap para Snap Sidebar Cart");
    
    // Evento para botón anterior
    $(document).on('click', '.snap-sidebar-cart__related-prev', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const $slider = $(this).closest('.snap-sidebar-cart__related-slider-container').find('.snap-sidebar-cart__related-slider');
        if ($slider.length) {
            $slider.animate({
                scrollLeft: Math.max(0, $slider.scrollLeft() - $slider.width() * 0.8)
            }, 300);
        }
    });
    
    // Evento para botón siguiente
    $(document).on('click', '.snap-sidebar-cart__related-next', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const $slider = $(this).closest('.snap-sidebar-cart__related-slider-container').find('.snap-sidebar-cart__related-slider');
        if ($slider.length) {
            const maxScroll = $slider[0].scrollWidth - $slider.width();
            $slider.animate({
                scrollLeft: Math.min(maxScroll, $slider.scrollLeft() + $slider.width() * 0.8)
            }, 300);
        }
    });
    
    // Comprobar navegación en todos los sliders al abrir el carrito
    if (snap_sidebar_cart_params && snap_sidebar_cart_params.activation_selectors) {
        $(document).on('click', snap_sidebar_cart_params.activation_selectors, function() {
            // Esperar a que se abra el sidebar
            setTimeout(function() {
                // Comprobar navegación en todos los sliders
                $('.snap-sidebar-cart__related-container').each(function() {
                    checkNavigationVisibility($(this));
                });
            }, 500);
        });
    }
}

/**
 * Comprueba si hay suficientes productos para mostrar los botones de navegación
 */
function checkNavigationVisibility($container) {
    const $slider = $container.find('.snap-sidebar-cart__related-slider');
    const $prevButton = $container.find('.snap-sidebar-cart__related-prev');
    const $nextButton = $container.find('.snap-sidebar-cart__related-next');
    
    if (!$slider.length || !$prevButton.length || !$nextButton.length) return;
    
    // Comprobar si hay suficiente contenido para hacer scroll
    const hasOverflow = $slider[0].scrollWidth > $slider.width();
    
    // Mostrar u ocultar botones según sea necesario
    if (hasOverflow) {
        $prevButton.show();
        $nextButton.show();
    } else {
        $prevButton.hide();
        $nextButton.hide();
    }
}

/**
 * Carga productos relacionados mediante AJAX
 */
function loadRelatedProducts(productId, type) {
    if (!productId || !type) {
        console.error('ID de producto o tipo no especificados');
        return;
    }
    
    console.log('Cargando productos relacionados:', type, 'para producto ID:', productId);
    
    // Mostrar preloader en el contenedor de productos relacionados
    const $container = $('.snap-sidebar-cart__related-container[data-content="' + type + '"]');
    const $slider = $container.find('.snap-sidebar-cart__related-slider');
    
    // Mostrar mensaje de carga
    if ($slider.children().length === 0) {
        $slider.html('<div class="snap-sidebar-cart__loading-products">Cargando productos...</div>');
    }
    
    // Realizar solicitud AJAX
    $.ajax({
        type: 'POST',
        url: snap_sidebar_cart_params.ajax_url,
        data: {
            action: 'snap_sidebar_cart_get_related',
            nonce: snap_sidebar_cart_params.nonce,
            product_id: productId,
            type: type
        },
        success: function(response) {
            if (response.success) {
                $slider.html(response.data.html);
                
                // Inicializar slider si hay productos
                if (response.data.count > 0) {
                    // Ajustar ancho de slides según número de columnas
                    const columns = parseInt(response.data.columns) || 2;
                    $container.attr('class', $container.attr('class').replace(/snap-sidebar-cart__columns-\\d+/g, ''));
                    $container.addClass('snap-sidebar-cart__columns-' + columns);
                    
                    // Comprobar navegación
                    checkNavigationVisibility($container);
                } else {
                    $slider.html('<div class="snap-sidebar-cart__no-products">No hay productos disponibles</div>');
                }
                
                // Ocultar preloader
                if (window.snap_sidebar_cart.hidePreloader) {
                    window.snap_sidebar_cart.hidePreloader($container);
                }
            } else {
                $slider.html('<div class="snap-sidebar-cart__no-products">Error al cargar productos</div>');
                
                // Ocultar preloader
                if (window.snap_sidebar_cart.hidePreloader) {
                    window.snap_sidebar_cart.hidePreloader($container);
                }
            }
        },
        error: function() {
            $slider.html('<div class="snap-sidebar-cart__no-products">Error al cargar productos</div>');
            
            // Ocultar preloader
            if (window.snap_sidebar_cart.hidePreloader) {
                window.snap_sidebar_cart.hidePreloader($container);
            }
        }
    });
}

// Exportar funciones para uso global
window.snap_sidebar_cart.loadRelatedProducts = loadRelatedProducts;
window.snap_sidebar_cart.checkNavigationVisibility = checkNavigationVisibility;

// Inicializar cuando el DOM esté listo
$(document).ready(function() {
    initScrollSnap();
});