/**
 * Snap Sidebar Cart - Archivo JavaScript unificado
 * 
 * Este archivo contiene toda la funcionalidad esencial del plugin:
 * - Controlador principal del carrito
 * - Manejo de pestañas y sliders
 * - Preloaders y efectos visuales
 * - Actualización AJAX del carrito
 * - Manejo de cantidades
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
    
    // Variables globales
    var loadedTabs = {};
    
    // ===========================
    // FUNCIONES DE INICIALIZACIÓN
    // ===========================
    
    /**
     * Inicializa el carrito lateral
     */
    function initSidebarCart() {
        console.log('Inicializando Snap Sidebar Cart');
        
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
            console.log('Producto añadido al carrito');
            
            if (snap_sidebar_cart_params && 
                (snap_sidebar_cart_params.auto_open === '1' || 
                 snap_sidebar_cart_params.auto_open === true)) {
                openSidebar();
                
                // Mostrar preloader global
                showGlobalLoader();
                
                // Ocultar preloader después de un tiempo
                setTimeout(function() {
                    hideGlobalLoader();
                }, 800);
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
        
        // Inicializar sistema de pestañas
        initTabs();
        
        // Inicializar sistema de scroll snap
        initScrollSnap();
        
        // Inicializar manejo de cantidades
        initQuantityHandlers();
    }
    
    // ===========================
    // FUNCIONES DEL CARRITO
    // ===========================
    
    /**
     * Abre el carrito lateral
     */
    function openSidebar() {
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
                        loadRelatedProducts(productId, tabType);
                    }
                }
            }
        }
    }
    
    /**
     * Cierra el carrito lateral
     */
    function closeSidebar() {
        console.log('Cerrando carrito lateral');
        $('.snap-sidebar-cart').removeClass('open');
        $('.snap-sidebar-cart__overlay').css('display', 'none');
        $('body').removeClass('snap-sidebar-cart-open');
    }
    
    // ===========================
    // FUNCIONES DE PRELOADER
    // ===========================
    
    /**
     * Muestra el preloader global
     */
    function showGlobalLoader() {
        $('.snap-sidebar-cart__loader').addClass('active').css('display', 'flex');
    }
    
    /**
     * Oculta el preloader global
     */
    function hideGlobalLoader() {
        $('.snap-sidebar-cart__loader').removeClass('active').hide();
    }
    
    /**
     * Muestra el preloader para un producto específico
     */
    function showProductLoader($product) {
        if (!$product || !$product.length) return;
        
        $product.addClass('updating');
        var $loader = $product.find('.snap-sidebar-cart__product-loader');
        
        if (!$loader.length) {
            $loader = $('<div class="snap-sidebar-cart__product-loader"><div class="snap-sidebar-cart__loader-spinner"></div></div>');
            $product.append($loader);
        }
        
        $loader.css('display', 'flex').addClass('active');
        console.log('Preloader mostrado para producto');
    }
    
    /**
     * Oculta el preloader para un producto específico
     */
    function hideProductLoader($product) {
        if (!$product || !$product.length) return;
        
        $product.removeClass('updating');
        $product.find('.snap-sidebar-cart__product-loader').removeClass('active').hide();
        console.log('Preloader ocultado para producto');
    }
    
    /**
     * Oculta todos los preloaders
     */
    function hideAllLoaders() {
        hideGlobalLoader();
        $('.snap-sidebar-cart__product').each(function() {
            hideProductLoader($(this));
        });
    }
    
    // ===========================
    // FUNCIONES PARA PESTAÑAS
    // ===========================
    
    /**
     * Inicializa el sistema de pestañas
     */
    function initTabs() {
        // Evento para cambiar entre pestañas
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
            
            // Mostrar preloader en el contenedor activo
            showProductLoader($activeContainer);
            
            // Intentar encontrar el contenedor del slider
            var $container = $('#snap-sidebar-cart-related-' + tabType);
            
            // Si no encontramos el contenedor por ID, intentamos buscarlo por el atributo data-content
            if (!$container || !$container.length) {
                $container = $activeContainer.find('.snap-sidebar-cart__related-slider-container');
                if (!$container || !$container.length) {
                    // Ocultar preloader si no se encuentra el contenedor
                    hideProductLoader($activeContainer);
                    return;
                }
            }
            
            // Buscar el slider dentro del contenedor
            var $slider = $container.find('.snap-sidebar-cart__related-slider');
            if (!$slider || !$slider.length) {
                // Ocultar preloader si no se encuentra el slider
                hideProductLoader($activeContainer);
                return;
            }
            
            // Comprobar si hay slides y si necesitamos cargar productos
            var $slides = $slider.children();
            if (!$slides.length || $slides.first().hasClass('snap-sidebar-cart__loading-products') || $slides.first().hasClass('snap-sidebar-cart__no-products')) {
                // Obtener el primer producto del carrito
                var $firstProduct = $('.snap-sidebar-cart__product').first();
                if ($firstProduct.length) {
                    var productId = $firstProduct.data('product-id');
                    if (productId) {
                        loadRelatedProducts(productId, tabType);
                    } else {
                        hideProductLoader($activeContainer);
                    }
                } else {
                    hideProductLoader($activeContainer);
                }
            } else {
                hideProductLoader($activeContainer);
            }
        });
    }
    
    // ===========================
    // FUNCIONES PARA SCROLL SNAP
    // ===========================
    
    /**
     * Inicializa el sistema de scroll snap para sliders
     */
    function initScrollSnap() {
        console.log("Inicializando sistema de Scroll Snap para Snap Sidebar Cart");
        
        // Evento para botón anterior
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
        
        // Evento para botón siguiente
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
        
        // Comprobar navegación en todos los sliders al abrir el carrito
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
    
    /**
     * Comprueba si hay suficientes productos para mostrar los botones de navegación
     */
    function checkNavigationVisibility($container) {
        var $slider = $container.find('.snap-sidebar-cart__related-slider');
        var $prevButton = $container.find('.snap-sidebar-cart__related-prev');
        var $nextButton = $container.find('.snap-sidebar-cart__related-next');
        
        if (!$slider.length || !$prevButton.length || !$nextButton.length) return;
        
        // Comprobar si hay suficiente contenido para hacer scroll
        var hasOverflow = $slider[0].scrollWidth > $slider.width();
        
        // Mostrar u ocultar botones según sea necesario
        if (hasOverflow) {
            $prevButton.show();
            $nextButton.show();
        } else {
            $prevButton.hide();
            $nextButton.hide();
        }
    }
    
    // ===========================
    // FUNCIONES PARA PRODUCTOS RELACIONADOS
    // ===========================
    
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
                        $container.attr('class', $container.attr('class').replace(/snap-sidebar-cart__columns-\\d+/g, ''));
                        $container.addClass('snap-sidebar-cart__columns-' + columns);
                        
                        // Comprobar navegación
                        checkNavigationVisibility($container);
                    } else {
                        $slider.html('<div class="snap-sidebar-cart__no-products">No hay productos disponibles</div>');
                    }
                } else {
                    $slider.html('<div class="snap-sidebar-cart__no-products">Error al cargar productos</div>');
                }
                
                // Ocultar preloader
                hideProductLoader($container);
            },
            error: function() {
                $slider.html('<div class="snap-sidebar-cart__no-products">Error al cargar productos</div>');
                hideProductLoader($container);
            }
        });
    }
    
    // ===========================
    // FUNCIONES PARA MANEJO DE CANTIDADES
    // ===========================
    
    /**
     * Inicializa los manejadores de cantidades
     */
    function initQuantityHandlers() {
        // Evento para incrementar cantidad
        $(document).on('click', '.notabutton.quantity-up', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            var $button = $(this);
            var $wrapper = $button.closest('.quantity.buttoned-input');
            var $input = $wrapper.find('input.cart-item__quantity-input');
            var cartItemKey = $wrapper.data('cart-item-key') || $input.data('cart-item-key');
            var currentVal = parseInt($input.val(), 10) || 0;
            var $product = $button.closest('.snap-sidebar-cart__product');
            
            if (!cartItemKey && $product.length) {
                cartItemKey = $product.data('cart-item-key');
            }
            
            if (!cartItemKey) {
                console.error('No se pudo obtener la clave del producto');
                return;
            }
            
            var newVal = currentVal + 1;
            $input.val(newVal);
            
            // Mostrar preloader
            showProductLoader($product);
            
            // Actualizar cantidad
            updateCartItem(cartItemKey, newVal);
        });
        
        // Evento para decrementar cantidad
        $(document).on('click', '.notabutton.quantity-down', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            var $button = $(this);
            var $wrapper = $button.closest('.quantity.buttoned-input');
            var $input = $wrapper.find('input.cart-item__quantity-input');
            var cartItemKey = $wrapper.data('cart-item-key') || $input.data('cart-item-key');
            var currentVal = parseInt($input.val(), 10) || 0;
            var $product = $button.closest('.snap-sidebar-cart__product');
            
            if (!cartItemKey && $product.length) {
                cartItemKey = $product.data('cart-item-key');
            }
            
            if (!cartItemKey) {
                console.error('No se pudo obtener la clave del producto');
                return;
            }
            
            var newVal = Math.max(1, currentVal - 1);
            $input.val(newVal);
            
            // Si la nueva cantidad es 0, eliminamos el producto
            if (newVal === 0) {
                removeCartItem(cartItemKey);
                return;
            }
            
            // Mostrar preloader
            showProductLoader($product);
            
            // Actualizar cantidad
            updateCartItem(cartItemKey, newVal);
        });
        
        // Evento para cambio manual de cantidad
        $(document).on('change', 'input.cart-item__quantity-input', function(e) {
            var $input = $(this);
            var $wrapper = $input.closest('.quantity.buttoned-input');
            var cartItemKey = $wrapper.data('cart-item-key') || $input.data('cart-item-key');
            var newVal = parseInt($input.val(), 10) || 1;
            var $product = $input.closest('.snap-sidebar-cart__product');
            
            if (!cartItemKey && $product.length) {
                cartItemKey = $product.data('cart-item-key');
            }
            
            if (!cartItemKey) {
                console.error('No se pudo obtener la clave del producto');
                return;
            }
            
            // Asegurarse de que la cantidad sea al menos 1
            if (newVal < 1) {
                newVal = 1;
                $input.val(newVal);
            }
            
            // Mostrar preloader
            showProductLoader($product);
            
            // Actualizar cantidad
            updateCartItem(cartItemKey, newVal);
        });
        
        // Evento para eliminar un producto del carrito
        $(document).on('click', '.snap-sidebar-cart__product-remove', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            var $button = $(this);
            var $product = $button.closest('.snap-sidebar-cart__product');
            var cartItemKey = $product.data('cart-item-key');
            
            if (!cartItemKey) {
                console.error('No se pudo obtener la clave del producto');
                return;
            }
            
            // Mostrar preloader
            showProductLoader($product);
            
            // Eliminar producto
            removeCartItem(cartItemKey);
        });
    }
    
    // ===========================
    // FUNCIONES AJAX
    // ===========================
    
    /**
     * Actualiza un elemento del carrito
     */
    function updateCartItem(cartItemKey, quantity) {
        console.log('Actualizando cantidad:', cartItemKey, quantity);
        
        // Realizar solicitud AJAX
        $.ajax({
            type: 'POST',
            url: snap_sidebar_cart_params.ajax_url,
            data: {
                action: 'snap_sidebar_cart_update',
                cart_item_key: cartItemKey,
                quantity: quantity,
                nonce: snap_sidebar_cart_params.nonce
            },
            success: function(response) {
                if (response.success) {
                    updateCartContent(response.data);
                } else {
                    hideAllLoaders();
                    if (response.data && response.data.message) {
                        alert(response.data.message);
                    }
                }
            },
            error: function() {
                hideAllLoaders();
                alert('Error al comunicarse con el servidor');
            }
        });
    }
    
    /**
     * Elimina un elemento del carrito
     */
    function removeCartItem(cartItemKey) {
        console.log('Eliminando producto:', cartItemKey);
        
        // Realizar solicitud AJAX
        $.ajax({
            type: 'POST',
            url: snap_sidebar_cart_params.ajax_url,
            data: {
                action: 'snap_sidebar_cart_remove',
                cart_item_key: cartItemKey,
                nonce: snap_sidebar_cart_params.nonce
            },
            success: function(response) {
                if (response.success) {
                    updateCartContent(response.data);
                } else {
                    hideAllLoaders();
                    if (response.data && response.data.message) {
                        alert(response.data.message);
                    }
                }
            },
            error: function() {
                hideAllLoaders();
                alert('Error al comunicarse con el servidor');
            }
        });
    }
    
    /**
     * Actualiza el contenido del carrito
     */
    function updateCartContent(data) {
        if (data.cart_content) {
            $('.snap-sidebar-cart__products').html(data.cart_content);
        }
        
        if (data.cart_totals) {
            $('.snap-sidebar-cart__totals').html(data.cart_totals);
        }
        
        if (data.cart_count !== undefined) {
            $('.snap-sidebar-cart__count').text(data.cart_count);
            
            // Actualizar también otros contadores de carrito en la página
            $('.cart-contents-count').text(data.cart_count);
            $('.cart-count').text(data.cart_count);
        }
        
        // Ocultar todos los preloaders
        hideAllLoaders();
        
        // Disparar evento personalizado para que otros scripts puedan reaccionar
        $(document.body).trigger('snap_sidebar_cart_updated', [data]);
    }
    
    // ===========================
    // EXPORTAR FUNCIONES GLOBALES
    // ===========================
    
    // Exportar funciones para uso global
    window.snap_sidebar_cart.openSidebar = openSidebar;
    window.snap_sidebar_cart.closeSidebar = closeSidebar;
    window.snap_sidebar_cart.loadRelatedProducts = loadRelatedProducts;
    window.snap_sidebar_cart.showGlobalLoader = showGlobalLoader;
    window.snap_sidebar_cart.hideGlobalLoader = hideGlobalLoader;
    window.snap_sidebar_cart.showProductLoader = showProductLoader;
    window.snap_sidebar_cart.hideProductLoader = hideProductLoader;
    window.snap_sidebar_cart.showPreloader = showProductLoader; // Alias para compatibilidad
    window.snap_sidebar_cart.hidePreloader = hideProductLoader; // Alias para compatibilidad
    
    // Inicializar cuando el DOM esté listo
    $(document).ready(function() {
        initSidebarCart();
    });
    
})(jQuery);