/**
 * Manejador específico para el botón de eliminación superior
 * Este script añade funcionalidad al botón de eliminar en la parte superior
 */
(function($) {
    'use strict';
    
    // Ejecutar cuando el DOM esté listo
    $(document).ready(function() {
        console.log('Inicializando manejador para el botón de eliminación superior');
        
        // Usar delegación de eventos para manejar el clic en el botón de eliminar superior
        $(document).on('click', '.snap-sidebar-cart__product-remove-top', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            var $button = $(this);
            var cartItemKey = $button.data('key');
            
            console.log('Botón de eliminar superior clickeado - Clave:', cartItemKey);
            
            if (!cartItemKey) {
                console.error('Error: No se pudo encontrar la clave del producto');
                return;
            }
            
            // Encontrar el elemento del producto
            var $product = $button.closest('.snap-sidebar-cart__product');
            
            // Añadir clase para animar la eliminación
            if ($product.length) {
                $product.addClass('removing');
                
                // Mostrar preloader
                var $loader = $product.find('.snap-sidebar-cart__product-loader');
                if ($loader.length) {
                    $loader.css('display', 'flex');
                    
                    // Configurar el tipo de preloader según las opciones
                    var $spinner = $loader.find('.snap-sidebar-cart__loader-spinner');
                    
                    // Obtener configuración del preloader desde los parámetros globales
                    if (window.snap_sidebar_cart_params && window.snap_sidebar_cart_params.preloader) {
                        var preloaderType = window.snap_sidebar_cart_params.preloader.type || 'circle';
                        var preloaderPosition = window.snap_sidebar_cart_params.preloader.position || 'center';
                        
                        // Aplicar clases según la configuración
                        $spinner.attr('class', 'snap-sidebar-cart__loader-spinner');
                        $spinner.addClass('preloader-' + preloaderType);
                        $spinner.addClass('preloader-position-' + preloaderPosition);
                        
                        // Crear contenido HTML específico para el tipo de preloader
                        if (preloaderType === 'dots') {
                            $spinner.html('<span></span><span></span><span></span>');
                        } else {
                            $spinner.html('');
                        }
                    }
                }
            }
            
            // Realizar petición AJAX para eliminar el producto
            $.ajax({
                type: 'POST',
                url: snap_sidebar_cart_params.ajax_url,
                data: {
                    action: 'snap_sidebar_cart_remove',
                    nonce: snap_sidebar_cart_params.nonce,
                    cart_item_key: cartItemKey
                },
                success: function(response) {
                    console.log('Respuesta de eliminación:', response);
                    
                    if (response.success) {
                        // Actualizar contenido del carrito
                        if (response.data.cart_html) {
                            $('.snap-sidebar-cart__products').html(response.data.cart_html);
                        }
                        
                        // Actualizar contador
                        if (response.data.cart_count !== undefined) {
                            $('.snap-sidebar-cart__count').text(response.data.cart_count);
                        }
                        
                        // Actualizar precios
                        if (response.data.subtotal) {
                            $('.snap-sidebar-cart__subtotal-price').html(response.data.subtotal);
                        }
                        
                        if (response.data.shipping_total) {
                            $('.snap-sidebar-cart__shipping-price').html(response.data.shipping_total);
                        }
                        
                        // Verificar si el carrito está vacío y actualizar estado
                        var cartCount = parseInt($('.snap-sidebar-cart__count').text()) || 0;
                        if (cartCount === 0) {
                            console.log('Carrito vacío después de eliminar producto con botón de papelera');
                            
                            // Ocultar footer si está vacío
                            $('.snap-sidebar-cart__footer').hide();
                            
                            // Ocultar la sección de productos relacionados
                            var $relatedSection = $('.snap-sidebar-cart__related-section');
                            $relatedSection.hide();
                            $relatedSection.css('display', 'none');
                            $relatedSection.attr('style', 'display: none !important');
                            
                            // Añadir clase para indicar que el carrito está vacío
                            $('.snap-sidebar-cart').addClass('cart-is-empty');
                            
                            // Limpiar productos relacionados
                            $('.snap-sidebar-cart__related-container .snap-sidebar-cart__slider-track').empty();
                            
                            // Disparar evento personalizado para notificar que el carrito está vacío
                            $(document.body).trigger('snap_sidebar_cart_empty');
                        }
                        
                        // Disparar evento personalizado para notificar la actualización
                        $(document.body).trigger('snap_sidebar_cart_updated');
                    } else {
                        // Mostrar mensaje de error
                        if (response.data && response.data.message) {
                            alert(response.data.message);
                        } else {
                            alert('Error al eliminar el producto del carrito');
                        }
                        
                        // Revertir animación de eliminación
                        if ($product.length) {
                            $product.removeClass('removing');
                            if ($loader.length) {
                                $loader.hide();
                            }
                        }
                    }
                },
                error: function(xhr, status, error) {
                    console.error('Error AJAX:', error);
                    alert('Error de comunicación con el servidor');
                    
                    // Revertir animación de eliminación
                    if ($product.length) {
                        $product.removeClass('removing');
                        if ($loader.length) {
                            $loader.hide();
                        }
                    }
                }
            });
        });
    });
    
})(jQuery);
