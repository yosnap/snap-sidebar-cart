/**
 * Archivo principal de Snap Sidebar Cart
 * Contiene la funcionalidad esencial del carrito lateral
 */
(function($) {
    "use strict";
    
    // Objeto global para el carrito
    window.snap_sidebar_cart = window.snap_sidebar_cart || {};
    
    // Configuración predeterminada
    var defaults = {
        autoOpen: true,
        animationDuration: 300,
        animationDelay: 200
    };
    
    // Inicialización del carrito
    $(document).ready(function() {
        console.log('Inicializando Snap Sidebar Cart Core');
        
        // Función para abrir el carrito lateral
        window.snap_sidebar_cart.openSidebar = function() {
            console.log('Abriendo carrito lateral');
            $('.snap-sidebar-cart').addClass('open');
            $('.snap-sidebar-cart__overlay').css('display', 'block');
            $('body').addClass('snap-sidebar-cart-open');
            
            // Cargar productos relacionados si es necesario
            var $activeContainer = $('.snap-sidebar-cart__related-container.active');
            if ($activeContainer.length) {
                var tabType = $activeContainer.data('content');
                var $slider = $activeContainer.find('.snap-sidebar-cart__related-slider');
                
                if ($slider.length && $slider.children().length === 0) {
                    var $firstProduct = $('.snap-sidebar-cart__product').first();
                    if ($firstProduct.length) {
                        var productId = $firstProduct.data('product-id');
                        if (productId) {
                            window.snap_sidebar_cart.loadRelatedProducts(productId, tabType);
                        }
                    }
                }
            }
        };
        
        // Función para cerrar el carrito lateral
        window.snap_sidebar_cart.closeSidebar = function() {
            console.log('Cerrando carrito lateral');
            $('.snap-sidebar-cart').removeClass('open');
            $('.snap-sidebar-cart__overlay').css('display', 'none');
            $('body').removeClass('snap-sidebar-cart-open');
        };
        
        // Función para cargar productos relacionados
        window.snap_sidebar_cart.loadRelatedProducts = function(productId, type) {
            if (!productId || !type) {
                console.error('ID de producto o tipo no especificados');
                return;
            }
            
            console.log('Cargando productos relacionados:', type, 'para producto ID:', productId);
            
            // Mostrar preloader en el contenedor de productos relacionados
            var $container = $('.snap-sidebar-cart__related-container[data-content="' + type + '"]');
            var $slider = $container.find('.snap-sidebar-cart__related-slider');
            
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
                            var columns = parseInt(response.data.columns) || 2;
                            $container.attr('class', $container.attr('class').replace(/snap-sidebar-cart__columns-\d+/g, ''));
                            $container.addClass('snap-sidebar-cart__columns-' + columns);
                        } else {
                            $slider.html('<div class="snap-sidebar-cart__no-products">No hay productos disponibles</div>');
                        }
                    } else {
                        $slider.html('<div class="snap-sidebar-cart__no-products">Error al cargar productos</div>');
                    }
                },
                error: function() {
                    $slider.html('<div class="snap-sidebar-cart__no-products">Error al cargar productos</div>');
                }
            });
        };
        
        // Eventos para abrir el carrito
        if (snap_sidebar_cart_params && snap_sidebar_cart_params.activation_selectors) {
            $(document).on('click', snap_sidebar_cart_params.activation_selectors, function(e) {
                e.preventDefault();
                e.stopPropagation();
                window.snap_sidebar_cart.openSidebar();
            });
        }
        
        // Evento cuando se añade un producto al carrito
        $(document.body).on('added_to_cart', function(event, fragments, cart_hash, $button) {
            console.log('Producto añadido al carrito');
            
            if (snap_sidebar_cart_params && 
                (snap_sidebar_cart_params.auto_open === '1' || 
                 snap_sidebar_cart_params.auto_open === true)) {
                window.snap_sidebar_cart.openSidebar();
            }
        });
        
        // Eventos para cerrar el carrito
        $(document).on('click', '.snap-sidebar-cart__close, .snap-sidebar-cart__overlay', function(e) {
            e.preventDefault();
            e.stopPropagation();
            window.snap_sidebar_cart.closeSidebar();
        });
        
        // Cerrar con la tecla Escape
        $(document).on('keyup', function(e) {
            if (e.key === 'Escape' && $('.snap-sidebar-cart').hasClass('open')) {
                window.snap_sidebar_cart.closeSidebar();
            }
        });
        
        // Navegación entre pestañas de productos relacionados
        $(document).on('click', '.snap-sidebar-cart__related-tab', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            var tabType = $(this).data('tab');
            console.log('Cambiando a pestaña:', tabType);
            
            // Actualizar UI
            $('.snap-sidebar-cart__related-tab').removeClass('active');
            $(this).addClass('active');
            
            $('.snap-sidebar-cart__related-container').removeClass('active');
            var $activeContainer = $('.snap-sidebar-cart__related-container[data-content="' + tabType + '"]');
            $activeContainer.addClass('active');
            
            // Cargar productos si es necesario
            var $slider = $activeContainer.find('.snap-sidebar-cart__related-slider');
            if ($slider.length && ($slider.children().length === 0 || $slider.find('.snap-sidebar-cart__loading-products').length || $slider.find('.snap-sidebar-cart__no-products').length)) {
                var $firstProduct = $('.snap-sidebar-cart__product').first();
                if ($firstProduct.length) {
                    var productId = $firstProduct.data('product-id');
                    if (productId) {
                        window.snap_sidebar_cart.loadRelatedProducts(productId, tabType);
                    }
                }
            }
        });
        
        // Navegación en sliders de productos relacionados
        $(document).on('click', '.snap-sidebar-cart__related-prev', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            var $slider = $(this).closest('.snap-sidebar-cart__related-slider-container').find('.snap-sidebar-cart__related-slider');
            if ($slider.length) {
                $slider.animate({
                    scrollLeft: Math.max(0, $slider.scrollLeft() - $slider.width() * 0.8)
                }, 300);
            }
        });
        
        $(document).on('click', '.snap-sidebar-cart__related-next', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            var $slider = $(this).closest('.snap-sidebar-cart__related-slider-container').find('.snap-sidebar-cart__related-slider');
            if ($slider.length) {
                var maxScroll = $slider[0].scrollWidth - $slider.width();
                $slider.animate({
                    scrollLeft: Math.min(maxScroll, $slider.scrollLeft() + $slider.width() * 0.8)
                }, 300);
            }
        });
    });
})(jQuery);