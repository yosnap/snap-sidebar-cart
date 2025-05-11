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
    
    // Aplicar la configuración de columnas a los contenedores
    function applyColumnsConfiguration() {
        // Obtener la configuración de columnas de los parámetros
        const columnsCount = snap_sidebar_cart_params && 
                            snap_sidebar_cart_params.related && 
                            snap_sidebar_cart_params.related.columns_count ? 
                            parseInt(snap_sidebar_cart_params.related.columns_count) : 2;
        
        console.log('Aplicando configuración de columnas:', columnsCount);
        
        // Aplicar la clase de columnas a todos los contenedores
        $('.snap-sidebar-cart__related-container').each(function() {
            // Eliminar clases de columnas anteriores
            $(this).removeClass(function(index, className) {
                return (className.match(/(^|\s)snap-sidebar-cart__columns-\S+/g) || []).join(' ');
            });
            
            // Agregar la clase con el número correcto de columnas
            $(this).addClass('snap-sidebar-cart__columns-' + columnsCount);
            
            // Aplicar estilos directamente a los productos para forzar el ancho correcto
            const $products = $(this).find('.product, .snap-sidebar-cart__related-product');
            const productWidth = `calc(${100 / columnsCount}% - 10px)`;
            
            $products.css({
                'width': productWidth,
                'flex': `0 0 ${productWidth}`,
                'min-width': productWidth,
                'max-width': productWidth
            });
        });
        
        // Asegurar que los estilos CSS se apliquen correctamente
        applyRelatedProductsStyles(columnsCount);
    }
    
    // Aplicar estilos CSS para asegurar el correcto número de columnas
    function applyRelatedProductsStyles(columnsCount) {
        // Si ya existe el estilo, lo eliminamos para recrearlo
        $('#snap-sidebar-cart-column-fix').remove();
        
        // Crear estilo con el ancho correcto basado en columnas
        const productWidth = `calc(${100 / columnsCount}% - 10px)`;
        
        $('<style id="snap-sidebar-cart-column-fix">')
            .text(
                `.snap-sidebar-cart__related-slider .product, 
                 .snap-sidebar-cart__related-slider .snap-sidebar-cart__related-product { 
                     width: ${productWidth} !important; 
                     flex: 0 0 ${productWidth} !important;
                     min-width: ${productWidth} !important;
                     max-width: ${productWidth} !important;
                 }
                 
                 .snap-sidebar-cart__related-slider {
                     display: flex;
                     overflow-x: auto;
                     scroll-snap-type: x mandatory;
                     -webkit-overflow-scrolling: touch;
                     scrollbar-width: none;
                     -ms-overflow-style: none;
                 }
                 
                 .snap-sidebar-cart__related-slider::-webkit-scrollbar {
                     display: none;
                 }`
            )
            .appendTo('head');
    }
    
    // Evento para botón anterior
    $(document).on('click', '.snap-sidebar-cart__related-prev', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const $slider = $(this).closest('.snap-sidebar-cart__related-slider-container').find('.snap-sidebar-cart__related-slider');
        if ($slider.length) {
            // Obtener el número de slides a desplazar
            const slidesToScroll = 1; // Forzar a 1
            
            // Calcular el ancho de cada slide
            const slideWidth = $slider.find('.snap-sidebar-cart__related-product').first().outerWidth(true);
            
            // Calcular el desplazamiento
            const scrollAmount = slideWidth * slidesToScroll;
            
            $slider.animate({
                scrollLeft: Math.max(0, $slider.scrollLeft() - scrollAmount)
            }, 300);
        }
    });
    
    // Evento para botón siguiente
    $(document).on('click', '.snap-sidebar-cart__related-next', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const $slider = $(this).closest('.snap-sidebar-cart__related-slider-container').find('.snap-sidebar-cart__related-slider');
        if ($slider.length) {
            // Obtener el número de slides a desplazar
            const slidesToScroll = 1; // Forzar a 1
            
            // Calcular el ancho de cada slide
            const slideWidth = $slider.find('.snap-sidebar-cart__related-product').first().outerWidth(true);
            
            // Calcular el desplazamiento
            const scrollAmount = slideWidth * slidesToScroll;
            
            const maxScroll = $slider[0].scrollWidth - $slider.width();
            $slider.animate({
                scrollLeft: Math.min(maxScroll, $slider.scrollLeft() + scrollAmount)
            }, 300);
        }
    });
    
    // Comprobar navegación en todos los sliders al abrir el carrito
    if (snap_sidebar_cart_params && snap_sidebar_cart_params.activation_selectors) {
        $(document).on('click', snap_sidebar_cart_params.activation_selectors, function() {
            // Esperar a que se abra el sidebar
            setTimeout(function() {
                // Aplicar configuración de columnas
                applyColumnsConfiguration();
                
                // Comprobar navegación en todos los sliders
                $('.snap-sidebar-cart__related-container').each(function() {
                    checkNavigationVisibility($(this));
                });
            }, 500);
        });
    }
    
    // Aplicar configuración de columnas al cargar la página
    $(document).ready(function() {
        applyColumnsConfiguration();
    });
}

