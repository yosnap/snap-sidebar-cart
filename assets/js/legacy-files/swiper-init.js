/**
 * Inicialización y configuración de Swiper.js para los sliders de productos relacionados
 */
(function ($) {
    "use strict";

    // Objeto para almacenar todas las instancias de Swiper
    var swiperInstances = {};

    /**
     * Inicializa un slider Swiper
     * @param {string} container - Selector del contenedor
     */
    function initSwiper(container) {
        var $container = $(container);
        var tabId = $container.closest('.snap-sidebar-cart__related-container').data('content');
        
        // Verificar si ya existe una instancia para este tab
        if (swiperInstances[tabId]) {
            swiperInstances[tabId].destroy();
        }
        
        console.log("Inicializando Swiper para pestaña: " + tabId);
        
        // Eliminar cualquier estilo inline de altura que pueda estar causando problemas
        $container.find('.swiper-wrapper').css('height', '');
        
        // Obtener configuración desde los parámetros del admin
        var slidesToScroll = parseInt(snap_sidebar_cart_params.slides_to_scroll) || 2;
        var slidesPerView = parseInt(snap_sidebar_cart_params.related.columns) || 2;
        
        // Log para debug
        console.log("Configuración del slider para " + tabId + ":", {
            slidesToScroll: slidesToScroll,
            slidesPerView: slidesPerView,
            totalProducts: snap_sidebar_cart_params.related.count || 4
        });
        
        // Configurar el slider con Swiper
        swiperInstances[tabId] = new Swiper(container, {
            slidesPerView: slidesPerView,
            spaceBetween: 10,
            navigation: {
                nextEl: $container.find('.swiper-button-next')[0],
                prevEl: $container.find('.swiper-button-prev')[0],
            },
            // Usar slidesPerGroup con el valor configurado de slides_to_scroll
            slidesPerGroup: slidesToScroll,
            watchOverflow: true,
            resistance: true,
            resistanceRatio: 0.85,
            grabCursor: true,
            autoHeight: false, // Cambiado a false para evitar problemas de altura
            updateOnWindowResize: true,
            observer: true, // Observar cambios en el DOM
            observeParents: true, // Observar cambios en los padres
            resizeObserver: true, // Usar ResizeObserver si está disponible
            on: {
                init: function() {
                    console.log('Swiper inicializado para: ' + tabId);
                    
                    // Configurar evento de hover para imágenes de galería
                    setupProductGalleryHover();
                    
                    // Forzar actualización de tamaño después de la inicialización
                    setTimeout(function() {
                        swiperInstances[tabId].updateSize();
                        swiperInstances[tabId].updateSlides();
                    }, 50);
                },
                slideChange: function() {
                    console.log('Cambio de slide en: ' + tabId);
                }
            }
        });
        
        return swiperInstances[tabId];
    }

    /**
     * Configurar el hover que muestra las imágenes de galería
     */
    function setupProductGalleryHover() {
        $('.snap-sidebar-cart__related-product').each(function() {
            var $product = $(this);
            var $primaryImage = $product.find('.primary-image');
            var $hoverImage = $product.find('.hover-image');
            
            // Verificar si hay una imagen de hover válida
            if ($hoverImage.length) {
                // Verificar que la imagen de hover tenga un src válido
                var hoverImageSrc = $hoverImage.attr('src');
                var hasValidHoverImage = hoverImageSrc && 
                                        hoverImageSrc.trim() !== '' && 
                                        !hoverImageSrc.includes('placeholder');
                
                if (hasValidHoverImage) {
                    // Configurar hover con cambio de imagen
                    $product.hover(
                        function() {
                            // Mouse enter
                            $primaryImage.css('opacity', '0');
                            $hoverImage.css('opacity', '1');
                        },
                        function() {
                            // Mouse leave
                            $primaryImage.css('opacity', '1');
                            $hoverImage.css('opacity', '0');
                        }
                    );
                } else {
                    // Si la imagen de hover no es válida, solo aplicar efecto de zoom sin cambiar la imagen
                    $product.hover(
                        function() {
                            // Mouse enter - solo aplicar efecto de zoom
                            $product.addClass('hover-active');
                        },
                        function() {
                            // Mouse leave - quitar efecto de zoom
                            $product.removeClass('hover-active');
                        }
                    );
                }
            } else {
                // Si no hay imagen de hover, solo aplicar efecto de zoom sin cambiar la imagen
                $product.hover(
                    function() {
                        // Mouse enter - solo aplicar efecto de zoom
                        $product.addClass('hover-active');
                    },
                    function() {
                        // Mouse leave - quitar efecto de zoom
                        $product.removeClass('hover-active');
                    }
                );
            }
        });
    }

    /**
     * Cargar productos relacionados y inicializar el slider
     * @param {number} productId - ID del producto
     * @param {string} type - Tipo de productos relacionados
     */
    function loadRelatedProducts(productId, type) {
        console.log("=== INICIO loadRelatedProducts con Swiper ===");
        console.log("Cargando productos relacionados para ID: " + productId + ", tipo: " + type);
        
        var $targetContainer = $('.snap-sidebar-cart__related-container[data-content="' + type + '"] .swiper-wrapper');
        
        if ($targetContainer.length === 0) {
            console.error("No se encontró el contenedor para productos relacionados");
            return;
        }
        
        // Obtener configuración desde los parámetros del admin
        var slidesToScroll = parseInt(snap_sidebar_cart_params.slides_to_scroll) || 2;
        var slidesPerView = parseInt(snap_sidebar_cart_params.related.columns) || 2;
        var totalProducts = parseInt(snap_sidebar_cart_params.related.count) || 4;
        
        // Mostrar preloader
        
        // Obtener configuración del preloader desde los parámetros globales
        var preloaderType = 'circle';
        var preloaderPosition = 'center';
        var preloaderColor = '#3498db';
        var preloaderColor2 = '#e74c3c';
        var preloaderSize = '40px';
        
        // Si existen los parámetros, usarlos
        if (typeof snap_sidebar_cart_params !== 'undefined' && snap_sidebar_cart_params.preloader) {
            preloaderType = snap_sidebar_cart_params.preloader.type || 'circle';
            preloaderPosition = snap_sidebar_cart_params.preloader.position || 'center';
            preloaderColor = snap_sidebar_cart_params.preloader.color || '#3498db';
            preloaderColor2 = snap_sidebar_cart_params.preloader.color2 || '#e74c3c';
            preloaderSize = snap_sidebar_cart_params.preloader.size || '40px';
        }
        
        console.log('swiper-init.js - Configuración del preloader:', {
            type: preloaderType,
            position: preloaderPosition,
            color: preloaderColor,
            color2: preloaderColor2,
            size: preloaderSize
        });
        
        // Crear clases del preloader
        var preloaderClasses = 'snap-sidebar-cart__loader-spinner ' + 
                              'preloader-' + preloaderType + ' ' +
                              'preloader-position-' + preloaderPosition;
        
        // Crear estilos inline para el preloader
        var inlineStyles = '';
        
        // Aplicar estilos según el tipo de preloader
        if (preloaderType === 'circle') {
            inlineStyles = 'width: ' + preloaderSize + '; ' +
                          'height: ' + preloaderSize + '; ' +
                          'border-color: ' + preloaderColor + '; ' +
                          'border-top-color: ' + preloaderColor2 + ';';
        } else {
            inlineStyles = 'width: ' + preloaderSize + '; ' +
                          'height: ' + preloaderSize + ';';
        }
        
        // Crear el HTML del preloader
        var preloaderHTML = '<div class="' + preloaderClasses + '" style="' + inlineStyles + '"';
        
        // Añadir contenido específico según el tipo de preloader
        if (preloaderType === 'dots') {
            preloaderHTML += '><span style="background-color: ' + preloaderColor + ';"></span>' +
                           '<span style="background-color: ' + preloaderColor + ';"></span>' +
                           '<span style="background-color: ' + preloaderColor + ';"></span>';
        } else {
            preloaderHTML += '>';
        }
        
        // Cerrar la etiqueta div
        preloaderHTML += '</div>';
        
        $targetContainer.html(
            '<div class="swiper-slide snap-sidebar-cart__loading-products">' +
            preloaderHTML +
            '<span>Cargando productos...</span>' +
            '</div>'
        );
        
        // Realizar la petición AJAX
        $.ajax({
            type: "POST",
            url: snap_sidebar_cart_params.ajax_url,
            data: {
                action: "snap_sidebar_cart_get_related",
                nonce: snap_sidebar_cart_params.nonce,
                product_id: productId,
                type: type,
                count: totalProducts // Pasar el número total de productos configurado en el admin
            },
            success: function(response) {
                console.log("Respuesta AJAX recibida");
                
                if (response.success && response.data.html) {
                    // Preparar los productos para Swiper
                    var productsHtml = prepareSwiperSlides(response.data.html);
                    $targetContainer.html(productsHtml);
                    
                    // Inicializar o actualizar Swiper
                    var swiperContainer = $targetContainer.closest('.swiper-container')[0];
                    if (swiperContainer) {
                        var swiper = initSwiper(swiperContainer);
                        
                        // Verificar si hay suficientes productos para mostrar los controles de navegación
                        // Solo mostrar si hay más productos que el número de columnas
                        if (response.data.count <= slidesPerView) {
                            // Ocultar botones de navegación si hay pocos productos
                            $targetContainer.closest('.swiper-container').find('.swiper-button-prev, .swiper-button-next').hide();
                        } else {
                            $targetContainer.closest('.swiper-container').find('.swiper-button-prev, .swiper-button-next').show();
                        }
                    }
                } else {
                    console.log("No se encontraron productos o respuesta inválida");
                    $targetContainer.html(
                        '<div class="swiper-slide snap-sidebar-cart__no-products">No se encontraron productos relacionados.</div>'
                    );
                    $targetContainer.closest('.swiper-container').find('.swiper-button-prev, .swiper-button-next').hide();
                }
            },
            error: function(xhr, status, error) {
                console.error("Error AJAX: " + error);
                $targetContainer.html(
                    '<div class="swiper-slide snap-sidebar-cart__no-products">Error al cargar productos.</div>'
                );
                $targetContainer.closest('.swiper-container').find('.swiper-button-prev, .swiper-button-next').hide();
            }
        });
    }
    
    /**
     * Prepara el HTML de los productos para Swiper
     * @param {string} html - HTML original de los productos
     * @return {string} HTML preparado con slides de Swiper
     */
    function prepareSwiperSlides(html) {
        var $temp = $('<div>').html(html);
        var result = '';
        
        // Obtener configuración de columnas desde los parámetros del admin
        var slidesPerView = parseInt(snap_sidebar_cart_params.related.columns) || 2;
        var columnWidth = 100 / slidesPerView;
        
        // Asegurar que cada producto tenga el ancho correcto según la configuración
        $temp.find('.snap-sidebar-cart__related-product').each(function() {
            var $product = $(this);
            
            // Envolver cada producto en un slide de Swiper
            result += '<div class="swiper-slide">' + $('<div>').append($product.clone()).html() + '</div>';
        });
        
        return result;
    }

    // Inicializar cuando el DOM esté listo
    $(document).ready(function() {
        console.log("Inicializando sistema de Swiper para Snap Sidebar Cart");
        
        // Log de la configuración general para debug
        console.log("Configuración general de productos relacionados:", {
            columns: snap_sidebar_cart_params.related.columns || 2,
            count: snap_sidebar_cart_params.related.count || 4,
            slides_to_scroll: snap_sidebar_cart_params.slides_to_scroll || 2
        });
        
        // Inicializar sliders existentes
        $('.snap-sidebar-cart__related-container.active .swiper-container').each(function() {
            // Si hay productos, inicializar Swiper
            var $products = $(this).find('.swiper-wrapper').children();
            
            // Aplicar el ancho correcto a todos los productos en la primera carga
            if ($products.length > 0 && !$products.hasClass('snap-sidebar-cart__loading-products')) {
                initSwiper(this);
            }
        });
        
        // Cuando se abre el sidebar
        $(document).on('click', snap_sidebar_cart_params.activation_selectors, function() {
            // Esperar a que se abra el sidebar
            setTimeout(function() {
                console.log('Sidebar abierto, aplicando estilos y actualizando sliders');
                
                // Aplicar el ancho correcto a todos los productos
                var slidesPerView = parseInt(snap_sidebar_cart_params.related.columns) || 2;
                var columnWidth = 100 / slidesPerView;
                $('.snap-sidebar-cart__related-product').css('width', 'calc(' + columnWidth + '% - 20px)');
                
                // Eliminar cualquier estilo inline de altura que pueda estar causando problemas
                $('.swiper-wrapper').css('height', '');
                
                // Verificar si hay que cargar productos en la pestaña activa
                var $activeTab = $('.snap-sidebar-cart__related-tab.active');
                var activeTabType = $activeTab.length ? $activeTab.data('tab') : null;
                
                if (!activeTabType) {
                    return;
                }
                
                var $container = $('.snap-sidebar-cart__related-container[data-content="' + activeTabType + '"]');
                if ($container.length && $container.find('.snap-sidebar-cart__related-product').length === 0) {
                    // No hay productos cargados en esta pestaña, cargarlos
                    console.log('No hay productos en la pestaña activa, cargando...');
                    
                    // Obtener el ID del producto actual
                    var productId = snap_sidebar_cart_params.current_product_id || 0;
                    
                    if (productId > 0) {
                        loadRelatedProducts(productId, activeTabType);
                    } else {
                        // Intentar obtener el ID del primer producto en el carrito
                        var firstProduct = $('.snap-sidebar-cart__product').first();
                        if (firstProduct.length) {
                            var productId = firstProduct.data('product-id');
                            if (productId) {
                                // Cargar productos para la pestaña activa
                                loadRelatedProducts(productId, activeTabType);
                            }
                        }
                    }
                }
                
                // Actualizar todos los Swipers existentes
                $('.swiper-container').each(function() {
                    var tabId = $(this).closest('.snap-sidebar-cart__related-container').data('content');
                    if (tabId && swiperInstances[tabId]) {
                        console.log('Actualizando Swiper para tab:', tabId);
                        swiperInstances[tabId].updateSize();
                        swiperInstances[tabId].updateSlides();
                        swiperInstances[tabId].update();
                    }
                });
                
                // Forzar un reflow adicional para asegurar que todo se muestre correctamente
                setTimeout(function() {
                    $('.swiper-wrapper').css('height', '');
                    
                    // Actualizar todos los Swipers una vez más
                    for (var tabId in swiperInstances) {
                        if (swiperInstances[tabId]) {
                            swiperInstances[tabId].updateSize();
                            swiperInstances[tabId].updateSlides();
                            swiperInstances[tabId].update();
                        }
                    }
                }, 100);
            }, 300);
        });
        
        // Exponer funciones globalmente
        window.snap_sidebar_cart = window.snap_sidebar_cart || {};
        window.snap_sidebar_cart.loadRelatedProducts = loadRelatedProducts;
        window.snap_sidebar_cart.initSwiper = initSwiper;
    });

})(jQuery);