/**
 * JavaScript para el funcionamiento del carrito lateral
 */
(function($) {
    'use strict';

    $(document).ready(function() {
        var $body = $('body');
        var $sidebar = $('.snap-sidebar-cart');
        var $overlay = $('.snap-sidebar-cart__overlay');
        var $container = $('.snap-sidebar-cart__products');
        var $productsContainer = $('.snap-sidebar-cart__products-list');
        var addingProduct = false;
        var currentRelatedProductTab = 'related'; // Tab activo por defecto

        // Selector específico para los elementos que activan el carrito lateral
        $body.on('click', snap_sidebar_cart_params.activation_selectors, function(e) {
            e.preventDefault();
            e.stopPropagation();
            openSidebar();
            console.log('Activation selector clicked');
        });
        
        // Abrir cuando se añade un producto al carrito (evento propio de WooCommerce)
        $body.on('added_to_cart', function(event, fragments, cart_hash, $button) {
            // Verificar si la apertura automática está habilitada
            if (snap_sidebar_cart_params.auto_open) {
                openSidebar();
                console.log('Auto-opening sidebar after adding product');
            }
            
            // Si tenemos el producto ID, obtener los productos relacionados
            if ($button && $button.data('product_id')) {
                loadRelatedProducts($button.data('product_id'), currentRelatedProductTab);
            }
        });
        
        // Cerrar el carrito
        $body.on('click', '.snap-sidebar-cart__close', function(e) {
            e.preventDefault();
            e.stopPropagation();
            closeSidebar();
            console.log('Close button clicked');
        });
        
        // Cierre al hacer clic en el overlay
        $body.on('click', '.snap-sidebar-cart__overlay', function(e) {
            e.preventDefault();
            e.stopPropagation();
            closeSidebar();
            console.log('Overlay clicked');
        });
        
        // Cerrar con Escape
        $(document).on('keyup', function(e) {
            if (e.key === 'Escape' && $sidebar.hasClass('open')) {
                closeSidebar();
            }
        });
        
        // Cambiar de pestaña en productos relacionados
        $body.on('click', '.snap-sidebar-cart__related-tab', function(e) {
            e.preventDefault();
            var $tab = $(this);
            var tabType = $tab.data('tab');
            
            if (tabType === currentRelatedProductTab) {
                return; // Ya está activa
            }
            
            // Actualizar UI
            $('.snap-sidebar-cart__related-tab').removeClass('active');
            $tab.addClass('active');
            
            $('.snap-sidebar-cart__related-container').removeClass('active');
            $('.snap-sidebar-cart__related-container[data-content="' + tabType + '"]').addClass('active');
            
            // Actualizar tab activo
            currentRelatedProductTab = tabType;
            
            // Cargar productos si el contenedor está vacío
            var $targetContainer = $('.snap-sidebar-cart__related-container[data-content="' + tabType + '"] .snap-sidebar-cart__slider-track');
            
            if ($targetContainer.children().length === 0) {
                // Obtener el primer producto del carrito para referencia
                var firstProduct = $('.snap-sidebar-cart__product').first();
                if (firstProduct.length) {
                    var productId = firstProduct.find('a').first().attr('href').split('/').filter(Boolean).pop();
                    if (productId) {
                        loadRelatedProducts(productId, tabType);
                    }
                }
            }
        });
        
        // Navegación del slider (botones prev/next)
        $body.on('click', '.snap-sidebar-cart__slider-prev', function() {
            var $track = $(this).siblings('.snap-sidebar-cart__slider-track');
            var scrollAmount = $track.width() * 0.8;
            $track.animate({
                scrollLeft: $track.scrollLeft() - scrollAmount
            }, 300);
        });
        
        $body.on('click', '.snap-sidebar-cart__slider-next', function() {
            var $track = $(this).siblings('.snap-sidebar-cart__slider-track');
            var scrollAmount = $track.width() * 0.8;
            $track.animate({
                scrollLeft: $track.scrollLeft() + scrollAmount
            }, 300);
        });
        
        // Añadir productos relacionados al carrito
        $body.on('click', '.snap-sidebar-cart__add-related-product', function(e) {
            e.preventDefault();
            
            if (addingProduct) {
                return; // Evitar múltiples clics simultáneos
            }
            
            var $button = $(this);
            var productId = $button.data('product-id');
            
            $button.addClass('loading');
            addingProduct = true;
            
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
                    if (response.success) {
                        // Preparar espacio para el nuevo producto con animación
                        if ($productsContainer.length) {
                            var $newItemPlaceholder = $('<li class="snap-sidebar-cart__product placeholder"></li>');
                            $productsContainer.prepend($newItemPlaceholder);
                        }
                        
                        // Actualizar el contenido del carrito
                        updateCartContent(response.data);
                        
                        // Agregar clase para la animación al nuevo producto
                        var $newItem = $('.snap-sidebar-cart__product:first-child');
                        $newItem.addClass('new-item');
                        
                        // Eliminar la clase después de la animación
                        setTimeout(function() {
                            $newItem.removeClass('new-item');
                        }, 600);
                    } else {
                        if (response.data && response.data.message) {
                            alert(response.data.message);
                        } else {
                            alert('Error al añadir el producto al carrito');
                        }
                    }
                },
                error: function() {
                    alert('Error de comunicación con el servidor');
                },
                complete: function() {
                    $button.removeClass('loading');
                    addingProduct = false;
                }
            });
        });
        
        // Incrementar cantidad
        $body.on('click', '.snap-sidebar-cart__quantity-up', function() {
            var $button = $(this);
            var $product = $button.closest('.snap-sidebar-cart__product');
            var $input = $product.find('.snap-sidebar-cart__quantity-input');
            var cartItemKey = $product.data('key');
            var currentVal = parseInt($input.val(), 10);
            var newVal = currentVal + 1;
            
            // Actualizar valor de input
            $input.val(newVal);
            
            // Mostrar loader
            $product.find('.snap-sidebar-cart__product-loader').show();
            
            // Actualizar carrito
            updateCartItemQuantity(cartItemKey, newVal);
        });
        
        // Decrementar cantidad
        $body.on('click', '.snap-sidebar-cart__quantity-down', function() {
            var $button = $(this);
            var $product = $button.closest('.snap-sidebar-cart__product');
            var $input = $product.find('.snap-sidebar-cart__quantity-input');
            var cartItemKey = $product.data('key');
            var currentVal = parseInt($input.val(), 10);
            var newVal = currentVal > 1 ? currentVal - 1 : 0; // Permitir llegar a 0 para eliminar
            
            // Actualizar valor de input
            $input.val(newVal);
            
            // Mostrar loader
            $product.find('.snap-sidebar-cart__product-loader').show();
            
            // Actualizar carrito
            updateCartItemQuantity(cartItemKey, newVal);
        });
        
        // Actualizar cantidad con input manualmente
        $body.on('change', '.snap-sidebar-cart__quantity-input', function() {
            var $input = $(this);
            var $product = $input.closest('.snap-sidebar-cart__product');
            var cartItemKey = $product.data('key');
            var newVal = parseInt($input.val(), 10);
            
            // Validar valor
            if (isNaN(newVal) || newVal < 0) {
                newVal = 0;
                $input.val(newVal);
            }
            
            // Mostrar loader
            $product.find('.snap-sidebar-cart__product-loader').show();
            
            // Actualizar carrito
            updateCartItemQuantity(cartItemKey, newVal);
        });
        
        // Eliminar producto directamente
        $body.on('click', '.snap-sidebar-cart__remove-product', function() {
            var $button = $(this);
            var $product = $button.closest('.snap-sidebar-cart__product');
            var cartItemKey = $product.data('key');
            
            // Mostrar loader
            $product.find('.snap-sidebar-cart__product-loader').show();
            
            // Eliminar producto (cantidad = 0)
            updateCartItemQuantity(cartItemKey, 0);
        });
        
        // Función para abrir el sidebar
        function openSidebar() {
            $sidebar.addClass('open');
            $overlay.css('display', 'block');
            $body.addClass('snap-sidebar-cart-open');
            
            // Cargar productos relacionados si el contenedor activo está vacío
            var $activeContainer = $('.snap-sidebar-cart__related-container.active .snap-sidebar-cart__slider-track');
            if ($activeContainer.length && $activeContainer.children().length === 0) {
                // Obtener el primer producto del carrito para cargar sus relacionados
                var firstProduct = $('.snap-sidebar-cart__product').first();
                if (firstProduct.length) {
                    var productId = firstProduct.find('a').first().attr('href').split('/').filter(Boolean).pop();
                    if (productId) {
                        loadRelatedProducts(productId, currentRelatedProductTab);
                    }
                }
            }
        }
        
        // Función para cerrar el sidebar
        function closeSidebar() {
            $sidebar.removeClass('open');
            $overlay.css('display', 'none');
            $body.removeClass('snap-sidebar-cart-open');
        }
        
        // Función para cargar productos relacionados
        function loadRelatedProducts(productId, type) {
            var $targetContainer = $('.snap-sidebar-cart__related-container[data-content="' + type + '"] .snap-sidebar-cart__slider-track');
            
            if ($targetContainer.length === 0) {
                return;
            }
            
            $targetContainer.html('<div class="snap-sidebar-cart__loading-products">Cargando productos...</div>');
            
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
                    if (response.success && response.data.html) {
                        $targetContainer.html(response.data.html);
                        
                        // Verificar si hay pocos productos para ocultar navegación
                        var childrenCount = $targetContainer.children().length;
                        var containerWidth = $targetContainer.width();
                        var itemWidth = $targetContainer.children().first().outerWidth(true);
                        
                        if (childrenCount * itemWidth <= containerWidth) {
                            $targetContainer.parent().find('.snap-sidebar-cart__slider-nav').hide();
                        } else {
                            $targetContainer.parent().find('.snap-sidebar-cart__slider-nav').show();
                        }
                    } else {
                        $targetContainer.html('<div class="snap-sidebar-cart__no-products">No se encontraron productos.</div>');
                    }
                },
                error: function() {
                    $targetContainer.html('<div class="snap-sidebar-cart__error">Error al cargar productos.</div>');
                }
            });
        }
        
        // Función para actualizar la cantidad de un item en el carrito
        function updateCartItemQuantity(cartItemKey, quantity) {
            $.ajax({
                type: 'POST',
                url: snap_sidebar_cart_params.ajax_url,
                data: {
                    action: 'snap_sidebar_cart_update',
                    nonce: snap_sidebar_cart_params.nonce,
                    cart_item_key: cartItemKey,
                    quantity: quantity
                },
                success: function(response) {
                    if (response.success) {
                        updateCartContent(response.data);
                    } else {
                        if (response.data && response.data.message) {
                            alert(response.data.message);
                        }
                        // Ocultar loader en caso de error
                        $('.snap-sidebar-cart__product-loader').hide();
                    }
                },
                error: function() {
                    alert('Error de comunicación con el servidor');
                    // Ocultar loader en caso de error
                    $('.snap-sidebar-cart__product-loader').hide();
                }
            });
        }
        
        // Función para actualizar el contenido del carrito
        function updateCartContent(data) {
            // Actualizar el HTML del carrito
            $('.snap-sidebar-cart__products').html(data.cart_html);
            
            // Actualizar el contador
            $('.snap-sidebar-cart__count').text(data.cart_count);
            
            // Actualizar los totales
            $('.snap-sidebar-cart__shipping-price').html(data.shipping_total);
            $('.snap-sidebar-cart__subtotal-price').html(data.subtotal);
            
            // Actualizar botones según el estado del carrito
            if (data.cart_count > 0) {
                if ($('.snap-sidebar-cart__buttons').length === 0) {
                    var buttonsHtml = '<div class="snap-sidebar-cart__buttons">' +
                        '<a href="' + wc_cart_fragments_params.cart_url + '" class="snap-sidebar-cart__button snap-sidebar-cart__button--cart">' + 
                        'Ver carrito</a>' +
                        '<a href="' + wc_cart_fragments_params.checkout_url + '" class="snap-sidebar-cart__button snap-sidebar-cart__button--checkout">' + 
                        'Finalizar pedido</a>' +
                        '</div>';
                    $('.snap-sidebar-cart__footer').append(buttonsHtml);
                }
                
                // Si hay productos pero no hay productos relacionados cargados, cargar para el primer producto
                if ($('.snap-sidebar-cart__related-section').length && $('.snap-sidebar-cart__related-container.active .snap-sidebar-cart__slider-track').children().length === 0) {
                    var firstProduct = $('.snap-sidebar-cart__product').first();
                    if (firstProduct.length) {
                        var productId = firstProduct.find('a').first().attr('href').split('/').filter(Boolean).pop();
                        if (productId) {
                            loadRelatedProducts(productId, currentRelatedProductTab);
                        }
                    }
                }
            } else {
                $('.snap-sidebar-cart__buttons').remove();
                
                // Si no hay productos, limpiar los productos relacionados
                $('.snap-sidebar-cart__related-container .snap-sidebar-cart__slider-track').empty();
            }
            
            // Disparar un evento personalizado
            $(document.body).trigger('snap_sidebar_cart_updated');
        }
        
        // Inicializar slider cuando el DOM esté listo
        function initSliders() {
            $('.snap-sidebar-cart__slider-track').each(function() {
                var $track = $(this);
                var childrenCount = $track.children().length;
                var containerWidth = $track.width();
                var itemWidth = $track.children().first().outerWidth(true);
                
                if (childrenCount * itemWidth <= containerWidth) {
                    $track.parent().find('.snap-sidebar-cart__slider-nav').hide();
                } else {
                    $track.parent().find('.snap-sidebar-cart__slider-nav').show();
                }
            });
        }
        
        // Ejecutar después de que el DOM esté listo
        initSliders();
        
        // Ejecutar también cuando cambie el tamaño de la ventana
        $(window).on('resize', function() {
            initSliders();
        });
    });
})(jQuery);
