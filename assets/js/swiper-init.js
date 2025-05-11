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
            
            if ($hoverImage.length) {
                // Configurar hover
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
        $targetContainer.html(
            '<div class="swiper-slide snap-sidebar-cart__loading-products">' +
            '<div class="snap-sidebar-cart__loader-spinner preloader-circle"></div>' +
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
            // Aplicar el ancho correcto basado en la configuración del admin
            $(this).css('width', 'calc(' + columnWidth + '% - 20px)');
            
            var productHtml = $(this).prop('outerHTML');
            result += '<div class="swiper-slide">' + productHtml + '</div>';
        });
        
        return result || '<div class="swiper-slide snap-sidebar-cart__no-products">No se encontraron productos.</div>';
    }

    // Inicializar cuando el DOM esté listo
    $(document).ready(function() {
        console.log("Inicializando sistema de Swiper para Snap Sidebar Cart");
        
        // Log de la configuración general para debug
        console.log("Configuración general de productos relacionados:", {
            slidesToScroll: snap_sidebar_cart_params.slides_to_scroll,
            columns: snap_sidebar_cart_params.related.columns,
            totalProducts: snap_sidebar_cart_params.related.count
        });
        
        // Aplicar el ancho correcto a todos los productos inmediatamente
        var slidesPerView = parseInt(snap_sidebar_cart_params.related.columns) || 2;
        var columnWidth = 100 / slidesPerView;
        
        // Aplicar estilos directamente a través de CSS en el head
        $('<style>').prop('type', 'text/css')
            .html('.snap-sidebar-cart__related-product { width: calc(' + columnWidth + '% - 20px) !important; }')
            .appendTo('head');
        
        // Cambio de pestaña en productos relacionados
        $(document).on('click', '.snap-sidebar-cart__related-tab', function(e) {
            e.preventDefault();
            var $tab = $(this);
            var tabType = $tab.data('tab');
            
            // Comprobar si ya está activa
            if ($tab.hasClass('active')) {
                return;
            }
            
            console.log("Cambio a pestaña: " + tabType);
            
            // Actualizar UI
            $('.snap-sidebar-cart__related-tab').removeClass('active');
            $tab.addClass('active');
            
            $('.snap-sidebar-cart__related-container').removeClass('active');
            $('.snap-sidebar-cart__related-container[data-content="' + tabType + '"]').addClass('active');
            
            // Cargar productos si el contenedor está vacío
            var $targetContainer = $('.snap-sidebar-cart__related-container[data-content="' + tabType + '"] .swiper-wrapper');
            var $slides = $targetContainer.children();
            
            // Eliminar cualquier estilo inline de altura que pueda estar causando problemas
            $targetContainer.css('height', '');
            
            // Aplicar el ancho correcto a todos los productos en este contenedor
            var slidesPerView = parseInt(snap_sidebar_cart_params.related.columns) || 2;
            var columnWidth = 100 / slidesPerView;
            $targetContainer.find('.snap-sidebar-cart__related-product').css('width', 'calc(' + columnWidth + '% - 20px)');
            
            // Forzar actualización de Swiper si existe una instancia
            if (swiperInstances[tabType]) {
                setTimeout(function() {
                    swiperInstances[tabType].update();
                }, 50);
            }
            
            if ($slides.length === 0 || ($slides.length === 1 && $slides.first().hasClass('snap-sidebar-cart__loading-products'))) {
                // Obtener el primer producto del carrito
                var firstProduct = $('.snap-sidebar-cart__product').first();
                if (firstProduct.length) {
                    var productId = firstProduct.data('product-id');
                    if (productId) {
                        loadRelatedProducts(productId, tabType);
                    }
                }
            } else if (swiperInstances[tabType]) {
                // Si ya hay productos, actualizar el Swiper y forzar recalculo de altura
                swiperInstances[tabType].updateSize();
                swiperInstances[tabType].updateSlides();
                swiperInstances[tabType].update();
                
                // Forzar un reflow para asegurar que la altura se actualice correctamente
                setTimeout(function() {
                    swiperInstances[tabType].updateSize();
                    swiperInstances[tabType].updateSlides();
                }, 50);
            }
        });
        
        // Inicializar los swipers existentes al cargar
        $('.snap-sidebar-cart__related-container.active .swiper-container').each(function() {
            // Si hay productos, inicializar Swiper
            var $products = $(this).find('.swiper-wrapper').children();
            
            // Aplicar el ancho correcto a todos los productos en la primera carga
            var slidesPerView = parseInt(snap_sidebar_cart_params.related.columns) || 2;
            var columnWidth = 100 / slidesPerView;
            $(this).find('.snap-sidebar-cart__related-product').css('width', 'calc(' + columnWidth + '% - 20px)');
            
            // Eliminar cualquier estilo inline de altura que pueda estar causando problemas
            $(this).find('.swiper-wrapper').css('height', '');
            
            if ($products.length > 0 && !$products.first().hasClass('snap-sidebar-cart__loading-products')) {
                // Inicializar Swiper solo si hay productos reales
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
                    // Si no hay pestaña activa, activar la primera
                    $activeTab = $('.snap-sidebar-cart__related-tab').first();
                    $activeTab.addClass('active');
                    activeTabType = $activeTab.data('tab');
                    
                    // Activar el contenedor correspondiente
                    $('.snap-sidebar-cart__related-container').removeClass('active');
                    $('.snap-sidebar-cart__related-container[data-content="' + activeTabType + '"]').addClass('active');
                }
                
                // Verificar si hay productos en la pestaña activa
                var $activeContainer = $('.snap-sidebar-cart__related-container[data-content="' + activeTabType + '"]');
                var $targetWrapper = $activeContainer.find('.swiper-wrapper');
                var $products = $targetWrapper.children();
                
                // Si no hay productos o solo está el loader, cargarlos
                if ($products.length === 0 || ($products.length === 1 && $products.first().hasClass('snap-sidebar-cart__loading-products'))) {
                    console.log('Cargando productos para la pestaña activa:', activeTabType);
                    var firstProduct = $('.snap-sidebar-cart__product').first();
                    if (firstProduct.length) {
                        var productId = firstProduct.data('product-id');
                        if (productId) {
                            // Cargar productos para la pestaña activa
                            loadRelatedProducts(productId, activeTabType);
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
