/**
 * Solución completa para los botones de cambio de cantidad
 * Este script garantiza que los botones de cantidad funcionen correctamente
 * y que el precio total se actualice adecuadamente
 */
jQuery(function($) {
    'use strict';
    
    console.log('=== QUANTITY BUTTONS COMPLETE FIX CARGADO ===');
    
    // Variables globales
    var isUpdating = false;
    var updateQueue = [];
    
    /**
     * Función principal para corregir los botones de cantidad
     */
    function applyQuantityButtonsFix() {
        console.log('Aplicando solución completa para botones de cantidad');
        
        // PASO 1: Eliminar TODOS los manejadores de eventos existentes
        // Esto es crucial para evitar que se ejecuten múltiples veces
        $(document).off('click', '.snap-sidebar-cart__quantity-up, .notabutton.quantity-up');
        $(document).off('click', '.snap-sidebar-cart__quantity-down, .notabutton.quantity-down');
        $('.snap-sidebar-cart__quantity-up, .snap-sidebar-cart__quantity-down, .notabutton.quantity-up, .notabutton.quantity-down').off('click');
        
        // PASO 2: Vincular nuevos manejadores de eventos
        // Botón de incremento
        $('.snap-sidebar-cart__quantity-up, .notabutton.quantity-up').on('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Si ya hay una actualización en curso, no hacer nada
            if (isUpdating) {
                console.log('Actualización en curso, ignorando clic');
                return;
            }
            
            var $button = $(this);
            console.log('Botón de incremento clickeado:', $button);
            
            // Buscar el contenedor de cantidad y el input
            var $quantityWrapper = $button.closest('.quantity, .snap-sidebar-cart__quantity');
            var $input = $quantityWrapper.find('input.cart-item__quantity-input, input.snap-sidebar-cart__quantity-input');
            var $product = $button.closest('.snap-sidebar-cart__product');
            
            // Obtener la clave del producto
            var cartItemKey = $quantityWrapper.data('key') || $input.data('key');
            if (!cartItemKey && $product.length) {
                cartItemKey = $product.data('key');
            }
            
            if (!cartItemKey) {
                console.error('Error: No se pudo encontrar la clave del producto');
                return;
            }
            
            // Obtener valores actuales
            var currentVal = parseInt($input.val(), 10) || 1;
            var maxQty = parseInt($quantityWrapper.data('max-qty'), 10);
            
            // Verificar si va a exceder el stock disponible
            if (!isNaN(maxQty) && currentVal >= maxQty) {
                console.log('Stock máximo alcanzado:', maxQty);
                return;
            }
            
            // Calcular nuevo valor (incrementar de 1 en 1)
            var newVal = currentVal + 1;
            console.log('Aumentando cantidad de', currentVal, 'a', newVal);
            
            // Actualizar valor del input
            $input.val(newVal);
            
            // Procesar la actualización
            processQuantityUpdate(cartItemKey, newVal, currentVal, $product);
        });
        
        // Botón de decremento
        $('.snap-sidebar-cart__quantity-down, .notabutton.quantity-down').on('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Si ya hay una actualización en curso, no hacer nada
            if (isUpdating) {
                console.log('Actualización en curso, ignorando clic');
                return;
            }
            
            var $button = $(this);
            console.log('Botón de decremento clickeado:', $button);
            
            // Buscar el contenedor de cantidad y el input
            var $quantityWrapper = $button.closest('.quantity, .snap-sidebar-cart__quantity');
            var $input = $quantityWrapper.find('input.cart-item__quantity-input, input.snap-sidebar-cart__quantity-input');
            var $product = $button.closest('.snap-sidebar-cart__product');
            
            // Obtener la clave del producto
            var cartItemKey = $quantityWrapper.data('key') || $input.data('key');
            if (!cartItemKey && $product.length) {
                cartItemKey = $product.data('key');
            }
            
            if (!cartItemKey) {
                console.error('Error: No se pudo encontrar la clave del producto');
                return;
            }
            
            // Obtener valor actual
            var currentVal = parseInt($input.val(), 10) || 1;
            
            // Calcular nuevo valor (decrementar de 1 en 1, mínimo 0 para eliminar)
            var newVal = currentVal > 1 ? currentVal - 1 : 0;
            console.log('Disminuyendo cantidad de', currentVal, 'a', newVal);
            
            // Actualizar valor del input
            $input.val(newVal);
            
            // Procesar la actualización
            processQuantityUpdate(cartItemKey, newVal, currentVal, $product);
        });
        
        console.log('Eventos de botones de cantidad vinculados correctamente');
    }
    
    /**
     * Procesa la actualización de cantidad de forma segura
     */
    function processQuantityUpdate(cartItemKey, newVal, oldVal, $product) {
        // Marcar que hay una actualización en curso
        isUpdating = true;
        
        // Mostrar preloader
        showProductLoader($product);
        
        // Realizar la petición AJAX para actualizar el carrito
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
                console.log('Respuesta de actualización:', response);
                
                if (response.success) {
                    // Actualizar el contenido del carrito
                    updateCartFromResponse(response.data);
                } else {
                    // Mostrar mensaje de error si existe
                    if (response.data && response.data.message) {
                        alert(response.data.message);
                    }
                    
                    // Restaurar el valor anterior en caso de error
                    $product.find('input.cart-item__quantity-input, input.snap-sidebar-cart__quantity-input').val(oldVal);
                }
                
                // Ocultar loader
                hideProductLoader($product);
                
                // Marcar que la actualización ha terminado
                isUpdating = false;
                
                // Procesar la siguiente actualización en cola si existe
                processNextUpdate();
            },
            error: function() {
                console.error('Error al actualizar el carrito');
                
                // Restaurar el valor anterior en caso de error
                $product.find('input.cart-item__quantity-input, input.snap-sidebar-cart__quantity-input').val(oldVal);
                
                // Ocultar loader
                hideProductLoader($product);
                
                // Marcar que la actualización ha terminado
                isUpdating = false;
                
                // Procesar la siguiente actualización en cola si existe
                processNextUpdate();
            }
        });
    }
    
    /**
     * Procesa la siguiente actualización en cola
     */
    function processNextUpdate() {
        if (updateQueue.length > 0) {
            var nextUpdate = updateQueue.shift();
            processQuantityUpdate(nextUpdate.key, nextUpdate.newVal, nextUpdate.oldVal, nextUpdate.$product);
        }
    }
    
    /**
     * Actualiza el carrito con los datos de la respuesta
     */
    function updateCartFromResponse(data) {
        if (!data) return;
        
        console.log('Actualizando carrito con datos:', data);
        
        // Actualizar el contenido del carrito
        if (data.cart_content) {
            $('.snap-sidebar-cart__products-list').html(data.cart_content);
        }
        
        // Actualizar contador de ítems
        if (data.cart_count !== undefined) {
            updateCartItemCount(data.cart_count);
        }
        
        // Actualizar subtotal
        if (data.cart_subtotal !== undefined) {
            updateCartSubtotal(data.cart_subtotal);
        }
        
        // Recalcular el total sumando las cantidades de cada producto
        recalculateCartTotal();
        
        // Solicitar una actualización completa del carrito para asegurar que todo esté sincronizado
        setTimeout(function() {
            $.ajax({
                type: 'POST',
                url: snap_sidebar_cart_params.ajax_url,
                data: {
                    action: 'snap_sidebar_cart_get_cart',
                    nonce: snap_sidebar_cart_params.nonce
                },
                success: function(response) {
                    console.log('Respuesta de actualización completa:', response);
                    
                    if (response.success && response.data) {
                        // Actualizar el subtotal con el valor correcto
                        if (response.data.cart_subtotal) {
                            // Actualizar todos los elementos que muestran el subtotal
                            $('.snap-sidebar-cart__subtotal-value').html(response.data.cart_subtotal);
                            
                            // Actualizar el elemento con la estructura específica
                            var $subtotalPrice = $('.snap-sidebar-cart__subtotal-price');
                            if ($subtotalPrice.length) {
                                // Si contiene la estructura de WooCommerce, actualizar solo el contenido
                                if ($subtotalPrice.find('.woocommerce-Price-amount').length) {
                                    $subtotalPrice.find('.woocommerce-Price-amount bdi').html(
                                        response.data.cart_subtotal.replace('<span class="woocommerce-Price-currencySymbol">', '&nbsp;<span class="woocommerce-Price-currencySymbol">')
                                    );
                                } else {
                                    // Si no, reemplazar todo el contenido
                                    $subtotalPrice.html(response.data.cart_subtotal);
                                }
                            }
                        }
                    }
                }
            });
        }, 300);
        
        // Disparar evento de actualización
        $(document.body).trigger('snap_sidebar_cart_updated', [data]);
    }
    
    /**
     * Actualiza el contador de ítems en el carrito
     */
    function updateCartItemCount(count) {
        console.log('Actualizando contador de ítems a:', count);
        
        // Actualizar todos los contadores en la página
        $('.snap-sidebar-cart__count, .cart-contents-count, .cart-count, .cart-items-count').text(count);
    }
    
    /**
     * Actualiza el subtotal del carrito
     */
    function updateCartSubtotal(subtotal) {
        console.log('Actualizando subtotal a:', subtotal);
        
        // Actualizar directamente los elementos que contienen el subtotal
        $('.snap-sidebar-cart__subtotal-value').html(subtotal);
        
        // Actualizar también el elemento con la estructura específica
        var $subtotalPrice = $('.snap-sidebar-cart__subtotal-price');
        
        // Solicitar una actualización completa del carrito para obtener el subtotal correcto
        $.ajax({
            type: 'POST',
            url: snap_sidebar_cart_params.ajax_url,
            data: {
                action: 'snap_sidebar_cart_get_cart',
                nonce: snap_sidebar_cart_params.nonce
            },
            success: function(response) {
                if (response.success && response.data && response.data.cart_subtotal) {
                    console.log('Subtotal actualizado desde servidor:', response.data.cart_subtotal);
                    
                    // Actualizar el elemento principal
                    $('.snap-sidebar-cart__subtotal-value').html(response.data.cart_subtotal);
                    
                    // Actualizar el elemento con la estructura específica
                    if ($subtotalPrice.length) {
                        // Reemplazar todo el HTML con la estructura correcta
                        $subtotalPrice.html(response.data.cart_subtotal);
                    }
                    
                    // Actualizar también cualquier otro elemento que muestre el subtotal
                    $('.woocommerce-Price-amount.amount').each(function() {
                        if ($(this).closest('.snap-sidebar-cart__subtotal-price, .snap-sidebar-cart__subtotal-value').length) {
                            $(this).html(response.data.cart_subtotal.replace(/^<span class="woocommerce-Price-amount amount"><bdi>|<\/bdi><\/span>$/g, ''));
                        }
                    });
                }
            }
        });
    }
    
    /**
     * Recalcula el total del carrito sumando las cantidades de cada producto
     */
    function recalculateCartTotal() {
        var totalItems = 0;
        
        // Sumar las cantidades de cada producto
        $('.snap-sidebar-cart__product').each(function() {
            var quantity = parseInt($(this).find('input.cart-item__quantity-input, input.snap-sidebar-cart__quantity-input').val(), 10) || 0;
            totalItems += quantity;
        });
        
        console.log('Total de ítems recalculado:', totalItems);
        
        // Actualizar el contador con el total recalculado
        updateCartItemCount(totalItems);
    }
    
    /**
     * Muestra el preloader en un producto
     */
    function showProductLoader($product) {
        if (!$product || $product.length === 0) return;
        
        // Verificar si ya existe un loader
        var $existingLoader = $product.find('.snap-sidebar-cart__product-loader');
        
        if ($existingLoader.length === 0) {
            // Crear y añadir el loader
            var $loader = $('<div class="snap-sidebar-cart__product-loader"><div class="snap-sidebar-cart__loader-spinner"></div></div>');
            $product.append($loader);
        } else {
            // Mostrar el loader existente
            $existingLoader.show();
        }
    }
    
    /**
     * Oculta el preloader en un producto
     */
    function hideProductLoader($product) {
        if (!$product || $product.length === 0) return;
        
        // Ocultar el loader
        $product.find('.snap-sidebar-cart__product-loader').hide();
    }
    
    // Aplicar la solución inmediatamente
    setTimeout(applyQuantityButtonsFix, 500);
    
    // Volver a aplicar la solución cuando se actualiza el carrito
    $(document.body).on('snap_sidebar_cart_updated', function() {
        setTimeout(applyQuantityButtonsFix, 300);
    });
    
    // Volver a aplicar la solución cuando se abre el sidebar
    $(document.body).on('snap_sidebar_cart_opened', function() {
        setTimeout(applyQuantityButtonsFix, 300);
    });
    
    // Exponer funciones globalmente para que otros scripts puedan utilizarlas
    window.snapSidebarCart = window.snapSidebarCart || {};
    window.snapSidebarCart.updateCartItemCount = updateCartItemCount;
    window.snapSidebarCart.updateCartSubtotal = updateCartSubtotal;
    window.snapSidebarCart.recalculateCartTotal = recalculateCartTotal;
});