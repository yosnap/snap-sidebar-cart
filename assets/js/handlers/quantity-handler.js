/**
 * Maneja la funcionalidad de cantidades de productos en el carrito
 *
 * Cambios recientes:
 * - Obtención robusta de la clave hash de WooCommerce para cada producto.
 * - Actualización dinámica de totales y subtotal tras cada cambio.
 * - Handlers delegados y compatibles con recarga dinámica del HTML del carrito.
 * - Corrección de errores al eliminar o actualizar productos.
 *
 * Este archivo se encarga de:
 * - Incrementar/decrementar cantidades de productos
 * - Controlar límites de stock
 * - Eliminar productos cuando la cantidad llega a 0
 * - Mostrar preloaders durante las actualizaciones
 * - Gestionar animaciones de actualización de cantidad
 */
(function ($) {
    'use strict';

    jQuery(document).ready(function($) {
        // Handler delegado para el botón eliminar dentro del sidebar
        $('#sidebar-cart-container').on('click', '.snap-sidebar-cart__product-remove-top', function() {
            var $button = $(this);
            var cartItemKey = $button.data('key');
            if (!cartItemKey) {
                var $product = $button.closest('.snap-sidebar-cart__product');
                cartItemKey = $product.data('key');
            }
            if (!cartItemKey) {
                return;
            }
            var $product = $button.closest('.snap-sidebar-cart__product');
            $product.addClass('removing');
            $.ajax({
                type: 'POST',
                url: snap_sidebar_cart_params.ajax_url,
                data: {
                    action: 'snap_sidebar_cart_remove',
                    nonce: snap_sidebar_cart_params.nonce,
                    cart_item_key: cartItemKey
                },
                success: function(response) {
                    if (response.success && response.data.cart_html) {
                        actualizarSidebarCartHTML(response.data.cart_html, response.data.cart_count);
                        // Actualizar totales
                        if (typeof response.data.cart_count !== 'undefined') {
                            $('.snap-sidebar-cart__count').text(response.data.cart_count);
                        }
                        if (typeof response.data.subtotal !== 'undefined') {
                            $('.snap-sidebar-cart__subtotal-price').html(response.data.subtotal);
                        }
                        if (typeof response.data.shipping_total !== 'undefined') {
                            $('.snap-sidebar-cart__shipping-price').html(response.data.shipping_total);
                        }
                        refreshWooFragments();
                        ajaxRefreshCartPage();
                    } else {
                        alert(response.data?.message || 'Error al eliminar el producto');
                    }
                },
                error: function() {
                    alert('Error de comunicación con el servidor');
                },
                complete: function() {
                    $product.removeClass('removing');
                }
            });
        });

        // Handler delegado para los botones de cantidad dentro del sidebar
        $('#sidebar-cart-container').on('click', '.notabutton.quantity-up, .notabutton.quantity-down', function() {
            var $button = $(this);
            var $quantityWrapper = $button.closest('.quantity.buttoned-input');
            var $input = $quantityWrapper.find('input.cart-item__quantity-input');
            var cartItemKey = $quantityWrapper.data('key') || $input.data('key');
            if (!cartItemKey) {
                var $product = $button.closest('.snap-sidebar-cart__product');
                cartItemKey = $product.data('key');
            }
            var currentVal = parseInt($input.val(), 10) || 0;
            var newVal = currentVal;
            if ($button.hasClass('quantity-up')) {
                newVal = currentVal + 1;
            } else if ($button.hasClass('quantity-down')) {
                newVal = Math.max(currentVal - 1, 0);
            }
            if (!cartItemKey) {
                return;
            }
            var $product = $button.closest('.snap-sidebar-cart__product');
            $product.addClass('updating');
            $.ajax({
                type: 'POST',
                url: snap_sidebar_cart_params.ajax_url,
                data: {
                    action: 'snap_sidebar_cart_update',
                    nonce: snap_sidebar_cart_params.nonce,
                    cart_item_key: cartItemKey,
                    quantity: newVal
                },
                success: function(response) {
                    if (response.success && response.data.cart_html) {
                        actualizarSidebarCartHTML(response.data.cart_html, response.data.cart_count);
                        // Actualizar totales
                        if (typeof response.data.cart_count !== 'undefined') {
                            $('.snap-sidebar-cart__count').text(response.data.cart_count);
                        }
                        if (typeof response.data.subtotal !== 'undefined') {
                            $('.snap-sidebar-cart__subtotal-price').html(response.data.subtotal);
                        }
                        if (typeof response.data.shipping_total !== 'undefined') {
                            $('.snap-sidebar-cart__shipping-price').html(response.data.shipping_total);
                        }
                        refreshWooFragments();
                        ajaxRefreshCartPage();
                    } else {
                        alert(response.data?.message || 'Error al actualizar la cantidad');
                    }
                },
                error: function() {
                    alert('Error de comunicación con el servidor');
                },
                complete: function() {
                    $product.removeClass('updating');
                }
            });
        });

        // Debounce para evitar múltiples peticiones rápidas al escribir en el input de cantidad
        let quantityInputTimeout = null;

        $('#sidebar-cart-container').on('input', 'input.cart-item__quantity-input', function() {
            var $input = $(this);
            var $quantityWrapper = $input.closest('.quantity.buttoned-input');
            var cartItemKey = $quantityWrapper.data('key') || $input.data('key');
            if (!cartItemKey) {
                var $product = $input.closest('.snap-sidebar-cart__product');
                cartItemKey = $product.data('key');
            }
            var newVal = parseInt($input.val(), 10) || 0;
            if (!cartItemKey) {
                return;
            }
            var $product = $input.closest('.snap-sidebar-cart__product');
            $product.addClass('updating');

            // Limpiar timeout anterior
            if (quantityInputTimeout) clearTimeout(quantityInputTimeout);

            // Esperar 500ms tras el último cambio antes de enviar AJAX
            quantityInputTimeout = setTimeout(function() {
                $.ajax({
                    type: 'POST',
                    url: snap_sidebar_cart_params.ajax_url,
                    data: {
                        action: 'snap_sidebar_cart_update',
                        nonce: snap_sidebar_cart_params.nonce,
                        cart_item_key: cartItemKey,
                        quantity: newVal
                    },
                    success: function(response) {
                        if (response.success && response.data.cart_html) {
                            actualizarSidebarCartHTML(response.data.cart_html, response.data.cart_count);
                            refreshWooFragments();
                            ajaxRefreshCartPage();
                        } else {
                            alert(response.data?.message || 'Error al actualizar la cantidad');
                        }
                    },
                    error: function() {
                        alert('Error de comunicación con el servidor');
                    },
                    complete: function() {
                        $product.removeClass('updating');
                    }
                });
            }, 500);
        });

        // Handler para Enter en el input de cantidad
        $('#sidebar-cart-container').off('keyup', 'input.cart-item__quantity-input');
        $('#sidebar-cart-container').on('keydown', 'input.cart-item__quantity-input', function(e) {
            if (e.key === 'Enter') {
                var $input = $(this);
                var $quantityWrapper = $input.closest('.quantity.buttoned-input');
                var cartItemKey = $quantityWrapper.data('key') || $input.data('key');
                if (!cartItemKey) {
                    var $product = $input.closest('.snap-sidebar-cart__product');
                    cartItemKey = $product.data('key');
                }
                var newVal = parseInt($input.val(), 10) || 0;
                if (!cartItemKey) {
                    return;
                }
                var $product = $input.closest('.snap-sidebar-cart__product');
                $product.addClass('updating');

                // Limpiar el debounce pendiente para evitar doble petición
                if (quantityInputTimeout) clearTimeout(quantityInputTimeout);

                // Enviar AJAX inmediatamente
                $.ajax({
                    type: 'POST',
                    url: snap_sidebar_cart_params.ajax_url,
                    data: {
                        action: 'snap_sidebar_cart_update',
                        nonce: snap_sidebar_cart_params.nonce,
                        cart_item_key: cartItemKey,
                        quantity: newVal
                    },
                    success: function(response) {
                        if (response.success && response.data.cart_html) {
                            actualizarSidebarCartHTML(response.data.cart_html, response.data.cart_count);
                            refreshWooFragments();
                            ajaxRefreshCartPage();
                        } else {
                            alert(response.data?.message || 'Error al actualizar la cantidad');
                        }
                    },
                    error: function() {
                        alert('Error de comunicación con el servidor');
                    },
                    complete: function() {
                        $product.removeClass('updating');
                    }
                });
                e.preventDefault();
                return false;
            }
        });
    });

    /**
     * Controlador de cantidades de productos
     * 
     * @class QuantityHandler
     */
    var QuantityHandler = {
        animationDuration: 300,
        quantityUpdateDelay: 200,
        highlightBgColor: 'rgba(241, 196, 15, 0.3)',
        
        /**
         * Inicialización y vinculación de eventos
         */
        init: function() {
            // Leer duración de animaciones desde los parámetros si están disponibles
            if (window.snap_sidebar_cart_params) {
                if (window.snap_sidebar_cart_params.animations) {
                    this.animationDuration = parseInt(window.snap_sidebar_cart_params.animations.duration, 10) || 300;
                    this.quantityUpdateDelay = parseInt(window.snap_sidebar_cart_params.animations.quantity_update_delay, 10) || 200;
                }
                
                // Obtener color destacado para animaciones si está disponible
                if (window.snap_sidebar_cart_params.styles && window.snap_sidebar_cart_params.styles.highlight_color) {
                    this.highlightBgColor = 'rgba(' + this.hexToRgb(window.snap_sidebar_cart_params.styles.highlight_color) + ', 0.3)';
                }
            }
            
            this.bindEvents();
        },
        
        /**
         * Convierte un color hexadecimal a formato RGB
         * @param {string} hex - Color en formato hexadecimal
         * @return {string} - Formato RGB como "r,g,b"
         */
        hexToRgb: function(hex) {
            // Eliminar # si está presente
            hex = hex.replace('#', '');
            
            // Convertir hex abreviado a la forma completa
            if (hex.length === 3) {
                hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
            }
            
            // Convertir a valores RGB
            var r = parseInt(hex.substring(0, 2), 16);
            var g = parseInt(hex.substring(2, 4), 16);
            var b = parseInt(hex.substring(4, 6), 16);
            
            return r + ',' + g + ',' + b;
        },

        /**
         * Vincula los eventos relacionados con cantidades
         */
        bindEvents: function() {
            var self = this;
            
            // Incrementar cantidad (botón +)
            $(document).on('click', '.notabutton.quantity-up', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                var $button = $(this);
                
                // Verificar si el botón está deshabilitado
                if ($button.hasClass('disabled') || $button.attr('disabled')) {
                    return;
                }
                
                // Encontrar elementos necesarios
                var $quantityWrapper = $button.closest('.quantity.buttoned-input');
                var $input = $quantityWrapper.find('input.cart-item__quantity-input');
                var cartItemKey = $quantityWrapper.data('key') || $input.data('key');
                var $product = $button.closest('.snap-sidebar-cart__product');
                
                if (!cartItemKey && $product.length) {
                    cartItemKey = $product.data('key');
                }
                
                // Verificar si tenemos una clave válida
                if (!cartItemKey) {
                    return;
                }
                
                // Obtener valor actual
                var currentVal = parseInt($input.val(), 10);
                if (isNaN(currentVal)) currentVal = 0;
                
                // Verificar límite de stock
                var maxQty = parseInt($quantityWrapper.data('max-qty'), 10);
                if (!isNaN(maxQty) && currentVal >= maxQty) {
                    $button.addClass('disabled').attr('disabled', 'disabled');
                    self.showMaxStockNotification($button, maxQty);
                    return;
                }
                
                var newVal = currentVal + 1;
                
                // Mostrar el preloader ANTES de actualizar
                if ($product.length) {
                    self.setupAndShowLoader($product);
                }
                
                // Deshabilitar botón si se alcanza el máximo
                if (!isNaN(maxQty) && newVal >= maxQty) {
                    $button.addClass('disabled').attr('disabled', 'disabled');
                    
                    // Mostrar indicador de último producto disponible
                    if (newVal === maxQty) {
                        $quantityWrapper.addClass('last-available');
                        setTimeout(function() {
                            $quantityWrapper.removeClass('last-available');
                        }, 3000);
                    }
                }
                
                // Actualizar valor visualmente
                $input.val(newVal);
                
                // Enviar actualización al servidor
                self.updateCartItemQuantity(cartItemKey, newVal, currentVal);
            });
            
            // Decrementar cantidad (botón -)
            $(document).on('click', '.notabutton.quantity-down', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                var $button = $(this);
                var $quantityWrapper = $button.closest('.quantity.buttoned-input');
                var $input = $quantityWrapper.find('input.cart-item__quantity-input');
                var cartItemKey = $quantityWrapper.data('key') || $input.data('key');
                var $product = $button.closest('.snap-sidebar-cart__product');
                
                if (!cartItemKey && $product.length) {
                    cartItemKey = $product.data('key');
                }
                
                // Verificar si tenemos una clave válida
                if (!cartItemKey) {
                    return;
                }
                
                var currentVal = parseInt($input.val(), 10);
                if (isNaN(currentVal)) currentVal = 1;
                
                var newVal = currentVal > 1 ? currentVal - 1 : 0; // Permitir llegar a 0 para eliminar
                
                // Mostrar preloader inmediatamente en cualquier caso
                if ($product.length) {
                    self.setupAndShowLoader($product);
                }
                
                // Si se va a eliminar (cantidad 0), mostrar animación especial
                if (newVal === 0) {
                    $product.addClass('removing');
                }
                
                // Habilitar botón de incremento si estaba deshabilitado
                var $increaseBtn = $quantityWrapper.find('.notabutton.quantity-up');
                if ($increaseBtn.hasClass('disabled') || $increaseBtn.attr('disabled')) {
                    $increaseBtn.removeClass('disabled').removeAttr('disabled');
                }
                
                // Actualizar valor visualmente
                $input.val(newVal);
                
                // Enviar actualización al servidor
                self.updateCartItemQuantity(cartItemKey, newVal, currentVal);
            });
            
            // Verificar límites de stock cuando se actualiza el carrito
            $(document.body).on('snap_sidebar_cart_updated', function() {
                self.checkStockLimits();
            });
        },
        
        /**
         * Actualiza la cantidad de un producto en el carrito
         * 
         * @param {string} cartItemKey - Clave del producto en el carrito
         * @param {number} quantity - Nueva cantidad
         * @param {number} oldQuantity - Cantidad anterior
         */
        updateCartItemQuantity: function(cartItemKey, quantity, oldQuantity) {
            var self = this;
            
            if (!cartItemKey) {
                $('.snap-sidebar-cart__product-loader').hide();
                return;
            }
            
            // Determinar si es actualización o eliminación
            var isQuantityUpdate = quantity > 0 && oldQuantity > 0;
            var $product = $('[data-key="' + cartItemKey + '"]');
            
            // Para cualquier operación con botones +/-, mostrar el preloader inmediatamente
            if ($product.length) {
                // Mostrar preloader para indicar que se está procesando la actualización
                self.setupAndShowLoader($product);
                
                if (isQuantityUpdate) {
                    // Obtener el contenedor de cantidad y el input 
                    var $quantityDisplay = $product.find('.cart-item__quantity-input');
                    var $quantityContainer = $product.find('.quantity.buttoned-input');
                    
                    // Guardar referencias para uso posterior
                    $product.data('quantity-display', $quantityDisplay);
                    $product.data('quantity-container', $quantityContainer);
                    $product.data('old-quantity', oldQuantity);
                    $product.data('new-quantity', quantity);
                }
            }
            
            // Enviar actualización mediante AJAX
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
                        // Si es una actualización (no eliminación), guardar los datos para la animación posterior
                        var animationData = null;
                        
                        if (isQuantityUpdate) {
                            // Guardar datos antes de actualizar el HTML
                            animationData = {
                                productId: $product.data('product-id'),
                                oldQuantity: oldQuantity,
                                newQuantity: quantity
                            };
                        }
                        
                        // Actualizar contenido del carrito
                        if (window.SnapSidebarCartUI) {
                            // Animación de cantidad si aplica
                            if (animationData && animationData.productId) {
                                window.SnapSidebarCartUI.highlightExistingProductQuantity(
                                    animationData.productId, 
                                    animationData.oldQuantity
                                );
                            }
                        } else {
                            // Fallback si no está disponible el módulo UI
                        }
                        refreshWooFragments();
                        ajaxRefreshCartPage();
                    } else {
                        if (response.data && response.data.message) {
                            alert(response.data.message);
                        }
                        $('.snap-sidebar-cart__product-loader').hide();
                    }
                },
                error: function() {
                    alert('Error de comunicación con el servidor');
                    $('.snap-sidebar-cart__product-loader').hide();
                }
            });
        },
        
        /**
         * Configura y muestra el preloader en un producto
         * 
         * @param {jQuery} $product - Elemento del producto
         */
        setupAndShowLoader: function($product) {
            if (!$product || !$product.length) return;
            
            // Obtener configuración del preloader
            var preloaderType = 'circle';
            var preloaderPosition = 'center';
            
            if (window.snap_sidebar_cart_params && window.snap_sidebar_cart_params.preloader) {
                preloaderType = window.snap_sidebar_cart_params.preloader.type || 'circle';
                preloaderPosition = window.snap_sidebar_cart_params.preloader.position || 'center';
            }
            
            // Forzar reconstrucción completa del preloader para asegurar que funciona
            var $productLoader = $product.find('.snap-sidebar-cart__product-loader');
            
            // Si no existe el elemento loader, lo creamos
            if ($productLoader.length === 0) {
                $productLoader = $('<div class="snap-sidebar-cart__product-loader"><div class="snap-sidebar-cart__loader-spinner"></div></div>');
                $product.append($productLoader);
            }
            
            // Limpiar y reinicializar el loader
            var $spinner = $productLoader.find('.snap-sidebar-cart__loader-spinner');
            $spinner.attr('class', 'snap-sidebar-cart__loader-spinner');
            $spinner.addClass('preloader-' + preloaderType);
            $spinner.addClass('preloader-position-' + preloaderPosition);
            
            // Contenido según tipo
            if (preloaderType === 'dots') {
                $spinner.html('<span></span><span></span><span></span>');
            } else {
                $spinner.html('');
            }
            
            // Asegurarnos de que los estilos sean correctos
            $productLoader.css({
                'position': 'absolute',
                'top': '0',
                'left': '0',
                'width': '100%',
                'height': '100%',
                'display': 'flex',
                'justify-content': 'center',
                'align-items': 'center',
                'background-color': 'rgba(255, 255, 255, 0.8)',
                'z-index': '9999'
            });
            
            $spinner.css({
                'width': '40px',
                'height': '40px',
                'position': 'relative',
                'z-index': '10000'
            });
            
            // Estilos específicos según el tipo de preloader
            if (preloaderType === 'circle') {
                $spinner.css({
                    'border': '3px solid rgba(0, 0, 0, 0.1)',
                    'border-top': '3px solid #2c6aa0',
                    'border-radius': '50%',
                    'animation': 'spin 1s linear infinite'
                });
            }
            
            // Deshabilitar inputs y botones durante la carga
            var $quantityInput = $product.find('.cart-item__quantity-input');
            var $buttons = $product.find('.notabutton');
            
            // Guardar estado original para restaurar después
            $buttons.each(function() {
                var $btn = $(this);
                $btn.data('original-disabled', $btn.prop('disabled'));
                $btn.prop('disabled', true).addClass('temp-disabled');
            });
            
            if ($quantityInput.length) {
                $quantityInput.data('original-disabled', $quantityInput.prop('disabled'));
                $quantityInput.prop('disabled', true);
            }
            
            // Mostrar el loader con fuerza
            $productLoader.show();
        },
        
        /**
         * Verifica los límites de stock y actualiza el estado de los botones
         */
        checkStockLimits: function() {
            $('.quantity.buttoned-input').each(function() {
                var $wrapper = $(this);
                var maxQty = parseInt($wrapper.data('max-qty'), 10);
                
                // Solo si hay un máximo definido
                if (!isNaN(maxQty) && maxQty > 0) {
                    var $input = $wrapper.find('input.cart-item__quantity-input');
                    var currentVal = parseInt($input.val(), 10);
                    var $increaseBtn = $wrapper.find('.notabutton.quantity-up');
                    
                    // Si la cantidad actual ha alcanzado o superado el máximo
                    if (currentVal >= maxQty) {
                        // Deshabilitar el botón de incremento
                        $increaseBtn.addClass('disabled').attr('disabled', 'disabled');
                    } else {
                        // Habilitar el botón de incremento
                        $increaseBtn.removeClass('disabled').removeAttr('disabled');
                    }
                }
            });
        },
        
        /**
         * Muestra una notificación flotante de stock máximo alcanzado
         *
         * @param {jQuery} $button - El botón que fue pulsado
         * @param {number} maxQty - La cantidad máxima disponible
         */
        showMaxStockNotification: function($button, maxQty) {
            // Eliminar notificaciones previas
            $('.snap-sidebar-cart__stock-notification').remove();
            
            // Crear la notificación
            var $notification = $('<div class="snap-sidebar-cart__stock-notification">' +
                                 'Stock máximo: ' + maxQty + ' unidades' +
                                 '</div>');
            
            // Añadir a la página
            $('body').append($notification);
            
            // Posicionar cerca del botón
            var buttonPos = $button.offset();
            var left = buttonPos.left;
            var top = buttonPos.top - $notification.outerHeight() - 10;
            
            // Ajustar posición para que quede visible en pantalla
            var windowWidth = $(window).width();
            if (left + $notification.outerWidth() > windowWidth) {
                left = windowWidth - $notification.outerWidth() - 10;
            }
            
            $notification.css({
                left: left + 'px',
                top: top + 'px'
            });
            
            // Mostrar con animación
            $notification.addClass('show');
            
            // Ocultar después de un tiempo
            setTimeout(function() {
                $notification.removeClass('show');
                setTimeout(function() {
                    $notification.remove();
                }, 300);
            }, 2500);
        }
    };

    // Inicializar cuando el DOM esté listo
    $(document).ready(function() {
        QuantityHandler.init();
    });

    // Exportar para uso en otros scripts
    window.SnapSidebarCartQuantity = QuantityHandler;

    // Re-inicializar handlers de cantidad y eliminar tras cada cambio en el carrito
    function reinicializarHandlersSnapSidebarCart() {
        // Eliminar handlers previos para evitar duplicados
        jQuery(document).off('click', '.notabutton.quantity-up');
        jQuery(document).off('click', '.notabutton.quantity-down');
        jQuery(document).off('click', '.snap-sidebar-cart__product-remove-top');

        // Volver a enganchar los handlers de cantidad
        if (window.SnapSidebarCartQuantity && typeof window.SnapSidebarCartQuantity.init === 'function') {
            window.SnapSidebarCartQuantity.init();
        }

        // Handler para eliminar producto (por si no está en el handler de cantidad)
        jQuery(document).on('click', '.snap-sidebar-cart__product-remove-top', function(e) {
            e.preventDefault();
            e.stopPropagation();
            // Log para depuración
            var $button = jQuery(this);
            var cartItemKey = $button.data('key');
            if (!cartItemKey) {
                return;
            }
            var $product = $button.closest('.snap-sidebar-cart__product');
            // Animación y preloader
            if ($product.length) {
                $product.addClass('removing');
                var $loader = $product.find('.snap-sidebar-cart__product-loader');
                if ($loader.length) {
                    $loader.css('display', 'flex');
                    var $spinner = $loader.find('.snap-sidebar-cart__loader-spinner');
                    if (window.snap_sidebar_cart_params && window.snap_sidebar_cart_params.preloader) {
                        var preloaderType = window.snap_sidebar_cart_params.preloader.type || 'circle';
                        var preloaderPosition = window.snap_sidebar_cart_params.preloader.position || 'center';
                        $spinner.attr('class', 'snap-sidebar-cart__loader-spinner');
                        $spinner.addClass('preloader-' + preloaderType);
                        $spinner.addClass('preloader-position-' + preloaderPosition);
                        if (preloaderType === 'dots') {
                            $spinner.html('<span></span><span></span><span></span>');
                        } else {
                            $spinner.html('');
                        }
                    }
                }
            }
            // AJAX para eliminar producto
            jQuery.ajax({
                type: 'POST',
                url: snap_sidebar_cart_params.ajax_url,
                data: {
                    action: 'snap_sidebar_cart_remove',
                    nonce: snap_sidebar_cart_params.nonce,
                    cart_item_key: cartItemKey
                },
                success: function(response) {
                    if (response.success) {
                        if (response.data.cart_html) {
                            jQuery('.snap-sidebar-cart__products').html(response.data.cart_html);
                        }
                        if (response.data.subtotal) {
                            jQuery('.snap-sidebar-cart__subtotal-price').html(response.data.subtotal);
                        }
                        if (response.data.shipping_total) {
                            jQuery('.snap-sidebar-cart__shipping-price').html(response.data.shipping_total);
                        }
                        var cartCount = parseInt(jQuery('.snap-sidebar-cart__count').text()) || 0;
                        if (cartCount === 0) {
                            jQuery('.snap-sidebar-cart__footer').hide();
                            var $relatedSection = jQuery('.snap-sidebar-cart__related-section');
                            $relatedSection.hide();
                            $relatedSection.css('display', 'none');
                            $relatedSection.attr('style', 'display: none !important');
                            jQuery('.snap-sidebar-cart').addClass('cart-is-empty');
                            jQuery('.snap-sidebar-cart__related-container .snap-sidebar-cart__slider-track').empty();
                            jQuery(document.body).trigger('snap_sidebar_cart_empty');
                        }
                        jQuery(document.body).trigger('snap_sidebar_cart_updated');
                    } else {
                        if (response.data && response.data.message) {
                            alert(response.data.message);
                        } else {
                            alert('Error al eliminar el producto del carrito');
                        }
                        if ($product.length) {
                            $product.removeClass('removing');
                            if ($loader.length) {
                                $loader.hide();
                            }
                        }
                    }
                },
                error: function(xhr, status, error) {
                    alert('Error de comunicación con el servidor');
                    if ($product.length) {
                        $product.removeClass('removing');
                        if ($loader.length) {
                            $loader.hide();
                        }
                    }
                }
            });
        });
    }

    // Llama a la función tras cada cambio en el carrito
    jQuery(document.body).on('snap_sidebar_cart_updated added_to_cart wc_fragments_refreshed', function() {
        reinicializarHandlersSnapSidebarCart();
    });

    // Llama también al cargar la página
    jQuery(document).ready(function() {
        reinicializarHandlersSnapSidebarCart();
    });

    // Observador robusto para detectar cambios en el contenedor de productos del carrito incluso si el nodo se reemplaza
    (function() {
        var observer = null;
        function observeCartProducts() {
            var cartProductsContainer = document.querySelector('.snap-sidebar-cart__products');
            if (!cartProductsContainer) return;
            if (observer) observer.disconnect();
            observer = new MutationObserver(function(mutationsList, observerInstance) {
                if (window.SnapSidebarCartQuantity && typeof window.SnapSidebarCartQuantity.init === 'function') {
                    window.SnapSidebarCartQuantity.init();
                }
            });
            observer.observe(cartProductsContainer, { childList: true, subtree: true });
        }
        // Observar el contenedor padre para detectar si .snap-sidebar-cart__products es reemplazado
        var parent = document.querySelector('.snap-sidebar-cart__body');
        if (parent) {
            var parentObserver = new MutationObserver(function(mutationsList, parentObs) {
                // Cada vez que aparece un nuevo contenedor de productos, reenganchar el observer
                observeCartProducts();
            });
            parentObserver.observe(parent, { childList: true, subtree: true });
        }
        // Enganchar al cargar por primera vez
        observeCartProducts();
    })();

    function actualizarSidebarCartHTML(cartHtml, cartCount) {
        var $productsContainer = $('.snap-sidebar-cart__products');
        if ($productsContainer.length) {
            $productsContainer.empty();
            $productsContainer.html(cartHtml);
        }
        // Actualizar el contador de productos
        if (typeof cartCount !== 'undefined') {
            $('.snap-sidebar-cart__count').text(cartCount);
        }
        // Extraer y reemplazar el subtotal desde el HTML recibido
        var tempDiv = document.createElement('div');
        tempDiv.innerHTML = cartHtml;
        var newSubtotal = tempDiv.querySelector('.snap-sidebar-cart__subtotal-price');
        if (newSubtotal) {
            document.querySelectorAll('.snap-sidebar-cart__subtotal-price').forEach(function(el) {
                el.innerHTML = newSubtotal.innerHTML;
            });
        }
    }
    window.actualizarSidebarCartHTML = actualizarSidebarCartHTML;

    // Función global para refrescar los fragmentos de WooCommerce (contador, mini-cart, etc.)
    function refreshWooFragments() {
        if (typeof wc_cart_fragments_params !== 'undefined') {
            jQuery.ajax({
                url: wc_cart_fragments_params.wc_ajax_url.toString().replace('%%endpoint%%', 'get_refreshed_fragments'),
                type: 'POST',
                success: function(data) {
                    if (data && data.fragments) {
                        jQuery.each(data.fragments, function(key, value) {
                            jQuery(key).replaceWith(value);
                        });
                        if (typeof sessionStorage !== 'undefined') {
                            sessionStorage.setItem(wc_cart_fragments_params.fragment_name, JSON.stringify(data.fragments));
                            sessionStorage.setItem('wc_cart_hash', data.cart_hash);
                        }
                        jQuery(document.body).trigger('wc_fragments_refreshed');
                        ajaxRefreshCartPage();
                    }
                }
            });
        }
    }
    window.refreshWooFragments = refreshWooFragments;

    // Función para refrescar la página del carrito vía AJAX si está presente
    function ajaxRefreshCartPage() {
        if (jQuery('.woocommerce-cart-form').length > 0) {
            jQuery.ajax({
                url: window.location.href,
                type: 'GET',
                dataType: 'html',
                success: function(response) {
                    var $html = jQuery('<div>').html(response);
                    var $newTable = $html.find('.shop_table.cart');
                    var $newTotals = $html.find('.cart_totals');
                    if ($newTable.length && $newTotals.length) {
                        jQuery('.shop_table.cart').replaceWith($newTable);
                        jQuery('.cart_totals').replaceWith($newTotals);
                    }
                }
            });
        }
    }
    window.ajaxRefreshCartPage = ajaxRefreshCartPage;

})(jQuery);
