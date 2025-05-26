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
        console.log('quantity-handler.js cargado');

        // Handler delegado para el botón eliminar dentro del sidebar
        $('#sidebar-cart-container').on('click', '.snap-sidebar-cart__product-remove-top', function() {
            var $button = $(this);
            var cartItemKey = $button.data('key');
            if (!cartItemKey) {
                var $product = $button.closest('.snap-sidebar-cart__product');
                cartItemKey = $product.data('key');
            }
            if (!cartItemKey) {
                console.error('No se pudo obtener la clave del producto para eliminar');
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
                console.error('No se pudo obtener la clave del producto para actualizar cantidad');
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

        // Handler para cambio manual de cantidad (input)
        $('#sidebar-cart-container').on('change', 'input.cart-item__quantity-input', function() {
            var $input = $(this);
            var $quantityWrapper = $input.closest('.quantity.buttoned-input');
            var cartItemKey = $quantityWrapper.data('key') || $input.data('key');
            if (!cartItemKey) {
                var $product = $input.closest('.snap-sidebar-cart__product');
                cartItemKey = $product.data('key');
            }
            var newVal = parseInt($input.val(), 10) || 0;
            if (!cartItemKey) {
                console.error('No se pudo obtener la clave del producto para actualizar cantidad');
                return;
            }
            var $product = $input.closest('.snap-sidebar-cart__product');
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

        // Handler para Enter en el input de cantidad
        $('#sidebar-cart-container').on('keyup', 'input.cart-item__quantity-input', function(e) {
            if (e.key === 'Enter') {
                $(this).trigger('change');
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
                    console.log("Botón de incremento deshabilitado - Stock máximo alcanzado");
                    
                    // Opcionalmente mostrar mensaje de stock máximo
                    var $quantityWrapper = $button.closest('.quantity.buttoned-input');
                    var maxQty = parseInt($quantityWrapper.data('max-qty'), 10);
                    if (!isNaN(maxQty)) {
                        // Mostrar notificación flotante
                        self.showMaxStockNotification($button, maxQty);
                    }
                    
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
                    console.error("Error: No se pudo determinar la clave del producto");
                    return;
                }
                
                // Obtener valor actual
                var currentVal = parseInt($input.val(), 10);
                if (isNaN(currentVal)) currentVal = 0;
                
                // Verificar límite de stock
                var maxQty = parseInt($quantityWrapper.data('max-qty'), 10);
                if (!isNaN(maxQty) && currentVal >= maxQty) {
                    console.log("Stock máximo alcanzado:", maxQty);
                    $button.addClass('disabled').attr('disabled', 'disabled');
                    self.showMaxStockNotification($button, maxQty);
                    return;
                }
                
                var newVal = currentVal + 1;
                
                // Mostrar el preloader ANTES de actualizar
                if ($product.length) {
                    console.log("Mostrando preloader para incremento");
                    self.setupAndShowLoader($product);
                }
                
                // Deshabilitar botón si se alcanza el máximo
                if (!isNaN(maxQty) && newVal >= maxQty) {
                    $button.addClass('disabled').attr('disabled', 'disabled');
                    
                    // Mostrar indicador de último producto disponible
                    if (newVal === maxQty) {
                        console.log("Último producto disponible");
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
                    console.error("Error: No se pudo determinar la clave del producto");
                    return;
                }
                
                var currentVal = parseInt($input.val(), 10);
                if (isNaN(currentVal)) currentVal = 1;
                
                var newVal = currentVal > 1 ? currentVal - 1 : 0; // Permitir llegar a 0 para eliminar
                
                // Mostrar preloader inmediatamente en cualquier caso
                if ($product.length) {
                    console.log("Mostrando preloader para decremento");
                    self.setupAndShowLoader($product);
                }
                
                // Si se va a eliminar (cantidad 0), mostrar animación especial
                if (newVal === 0) {
                    console.log("Eliminando producto del carrito (cantidad 0)");
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
            
            // Cambio manual de cantidad (input)
            $(document).on('change', '.cart-item__quantity-input', function() {
                var $input = $(this);
                var $product = $input.closest('.snap-sidebar-cart__product');
                var cartItemKey = $product.data('key') || $input.data('key');
                var $quantityWrapper = $input.closest('.quantity.buttoned-input');
                var maxQty = parseInt($quantityWrapper.data('max-qty'), 10);
                
                // Verificar si tenemos una clave válida de producto
                if (!cartItemKey) {
                    console.error("Error: No se pudo determinar la clave del producto");
                    return;
                }
                
                var oldVal = parseInt($input.data('initial-value'), 10) || 0;
                var newVal = parseInt($input.val(), 10);
                
                // Validar valor
                if (isNaN(newVal) || newVal < 0) {
                    newVal = 0;
                }
                
                // Limitar al stock máximo si está definido
                if (!isNaN(maxQty) && newVal > maxQty) {
                    newVal = maxQty;
                }
                
                // Mostrar preloader inmediatamente para todos los cambios de cantidad
                if ($product.length) {
                    console.log("Mostrando preloader para cambio manual de cantidad");
                    self.setupAndShowLoader($product);
                }
                
                // Actualizar valor visual
                $input.val(newVal);
                
                // Actualizar estado del botón de incremento
                var $increaseBtn = $quantityWrapper.find('.notabutton.quantity-up');
                if (!isNaN(maxQty)) {
                    if (newVal >= maxQty) {
                        $increaseBtn.addClass('disabled').attr('disabled', 'disabled');
                    } else {
                        $increaseBtn.removeClass('disabled').removeAttr('disabled');
                    }
                }
                
                // Si se va a eliminar (cantidad 0), agregar clase adicional
                if (newVal === 0) {
                    $product.addClass('removing');
                }
                
                // Enviar actualización al servidor
                self.updateCartItemQuantity(cartItemKey, newVal, oldVal);
                
                // Actualizar el valor inicial para la próxima vez
                $input.data('initial-value', newVal);
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
                console.error("Error: Clave de producto no válida para actualizar cantidad");
                $('.snap-sidebar-cart__product-loader').hide();
                return;
            }
            
            console.log("Actualizando cantidad - Clave:", cartItemKey, "De:", oldQuantity, "A:", quantity);
            
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
            
            console.log("Mostrando preloader para producto: ", $product.data('key'));
            
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
            console.log("Verificando límites de stock");
            
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
            console.log('Botón eliminar del carrito lateral presionado');
            var $button = jQuery(this);
            var cartItemKey = $button.data('key');
            if (!cartItemKey) {
                console.error('Error: No se pudo encontrar la clave del producto');
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
        if ($productsContainer.length === 0) {
            // Si no existe, crearlo y añadirlo al body del sidebar
            var $body = $('#sidebar-cart-container .snap-sidebar-cart__body');
            if ($body.length) {
                $productsContainer = $('<div class="snap-sidebar-cart__products"></div>');
                $body.prepend($productsContainer);
            }
        }
        if ($productsContainer.length) {
            $productsContainer.empty(); // Limpiar antes de insertar
            $productsContainer.html(cartHtml);
        }
        // Mostrar/ocultar el footer según si el carrito está vacío
        if (typeof cartCount !== 'undefined' && cartCount > 0) {
            $('.snap-sidebar-cart__footer').show();
            $('.snap-sidebar-cart__related-section').show();
            $('.snap-sidebar-cart').removeClass('cart-is-empty');
        } else {
            $('.snap-sidebar-cart__footer').hide();
            $('.snap-sidebar-cart__related-section').hide();
            $('.snap-sidebar-cart').addClass('cart-is-empty');
        }
    }

})(jQuery);
