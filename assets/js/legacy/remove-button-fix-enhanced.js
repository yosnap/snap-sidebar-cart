/**
 * Script de mejora para el botón de eliminar productos
 * Asegura que los botones funcionen correctamente y muestra un preloader adecuado
 */
(function ($) {
    "use strict";

    $(document).ready(function () {
        const preloaderOptions = snap_sidebar_cart_params.preloader || {};
        const preloaderType = preloaderOptions.type || 'circle';
        const preloaderPosition = preloaderOptions.position || 'center';

        // Función para mostrar el preloader en un producto
        function showPreloader($product) {
            if (!$product || !$product.length) return;

            // Obtener el contenedor del preloader
            const $loader = $product.find('.snap-sidebar-cart__product-loader');
            const $spinner = $loader.find('.snap-sidebar-cart__loader-spinner');

            // Configurar el preloader según el tipo
            $spinner.attr('class', 'snap-sidebar-cart__loader-spinner');
            $spinner.addClass('preloader-' + preloaderType);
            $spinner.addClass('preloader-position-' + preloaderPosition);

            // Crear el HTML interno para el preloader de puntos
            if (preloaderType === 'dots') {
                $spinner.html('<span></span><span></span><span></span>');
            } else {
                $spinner.html('');
            }

            // Mostrar el preloader
            $loader.show();
        }

        // Función para ocultar el preloader
        function hidePreloader($product) {
            if (!$product || !$product.length) return;
            $product.find('.snap-sidebar-cart__product-loader').hide();
        }

        // Manejar el botón de eliminar producto - versión mejorada
        $(document).on('click', '.snap-sidebar-cart__remove-product', function (e) {
            e.preventDefault();
            e.stopPropagation();

            const $button = $(this);
            const $product = $button.closest('.snap-sidebar-cart__product');
            const cartItemKey = $button.data('key') || $product.data('key');
            const productId = $button.data('product-id') || $product.data('product-id');

            console.log('Eliminar producto: Key =', cartItemKey, 'ID =', productId);

            if (!cartItemKey) {
                console.error('Error: No se pudo encontrar la clave del producto para eliminar');
                return;
            }

            // Añadir clase para animación de eliminación
            $product.addClass('removing');

            // Mostrar preloader
            showPreloader($product);

            // Enviar solicitud AJAX para eliminar el producto
            $.ajax({
                type: 'POST',
                url: snap_sidebar_cart_params.ajax_url,
                data: {
                    action: 'snap_sidebar_cart_remove',
                    nonce: snap_sidebar_cart_params.nonce,
                    cart_item_key: cartItemKey
                },
                success: function (response) {
                    if (response.success) {
                        console.log('Producto eliminado correctamente:', response);
                        // Actualizar el contenido del carrito
                        if (typeof window.updateCartContent === 'function') {
                            window.updateCartContent(response.data);
                        } else if (typeof updateCartContent === 'function') {
                            updateCartContent(response.data);
                        } else {
                            // Alternativa si la función de actualización no está disponible
                            $product.slideUp(300, function() {
                                $(this).remove();
                                // Actualizar el contador
                                if (response.data && response.data.cart_count !== undefined) {
                                    $('.snap-sidebar-cart__count').text(response.data.cart_count);
                                }
                                // Verificar si el carrito está vacío y recargar
                                if (response.data && response.data.cart_count === 0) {
                                    location.reload();
                                }
                            });
                        }
                    } else {
                        console.error('Error al eliminar producto:', response.data?.message || 'Error desconocido');
                        hidePreloader($product);
                        $product.removeClass('removing');
                        
                        // Mostrar mensaje de error
                        alert(response.data?.message || 'Error al eliminar el producto');
                    }
                },
                error: function (xhr, status, error) {
                    console.error('Error AJAX al eliminar producto:', error);
                    hidePreloader($product);
                    $product.removeClass('removing');
                    
                    // Mostrar mensaje de error
                    alert('Error de comunicación con el servidor');
                }
            });
        });
        
        // Hacer global la función de mostrar preloader para uso en otros scripts
        window.showProductPreloader = showPreloader;
        window.hideProductPreloader = hidePreloader;
    });
})(jQuery);
