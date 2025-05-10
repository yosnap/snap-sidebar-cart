/**
 * Implementación de Scroll Snap para los sliders de productos relacionados
 */
(function ($) {
    "use strict";

    /**
     * Inicializa un slider con scroll snap
     * @param {string} containerId - ID del contenedor
     */
    function initScrollSnap(containerId) {
        var $container = $('#' + containerId);
        if (!$container.length) {
            console.error('Contenedor no encontrado:', containerId);
            return;
        }

        console.log("Inicializando Scroll Snap para:", containerId);
        
        // Configurar botones de navegación
        var $prevButton = $container.find('.snap-sidebar-cart__related-prev');
        var $nextButton = $container.find('.snap-sidebar-cart__related-next');
        var $slider = $container.find('.snap-sidebar-cart__related-slider');
        
        if (!$slider.length) {
            console.error('Slider no encontrado en el contenedor:', containerId);
            return;
        }
        
        // Eliminar eventos previos para evitar duplicados
        $prevButton.off('click');
        $nextButton.off('click');
        
        // Evento para botón anterior
        $prevButton.on('click', function() {
            console.log("Click en botón anterior");
            var scrollAmount = $slider.width() * 0.8;
            $slider.animate({
                scrollLeft: '-=' + scrollAmount
            }, 300);
        });
        
        // Evento para botón siguiente
        $nextButton.on('click', function() {
            console.log("Click en botón siguiente");
            var scrollAmount = $slider.width() * 0.8;
            $slider.animate({
                scrollLeft: '+=' + scrollAmount
            }, 300);
        });
        
        // Comprobar si hay suficientes productos para mostrar los botones de navegación
        checkNavigationVisibility($container);
        
        // Configurar evento de hover para imágenes de galería
        setupProductGalleryHover($container);
        
        // Añadir evento de scroll para actualizar la navegación
        $slider.on('scroll', function() {
            // Comprobar si estamos al inicio o al final para deshabilitar botones
            var scrollLeft = $slider.scrollLeft();
            var maxScrollLeft = $slider[0].scrollWidth - $slider.outerWidth();
            
            if (scrollLeft <= 0) {
                $prevButton.addClass('disabled');
            } else {
                $prevButton.removeClass('disabled');
            }
            
            if (scrollLeft >= maxScrollLeft) {
                $nextButton.addClass('disabled');
            } else {
                $nextButton.removeClass('disabled');
            }
        });
        
        // Trigger inicial para configurar estado de botones
        $slider.trigger('scroll');
    }
    
    /**
     * Comprueba si hay suficientes productos para mostrar los botones de navegación
     * @param {jQuery} $container - Contenedor del slider
     */
    function checkNavigationVisibility($container) {
        var $slider = $container.find('.snap-sidebar-cart__related-slider');
        var $slides = $slider.find('.snap-sidebar-cart__related-slide');
        var $navigation = $container.find('.snap-sidebar-cart__related-navigation');
        
        if ($slides.length <= 2) {
            $navigation.hide();
        } else {
            // Comprobar si el contenido es más ancho que el contenedor
            var sliderWidth = $slider.width();
            var totalWidth = 0;
            
            $slides.each(function() {
                totalWidth += $(this).outerWidth(true);
            });
            
            if (totalWidth > sliderWidth) {
                $navigation.show();
            } else {
                $navigation.hide();
            }
        }
    }

    /**
     * Configurar el hover que muestra las imágenes de galería
     * @param {jQuery} $container - Contenedor del slider
     */
    function setupProductGalleryHover($container) {
        $container.find('.snap-sidebar-cart__related-product').each(function() {
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
     * Cargar productos relacionados y mostrarlos en el slider
     * @param {number} productId - ID del producto
     * @param {string} type - Tipo de productos relacionados
     */
    function loadRelatedProducts(productId, type) {
        console.log("Cargando productos relacionados para ID:", productId, "tipo:", type);
        
        // Obtener configuración del admin
        var productsPerPage = snap_sidebar_cart_params.related && snap_sidebar_cart_params.related.products_per_page ? 
            parseInt(snap_sidebar_cart_params.related.products_per_page) : 7;
        
        var slidesToScroll = snap_sidebar_cart_params.related && snap_sidebar_cart_params.related.slides_to_scroll ? 
            parseInt(snap_sidebar_cart_params.related.slides_to_scroll) : 1;
            
        var columnsCount = snap_sidebar_cart_params.related && snap_sidebar_cart_params.related.columns_count ? 
            parseInt(snap_sidebar_cart_params.related.columns_count) : 2;
        
        console.log("Configuración: productos por página =", productsPerPage, "columnas =", columnsCount, "slides a desplazar =", slidesToScroll);
        
        var containerId = 'snap-sidebar-cart-related-' + type;
        var $container = $('#' + containerId);
        
        if (!$container.length) {
            console.error("No se encontró el contenedor para productos relacionados:", containerId);
            // Intentar encontrar el contenedor por el atributo data-content
            $container = $('.snap-sidebar-cart__related-container[data-content="' + type + '"]').find('.snap-sidebar-cart__related-slider-container');
            if (!$container.length) {
                console.error("No se pudo encontrar el contenedor alternativo");
                return;
            }
            console.log("Se encontró un contenedor alternativo");
        }
        
        // Añadir clase para el número de columnas
        $container.removeClass('snap-sidebar-cart__columns-1 snap-sidebar-cart__columns-2 snap-sidebar-cart__columns-3 snap-sidebar-cart__columns-4')
                 .addClass('snap-sidebar-cart__columns-' + columnsCount);
        
        var $slider = $container.find('.snap-sidebar-cart__related-slider');
        if (!$slider.length) {
            console.error("No se encontró el slider dentro del contenedor");
            return;
        }
        
        console.log("Slider encontrado, mostrando preloader");
        
        // Mostrar preloader
        $slider.html(
            '<div class="snap-sidebar-cart__loading-products">' +
            '<div class="snap-sidebar-cart__loader-spinner"></div>' +
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
                per_page: productsPerPage, // Pasar el número de productos configurado en el admin
            },
            success: function(response) {
                console.log("Respuesta AJAX recibida para productos relacionados:", response);
                
                if (response.success && response.data && response.data.html) {
                    // Preparar los productos para el slider
                    var productsHtml = prepareScrollSnapSlides(response.data.html);
                    $slider.html(productsHtml);
                    
                    // Ajustar el ancho de los slides según el número de columnas
                    adjustSlideWidths($container);
                    
                    // Comprobar visibilidad de la navegación
                    checkNavigationVisibility($container);
                    
                    // Configurar hover para imágenes
                    setupProductGalleryHover($container);
                    
                    // Mostrar el contenedor si estaba oculto
                    $container.closest('.snap-sidebar-cart__related-container').addClass('active');
                } else {
                    console.log("No se encontraron productos o respuesta inválida");
                    $slider.html(
                        '<div class="snap-sidebar-cart__no-products">No se encontraron productos relacionados.</div>'
                    );
                    $container.find('.snap-sidebar-cart__related-navigation').hide();
                }
            },
            error: function(xhr, status, error) {
                console.error("Error AJAX:", error);
                $slider.html(
                    '<div class="snap-sidebar-cart__no-products">Error al cargar productos.</div>'
                );
                $container.find('.snap-sidebar-cart__related-navigation').hide();
            }
        });
    }
    
    /**
     * Prepara el HTML de los productos para el scroll snap
     * @param {string} html - HTML original de los productos
     * @return {string} HTML preparado con slides
     */
    function prepareScrollSnapSlides(html) {
        var $temp = $('<div>').html(html);
        var result = '';
        
        // Convertir cada producto en un slide
        $temp.find('.product, .snap-sidebar-cart__related-product').each(function() {
            var productHtml = $(this).prop('outerHTML');
            result += '<div class="snap-sidebar-cart__related-slide">' + productHtml + '</div>';
        });
        
        // Si no hay productos, mostrar mensaje
        if (!result) {
            result = '<div class="snap-sidebar-cart__no-products">No se encontraron productos.</div>';
        }
        
        console.log("Productos preparados:", result.substring(0, 100) + "...");
        return result;
    }
    
    /**
     * Ajusta el ancho de los slides según el número de columnas configurado
     * @param {jQuery} $container - Contenedor del slider
     */
    function adjustSlideWidths($container) {
        if (!$container || !$container.length) return;
        
        // Obtener el número de columnas configurado
        var columnsClass = $container.attr('class').match(/snap-sidebar-cart__columns-(\d+)/);
        var columns = columnsClass ? parseInt(columnsClass[1]) : 2;
        
        // Ajustar el ancho de los slides
        var $slides = $container.find('.snap-sidebar-cart__related-slide');
        if ($slides.length) {
            $slides.css('width', (100 / columns) + '%');
        }
    }

    // Inicializar cuando el DOM esté listo
    $(document).ready(function() {
        console.log("Inicializando sistema de Scroll Snap para Snap Sidebar Cart");
        
        // Inicializar los sliders existentes y cargar productos en la pestaña activa
        setTimeout(function() {
            // Cargar productos en la pestaña activa
            var $activeTab = $('.snap-sidebar-cart__related-tab.active');
            if ($activeTab.length) {
                var tabType = $activeTab.data('tab');
                console.log("Pestaña activa inicial:", tabType);
                
                var $container = $('.snap-sidebar-cart__related-container[data-content="' + tabType + '"]');
                var $sliderContainer = $container.find('.snap-sidebar-cart__related-slider-container');
                
                // Asignar ID al contenedor si no lo tiene
                if (!$sliderContainer.attr('id')) {
                    $sliderContainer.attr('id', 'snap-sidebar-cart-related-' + tabType);
                }
                
                // Inicializar scroll snap
                initScrollSnap('snap-sidebar-cart-related-' + tabType);
                
                // Cargar productos
                var firstProduct = $('.snap-sidebar-cart__product').first();
                if (firstProduct.length) {
                    var productId = firstProduct.data('product-id');
                    if (productId) {
                        loadRelatedProducts(productId, tabType);
                    }
                }
            }
        }, 500);
        
        // Cambio de pestaña en productos relacionados - Usar delegación de eventos
        $(document).on('click', '.snap-sidebar-cart__related-tab', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            var $tab = $(this);
            var tabType = $tab.data('tab');
            
            // Comprobar si ya está activa
            if ($tab.hasClass('active')) {
                return;
            }
            
            console.log("Cambio a pestaña mediante click directo:", tabType);
            
            // Actualizar UI
            $('.snap-sidebar-cart__related-tab').removeClass('active');
            $tab.addClass('active');
            
            $('.snap-sidebar-cart__related-container').removeClass('active');
            var $activeContainer = $('.snap-sidebar-cart__related-container[data-content="' + tabType + '"]');
            $activeContainer.addClass('active');
            
            // Obtener o crear el contenedor del slider
            var $sliderContainer = $activeContainer.find('.snap-sidebar-cart__related-slider-container');
            var containerId = 'snap-sidebar-cart-related-' + tabType;
            
            // Asignar ID al contenedor si no lo tiene
            if (!$sliderContainer.attr('id')) {
                $sliderContainer.attr('id', containerId);
            }
            
            var $slider = $sliderContainer.find('.snap-sidebar-cart__related-slider');
            var $slides = $slider.children();
            
            // Inicializar scroll snap si no se ha hecho ya
            initScrollSnap(containerId);
            
            if ($slides.length === 0 || $slides.first().hasClass('snap-sidebar-cart__loading-products') || $slides.first().hasClass('snap-sidebar-cart__no-products')) {
                // Obtener el primer producto del carrito
                var firstProduct = $('.snap-sidebar-cart__product').first();
                if (firstProduct.length) {
                    var productId = firstProduct.data('product-id');
                    if (productId) {
                        loadRelatedProducts(productId, tabType);
                    }
                }
            } else {
                // Si ya hay productos, comprobar navegación
                checkNavigationVisibility($sliderContainer);
            }
        });
        
        // Cuando se abre el sidebar
        $(document).on('click', snap_sidebar_cart_params.activation_selectors, function() {
            // Esperar a que se abra el sidebar
            setTimeout(function() {
                // Comprobar navegación en todos los sliders
                $('.snap-sidebar-cart__related-container').each(function() {
                    checkNavigationVisibility($(this));
                });
                
                // Cargar productos en la pestaña activa si está vacía
                var $activeContainer = $('.snap-sidebar-cart__related-container.active');
                if ($activeContainer.length) {
                    var tabType = $activeContainer.data('content');
                    var $slider = $activeContainer.find('.snap-sidebar-cart__related-slider');
                    var $slides = $slider.children();
                    
                    if ($slides.length === 0 || $slides.first().hasClass('snap-sidebar-cart__loading-products') || $slides.first().hasClass('snap-sidebar-cart__no-products')) {
                        // Obtener el primer producto del carrito
                        var firstProduct = $('.snap-sidebar-cart__product').first();
                        if (firstProduct.length) {
                            var productId = firstProduct.data('product-id');
                            if (productId) {
                                loadRelatedProducts(productId, tabType);
                            }
                        }
                    }
                }
            }, 300);
        });
        
        // Exponer funciones globalmente
        window.snap_sidebar_cart = window.snap_sidebar_cart || {};
        window.snap_sidebar_cart.loadRelatedProducts = loadRelatedProducts;
        window.snap_sidebar_cart.initScrollSnap = initScrollSnap;
    });

})(jQuery);