/**
 * Manejador centralizado de animaciones del carrito lateral
 * Respeta los ajustes del admin (posición, duración, etc)
 *
 * - Animación de agregado de productos (top/bottom)
 * - Animación de cantidad actualizada
 * - Mostrar/ocultar sidebar con animación
 *
 * @since 1.2.9
 */
(function($) {
    'use strict';

    var CartAnimationsHandler = {
        animationDuration: 300,
        newProductPosition: 'top',

        init: function() {
            // Leer configuración desde los parámetros globales
            if (window.snap_sidebar_cart_params) {
                if (window.snap_sidebar_cart_params.animations) {
                    this.animationDuration = parseInt(window.snap_sidebar_cart_params.animations.duration, 10) || 300;
                }
                // Líneas 23-24: comentar la asignación de this.newProductPosition desde snap_sidebar_cart_params.new_product_position o animations.new_product_position para desactivar temporalmente la lógica de orden de productos
                // this.newProductPosition = window.snap_sidebar_cart_params.new_product_position ||
                //     (window.snap_sidebar_cart_params.animations && window.snap_sidebar_cart_params.animations.new_product_position) || 'top';
            }
        },

        /**
         * Anima la adición de un producto al carrito
         * @param {string|number} productId
         * @param {boolean} isNew Indica si es realmente nuevo
         */
        animateProductAdd: function(productId, isNew) {
            var $productsContainer = $('.snap-sidebar-cart__products-list');
            var $product = $('.snap-sidebar-cart__product[data-product-id="' + productId + '"]');
            if (!$product.length) return;

            if (isNew) {
                // Animación de entrada según posición
                // $product.addClass('new-item'); // Animación desactivada temporalmente
                setTimeout(function() {
                    $product.removeClass('new-item');
                }, this.animationDuration);

                // Scroll a la posición correcta
                var $container = $('.snap-sidebar-cart__products');
                if (this.newProductPosition === 'top') {
                    $container.animate({ scrollTop: 0 }, this.animationDuration);
                } else {
                    // Scroll al final
                    $container.animate({ scrollTop: $container[0].scrollHeight }, this.animationDuration);
                }
            } else {
                // Solo resaltar cantidad y hacer scroll a la posición actual
                var $quantityInput = $product.find('.cart-item__quantity-input');
                if ($quantityInput.length) {
                    $quantityInput.addClass('quantity-updated');
                    setTimeout(function() {
                        $quantityInput.removeClass('quantity-updated');
                    }, 1000);
                }
                // Scroll a la posición actual del producto
                var $container = $('.snap-sidebar-cart__products');
                var productOffset = $product.offset().top - $container.offset().top + $container.scrollTop();
                $container.animate({ scrollTop: productOffset - 10 }, this.animationDuration);
            }
        },

        /**
         * Anima la apertura/cierre del sidebar
         * @param {boolean} open
         */
        animateSidebar: function(open) {
            var $sidebar = $('.snap-sidebar-cart');
            if (open) {
                $sidebar.addClass('sidebar-opening');
                setTimeout(function() {
                    $sidebar.removeClass('sidebar-opening');
                }, this.animationDuration);
            } else {
                $sidebar.addClass('sidebar-closing');
                setTimeout(function() {
                    $sidebar.removeClass('sidebar-closing');
                }, this.animationDuration);
            }
        }
    };

    CartAnimationsHandler.init();
    window.CartAnimationsHandler = CartAnimationsHandler;

})(jQuery); 