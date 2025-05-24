/**
 * Script para manejar el stock y eliminar productos cuando la cantidad llega a 0
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

        // Manejar el botón de eliminar producto
        $(document).on('click', '.snap-sidebar-cart__remove-product', function (e) {
            e.preventDefault();
            e.stopPropagation();

            const $button = $(this);
            const $product = $button.closest('.snap-sidebar-cart__product');
            const cartItemKey = $product.data('key');

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
                        // Actualizar el contenido del carrito
                        if (typeof window.SnapSidebarCartUI.updateCartContent === 'function') {
                            window.SnapSidebarCartUI.updateCartContent(response.data);
                        } else {
                            location.reload(); // Fallback si la función no está disponible
                        }
                    } else {
                        console.error('Error al eliminar producto:', response.data?.message || 'Error desconocido');
                        hidePreloader($product);
                        $product.removeClass('removing');
                    }
                },
                error: function (xhr, status, error) {
                    console.error('Error AJAX al eliminar producto:', error);
                    hidePreloader($product);
                    $product.removeClass('removing');
                }
            });
        });

        // Manejar cambios de cantidad cuando llega a 0
        $(document).on('change', '.cart-item__quantity-input', function () {
            const $input = $(this);
            const newValue = parseInt($input.val(), 10);
            
            // Si la cantidad es 0, activar la eliminación del producto
            if (newValue === 0) {
                const $product = $input.closest('.snap-sidebar-cart__product');
                const cartItemKey = $product.data('key');
                
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
                            // Actualizar el contenido del carrito
                            if (typeof window.SnapSidebarCartUI.updateCartContent === 'function') {
                                window.SnapSidebarCartUI.updateCartContent(response.data);
                            } else {
                                location.reload(); // Fallback si la función no está disponible
                            }
                        } else {
                            console.error('Error al eliminar producto:', response.data?.message || 'Error desconocido');
                            hidePreloader($product);
                            $product.removeClass('removing');
                        }
                    },
                    error: function (xhr, status, error) {
                        console.error('Error AJAX al eliminar producto:', error);
                        hidePreloader($product);
                        $product.removeClass('removing');
                    }
                });
            }
        });
        
        // También manejar cuando se hace clic en el botón de disminuir y llega a 0
        $(document).on('click', '.notabutton.quantity-down', function (e) {
            const $button = $(this);
            const $input = $button.siblings('.cart-item__quantity-input');
            const currentValue = parseInt($input.val(), 10);
            
            // Si la cantidad es 1, el siguiente clic la llevará a 0
            if (currentValue === 1) {
                const $product = $button.closest('.snap-sidebar-cart__product');
                const cartItemKey = $product.data('key');
                
                if (!cartItemKey) {
                    console.error('Error: No se pudo encontrar la clave del producto para eliminar');
                    return;
                }
                
                // Actualizar el valor visual a 0
                $input.val(0);
                
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
                            // Actualizar el contenido del carrito
                            if (typeof window.SnapSidebarCartUI.updateCartContent === 'function') {
                                window.SnapSidebarCartUI.updateCartContent(response.data);
                            } else {
                                location.reload(); // Fallback si la función no está disponible
                            }
                        } else {
                            console.error('Error al eliminar producto:', response.data?.message || 'Error desconocido');
                            hidePreloader($product);
                            $product.removeClass('removing');
                            // Restaurar el valor original
                            $input.val(1);
                        }
                    },
                    error: function (xhr, status, error) {
                        console.error('Error AJAX al eliminar producto:', error);
                        hidePreloader($product);
                        $product.removeClass('removing');
                        // Restaurar el valor original
                        $input.val(1);
                    }
                });
            }
        });
    });
})(jQuery);
