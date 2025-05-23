/**
 * Manejador AJAX específico para el carrito
 * Se encarga de la comunicación con el servidor para actualizar el carrito
 */
jQuery(document).ready(function($) {
    'use strict';
    
    console.log('=== CART AJAX HANDLER CARGADO ===');
    
    // Función para obtener el contenido del carrito
    window.getCartContent = function(callback) {
        $.ajax({
            type: "POST",
            url: snap_sidebar_cart_params.ajax_url,
            data: {
                action: "snap_sidebar_cart_get_content",
                nonce: snap_sidebar_cart_params.nonce
            },
            success: function(response) {
                if (typeof callback === 'function') {
                    callback(response);
                }
            },
            error: function(xhr, status, error) {
                console.error("Error al obtener contenido del carrito:", error);
                if (typeof callback === 'function') {
                    callback({success: false, error: error});
                }
            }
        });
    };
    
    // Función para actualizar la cantidad de un item
    window.updateCartItemQuantity = function(cartItemKey, quantity, oldQuantity) {
        if (!cartItemKey) {
            console.error("Error: Clave de producto no válida para actualizar cantidad");
            $('.snap-sidebar-cart__product-loader').hide();
            return;
        }
        
        console.log("Enviando actualización para clave:", cartItemKey, "cantidad:", quantity);
        
        // Si es solo una actualización de cantidad y no eliminación
        var isQuantityUpdate = quantity > 0 && oldQuantity > 0;
        var $product = $('[data-key="' + cartItemKey + '"]');
        
        // Si hay un manejador de preloader global, usarlo
        if (window.setupAndShowPreloader && typeof window.setupAndShowPreloader === 'function' && $product.length) {
            window.setupAndShowPreloader($product);
        } else if ($product.length) {
            // Fallback simple
            var $loader = $product.find('.snap-sidebar-cart__product-loader');
            if ($loader.length) {
                $loader.css('display', 'flex');
            }
        }
        
        // Realizar la petición AJAX para actualizar la cantidad
        $.ajax({
            type: "POST",
            url: snap_sidebar_cart_params.ajax_url,
            data: {
                action: "snap_sidebar_cart_update",
                nonce: snap_sidebar_cart_params.nonce,
                cart_item_key: cartItemKey,
                quantity: quantity,
            },
            success: function(response) {
                console.log("Respuesta de actualización:", response);
                if (response.success) {
                    // Actualizar el contenido del carrito
                    if (window.updateCartContent && typeof window.updateCartContent === 'function') {
                        window.updateCartContent(response.data);
                    } else {
                        // Implementación básica si no existe la función
                        if (response.data.cart_html) {
                            $(".snap-sidebar-cart__products").html(response.data.cart_html);
                        }
                        
                        // Actualizar el contador
                        // $(".snap-sidebar-cart__count").text(response.data.cart_count);
                        
                        // Ocultar los loaders
                        $('.snap-sidebar-cart__product-loader').hide();
                    }
                } else {
                    if (response.data && response.data.message) {
                        alert(response.data.message);
                    }
                    // Ocultar loader en caso de error
                    $('.snap-sidebar-cart__product-loader').hide();
                }
            },
            error: function(xhr, status, error) {
                console.error("Error de AJAX:", error);
                alert("Error de comunicación con el servidor");
                // Ocultar loader en caso de error
                $('.snap-sidebar-cart__product-loader').hide();
            },
        });
    };
    
    // Función para verificar si un producto está en el carrito
    window.isProductInCart = function(productId) {
        if (!productId) return false;
        
        var productFound = false;
        
        // Buscar el producto en todos los elementos del carrito
        $(".snap-sidebar-cart__product").each(function() {
            var dataProductId = $(this).attr("data-product-id") || $(this).data("product-id");
            if (dataProductId == productId) {
                productFound = true;
                return false; // Romper el bucle each
            }
        });
        
        return productFound;
    };
    
    // Función para añadir un producto al carrito via AJAX
    window.addProductToCart = function(productId, quantity, variations, callback) {
        if (!productId) {
            console.error("Error: ID de producto no válido");
            return;
        }
        
        quantity = quantity || 1;
        variations = variations || {};
        
        // Mostrar un preloader global si existe
        if ($('.snap-sidebar-cart').length) {
            var $preloaderContainer = $('<div class="global-preloader" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(255,255,255,0.7); z-index:9999; display:flex; justify-content:center; align-items:center;"></div>');
            
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
            
            // Crear el HTML del preloader
            var spinnerHTML = '<div class="' + preloaderClasses + '" style="' + inlineStyles + '"';
            
            // Añadir contenido específico según el tipo de preloader
            if (preloaderType === 'dots') {
                spinnerHTML += '><span style="background-color: ' + preloaderColor + ';"></span>' +
                             '<span style="background-color: ' + preloaderColor + ';"></span>' +
                             '<span style="background-color: ' + preloaderColor + ';"></span>';
            } else {
                spinnerHTML += '>';
            }
            
            // Cerrar la etiqueta div
            spinnerHTML += '</div>';
            
            var $spinner = $(spinnerHTML);
            $preloaderContainer.append($spinner);
            $('body').append($preloaderContainer);
            
            console.log('Preloader configurado:', {
                type: preloaderType,
                position: preloaderPosition,
                color: preloaderColor,
                color2: preloaderColor2,
                size: preloaderSize
            });
        }
        
        $.ajax({
            type: "POST",
            url: snap_sidebar_cart_params.ajax_url,
            data: {
                action: "snap_sidebar_cart_add",
                nonce: snap_sidebar_cart_params.nonce,
                product_id: productId,
                quantity: quantity,
                variation: variations,
                new_product_position: snap_sidebar_cart_params.animations.new_product_position || 'top'
            },
            success: function(response) {
                console.log("Respuesta de añadir producto:", response);
                
                // Quitar el preloader global
                $('.global-preloader').remove();
                
                if (response.success) {
                    // Verificar si debe abrirse automáticamente
                    var autoOpenValue = snap_sidebar_cart_params.auto_open;
                    var shouldAutoOpen = (autoOpenValue === true || 
                                         autoOpenValue === "true" || 
                                         autoOpenValue === 1 || 
                                         autoOpenValue === "1");
                    
                    // Si auto_open está habilitado, abrir el sidebar
                    if (shouldAutoOpen && window.openSidebarDefinitive) {
                        console.log('Auto-open habilitado, abriendo sidebar...');
                        window.openSidebarDefinitive();
                    }
                    
                    // Actualizar el contenido del carrito
                    if (window.updateCartContent && typeof window.updateCartContent === 'function') {
                        window.updateCartContent(response.data);
                    }
                    
                    // Productos relacionados
                    var currentTab = $('.snap-sidebar-cart__related-tab.active').data('tab') || 'related';
                    if (window.loadRelatedProducts && typeof window.loadRelatedProducts === 'function') {
                        window.loadRelatedProducts(productId, currentTab);
                    }
                    
                    // Llamar al callback si existe
                    if (typeof callback === 'function') {
                        callback(response);
                    }
                } else {
                    if (response.data && response.data.message) {
                        alert(response.data.message);
                    } else {
                        alert("Error al añadir el producto al carrito");
                    }
                    
                    if (typeof callback === 'function') {
                        callback(response);
                    }
                }
            },
            error: function(xhr, status, error) {
                console.error("Error de AJAX:", error);
                alert("Error de comunicación con el servidor");
                
                // Quitar el preloader global
                $('.global-preloader').remove();
                
                if (typeof callback === 'function') {
                    callback({success: false, error: error});
                }
            }
        });
    };
    
    console.log('Cart AJAX Handler instalado correctamente');
});