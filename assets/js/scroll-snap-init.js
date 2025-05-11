/**
 * Inicialización y configuración de Scroll Snap para los sliders de productos relacionados
 * Mantiene la compatibilidad con la implementación original del sidebar
 */
(function ($) {
    "use strict";

    /**
     * Inicializa un slider con Scroll Snap
     * @param {string} container - Selector del contenedor
     */
    function initScrollSnap(container) {
        var $container = $(container);
        var tabId = $container.closest('.snap-sidebar-cart__related-container').data('content');
        
        console.log("Inicializando Scroll Snap para pestaña: " + tabId);
        
        // Configurar evento de hover para imágenes de galería
        setupProductGalleryHover();
        
        // Configurar botones de navegación
        setupNavigationButtons($container);
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
     * Configurar botones de navegación para el scroll snap
     * @param {jQuery} $container - Contenedor del slider
     */
    function setupNavigationButtons($container) {
        var $track = $container.find('.snap-sidebar-cart__slider-track');
        var $prevBtn = $container.find('.snap-sidebar-cart__slider-prev');
        var $nextBtn = $container.find('.snap-sidebar-cart__slider-next');
        
        // Obtener configuración desde los parámetros del admin
        var slidesToScroll = parseInt(snap_sidebar_cart_params.slides_to_scroll) || 2;
        var slidesPerView = parseInt(snap_sidebar_cart_params.related.columns) || 2;
        
        // Calcular el ancho aproximado de cada slide para el desplazamiento
        var slideWidth = $track.width() / slidesPerView;
        
        $prevBtn.on('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Calcular el desplazamiento basado en slidesToScroll
            var scrollAmount = slideWidth * slidesToScroll;
            $track.animate({
                scrollLeft: Math.max(0, $track.scrollLeft() - scrollAmount)
            }, 300);
        });
        
        $nextBtn.on('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Calcular el desplazamiento basado en slidesToScroll
            var scrollAmount = slideWidth * slidesToScroll;
            var maxScroll = $track[0].scrollWidth - $track.width();
            
            $track.animate({
                scrollLeft: Math.min(maxScroll, $track.scrollLeft() + scrollAmount)
            }, 300);
        });
        
        // Actualizar visibilidad de los botones según la posición del scroll
        updateButtonVisibility($track, $prevBtn, $nextBtn);
        
        // Actualizar visibilidad de botones cuando se hace scroll
        $track.on('scroll', function() {
            updateButtonVisibility($track, $prevBtn, $nextBtn);
        });
    }
    
    /**
     * Actualiza la visibilidad de los botones de navegación según la posición del scroll
     * @param {jQuery} $track - Elemento con scroll
     * @param {jQuery} $prevBtn - Botón anterior
     * @param {jQuery} $nextBtn - Botón siguiente
     */
    function updateButtonVisibility($track, $prevBtn, $nextBtn) {
        var scrollLeft = $track.scrollLeft();
        var maxScroll = $track[0].scrollWidth - $track.width();
        
        // Mostrar/ocultar botón anterior según posición
        if (scrollLeft <= 0) {
            $prevBtn.addClass('disabled');
        } else {
            $prevBtn.removeClass('disabled');
        }
        
        // Mostrar/ocultar botón siguiente según posición
        if (scrollLeft >= maxScroll - 5) { // Tolerancia de 5px
            $nextBtn.addClass('disabled');
        } else {
            $nextBtn.removeClass('disabled');
        }
    }

    /**
     * Cargar productos relacionados e inicializar el slider
     * @param {number} productId - ID del producto
     * @param {string} type - Tipo de productos relacionados
     */
    function loadRelatedProducts(productId, type) {
        console.log("=== INICIO loadRelatedProducts con Scroll Snap ===");
        console.log("Cargando productos relacionados para ID: " + productId + ", tipo: " + type);
        
        var $targetContainer = $('.snap-sidebar-cart__related-container[data-content="' + type + '"] .snap-sidebar-cart__slider-track');
        
        if ($targetContainer.length === 0) {
            console.error("No se encontró el contenedor para productos relacionados");
            return;
        }
        
        // Obtener configuración desde los parámetros del admin
        var slidesPerView = parseInt(snap_sidebar_cart_params.related.columns) || 2;
        var totalProducts = parseInt(snap_sidebar_cart_params.related.count) || 4;
        
        // Mostrar preloader
        $targetContainer.html(
            '<div class="snap-sidebar-cart__related-product snap-sidebar-cart__loading-products">' +
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
                count: totalProducts
            },
            success: function(response) {
                console.log("Respuesta AJAX recibida");
                
                if (response.success && response.data.html) {
                    // Preparar los productos para el slider
                    var productsHtml = prepareScrollSnapItems(response.data.html);
                    $targetContainer.html(productsHtml);
                    
                    // Inicializar Scroll Snap
                    var $sliderContainer = $targetContainer.closest('.snap-sidebar-cart__swiper-container');
                    if ($sliderContainer.length) {
                        initScrollSnap($sliderContainer);
                        
                        // Verificar si hay suficientes productos para mostrar los controles de navegación
                        if (response.data.count <= slidesPerView) {
                            // Ocultar botones de navegación si hay pocos productos
                            $sliderContainer.find('.snap-sidebar-cart__slider-prev, .snap-sidebar-cart__slider-next').hide();
                        } else {
                            $sliderContainer.find('.snap-sidebar-cart__slider-prev, .snap-sidebar-cart__slider-next').show();
                        }
                    }
                } else {
                    console.log("No se encontraron productos o respuesta inválida");
                    $targetContainer.html(
                        '<div class="snap-sidebar-cart__related-product snap-sidebar-cart__no-products">No se encontraron productos relacionados.</div>'
                    );
                    $targetContainer.closest('.snap-sidebar-cart__swiper-container').find('.snap-sidebar-cart__slider-prev, .snap-sidebar-cart__slider-next').hide();
                }
            },
            error: function(xhr, status, error) {
                console.error("Error AJAX: " + error);
                $targetContainer.html(
                    '<div class="snap-sidebar-cart__related-product snap-sidebar-cart__no-products">Error al cargar productos.</div>'
                );
                $targetContainer.closest('.snap-sidebar-cart__swiper-container').find('.snap-sidebar-cart__slider-prev, .snap-sidebar-cart__slider-next').hide();
            }
        });
    }
    
    /**
     * Prepara el HTML de los productos para Scroll Snap
     * @param {string} html - HTML original de los productos
     * @return {string} HTML preparado con clases de Scroll Snap
     */
    function prepareScrollSnapItems(html) {
        var $temp = $('<div>').html(html);
        var result = '';
        
        // Obtener configuración de columnas desde los parámetros del admin
        var slidesPerView = parseInt(snap_sidebar_cart_params.related.columns) || 2;
        var columnWidth = 100 / slidesPerView;
        
        // Asegurar que cada producto tenga el ancho correcto según la configuración
        $temp.find('.snap-sidebar-cart__related-product').each(function() {
            var $product = $(this);
            
            // Aplicar ancho basado en la configuración de columnas
            $product.css('width', columnWidth + '%');
            $product.css('flex', '0 0 ' + columnWidth + '%');
            
            // Asegurar que tenga la clase para scroll-snap
            $product.addClass('snap-sidebar-cart__scroll-snap-item');
            
            result += $('<div>').append($product.clone()).html();
        });
        
        return result;
    }

    // No definimos funciones de apertura/cierre del sidebar aquí para evitar conflictos
    // con las funciones originales en snap-sidebar-cart-public.js

    // Inicializar cuando el DOM esté listo
    $(document).ready(function() {
        console.log("Inicializando sistema de Scroll Snap para Snap Sidebar Cart");
        
        // Log de la configuración general para debug
        console.log("Configuración general de productos relacionados:", {
            columns: snap_sidebar_cart_params.related.columns || 2,
            count: snap_sidebar_cart_params.related.count || 4,
            slides_to_scroll: snap_sidebar_cart_params.slides_to_scroll || 2
        });
        
        // Inicializar sliders existentes
        $('.snap-sidebar-cart__related-container.active .snap-sidebar-cart__swiper-container').each(function() {
            // Si hay productos, inicializar Scroll Snap
            var $products = $(this).find('.snap-sidebar-cart__slider-track').children();
            
            // Aplicar el ancho correcto a todos los productos en la primera carga
            if ($products.length > 0 && !$products.hasClass('snap-sidebar-cart__loading-products')) {
                var slidesPerView = parseInt(snap_sidebar_cart_params.related.columns) || 2;
                var columnWidth = 100 / slidesPerView;
                
                $products.each(function() {
                    $(this).css('width', columnWidth + '%');
                    $(this).css('flex', '0 0 ' + columnWidth + '%');
                    $(this).addClass('snap-sidebar-cart__scroll-snap-item');
                });
                
                initScrollSnap(this);
            }
        });
        
        // Cuando se abre el sidebar (usando el manejador de eventos original)
        $(document).on('click', snap_sidebar_cart_params.activation_selectors, function() {
            // Esperar a que se abra el sidebar
            setTimeout(function() {
                console.log('Sidebar abierto, aplicando estilos y actualizando sliders');
                
                // Aplicar el ancho correcto a todos los productos
                var slidesPerView = parseInt(snap_sidebar_cart_params.related.columns) || 2;
                var columnWidth = 100 / slidesPerView;
                
                // Actualizar productos con las clases de Scroll Snap
                $('.snap-sidebar-cart__related-product').each(function() {
                    $(this).css('width', columnWidth + '%');
                    $(this).css('flex', '0 0 ' + columnWidth + '%');
                    $(this).addClass('snap-sidebar-cart__scroll-snap-item');
                });
                
                // Verificar si hay que cargar productos en la pestaña activa
                var $activeTab = $('.snap-sidebar-cart__related-tab.active');
                var activeTabType = $activeTab.length ? $activeTab.data('tab') : null;
                
                // Obtener el ID del producto actual
                var productId = snap_sidebar_cart_params.current_product_id || 0;
                
                if (productId > 0 && activeTabType) {
                    // Cargar productos relacionados para la pestaña activa
                    var $container = $('.snap-sidebar-cart__related-container[data-content="' + activeTabType + '"]');
                    if ($container.length && $container.find('.snap-sidebar-cart__related-product').length === 0) {
                        loadRelatedProducts(productId, activeTabType);
                    }
                }
                
                // Inicializar los sliders existentes
                $('.snap-sidebar-cart__swiper-container').each(function() {
                    initScrollSnap(this);
                });
                
            }, 300); // Usar un tiempo fijo para asegurar compatibilidad
        });
        
        // No manejamos la apertura automática aquí, dejamos que el script original lo haga
        // Solo nos aseguramos de inicializar los sliders cuando se añaden productos
        $(document.body).on('added_to_cart', function(event, fragments, cart_hash, $button) {
            // Esperar a que se abra el sidebar (si está configurado para abrirse)
            setTimeout(function() {
                // Inicializar los sliders existentes
                $('.snap-sidebar-cart__swiper-container').each(function() {
                    initScrollSnap(this);
                });
                
                // Aplicar el ancho correcto a todos los productos
                var slidesPerView = parseInt(snap_sidebar_cart_params.related.columns) || 2;
                var columnWidth = 100 / slidesPerView;
                
                // Actualizar productos con las clases de Scroll Snap
                $('.snap-sidebar-cart__related-product').each(function() {
                    $(this).css('width', columnWidth + '%');
                    $(this).css('flex', '0 0 ' + columnWidth + '%');
                    $(this).addClass('snap-sidebar-cart__scroll-snap-item');
                });
            }, 500); // Esperar un poco más para asegurar que el sidebar esté abierto
        });
        
        // Manejar el clic en las pestañas
        $(document).on('click', '.snap-sidebar-cart__related-tab', function() {
            var tabType = $(this).data('tab');
            var $container = $('.snap-sidebar-cart__related-container[data-content="' + tabType + '"]');
            
            if ($container.length) {
                // Verificar si ya hay productos cargados
                var $products = $container.find('.snap-sidebar-cart__related-product');
                
                if ($products.length === 0 || $products.hasClass('snap-sidebar-cart__loading-products')) {
                    // Cargar productos si no hay o solo está el preloader
                    var productId = snap_sidebar_cart_params.current_product_id || 0;
                    if (productId > 0) {
                        loadRelatedProducts(productId, tabType);
                    }
                } else {
                    // Si ya hay productos, solo inicializar el slider
                    var $sliderContainer = $container.find('.snap-sidebar-cart__swiper-container');
                    if ($sliderContainer.length) {
                        initScrollSnap($sliderContainer[0]);
                    }
                }
            }
        });
        
        // No manejamos el cierre del sidebar aquí, dejamos que el script original lo haga
        
        // Exponer funciones para uso global, pero sin las funciones de apertura/cierre del sidebar
        window.snapSidebarCartSlider = {
            loadRelatedProducts: loadRelatedProducts,
            initScrollSnap: initScrollSnap
        };
        
        // Debugging: Mostrar información de configuración
        console.log('Scroll Snap inicializado para sliders');
        console.log('Configuración de columnas:', snap_sidebar_cart_params.related.columns || 2);
    });

})(jQuery);
