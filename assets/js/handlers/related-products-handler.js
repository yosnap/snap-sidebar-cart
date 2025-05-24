/**
 * Maneja la funcionalidad de productos relacionados
 * 
 * Este archivo se encarga de:
 * - Cargar productos relacionados vía AJAX
 * - Manejar el slider de productos relacionados
 * - Mostrar imágenes alternas de la galería al hacer hover
 */

// Esta función ya no es necesaria, se ha eliminado la funcionalidad de test
(function ($) {
    'use strict';

    /**
     * Genera el HTML del preloader según la configuración del plugin
     * @param {boolean} isContainer - Si es true, genera el preloader para el contenedor, si es false, para un producto individual
     * @param {string} loadingText - Texto opcional para mostrar debajo del preloader (solo para contenedor)
     * @returns {string} - HTML del preloader
     */
    function generatePreloaderHTML(isContainer, loadingText) {
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
        
        // Crear el HTML del preloader con estilos inline
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
        
        // Si es para el contenedor, incluir el texto de carga
        if (isContainer) {
            return '<div class="snap-sidebar-cart__loading-products">' +
                   preloaderHTML +
                   '<span>' + (loadingText || 'Cargando productos...') + '</span>' +
                   '</div>';
        } else {
            return '<div class="snap-sidebar-cart__product-loader" style="display:block;">' + 
                   preloaderHTML + 
                   '</div>';
        }
    }

    /**
     * Controlador de productos relacionados
     * 
     * @class RelatedProductsHandler
     */
    var RelatedProductsHandler = {
        currentTab: 'related', // Tab activo por defecto
        
        /**
         * Inicialización y vinculación de eventos
         */
        init: function() {
            this.bindEvents();
            this.initSlider();
        },

        /**
         * Vincula todos los eventos relacionados con productos relacionados
         */
        bindEvents: function() {
            var self = this;
            
            // Cambiar de pestaña en productos relacionados
            $(document).on('click', '.snap-sidebar-cart__related-tab', function(e) {
                e.preventDefault();
                var $tab = $(this);
                var tabType = $tab.data('tab');
                
                self.changeTab(tabType);
            });
            
            // Navegación del slider (botones prev/next)
            $(document).on('click', '.snap-sidebar-cart__slider-prev', function(e) {
                e.preventDefault();
                e.stopPropagation();
                var $track = $(this).siblings('.snap-sidebar-cart__slider-track');
                self.slideLeft($track);
            });
            
            $(document).on('click', '.snap-sidebar-cart__slider-next', function(e) {
                e.preventDefault();
                e.stopPropagation();
                var $track = $(this).siblings('.snap-sidebar-cart__slider-track');
                self.slideRight($track);
            });
            
            // Cargar productos relacionados cuando se abre el sidebar
            $(document.body).on('snap_sidebar_cart_opened', function() {
                self.loadRelatedProductsIfEmpty();
            });
            
            // Añadir productos relacionados al carrito
            $(document).on('click', '.snap-sidebar-cart__add-related-product', function(e) {
                e.preventDefault();
                
                var $button = $(this);
                var productId = $button.data('product-id');
                
                if (!productId) return;
                
                self.addRelatedProductToCart(productId, $button);
            });
        },
        
        /**
         * Inicializa el slider de productos relacionados
         */
        initSlider: function() {
            var self = this;
            
            $('.snap-sidebar-cart__slider-track').each(function() {
                var $track = $(this);
                self.updateSliderNavigation($track);
            });
            
            // Actualizar la navegación al cambiar el tamaño de la ventana
            $(window).on('resize', function() {
                $('.snap-sidebar-cart__slider-track').each(function() {
                    self.updateSliderNavigation($(this));
                });
            });
        },
        
        /**
         * Actualiza la visibilidad de los botones de navegación según el contenido
         * 
         * @param {jQuery} $track - El elemento contenedor del slider
         */
        updateSliderNavigation: function($track) {
            var childrenCount = $track.children('.snap-sidebar-cart__related-product').length;
            
            if (childrenCount > 0) {
                var containerWidth = $track.width();
                var $firstItem = $track.children('.snap-sidebar-cart__related-product').first();
                
                if ($firstItem.length > 0) {
                    var itemWidth = $firstItem.outerWidth(true);
                    var visibleItems = Math.floor(containerWidth / itemWidth);
                    
                    // Mostrar/ocultar navegación según sea necesario
                    if (childrenCount <= visibleItems) {
                        $track.parent().find('.snap-sidebar-cart__slider-nav').hide();
                    } else {
                        $track.parent().find('.snap-sidebar-cart__slider-nav').show();
                    }
                }
            } else {
                // Sin productos, ocultar navegación
                $track.parent().find('.snap-sidebar-cart__slider-nav').hide();
            }
        },
        
        /**
         * Desliza el slider hacia la izquierda
         * 
         * @param {jQuery} $track - El elemento contenedor del slider
         */
        slideLeft: function($track) {
            var scrollAmount = $track.width() * 0.8;
            $track.animate({
                scrollLeft: $track.scrollLeft() - scrollAmount
            }, 300);
        },
        
        /**
         * Desliza el slider hacia la derecha
         * 
         * @param {jQuery} $track - El elemento contenedor del slider
         */
        slideRight: function($track) {
            var scrollAmount = $track.width() * 0.8;
            $track.animate({
                scrollLeft: $track.scrollLeft() + scrollAmount
            }, 300);
        },
        
        /**
         * Cambia la pestaña activa de productos relacionados
         * 
         * @param {string} tabType - El tipo de pestaña a activar
         */
        changeTab: function(tabType) {
            console.log('changeTab: tabType recibido:', tabType, typeof tabType);
            if (tabType === this.currentTab) {
                return; // Ya está activa
            }
            
            console.log('Cambiando a pestaña:', tabType);
            
            // Actualizar UI
            $('.snap-sidebar-cart__related-tab').removeClass('active');
            $('.snap-sidebar-cart__related-tab[data-tab="' + tabType + '"]').addClass('active');
            
            $('.snap-sidebar-cart__related-container').removeClass('active');
            var $targetContent = $('.snap-sidebar-cart__related-container[data-content="' + tabType + '"]');
            $targetContent.addClass('active');
            
            // Actualizar tab activo
            this.currentTab = tabType;
            
            // Cargar productos si el contenedor está vacío
            var $targetContainer = $targetContent.find('.snap-sidebar-cart__slider-track');
            
            if ($targetContainer.children().length === 0) {
                this.loadRelatedProducts(tabType);
            }
        },
        
        /**
         * Carga productos relacionados si el contenedor activo está vacío
         */
        loadRelatedProductsIfEmpty: function() {
            var $activeContainer = $('.snap-sidebar-cart__related-container.active .snap-sidebar-cart__slider-track');
            
            if ($activeContainer.length && $activeContainer.children().length === 0) {
                this.loadRelatedProducts(this.currentTab);
            }
        },
        
        /**
         * Carga productos relacionados para la pestaña especificada
         * 
         * @param {string} tabType - El tipo de pestaña para cargar productos
         */
        loadRelatedProducts: function(tabType) {
            console.log('Llamando a loadRelatedProducts con tabType:', tabType, typeof tabType);
            var self = this;
            var $targetContainer = $('.snap-sidebar-cart__related-container[data-content="' + tabType + '"] .snap-sidebar-cart__slider-track');
            
            if ($targetContainer.length === 0) {
                console.error('Contenedor no encontrado para productos de tipo:', tabType);
                return;
            }
            
            // Mostrar preloader usando la función auxiliar
            $targetContainer.html(generatePreloaderHTML(true, 'Cargando productos...'));
            
            // Obtener ID del primer producto en el carrito
            var productIds = [];
            $('.snap-sidebar-cart__product').each(function() {
                var productId = $(this).data('product-id');
                if (productId) {
                    productIds.push(productId);
                }
            });
            
            if (productIds.length === 0) {
                $targetContainer.html('<div class="snap-sidebar-cart__no-products">No hay productos en el carrito para mostrar sugerencias.</div>');
                $targetContainer.parent().find('.snap-sidebar-cart__slider-nav').hide();
                return;
            }
            
            // Usar el primer producto como referencia
            var referenceProductId = productIds[0];
            
            $.ajax({
                type: 'POST',
                url: snap_sidebar_cart_params.ajax_url,
                data: {
                    action: 'snap_sidebar_cart_get_related',
                    nonce: snap_sidebar_cart_params.nonce,
                    product_id: referenceProductId,
                    type: tabType
                },
                success: function(response) {
                    if (response.success && response.data.html && response.data.html.trim() !== '') {
                        // Insertar productos
                        $targetContainer.html(response.data.html);
                        
                        // Configurar hover para imágenes de galería
                        self.setupProductGalleryHover();
                        
                        // Actualizar botones de navegación
                        self.updateSliderNavigation($targetContainer);
                    } else {
                        // Intentar con otro producto si el primero falla
                        if (productIds.length > 1) {
                            self.tryAlternativeProduct(productIds.slice(1), tabType, $targetContainer);
                        } else {
                            self.showNoProductsMessage($targetContainer);
                        }
                    }
                },
                error: function() {
                    // Intentar con otro producto si el primero falla
                    if (productIds.length > 1) {
                        self.tryAlternativeProduct(productIds.slice(1), tabType, $targetContainer);
                    } else {
                        self.showNoProductsMessage($targetContainer);
                    }
                }
            });
        },
        
        /**
         * Intenta cargar productos relacionados usando un producto alternativo
         * 
         * @param {Array} productIds - Lista de IDs de productos alternativos
         * @param {string} tabType - Tipo de pestaña
         * @param {jQuery} $targetContainer - Contenedor donde mostrar los productos
         */
        tryAlternativeProduct: function(productIds, tabType, $targetContainer) {
            var self = this;
            
            if (!productIds.length) {
                self.showNoProductsMessage($targetContainer);
                return;
            }
            
            var alternativeProductId = productIds[0];
            
            $.ajax({
                type: 'POST',
                url: snap_sidebar_cart_params.ajax_url,
                data: {
                    action: 'snap_sidebar_cart_get_related',
                    nonce: snap_sidebar_cart_params.nonce,
                    product_id: alternativeProductId,
                    type: tabType
                },
                success: function(response) {
                    if (response.success && response.data.html && response.data.html.trim() !== '') {
                        // Insertar productos
                        $targetContainer.html(response.data.html);
                        
                        // Configurar hover para imágenes de galería
                        self.setupProductGalleryHover();
                        
                        // Actualizar botones de navegación
                        self.updateSliderNavigation($targetContainer);
                    } else {
                        // Intentar con el siguiente producto si hay más
                        if (productIds.length > 1) {
                            self.tryAlternativeProduct(productIds.slice(1), tabType, $targetContainer);
                        } else {
                            self.showNoProductsMessage($targetContainer);
                        }
                    }
                },
                error: function() {
                    // Intentar con el siguiente producto si hay más
                    if (productIds.length > 1) {
                        self.tryAlternativeProduct(productIds.slice(1), tabType, $targetContainer);
                    } else {
                        self.showNoProductsMessage($targetContainer);
                    }
                }
            });
        },
        
        /**
         * Muestra un mensaje cuando no hay productos para mostrar
         * 
         * @param {jQuery} $targetContainer - Contenedor donde mostrar el mensaje
         */
        showNoProductsMessage: function($targetContainer) {
            $targetContainer.html('<div class="snap-sidebar-cart__no-products">No se encontraron productos relacionados.</div>');
            $targetContainer.parent().find('.snap-sidebar-cart__slider-nav').hide();
        },
        
        /**
         * Configura el efecto hover para mostrar imágenes alternativas de producto
         */
        setupProductGalleryHover: function() {
            $('.snap-sidebar-cart__related-product').each(function() {
                var $product = $(this);
                var $primaryImage = $product.find('.primary-image');
                var $hoverImage = $product.find('.hover-image');
                var $imageContainer = $product.find('.snap-sidebar-cart__related-product-image');
                // Verificar si hay una imagen de hover válida
                var hasValidHoverImage = false;
                if ($hoverImage.length > 0) {
                    var hoverSrc = $hoverImage.attr('src');
                    if (hoverSrc && hoverSrc.trim() !== '' && !hoverSrc.includes('placeholder') && !hoverSrc.includes('woocommerce-placeholder')) {
                        hasValidHoverImage = true;
                    }
                }
                /*console.log('Producto:', $product.find('.snap-sidebar-cart__related-product-title').text(), 
                           '- Imagen hover válida:', hasValidHoverImage);*/
                var hasGalleryFromServer = !$product.hasClass('no-gallery-server');
                $product.hover(
                    function() {
                        $imageContainer.addClass('hover-active');
                    },
                    function() {
                        $imageContainer.removeClass('hover-active');
                    }
                );
                // Ya no necesitas el efecto de mousemove con la nueva estructura
                // El CSS se encarga de la animación de hover
            });
        },
        
        /**
         * Añade un producto relacionado al carrito
         * 
         * @param {number} productId - ID del producto a añadir
         * @param {jQuery} $button - Botón que se ha pulsado
         */
        addRelatedProductToCart: function(productId, $button) {
            var self = this;
            
            // Comprobar si ya está en proceso de añadir
            if ($button.hasClass('loading')) {
                return;
            }
            
            // Verificar si ya está en el carrito
            var existingProduct = false;
            var existingProductKey = null;
            var existingProductQuantity = 0;
            
            $('.snap-sidebar-cart__product').each(function() {
                if ($(this).data('product-id') == productId) {
                    existingProduct = true;
                    existingProductKey = $(this).data('key');
                    existingProductQuantity = parseInt($(this).find('.cart-item__quantity-input').val(), 10) || 0;
                    return false; // Salir del bucle
                }
            });
            
            // Mostrar estado de carga
            $button.addClass('loading');
            
            if (existingProduct && existingProductKey) {
                // Si ya existe, incrementar cantidad
                var newQuantity = existingProductQuantity + 1;
                
                // Buscar el elemento del producto
                var $existingItem = $('.snap-sidebar-cart__product[data-key="' + existingProductKey + '"]');
                
                // Mostrar preloader
                if ($existingItem.length) {
                    var $loader = $existingItem.find('.snap-sidebar-cart__product-loader');
                    $loader.show();
                }
                
                // Actualizar mediante AJAX
                $.ajax({
                    type: 'POST',
                    url: snap_sidebar_cart_params.ajax_url,
                    data: {
                        action: 'snap_sidebar_cart_update',
                        nonce: snap_sidebar_cart_params.nonce,
                        cart_item_key: existingProductKey,
                        quantity: newQuantity
                    },
                    success: function(response) {
                        if (response.success) {
                            // Resaltar producto
                            window.SnapSidebarCartUI.highlightExistingProduct(productId);
                        } else {
                            if (response.data && response.data.message) {
                                alert(response.data.message);
                            }
                            $loader.hide();
                        }
                    },
                    error: function() {
                        alert('Error al comunicarse con el servidor');
                        $loader.hide();
                    },
                    complete: function() {
                        $button.removeClass('loading');
                    }
                });
            } else {
                // Si es nuevo, añadirlo al carrito
                
                // Mostrar preloader
                var $productsContainer = $('.snap-sidebar-cart__products-list');
                var $newItemPlaceholder = $('<li class="snap-sidebar-cart__product placeholder-animation"></li>');
                
                // Insertar placeholder
                $productsContainer.append($newItemPlaceholder);
                
                // Añadir preloader usando la función auxiliar
                var $preloader = $(generatePreloaderHTML(false));
                $newItemPlaceholder.append($preloader);
                
                // Añadir mediante AJAX
                $.ajax({
                    type: 'POST',
                    url: snap_sidebar_cart_params.ajax_url,
                    data: {
                        action: 'snap_sidebar_cart_add',
                        nonce: snap_sidebar_cart_params.nonce,
                        product_id: productId,
                        quantity: 1
                    },
                    success: function(response) {
                        // Eliminar placeholder
                        $newItemPlaceholder.remove();
                        
                        if (response.success) {
                            // Animar nuevo producto
                            var $newItem = $('.snap-sidebar-cart__product:last-child');
                            
                            if ($newItem.length) {
                                $newItem.addClass('new-item');
                                setTimeout(function() {
                                    $newItem.removeClass('new-item');
                                }, 800);
                            }
                        } else {
                            if (response.data && response.data.message) {
                                alert(response.data.message);
                            }
                        }
                    },
                    error: function() {
                        alert('Error al comunicarse con el servidor');
                        $newItemPlaceholder.remove();
                    },
                    complete: function() {
                        $button.removeClass('loading');
                    }
                });
            }
        }
    };

    // Inicializar cuando el DOM esté listo
    $(document).ready(function() {
        RelatedProductsHandler.init();
    });

    // Exportar para uso global y compatibilidad con el plugin principal
    window.snapSidebarCartSlider = window.snapSidebarCartSlider || {};
    window.snapSidebarCartSlider.loadRelatedProducts = RelatedProductsHandler.loadRelatedProducts.bind(RelatedProductsHandler);
    window.snapSidebarCartSlider.initSlider = RelatedProductsHandler.initSlider.bind(RelatedProductsHandler);
    // (Opcional) Mantener la referencia anterior
    window.SnapSidebarCartRelated = RelatedProductsHandler;

})(jQuery);