/**
 * Comprueba si hay suficientes productos para mostrar los botones de navegación
 */
function checkNavigationVisibility($container) {
    const $slider = $container.find('.snap-sidebar-cart__related-slider');
    const $prevButton = $container.find('.snap-sidebar-cart__related-prev');
    const $nextButton = $container.find('.snap-sidebar-cart__related-next');
    
    if ($slider.length && $prevButton.length && $nextButton.length) {
        // Comprobar si hay suficiente contenido para desplazar
        const sliderWidth = $slider.width();
        const contentWidth = $slider[0].scrollWidth;
        
        if (contentWidth <= sliderWidth) {
            // No hay suficiente contenido para desplazar
            $prevButton.hide();
            $nextButton.hide();
        } else {
            // Hay suficiente contenido para desplazar
            $prevButton.show();
            $nextButton.show();
            
            // Comprobar si estamos al inicio o al final
            const scrollLeft = $slider.scrollLeft();
            const maxScroll = contentWidth - sliderWidth;
            
            if (scrollLeft <= 0) {
                $prevButton.addClass('disabled');
            } else {
                $prevButton.removeClass('disabled');
            }
            
            if (scrollLeft >= maxScroll - 5) { // 5px de margen para evitar problemas con redondeo
                $nextButton.addClass('disabled');
            } else {
                $nextButton.removeClass('disabled');
            }
        }
    }
}

/**
 * Carga productos relacionados mediante AJAX
 */
