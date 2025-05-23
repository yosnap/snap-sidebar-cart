/**
 * Maneja la interfaz principal del carrito lateral
 * 
 * Este archivo se encarga de:
 * - Abrir y cerrar el sidebar
 * - Actualizar el contenido del carrito
 * - Gestionar animaciones y efectos visuales
 */
(function ($) {
    'use strict';

    /**
     * Controlador de la interfaz del carrito
     * 
     * @class UIHandler
     */
    var UIHandler = {
        animationDuration: 300,
        newProductPosition: 'top',
        addingProduct: false,
        
        /**
         * Inicialización y vinculación de eventos
         */
        init: function() {
            // Cargar configuración
            if (window.snap_sidebar_cart_params) {
                if (window.snap_sidebar_cart_params.animations) {
                    this.animationDuration = parseInt(window.snap_sidebar_cart_params.animations.duration, 10) || 300;
                }
                
                this.newProductPosition = window.snap_sidebar_cart_params.new_product_position || 'top';
            }
            
            this.bindEvents();
            
            // Aplicar valores CSS para animaciones
            document.documentElement.style.setProperty('--animation-duration', this.animationDuration + 'ms');
        },

        /**
         * Vincula los eventos principales de la interfaz
         */
        bindEvents: function() {
            var self = this;
            
            // Selector para botones que activan el carrito
            var activationSelectors = window.snap_sidebar_cart_params ? 
                window.snap_sidebar_cart_params.activation_selectors : 
                '.add_to_cart_button';
            
            // Activar al hacer clic en botones específicos
            $('body').on('click', activationSelectors, function(e) {
                var $this = $(this);
                
                // Verificar si es un producto con variaciones
                if ($this.hasClass('add_to_cart_button') && 
                    (($this.attr('href') && self.isProductVariation($this.attr('href'))) || 
                     $this.hasClass('product_type_variable') ||
                     $this.hasClass('variations_form') ||
                     $this.closest('.variations_form').length)) {
                    console.log("Botón de variación detectado - No abriendo sidebar");
                    return; // Dejar que WooCommerce maneje la navegación
                }
                
                // Para productos simples, abrir el sidebar
                e.preventDefault();
                e.stopPropagation();
                console.log("Botón de producto simple detectado - Abriendo sidebar");
                self.openSidebar();
            });
            
            // Abrir cuando se añade un producto al carrito (evento de WooCommerce)
            $(document.body).on('added_to_cart', function(event, fragments, cart_hash, $button) {
                console.log("Evento added_to_cart detectado");
                
                // Verificar si es actualización de un producto existente
                var isProductUpdate = false;
                var productId = null;
                
                if ($button && $button.data('product_id')) {
                    productId = $button.data('product_id');
                    
                    // Comprobar si ya está en el carrito
                    isProductUpdate = self.isProductInCart(productId);
                }
                
                // Si la apertura automática está habilitada
                if (window.snap_sidebar_cart_params && 
                    (window.snap_sidebar_cart_params.auto_open === '1' || 
                     window.snap_sidebar_cart_params.auto_open === true)) {
                    self.openSidebar();
                }
                
                // Manejar diferente según sea actualización o nueva adición
                if (isProductUpdate) {
                    console.log("Actualizando producto existente");
                    self.updateExistingProduct(productId);
                } else {
                    console.log("Agregando nuevo producto");
                    self.addNewProductAnimation(productId);
                }
            });
            
            // Cargar contenido inicial
            self.loadInitialContent();
        },
        
        /**
         * Carga el contenido inicial del carrito
         */
        loadInitialContent: function() {
            var self = this;
            
            // Cargar mediante AJAX
            $.ajax({
                type: 'POST',
                url: snap_sidebar_cart_params.ajax_url,
                data: {
                    action: 'snap_sidebar_cart_get_content'
                },
                success: function(response) {
                    if (response.success) {
                        console.log("Contenido inicial cargado");
                        self.updateCartContent(response.data);
                    }
                }
            });
        },
        
        /**
         * Abre el sidebar del carrito
         */
        openSidebar: function() {
            $('.snap-sidebar-cart').addClass('open');
            $('.snap-sidebar-cart__overlay').css('display', 'block');
            $('body').addClass('snap-sidebar-cart-open');
            
            // Verificar si hay productos en el carrito
            var hasProducts = $('.snap-sidebar-cart__product').length > 0;
            
            // Mostrar u ocultar pestañas según haya productos
            if (hasProducts) {
                $('.snap-sidebar-cart__related-tabs').show();
                $('.snap-sidebar-cart__related-content').show();
                
                // Pequeño retraso para asegurar que el DOM está completamente cargado
                setTimeout(function() {
                    // Forzar carga de la primera pestaña
                    var $tabs = $('.snap-sidebar-cart__related-tab');
                    if ($tabs.length > 0) {
                        // Activar la primera pestaña si no hay ninguna activa
                        if ($('.snap-sidebar-cart__related-tab.active').length === 0) {
                            $tabs.first().addClass('active');
                        }
                        
                        // Obtener la pestaña activa
                        var $activeTab = $('.snap-sidebar-cart__related-tab.active');
                        var tabType = $activeTab.data('tab');
                        
                        // Activar el contenedor correspondiente
                        $('.snap-sidebar-cart__related-container').removeClass('active');
                        var $container = $('.snap-sidebar-cart__related-container[data-content="' + tabType + '"]');
                        $container.addClass('active');
                        
                        // Obtener el track para cargar productos
                        var $track = $container.find('.snap-sidebar-cart__slider-track');
                        
                        // Verificar si ya tiene productos
                        var hasLoadedProducts = $track.children('.snap-sidebar-cart__related-product').not('.snap-sidebar-cart__loading-products').length > 0;
                        
                        // Cargar productos si no hay
                        if (!hasLoadedProducts) {
                            // Obtener ID del último producto en el carrito
                            var productId = '';
                            $('.snap-sidebar-cart__product').each(function() {
                                var pid = $(this).data('product-id');
                                if (pid) {
                                    productId = pid;
                                }
                            });
                            
                            // Usar el último producto encontrado
                            if (productId) {
                                console.log('Cargando productos relacionados para la pestaña ' + tabType + ' con producto ID: ' + productId);
                                
                                // Mostrar preloader
                                if (typeof snap_sidebar_cart_params !== 'undefined' && snap_sidebar_cart_params.loading_html) {
                                    $track.html(snap_sidebar_cart_params.loading_html);
                                } else {
                                    $track.html('<p>Cargando productos relacionados...</p>');
                                }
                                
                                // Hacer la petición AJAX
                                $.ajax({
                                    type: 'POST',
                                    url: snap_sidebar_cart_params.ajax_url,
                                    data: {
                                        action: 'snap_sidebar_cart_get_related',
                                        nonce: snap_sidebar_cart_params.nonce,
                                        product_id: productId,
                                        type: tabType
                                    },
                                    success: function(response) {
                                        if (response.success && response.data && response.data.html) {
                                            $track.html(response.data.html);
                                        } else {
                                            $track.html('<p>No se encontraron productos para mostrar.</p>');
                                        }
                                    },
                                    error: function() {
                                        $track.html('<p>Error al cargar productos.</p>');
                                    }
                                });
                            }
                        }
                    }
                }, 300);
            } else {
                // Ocultar pestañas si no hay productos
                $('.snap-sidebar-cart__related-tabs').hide();
                $('.snap-sidebar-cart__related-content').hide();
            }
            
            // Disparar evento para que otros módulos puedan responder
            $(document.body).trigger('snap_sidebar_cart_opened');
        },
        
        /**
         * Actualiza el contenido del carrito
         * 
         * @param {Object} data - Datos actualizados del carrito
         */
        updateCartContent: function(data) {
            console.log("Actualizando contenido del carrito");
            // Actualizar el HTML del carrito
            $('.snap-sidebar-cart__products').html(data.cart_html);
            // Actualizar los totales
            $('.snap-sidebar-cart__shipping-price').html(data.shipping_total);
            $('.snap-sidebar-cart__subtotal-price').html(data.subtotal);
            // Actualizar botones según el estado del carrito
            this.updateCartButtons(data.cart_count);
            // Disparar evento para que otros módulos puedan responder
            $(document.body).trigger('snap_sidebar_cart_updated');
        },
        
        /**
         * Actualiza los botones del carrito según haya productos o no
         * 
         * @param {number} cartCount - Número de productos en el carrito
         */
        updateCartButtons: function(cartCount) {
            if (cartCount > 0) {
                // Si hay productos pero no hay botones, añadirlos
                if ($('.snap-sidebar-cart__buttons').length === 0) {
                    var cartUrl = '';
                    var checkoutUrl = '';
                    
                    // Intentar obtener URLs de WooCommerce
                    if (typeof wc_cart_fragments_params !== 'undefined') {
                        cartUrl = wc_cart_fragments_params.cart_url;
                        checkoutUrl = wc_cart_fragments_params.checkout_url;
                    } else {
                        // URLs por defecto
                        cartUrl = '/cart/';
                        checkoutUrl = '/checkout/';
                    }
                    
                    var buttonsHtml = 
                        '<div class="snap-sidebar-cart__buttons">' +
                            '<a href="' + cartUrl + '" class="snap-sidebar-cart__button snap-sidebar-cart__button--cart">' + 
                                'Ver carrito</a>' +
                            '<a href="' + checkoutUrl + '" class="snap-sidebar-cart__button snap-sidebar-cart__button--checkout">' + 
                                'Finalizar pedido</a>' +
                        '</div>';
                    
                    $('.snap-sidebar-cart__footer').append(buttonsHtml);
                }
            } else {
                // Si no hay productos, eliminar botones
                $('.snap-sidebar-cart__buttons').remove();
            }
        },
        
        /**
         * Verifica si un producto ya está en el carrito
         * 
         * @param {number} productId - ID del producto a verificar
         * @return {boolean} - true si ya está en el carrito
         */
        isProductInCart: function(productId) {
            var inCart = false;
            
            $('.snap-sidebar-cart__product').each(function() {
                var itemProductId = $(this).data('product-id');
                if (itemProductId == productId) {
                    inCart = true;
                    return false; // Salir del bucle
                }
            });
            
            return inCart;
        },
        
        /**
         * Actualiza visualmente un producto existente
         * 
         * @param {number} productId - ID del producto a resaltar
         */
        updateExistingProduct: function(productId) {
            var self = this;
            
            // Primero encontramos el producto existente para marcar su posición actual
            var $existingProduct = null;
            var $quantityInput = null;
            var oldQuantity = 0;
            
            $('.snap-sidebar-cart__product').each(function() {
                var $product = $(this);
                if ($product.data('product-id') == productId) {
                    $existingProduct = $product;
                    $quantityInput = $product.find('.cart-item__quantity-input');
                    oldQuantity = parseInt($quantityInput.val(), 10) || 0;
                    return false; // Salir del bucle
                }
            });
            
            // Guardar la posición actual del producto para mantener el scroll
            var productPosition = null;
            var $container = null;
            
            if ($existingProduct && $existingProduct.length) {
                $container = $('.snap-sidebar-cart__products');
                productPosition = $existingProduct.offset().top - $container.offset().top + $container.scrollTop();
                
                // No aplicamos animación aquí, lo haremos después de la actualización
                console.log("Producto existente encontrado: ID " + productId + ", cantidad actual: " + oldQuantity);
            }
            
            // Actualizar contenido completo
            $.ajax({
                type: 'POST',
                url: snap_sidebar_cart_params.ajax_url,
                data: {
                    action: 'snap_sidebar_cart_get_content'
                },
                success: function(response) {
                    if (response.success) {
                        self.updateCartContent(response.data);
                        
                        // Resaltar específicamente el campo de cantidad
                        // Pasamos la cantidad antigua para comparar con la nueva
                        console.log("Animando cambio de cantidad para producto ID " + productId);
                        self.highlightExistingProductQuantity(productId, oldQuantity);
                    }
                }
            });
        },
        
        /**
         * Resalta visualmente un producto existente en el carrito
         * 
         * @param {number} productId - ID del producto a resaltar
         */
        highlightExistingProduct: function(productId) {
            $('.snap-sidebar-cart__product').each(function() {
                var $product = $(this);
                if ($product.data('product-id') == productId) {
                    // Asegurar visibilidad (scroll)
                    var $container = $('.snap-sidebar-cart__products');
                    var productOffset = $product.offset().top - $container.offset().top + $container.scrollTop();
                    
                    $container.animate({
                        scrollTop: productOffset
                    }, 300);
                    
                    // Animar cambio de cantidad
                    var $quantityInput = $product.find('.cart-item__quantity-input');
                    if ($quantityInput.length) {
                        $quantityInput.addClass('quantity-updated');
                        setTimeout(function() {
                            $quantityInput.removeClass('quantity-updated');
                        }, 1000);
                    }
                    
                    // Ya no resaltamos el producto completo, solo la cantidad
                    
                    return false; // Salir del bucle
                }
            });
        },
        
        /**
         * Resalta específicamente la cantidad de un producto existente
         * Usado cuando se agrega un producto que ya está en el carrito
         * 
         * @param {number} productId - ID del producto a resaltar
         * @param {number} oldQuantity - Cantidad anterior del producto
         */
        highlightExistingProductQuantity: function(productId, oldQuantity) {
            $('.snap-sidebar-cart__product').each(function() {
                var $product = $(this);
                if ($product.data('product-id') == productId) {
                    // Encontrar contenedor de cantidad e input
                    var $quantityContainer = $product.find('.quantity.buttoned-input');
                    var $quantityInput = $product.find('.cart-item__quantity-input');
                    
                    if ($quantityInput.length) {
                        // Obtener nueva cantidad
                        var newQuantity = parseInt($quantityInput.val(), 10) || 0;
                        
                        if (newQuantity > oldQuantity) {
                            // Efecto más notable para el contenedor de cantidad
                            $quantityContainer.addClass('quantity-highlight');
                            
                            // Animación para el valor de la cantidad
                            $quantityInput.addClass('quantity-flash');
                            
                            // Añadir un efecto visual temporal para el producto
                            $product.css({
                                'transition': 'background-color 0.5s ease-in-out',
                                'background-color': 'rgba(241, 196, 15, 0.1)'
                            });
                            
                            // Eliminar clases y restaurar estilos después de completar la animación
                            setTimeout(function() {
                                $quantityContainer.removeClass('quantity-highlight');
                                $quantityInput.removeClass('quantity-flash');
                                
                                $product.css({
                                    'background-color': '',
                                    'transition': ''
                                });
                                
                                // Efecto de "pulso" final sutil con CSS puro
                                $quantityInput.css('animation', 'quantityPulse 0.3s ease-in-out');
                                
                                // Limpieza final
                                setTimeout(function() {
                                    $quantityInput.css('animation', '');
                                }, 300);
                            }, 1000);
                        }
                    }
                    
                    // Asegurar visibilidad scrollando al producto
                    var $container = $('.snap-sidebar-cart__products');
                    var productOffset = $product.offset().top - $container.offset().top + $container.scrollTop();
                    $container.animate({ scrollTop: productOffset - 10 }, 300);
                    
                    return false; // Salir del bucle
                }
            });
        },
        
        /**
         * Anima la adición de un nuevo producto
         * 
         * @param {number} productId - ID del producto añadido
         */
        addNewProductAnimation: function(productId) {
            var self = this;
            var $productsContainer = $('.snap-sidebar-cart__products-list');
            
            // Si no hay contenedor, actualizar todo el carrito
            if (!$productsContainer.length) {
                $.ajax({
                    type: 'POST',
                    url: snap_sidebar_cart_params.ajax_url,
                    data: {
                        action: 'snap_sidebar_cart_get_content'
                    },
                    success: function(response) {
                        if (response.success) {
                            self.updateCartContent(response.data);
                        }
                    }
                });
                return;
            }
            
            // Crear elemento de transición para inserción
            var $transitionElement = $('<div class="snap-sidebar-cart__insertion-transition"></div>');
            $productsContainer.append($transitionElement);
            
            // Crear placeholder para el nuevo producto con una estructura más completa
            var $newItemPlaceholder = $(
                '<li class="snap-sidebar-cart__product placeholder-animation">' +
                    '<div class="snap-sidebar-cart__product-image">' +
                        '<div class="placeholder-image"></div>' +
                    '</div>' +
                    '<div class="snap-sidebar-cart__product-details">' +
                        '<div class="snap-sidebar-cart__product-header">' +
                            '<div class="placeholder-title"></div>' +
                            '<div class="placeholder-variant"></div>' +
                        '</div>' +
                        '<div class="snap-sidebar-cart__product-footer">' +
                            '<div class="placeholder-quantity"></div>' +
                            '<div class="placeholder-price"></div>' +
                        '</div>' +
                    '</div>' +
                '</li>'
            );
            
            // Crear espacio para el nuevo producto según la configuración
            if (this.newProductPosition === 'top') {
                // Animar la apertura de espacio para el nuevo producto
                $productsContainer.css('overflow', 'hidden');
                $productsContainer.children().first().before($transitionElement);
                
                // Altura inicial 0
                $transitionElement.css({
                    height: '0',
                    overflow: 'hidden',
                    transition: 'height ' + (self.animationDuration / 3) + 'ms ease-out'
                });
                
                // Añadir placeholder con altura 0
                $transitionElement.append($newItemPlaceholder);
                
                // Calcular y animar altura
                var placeholderHeight = $newItemPlaceholder.outerHeight();
                if (!placeholderHeight) placeholderHeight = 110; // Altura predeterminada
                
                // Animar apertura
                setTimeout(function() {
                    $transitionElement.css('height', placeholderHeight + 'px');
                }, 10);
            } else {
                // Para posición bottom, simplemente añadir al final
                $productsContainer.append($newItemPlaceholder);
                $newItemPlaceholder.hide().fadeIn(self.animationDuration / 3);
            }
            
            // Añadir y configurar preloader
            var $preloader = $('<div class="snap-sidebar-cart__product-loader" style="display:block;"><div class="snap-sidebar-cart__loader-spinner"></div></div>');
            $newItemPlaceholder.append($preloader);
            
            // Configurar preloader con las opciones del usuario
            var preloaderType = 'circle';
            var preloaderPosition = 'center';
            
            if (window.snap_sidebar_cart_params && window.snap_sidebar_cart_params.preloader) {
                preloaderType = window.snap_sidebar_cart_params.preloader.type || 'circle';
                preloaderPosition = window.snap_sidebar_cart_params.preloader.position || 'center';
            }
            
            var $spinner = $preloader.find('.snap-sidebar-cart__loader-spinner');
            $spinner.addClass('preloader-' + preloaderType);
            $spinner.addClass('preloader-position-' + preloaderPosition);
            
            if (preloaderType === 'dots') {
                $spinner.html('<span></span><span></span><span></span>');
            }
            
            // Actualizar después de un breve retraso para permitir la animación
            setTimeout(function() {
                $.ajax({
                    type: 'POST',
                    url: snap_sidebar_cart_params.ajax_url,
                    data: {
                        action: 'snap_sidebar_cart_get_content'
                    },
                    success: function(response) {
                        if (response.success) {
                            // Eliminar elementos de transición y placeholder
                            $transitionElement.remove();
                            $newItemPlaceholder.remove();
                            
                            // Actualizar contenido
                            self.updateCartContent(response.data);
                            
                            // Animar nuevo producto
                            var $newItem;
                            if (self.newProductPosition === 'top') {
                                $newItem = $('.snap-sidebar-cart__product:first-child');
                            } else {
                                $newItem = $('.snap-sidebar-cart__product:last-child');
                            }
                            
                            if ($newItem.length) {
                                // Desplazar automáticamente para mostrar el nuevo producto
                                var $container = $('.snap-sidebar-cart__products');
                                var scrollPosition = 0;
                                
                                if (self.newProductPosition === 'top') {
                                    scrollPosition = 0;
                                } else {
                                    scrollPosition = $container[0].scrollHeight;
                                }
                                
                                $container.animate({
                                    scrollTop: scrollPosition
                                }, 300);
                                
                                // Destacar el nuevo producto
                                $newItem.addClass('new-item');
                                setTimeout(function() {
                                    $newItem.removeClass('new-item');
                                }, self.animationDuration * 2);
                            }
                            
                            // Cargar productos relacionados si se añadió un nuevo producto
                            if (productId && window.SnapSidebarCartRelated) {
                                window.SnapSidebarCartRelated.loadRelatedProductsIfEmpty();
                            }
                        }
                    },
                    error: function() {
                        // Eliminar elementos de transición en caso de error
                        $transitionElement.remove();
                        $newItemPlaceholder.remove();
                    }
                });
            }, self.animationDuration / 2); // Aumentar ligeramente el tiempo para permitir la transición
        },
        
        /**
         * Verifica si es un producto con variaciones
         * 
         * @param {string} url - URL del botón o producto
         * @return {boolean} - true si es un producto con variaciones
         */
        isProductVariation: function(url) {
            if (!url) return false;
            
            // Verificar parámetros en la URL
            if (url.includes('?') && 
                (url.includes('variation_id=') || 
                 url.includes('attribute_') || 
                 url.includes('product_type=variable'))) {
                return true;
            }
            
            // Verificar clases y estructura
            if (url.includes('/product-category/') || url.includes('?add-to-cart=')) {
                var $button = $('a[href="' + url + '"]');
                if ($button.length && 
                    ($button.hasClass('product_type_variable') || 
                     $button.hasClass('variations_form') || 
                     $button.closest('.variations_form').length)) {
                    return true;
                }
            }
            
            return false;
        }
    };

    // Inicializar cuando el DOM esté listo
    $(document).ready(function() {
        UIHandler.init();
    });

    // Exportar para uso en otros scripts
    window.SnapSidebarCartUI = UIHandler;

    // Importar y exponer el nuevo manejador de animaciones
    if (typeof window.CartAnimationsHandler === 'undefined') {
        $.getScript(snap_sidebar_cart_params.plugin_url + 'assets/js/handlers/cart-animations-handler.js');
    }
    // Importar el handler de sincronización de fragmentos de WooCommerce
    $.getScript(snap_sidebar_cart_params.plugin_url + 'assets/js/handlers/cart-fragment-sync.js');

})(jQuery);
