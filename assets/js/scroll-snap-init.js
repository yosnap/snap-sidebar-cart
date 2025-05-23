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
        console.log("Configurando hover para imágenes de galería");
        
        try {
            $('.snap-sidebar-cart__related-product').each(function() {
                var $product = $(this);
                var $primaryImage = $product.find('.primary-image');
                var $hoverImage = $product.find('.hover-image');
                
                if ($primaryImage.length && $hoverImage.length) {
                    console.log("Configurando hover para producto:", $product.find('.snap-sidebar-cart__related-product-title').text().trim() || "Producto");
                    
                    // Eliminar eventos existentes para evitar duplicados
                    $product.off('mouseenter mouseleave');
                    
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
                } else {
                    console.log("Producto sin imágenes alternativas para hover");
                }
            });
        } catch (error) {
            console.error("Error al configurar hover para imágenes:", error);
        }
    }

    /**
     * Configurar botones de navegación para el scroll snap
     * @param {jQuery} $container - Contenedor del slider
     */
    function setupNavigationButtons($container) {
        var $track = $container.find('.swiper-wrapper');
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
        
        // Si no se proporciona un tipo, usar el tab activo o el predeterminado
        if (!type) {
            var $activeTab = $('.snap-sidebar-cart__related-tab.active');
            type = $activeTab.length ? $activeTab.data('tab') : 'related';
            console.log("Tipo no proporcionado, usando tipo actual activo:", type);
        }
        
        // Buscar el contenedor para los productos relacionados
        var $targetContainer = $('.snap-sidebar-cart__related-container[data-content="' + type + '"] .swiper-wrapper');
        
        if ($targetContainer.length === 0) {
            console.error("No se encontró el contenedor para productos relacionados de tipo: " + type);
            
            // Intentar cargar el primer tab si el actual falla
            if (type !== 'related') {
                console.log("Intentando cargar el tab predeterminado 'related' como fallback");
                loadRelatedProducts(productId, 'related');
            }
            return;
        }
        
        // Obtener configuración desde los parámetros del admin
        var slidesPerView = parseInt(snap_sidebar_cart_params.related.columns) || 2;
        var totalProducts = parseInt(snap_sidebar_cart_params.related.count) || 4;
        
        // Mostrar preloader
        
        // Usamos el mismo preloader que utiliza el sistema principal
        // Esto asegura que se respete la configuración del backend
        if (typeof snap_sidebar_cart_params !== 'undefined' && snap_sidebar_cart_params.loading_html) {
            // Usar el HTML de carga proporcionado por el sistema
            $targetContainer.html(snap_sidebar_cart_params.loading_html);
        } else {
            // Fallback simple si no hay HTML de carga disponible
            $targetContainer.empty();
        }
        
        // Si el productId no es válido, intentar obtenerlo del primer producto en el carrito
        if (!productId || productId <= 0) {
            console.log("ID de producto no válido, intentando obtener el ID del primer producto en el carrito");
            var $firstProduct = $('.snap-sidebar-cart__product').first();
            if ($firstProduct.length) {
                productId = $firstProduct.data('product-id');
                console.log("Nuevo producto ID encontrado:", productId);
            }
            
            // Si todavía no hay un ID válido, mostrar mensaje
            if (!productId || productId <= 0) {
                console.error("No se pudo obtener un ID de producto válido");
                $targetContainer.html(
                    '<div class="snap-sidebar-cart__related-product snap-sidebar-cart__no-products">No hay productos en el carrito para mostrar recomendaciones.</div>'
                );
                $targetContainer.closest('.swiper-container').find('.snap-sidebar-cart__slider-prev, .snap-sidebar-cart__slider-next').hide();
                return;
            }
        }
        
        console.log("Realizando petición AJAX para productos relacionados - ID:", productId, "Tipo:", type);
        
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
                console.log("Respuesta AJAX recibida:", response);
                
                if (response.success && response.data && response.data.html && response.data.html.trim() !== '') {
                    console.log("Productos encontrados. Contenido HTML recibido:", response.data.html.length, "caracteres");
                    
                    // Preparar los productos para el slider
                    var productsHtml = prepareScrollSnapItems(response.data.html);
                    
                    // Verificar si el contenedor todavía existe (podría haberse eliminado si el usuario cambió de tab)
                    if ($targetContainer.length) {
                        $targetContainer.html(productsHtml);
                        
                        // Inicializar Scroll Snap
                        var $sliderContainer = $targetContainer.closest('.swiper-container');
                        if ($sliderContainer.length) {
                            initScrollSnap($sliderContainer);
                            
                            // Verificar si hay suficientes productos para mostrar los controles de navegación
                            var productsCount = response.data.count || $targetContainer.find('.snap-sidebar-cart__related-product').length;
                            console.log("Productos encontrados:", productsCount, "Slides por vista:", slidesPerView);
                            
                            if (productsCount <= slidesPerView) {
                                // Ocultar botones de navegación si hay pocos productos
                                console.log("Ocultando botones de navegación (pocos productos)");
                                $sliderContainer.find('.snap-sidebar-cart__slider-prev, .snap-sidebar-cart__slider-next').hide();
                            } else {
                                console.log("Mostrando botones de navegación");
                                $sliderContainer.find('.snap-sidebar-cart__slider-prev, .snap-sidebar-cart__slider-next').show();
                                
                                // Forzar actualización de estado de los botones
                                updateSliderNavigation($targetContainer);
                            }
                        } else {
                            console.log("No se encontró el contenedor del slider");
                        }
                    } else {
                        console.log("El contenedor ya no existe, probablemente el usuario cambió de tab");
                    }
                } else {
                    console.log("No se encontraron productos o respuesta inválida");
                    if (response.data && response.data.message) {
                        console.log("Mensaje:", response.data.message);
                    }
                    
                    // Mostrar mensaje de error en el contenedor
                    $targetContainer.html(
                        '<div class="snap-sidebar-cart__related-product snap-sidebar-cart__no-products">No se encontraron productos relacionados para esta categoría.</div>'
                    );
                    
                    // Ocultar botones de navegación
                    $targetContainer.closest('.swiper-container').find('.snap-sidebar-cart__slider-prev, .snap-sidebar-cart__slider-next').hide();
                    
                    // Intentar cargar con un producto alternativo
                    tryAlternativeProduct(productId, type, $targetContainer);
                }
            },
            error: function(xhr, status, error) {
                console.error("Error AJAX: " + error);
                console.error("Estado:", status);
                console.error("Respuesta:", xhr.responseText);
                
                // Mostrar mensaje de error en el contenedor
                $targetContainer.html(
                    '<div class="snap-sidebar-cart__related-product snap-sidebar-cart__no-products">Error al cargar productos. Por favor, intenta nuevamente.</div>'
                );
                
                // Ocultar botones de navegación
                $targetContainer.closest('.swiper-container').find('.snap-sidebar-cart__slider-prev, .snap-sidebar-cart__slider-next').hide();
            }
        });
    }
    
    /**
     * Intenta cargar productos relacionados usando un producto alternativo
     * @param {number} excludeProductId - ID del producto a excluir
     * @param {string} type - Tipo de productos relacionados
     * @param {jQuery} $targetContainer - Contenedor donde mostrar los productos
     */
    function tryAlternativeProduct(excludeProductId, type, $targetContainer) {
        console.log("Intentando cargar productos con un producto alternativo");
        
        // Buscar otro producto en el carrito
        var alternativeProductId = null;
        
        $('.snap-sidebar-cart__product').each(function() {
            var pid = $(this).data('product-id');
            if (pid && pid != excludeProductId && !alternativeProductId) {
                alternativeProductId = pid;
                return false; // Salir del bucle
            }
        });
        
        if (alternativeProductId) {
            console.log("Producto alternativo encontrado, ID:", alternativeProductId);
            loadRelatedProducts(alternativeProductId, type);
        } else {
            console.log("No se encontraron productos alternativos");
        }
    }
    
    /**
     * Actualiza el estado de los botones de navegación del slider
     * @param {jQuery} $track - El contenedor del slider
     */
    function updateSliderNavigation($track) {
        try {
            var maxScrollLeft = $track[0].scrollWidth - $track.outerWidth();
            var currentScrollLeft = $track.scrollLeft();
            
            var $prevButton = $track.siblings('.snap-sidebar-cart__slider-prev');
            var $nextButton = $track.siblings('.snap-sidebar-cart__slider-next');
            
            // Mostrar/ocultar botón de navegación anterior
            if (currentScrollLeft <= 0) {
                $prevButton.addClass('disabled');
            } else {
                $prevButton.removeClass('disabled');
            }
            
            // Mostrar/ocultar botón de navegación siguiente
            if (currentScrollLeft >= maxScrollLeft - 5) { // 5px de tolerancia
                $nextButton.addClass('disabled');
            } else {
                $nextButton.removeClass('disabled');
            }
        } catch (error) {
            console.error("Error al actualizar navegación:", error);
        }
    }
    
    /**
     * Prepara el HTML de los productos para Scroll Snap
     * @param {string} html - HTML original de los productos
     * @return {string} HTML preparado con clases de Scroll Snap
     */
    function prepareScrollSnapItems(html) {
        console.log("Preparando productos para Scroll Snap:", html.length, "caracteres");
        
        // Si no hay contenido HTML, devolver mensaje de error
        if (!html || html.trim() === '') {
            return '<div class="snap-sidebar-cart__related-product snap-sidebar-cart__no-products">No se encontraron productos relacionados.</div>';
        }
        
        try {
            var $temp = $('<div>').html(html);
            var result = '';
            
            // Obtener configuración de columnas desde los parámetros del admin
            var slidesPerView = parseInt(snap_sidebar_cart_params.related.columns) || 3;
            var columnWidth = 100 / slidesPerView;
            
            console.log("Preparando", $temp.find('.snap-sidebar-cart__related-product').length, "productos con ancho de columna:", columnWidth + "%");
            
            // Asegurar que cada producto tenga el ancho correcto según la configuración
            $temp.find('.snap-sidebar-cart__related-product').each(function() {
                var $product = $(this);
                $product.css('width', 'calc(' + columnWidth + '% - 10px)');
                $product.css('flex', '0 0 calc(' + columnWidth + '% - 10px)');
                $product.addClass('snap-sidebar-cart__scroll-snap-item');
                result += $('<div>').append($product.clone()).html();
            });
            
            console.log("Productos preparados:", result.length, "caracteres");
            return result;
        } catch (error) {
            console.error("Error al preparar productos:", error);
            return '<div class="snap-sidebar-cart__related-product snap-sidebar-cart__no-products">Error al procesar productos relacionados.</div>';
        }
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
        $('.snap-sidebar-cart__related-container.active .swiper-container').each(function() {
            // Si hay productos, inicializar Scroll Snap
            var $products = $(this).find('.swiper-wrapper').children();
            
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
                
                // Si no hay pestaña activa pero hay pestañas, activar la primera
                if (!activeTabType && $('.snap-sidebar-cart__related-tab').length > 0) {
                    console.log('No hay pestaña activa, activando la primera');
                    activeTabType = $('.snap-sidebar-cart__related-tab').first().data('tab');
                    $('.snap-sidebar-cart__related-tab').first().addClass('active');
                    $('.snap-sidebar-cart__related-container[data-content="' + activeTabType + '"]').addClass('active');
                }
                
                // Obtener el ID del producto actual
                var productId = snap_sidebar_cart_params.current_product_id || 0;
                
                // Si no hay producto ID en parámetros, intentar obtenerlo del primer producto del carrito
                if (!productId || productId <= 0) {
                    console.log('Buscando ID del primer producto en el carrito');
                    var $firstProduct = $('.snap-sidebar-cart__product').first();
                    if ($firstProduct.length) {
                        productId = $firstProduct.data('product-id');
                        console.log('Producto encontrado en carrito:', productId);
                    }
                }
                
                if (productId > 0 && activeTabType) {
                    console.log('Cargando productos relacionados para el producto:', productId, 'tipo:', activeTabType);
                    // Cargar productos relacionados para la pestaña activa
                    var $container = $('.snap-sidebar-cart__related-container[data-content="' + activeTabType + '"]');
                    // Siempre cargar los productos relacionados en la primera apertura
                    if ($container.length) {
                        var $productsWrapper = $container.find('.swiper-wrapper');
                        // Si el contenedor está vacío o solo contiene el preloader
                        if ($productsWrapper.length === 0 || 
                            $productsWrapper.children().length === 0 || 
                            $productsWrapper.find('.snap-sidebar-cart__loading-products').length > 0) {
                            loadRelatedProducts(productId, activeTabType);
                        }
                    }
                } else {
                    console.log('No se pudo cargar productos relacionados:', 'ProductID:', productId, 'TabType:', activeTabType);
                }
                
                // Inicializar los sliders existentes
                $('.swiper-container').each(function() {
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
                $('.swiper-container').each(function() {
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
                    var $sliderContainer = $container.find('.swiper-container');
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