function loadRelatedProducts(productId, type = 'related') {
    console.log('Cargando productos relacionados para el producto #' + productId + ' (tipo: ' + type + ')');
    
    if (!productId) {
        console.error('No se proporcionó un ID de producto válido');
        return;
    }
    
    // Obtener el contenedor
    const $container = $('.snap-sidebar-cart__' + type + '-container');
    
    if (!$container.length) {
        console.error('No se encontró el contenedor para productos ' + type);
        return;
    }
    
    const $slider = $container.find('.snap-sidebar-cart__related-slider');
    
    if (!$slider.length) {
        console.error('No se encontró el slider en el contenedor');
        return;
    }
    
    // Mostrar mensaje de carga
    $slider.html('<div class="snap-sidebar-cart__loading">Cargando productos relacionados...</div>');
    
    // Mostrar preloader
    if (window.snap_sidebar_cart.showPreloader) {
        window.snap_sidebar_cart.showPreloader($container);
    } else {
        // Preloader alternativo si no está disponible la función global
        $container.addClass('loading');
        const $loader = $container.find('.snap-sidebar-cart__container-loader');
        if (!$loader.length) {
            $container.append('<div class="snap-sidebar-cart__container-loader"><div class="snap-sidebar-cart__loader-spinner"></div></div>');
        }
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
            console.log('Respuesta de productos relacionados:', response);
            
            if (response.success && response.data && response.data.html) {
                // Actualizar el contenido del slider
                $slider.html(response.data.html);
                
                // Verificar si hay productos
                if ($slider.find('.product, .snap-sidebar-cart__related-product').length > 0) {
                    // Obtener la configuración de columnas de los parámetros
                    const columnsCount = snap_sidebar_cart_params && 
                                        snap_sidebar_cart_params.related && 
                                        snap_sidebar_cart_params.related.columns_count ? 
                                        parseInt(snap_sidebar_cart_params.related.columns_count) : 2;
                    
                    // Asegurarse de que el contenedor tenga la clase de columnas correcta
                    $container.removeClass(function(index, className) {
                        return (className.match(/(^|\s)snap-sidebar-cart__columns-\S+/g) || []).join(' ');
                    }).addClass('snap-sidebar-cart__columns-' + columnsCount);
                    
                    // Aplicar estilos directamente a los productos
                    const $products = $slider.find('.product, .snap-sidebar-cart__related-product');
                    const productWidth = `calc(${100 / columnsCount}% - 10px)`;
                    
                    $products.css({
                        'width': productWidth,
                        'flex': `0 0 ${productWidth}`,
                        'min-width': productWidth,
                        'max-width': productWidth,
                        'margin-right': '10px',
                        'scroll-snap-align': 'start',
                        'box-sizing': 'border-box'
                    });
                    
                    // Comprobar navegación
                    checkNavigationVisibility($container);
                    
                    // Agregar CSS adicional para aplicar la configuración de columnas
                    if (!$('#snap-sidebar-cart-column-fix').length) {
                        // Obtener la configuración de columnas
                        const columnsCount = snap_sidebar_cart_params && 
                                            snap_sidebar_cart_params.related && 
                                            snap_sidebar_cart_params.related.columns_count ? 
                                            parseInt(snap_sidebar_cart_params.related.columns_count) : 2;
                        
                        // Calcular el ancho basado en el número de columnas
                        const productWidth = `calc(${100 / columnsCount}% - 10px)`;
                        
                        $('<style id="snap-sidebar-cart-column-fix">')
                            .text(`
                                .snap-sidebar-cart__related-slider {
                                    display: flex !important;
                                    overflow-x: auto !important;
                                    scroll-snap-type: x mandatory !important;
                                    -webkit-overflow-scrolling: touch !important;
                                    scrollbar-width: none !important;
                                    -ms-overflow-style: none !important;
                                    padding: 5px 0 !important;
                                }
                                
                                .snap-sidebar-cart__related-slider::-webkit-scrollbar {
                                    display: none !important;
                                }
                                
                                .snap-sidebar-cart__related-slider .product,
                                .snap-sidebar-cart__related-slider .snap-sidebar-cart__related-product {
                                    width: ${productWidth} !important;
                                    flex: 0 0 ${productWidth} !important;
                                    min-width: ${productWidth} !important;
                                    max-width: ${productWidth} !important;
                                    margin-right: 10px !important;
                                    scroll-snap-align: start !important;
                                    box-sizing: border-box !important;
                                }
                                
                                /* Botones de cantidad */
                                .snap-sidebar-cart__quantity-up,
                                .snap-sidebar-cart__quantity-down,
                                .notabutton.quantity-up,
                                .notabutton.quantity-down {
                                    cursor: pointer !important;
                                    user-select: none !important;
                                }
                            `)
                            .appendTo('head');
                    }
                    
                    // Disparar evento personalizado para notificar que los productos relacionados se han cargado
                    $(document.body).trigger('snap_sidebar_cart_related_loaded', [response.data]);
                    
                    console.log(`Productos relacionados cargados: ${$products.length} productos, ${columnsCount} columnas`);
                } else {
                    $slider.html('<div class="snap-sidebar-cart__no-products">No hay productos disponibles</div>');
                }
                
                // Ocultar preloader
                if (window.snap_sidebar_cart.hidePreloader) {
                    window.snap_sidebar_cart.hidePreloader($container);
                } else {
                    // Ocultar preloader alternativo
                    $container.removeClass('loading');
                    $container.find('.snap-sidebar-cart__container-loader').remove();
                }
            } else {
                $slider.html('<div class="snap-sidebar-cart__no-products">Error al cargar productos</div>');
                
                // Ocultar preloader
                if (window.snap_sidebar_cart.hidePreloader) {
                    window.snap_sidebar_cart.hidePreloader($container);
                } else {
                    // Ocultar preloader alternativo
                    $container.removeClass('loading');
                    $container.find('.snap-sidebar-cart__container-loader').remove();
                }
            }
        },
        error: function(xhr, status, error) {
            console.error('Error al cargar productos relacionados:', status, error);
            console.log('Respuesta del servidor:', xhr.responseText);
            
            $slider.html('<div class="snap-sidebar-cart__no-products">Error al cargar productos</div>');
            
            // Ocultar preloader
            if (window.snap_sidebar_cart.hidePreloader) {
                window.snap_sidebar_cart.hidePreloader($container);
            } else {
                // Ocultar preloader alternativo
                $container.removeClass('loading');
                $container.find('.snap-sidebar-cart__container-loader').remove();
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