/**
 * Maneja la funcionalidad de productos relacionados
 * 
 * Este archivo se encarga de:
 * - Cargar productos relacionados vía AJAX
 * - Manejar el slider de productos relacionados
 * - Mostrar imágenes alternas de la galería al hacer hover
 */
(function ($) {
    'use strict';

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
            var self = this;
            var $targetContainer = $('.snap-sidebar-cart__related-container[data-content="' + tabType + '"] .snap-sidebar-cart__slider-track');
            
            if ($targetContainer.length === 0) {
                console.error('Contenedor no encontrado para productos de tipo:', tabType);
                return;
            }
            
            // Mostrar preloader
            $targetContainer.html(
                '<div class="snap-sidebar-cart__loading-products">' +
                '<div class="snap-sidebar-cart__loader-spinner preloader-circle"></div>' +
                '<span>Cargando productos...</span>' +
                '</div>'
            );
            
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
                var $galleryImages = $product.find('.product-gallery-image');
                var $imageContainer = $product.find('.snap-sidebar-cart__related-product-image');
                
                // Verificar si hay imágenes de galería y si son válidas
                var hasValidGalleryImages = false;
                var validGalleryImageCount = 0;
                var validGalleryImages = [];
                
                // Verificar cada imagen de la galería para asegurarse de que sea válida
                if ($galleryImages.length > 0) {
                    $galleryImages.each(function(index) {
                        var src = $(this).attr('src');
                        if (src && src.trim() !== '' && !src.includes('placeholder') && !src.includes('woocommerce-placeholder')) {
                            validGalleryImageCount++;
                            validGalleryImages.push($(this));
                        }
                    });
                    
                    hasValidGalleryImages = validGalleryImageCount > 0;
                }
                
                console.log('Producto:', $product.find('.snap-sidebar-cart__related-product-title').text(), 
                           '- Imágenes de galería válidas:', validGalleryImageCount);
                
                // Marcar productos sin galería válida
                if (hasValidGalleryImages) {
                    $product.removeClass('no-gallery');
                } else {
                    $product.addClass('no-gallery');
                }
                
                if (hasValidGalleryImages) {
                    // Solo mostrar imágenes de galería en hover si hay al menos una imagen válida
                    // Configurar hover con transiciones suaves
                    $product.hover(
                        function() {
                            // Mouse enter - mostrar la primera imagen de galería válida
                            if (validGalleryImages.length > 0) {
                                // CSS se encarga de la animación
                            } else {
                                // Si no hay imágenes válidas, mantener la imagen principal visible
                            }
                            
                            // Aplicar un ligero zoom a la imagen
                            $imageContainer.addClass('hover-active');
                        },
                        function() {
                            // Mouse leave - restaurar imagen principal
                            // CSS se encarga de la animación
                            $imageContainer.removeClass('hover-active');
                        }
                    );
                } else {
                    // Si no hay imágenes válidas, solo aplicar el efecto de zoom sin cambiar la imagen
                    // IMPORTANTE: No ocultar la imagen principal
                    $product.hover(
                        function() {
                            // Mantener la imagen principal visible
                            $primaryImage.css('opacity', '1');
                            // Solo aplicar el efecto de zoom
                            $imageContainer.addClass('hover-active');
                        },
                        function() {
                            $imageContainer.removeClass('hover-active');
                        }
                    );
                }
                    
                    // Manejar movimiento del ratón para cambiar entre imágenes
                    // Solo aplicar si hay múltiples imágenes válidas en la galería
                    if ($galleryImages.length > 1) {
                        // Verificar que las imágenes de la galería sean válidas
                        var validGalleryImages = 0;
                        var validGalleryImagesList = [];
                        
                        $galleryImages.each(function(index) {
                            var src = $(this).attr('src');
                            if (src && src.trim() !== '' && !src.includes('placeholder') && !src.includes('woocommerce-placeholder')) {
                                validGalleryImages++;
                                validGalleryImagesList.push(index);
                            }
                        });
                        
                        console.log('Producto:', $product.find('.snap-sidebar-cart__related-product-title').text(), 
                                   '- Imágenes válidas para mousemove:', validGalleryImages);
                        
                        // Solo aplicar el efecto si hay al menos 2 imágenes válidas
                        if (validGalleryImages > 1) {
                            $product.on('mousemove', function(e) {
                                if (!$imageContainer.hasClass('hover-active')) return;
                                
                                // Calcular proporción de la posición horizontal del ratón
                                var offset = $imageContainer.offset();
                                var width = $imageContainer.width();
                                var relativeX = e.pageX - offset.left;
                                var ratio = relativeX / width;
                                
                                // Determinar qué imagen mostrar basado en la posición del ratón
                                var imageCount = validGalleryImages;
                                var imageIndex = Math.min(Math.floor(ratio * imageCount), imageCount - 1);
                                
                                // Verificar que realmente tengamos imágenes válidas
                                if (validGalleryImagesList.length > 0) {
                                    // Usar la lista de índices de imágenes válidas que creamos anteriormente
                                    var segmentIndex = Math.min(Math.floor(ratio * validGalleryImagesList.length), validGalleryImagesList.length - 1);
                                    var targetIndex = validGalleryImagesList[segmentIndex];
                                    
                                    // Solo si el producto no está marcado como sin galería
                                    if (!$product.hasClass('no-gallery')) {
                                        // Ocultar la imagen principal y todas las imágenes de galería
                                        $primaryImage.css('opacity', '0');
                                        $primaryImage.css('transform', 'translateY(-20px)');
                                        $galleryImages.css('opacity', '0');
                                        $galleryImages.css('transform', 'translateY(20px)');
                                        
                                        // Mostrar solo la imagen válida correspondiente
                                        $galleryImages.eq(targetIndex).css('opacity', '1');
                                        $galleryImages.eq(targetIndex).css('transform', 'translateY(0)');
                                    }
                                } else {
                                    // Si no hay imágenes válidas, mantener la imagen principal visible
                                    $primaryImage.css('opacity', '1');
                                    $galleryImages.css('opacity', '0');
                                }
                            });
                        }
                    }
                }
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
                            // Actualizar contenido
                            window.SnapSidebarCartUI.updateCartContent(response.data);
                            
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
                
                // Obtener posición de nuevos productos
                var newProductPosition = snap_sidebar_cart_params.new_product_position || 'top';
                
                // Mostrar preloader
                var $productsContainer = $('.snap-sidebar-cart__products-list');
                var $newItemPlaceholder = $('<li class="snap-sidebar-cart__product placeholder-animation"></li>');
                
                // Insertar placeholder
                if (newProductPosition === 'top') {
                    $productsContainer.prepend($newItemPlaceholder);
                } else {
                    $productsContainer.append($newItemPlaceholder);
                }
                
                // Añadir preloader
                var $preloader = $('<div class="snap-sidebar-cart__product-loader" style="display:block;"><div class="snap-sidebar-cart__loader-spinner preloader-circle"></div></div>');
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
                            // Actualizar contenido
                            window.SnapSidebarCartUI.updateCartContent(response.data);
                            
                            // Animar nuevo producto
                            var $newItem;
                            if (newProductPosition === 'top') {
                                $newItem = $('.snap-sidebar-cart__product:first-child');
                            } else {
                                $newItem = $('.snap-sidebar-cart__product:last-child');
                            }
                            
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

    // Exportar para uso en otros scripts
    window.SnapSidebarCartRelated = RelatedProductsHandler;

})(jQuery);
