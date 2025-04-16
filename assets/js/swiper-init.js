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
        
        // Configurar el slider con Swiper
        swiperInstances[tabId] = new Swiper(container, {
            slidesPerView: 'auto',
            spaceBetween: 10,
            navigation: {
                nextEl: $container.find('.swiper-button-next')[0],
                prevEl: $container.find('.swiper-button-prev')[0],
            },
            // Usar slidesPerGroup con el valor configurado de slides_to_scroll
            slidesPerGroup: snap_sidebar_cart_params.slides_to_scroll || 2,
            watchOverflow: true,
            resistance: true,
            resistanceRatio: 0.85,
            grabCursor: true,
            autoHeight: true,
            on: {
                init: function() {
                    console.log('Swiper inicializado para: ' + tabId);
                    
                    // Configurar evento de hover para imágenes de galería
                    setupProductGalleryHover();
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
                        
                        // Verificar si hay suficientes productos
                        if (response.data.count <= 2) {
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
        
        // Convertir cada producto en un slide
        $temp.find('.snap-sidebar-cart__related-product').each(function() {
            var productHtml = $(this).prop('outerHTML');
            result += '<div class="swiper-slide">' + productHtml + '</div>';
        });
        
        return result || '<div class="swiper-slide snap-sidebar-cart__no-products">No se encontraron productos.</div>';
    }

    // Inicializar cuando el DOM esté listo
    $(document).ready(function() {
        console.log("Inicializando sistema de Swiper para Snap Sidebar Cart");
        
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
                // Si ya hay productos, actualizar el Swiper
                swiperInstances[tabType].update();
            }
        });
        
        // Inicializar los swipers existentes al cargar
        $('.snap-sidebar-cart__related-container.active .swiper-container').each(function() {
            // Si hay productos, inicializar Swiper
            var $products = $(this).find('.swiper-wrapper').children();
            
            if ($products.length === 0) {
                // Cargar productos
                var firstProduct = $('.snap-sidebar-cart__product').first();
                if (firstProduct.length) {
                    var productId = firstProduct.data('product-id');
                    var tabType = $(this).closest('.snap-sidebar-cart__related-container').data('content');
                    
                    if (productId && tabType) {
                        loadRelatedProducts(productId, tabType);
                    }
                }
            } else if (!$products.first().hasClass('snap-sidebar-cart__loading-products')) {
                // Inicializar Swiper solo si hay productos reales
                initSwiper(this);
            }
        });
        
        // Cuando se abre el sidebar
        $(document).on('click', snap_sidebar_cart_params.activation_selectors, function() {
            // Esperar a que se abra el sidebar
            setTimeout(function() {
                // Actualizar todos los Swipers
                $('.snap-sidebar-cart__swiper-container').each(function() {
                    var tabId = $(this).closest('.snap-sidebar-cart__related-container').data('content');
                    if (swiperInstances[tabId]) {
                        swiperInstances[tabId].update();
                    }
                });
            }, 300);
        });
        
        // Exponer funciones globalmente
        window.snap_sidebar_cart = window.snap_sidebar_cart || {};
        window.snap_sidebar_cart.loadRelatedProducts = loadRelatedProducts;
        window.snap_sidebar_cart.initSwiper = initSwiper;
    });

})(jQuery);
