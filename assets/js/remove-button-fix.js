/**
 * Solución específica para el botón eliminar del carrito lateral
 * Este script implementa un manejador de eventos altamente prioritario
 * para garantizar que el botón de eliminar funcione correctamente
 */
(function($) {
    "use strict";
    
    // Flags para seguimiento de eventos
    var removeButtonClickCount = 0;
    var removeButtonDebugMode = true;

    function debugLog(message) {
        if (removeButtonDebugMode) {
            console.log('%c[REMOVE BUTTON DEBUG] ' + message, 'background: #ffeeba; color: #856404; padding: 2px 5px;');
        }
    }

    // Función para eliminar un producto del carrito
    function removeCartItem(cartItemKey, $product) {
        if (!cartItemKey) {
            debugLog("Error: No cartItemKey provided");
            return;
        }
        
        debugLog("Removing item with key: " + cartItemKey);
        
        // Mostrar claramente que se está procesando
        $product.css('opacity', '0.5').addClass('removing');
        var $loader = $product.find('.snap-sidebar-cart__product-loader');
        $loader.show();
        
        // Enviar petición AJAX para eliminar el producto
        $.ajax({
            type: 'POST',
            url: snap_sidebar_cart_params.ajax_url,
            data: {
                action: 'snap_sidebar_cart_remove',
                nonce: snap_sidebar_cart_params.nonce,
                cart_item_key: cartItemKey
            },
            success: function(response) {
                debugLog("AJAX success: " + (response.success ? "true" : "false"));
                
                if (response.success) {
                    // Actualizar el contenido del carrito completo
                    $('.snap-sidebar-cart__products').html(response.data.cart_html);
                    $('.snap-sidebar-cart__count').text(response.data.cart_count);
                    $('.snap-sidebar-cart__shipping-price').html(response.data.shipping_total);
                    $('.snap-sidebar-cart__subtotal-price').html(response.data.subtotal);
                    
                    debugLog("Cart content updated successfully");
                    
                    // Reiniciar los manejadores de eventos
                    initRemoveButtonHandlers();
                    
                    // Si hay una función global para vincular eventos de cantidad, llamarla
                    if (typeof window.bindQuantityEvents === 'function') {
                        window.bindQuantityEvents();
                        debugLog("Re-bound quantity events");
                    }
                } else {
                    debugLog("Error en respuesta AJAX: " + (response.data ? response.data.message : "Unknown error"));
                    $product.css('opacity', '1').removeClass('removing');
                    $loader.hide();
                    
                    if (response.data && response.data.message) {
                        alert(response.data.message);
                    }
                }
            },
            error: function(xhr, status, error) {
                debugLog("AJAX error: " + error);
                $product.css('opacity', '1').removeClass('removing');
                $loader.hide();
            }
        });
    }

    // Función para inicializar handlers de botón eliminar
    function initRemoveButtonHandlers() {
        // Verificar si hay botones de eliminar en la página
        var removeButtonCount = $('.snap-sidebar-cart__remove-product').length;
        debugLog("Found " + removeButtonCount + " remove buttons");
        
        // Añadir un identificador único para cada botón de eliminar para seguimiento
        $('.snap-sidebar-cart__remove-product').each(function(index) {
            $(this).attr('data-remove-button-id', 'remove-button-' + index);
            debugLog("Assigned ID: remove-button-" + index);
        });
    }

    // Inicialización cuando el DOM está listo
    $(document).ready(function() {
        debugLog("Remove button fix script loaded");
        
        // Inicializar handlers
        initRemoveButtonHandlers();
        
        // Usar delegación de eventos para capturar clics en botones de eliminar
        // independientemente de cuándo o cómo se agregan al DOM
        $(document).on('click', '.snap-sidebar-cart__remove-product', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            removeButtonClickCount++;
            var buttonId = $(this).data('remove-button-id') || 'unknown';
            debugLog("Remove button clicked! Count: " + removeButtonClickCount + ", Button ID: " + buttonId);
            
            var $button = $(this);
            var $product = $button.closest('.snap-sidebar-cart__product');
            
            // Buscar la clave del producto de varias maneras posibles para máxima compatibilidad
            var cartItemKey = $product.data('key');
            
            if (!cartItemKey) {
                debugLog("Key not found on product element, looking in quantity wrapper...");
                var $quantityWrapper = $product.find('.quantity.buttoned-input');
                if ($quantityWrapper.length) {
                    cartItemKey = $quantityWrapper.data('key');
                    debugLog("Found key in quantity wrapper: " + cartItemKey);
                }
            }
            
            if (!cartItemKey) {
                debugLog("Key not found in quantity wrapper, looking in quantity input...");
                var $input = $product.find('input.cart-item__quantity-input');
                if ($input.length) {
                    cartItemKey = $input.data('key');
                    debugLog("Found key in input: " + cartItemKey);
                }
            }
            
            // Si todavía no tenemos clave, buscar en cualquier atributo data-* que pueda contenerla
            if (!cartItemKey) {
                debugLog("Still no key found, searching for any data attribute containing 'key'...");
                var dataAttrs = $product[0].attributes;
                for (var i = 0; i < dataAttrs.length; i++) {
                    var attr = dataAttrs[i];
                    if (attr.name.indexOf('data-') === 0 && attr.name.toLowerCase().indexOf('key') > -1) {
                        cartItemKey = attr.value;
                        debugLog("Found potential key in attribute " + attr.name + ": " + cartItemKey);
                        break;
                    }
                }
            }
            
            if (!cartItemKey) {
                // Último recurso: extraer de la estructura HTML del botón o proximidades
                debugLog("Still no key found. Last resort: checking nearby elements and HTML structure");
                
                // Intentar encontrar la clave en algún elemento cercano o contenedor padre
                var $parentElements = $product.parents('[data-key]');
                if ($parentElements.length) {
                    cartItemKey = $parentElements.first().data('key');
                    debugLog("Found key in parent element: " + cartItemKey);
                }
                
                // Si todavía no hay clave, generar un error detallado para depuración
                if (!cartItemKey) {
                    debugLog("ERROR: Could not find cart item key. Product HTML structure:");
                    debugLog($product.prop('outerHTML'));
                    alert("No se pudo eliminar el producto: clave no encontrada. Por favor recarga la página e intenta de nuevo.");
                    return;
                }
            }
            
            // Remover el producto
            removeCartItem(cartItemKey, $product);
        });
        
        // Evento de escucha para cuando el contenido del carrito se actualiza
        $(document).on('snap_sidebar_cart_updated', function() {
            debugLog("Cart updated event detected, re-initializing handlers");
            initRemoveButtonHandlers();
        });
        
        // También reinicializar cuando se agrega un producto al carrito
        $(document.body).on('added_to_cart', function() {
            debugLog("Product added to cart, re-initializing handlers");
            initRemoveButtonHandlers();
        });
    });
    
    // Añadir una pequeña mejora visual al botón eliminar para hacerlo más visible y clicable
    $('<style>')
        .prop('type', 'text/css')
        .html(`
            .snap-sidebar-cart__remove-product {
                cursor: pointer;
                padding: 2px 8px;
                background: #f5f5f5;
                border-radius: 50%;
                font-size: 16px;
                line-height: 1;
                font-weight: bold;
                transition: all 0.2s ease;
                position: relative;
                z-index: 10;
            }
            
            .snap-sidebar-cart__remove-product:hover {
                background: #e0e0e0;
                transform: scale(1.1);
            }
            
            .snap-sidebar-cart__product.removing {
                opacity: 0.5;
                pointer-events: none;
            }
        `)
        .appendTo('head');
    
})(jQuery);
