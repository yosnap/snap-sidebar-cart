/**
 * Script simplificado para asegurar el funcionamiento del botón de eliminar productos
 */
(function ($) {
    "use strict";

    $(document).ready(function () {
        // Delegación de eventos simple y directa para el botón eliminar
        $(document).on('click', '.snap-sidebar-cart__remove-product', function (e) {
            e.preventDefault();
            e.stopPropagation();

            const $button = $(this);
            const $product = $button.closest('.snap-sidebar-cart__product');
            const cartItemKey = $button.data('key');

            if (!cartItemKey) {
                console.error('Error: No se pudo encontrar la clave del producto para eliminar');
                return;
            }

            // Añadir clase para animación de eliminación
            $product.addClass('removing');
            
            // Mostrar loader del producto
            $product.find('.snap-sidebar-cart__product-loader').show();

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
                        // Si hay una función global para actualizar el carrito, usarla
                        if (typeof window.SnapSidebarCartUI !== 'undefined') {
                            window.SnapSidebarCartUI.updateCartContent(response.data);
                        } else if (typeof window.updateCartContent === 'function') {
                            window.SnapSidebarCartUI.updateCartContent(response.data);
                        } else {
                            // Fallback: solo actualizar HTML si no está disponible el handler principal
                            if (response.data && response.data.cart_html) {
                                $('.snap-sidebar-cart__products').html(response.data.cart_html);
                            }
                        }
                    } else {
                        // Ocultar loader y quitar clase de animación en caso de error
                        $product.find('.snap-sidebar-cart__product-loader').hide();
                        $product.removeClass('removing');
                    }
                },
                error: function () {
                    // Ocultar loader y quitar clase de animación en caso de error
                    $product.find('.snap-sidebar-cart__product-loader').hide();
                    $product.removeClass('removing');
                }
            });
        });
    });
})(jQuery);
