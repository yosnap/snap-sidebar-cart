/**
 * Manejador especial para la última unidad
 * Este script se encarga de garantizar que el sidebar se muestre correctamente
 * incluso cuando se agrega la última unidad disponible de un producto.
 */
(function($) {
    "use strict";
    
    // Al cargar la página
    $(document).ready(function() {
        // Interceptar el evento Ajax de WooCommerce antes de que se realice
        $(document).on('click', '.add_to_cart_button', function(e) {
            // Solo interceptamos si está configurado para abrir automáticamente
            if (snap_sidebar_cart_params.auto_open === "1" || snap_sidebar_cart_params.auto_open === true) {
                var $button = $(this);
                var productId = $button.data('product_id');
                
                // Registrar la intención de abrir el sidebar
                window.snap_last_unit_clicked = {
                    timestamp: new Date().getTime(),
                    product_id: productId
                };
                
                // Configurar un temporizador de respaldo para abrir el sidebar si WooCommerce no dispara los eventos normales
                // (lo que puede ocurrir con la última unidad disponible)
                window.snap_sidebar_backup_timer = setTimeout(function() {
                    console.log('Forzando apertura del sidebar (última unidad)');
                    // Forzar una actualización del contenido del carrito
                    $.ajax({
                        type: "POST",
                        url: snap_sidebar_cart_params.ajax_url,
                        data: {
                            action: "snap_sidebar_cart_get_content"
                        },
                        success: function(response) {
                            if (response.success) {
                                // Actualizar el carrito y abrir el sidebar
                                $(".snap-sidebar-cart__products").html(response.data.cart_html);
                                // $(".snap-sidebar-cart__count").text(response.data.cart_count);
                                $(".snap-sidebar-cart__shipping-price").html(response.data.shipping_total);
                                $(".snap-sidebar-cart__subtotal-price").html(response.data.subtotal);
                                
                                // Abrir el carrito
                                $(".snap-sidebar-cart").addClass("open");
                                $(".snap-sidebar-cart__overlay").css("display", "block");
                                $("body").addClass("snap-sidebar-cart-open");
                            }
                        }
                    });
                }, 1000); // Esperar 1 segundo antes de forzar la apertura
            }
        });
        
        // Si el carrito se abre normalmente, limpiar el temporizador de respaldo
        $(document.body).on('added_to_cart', function() {
            if (window.snap_sidebar_backup_timer) {
                clearTimeout(window.snap_sidebar_backup_timer);
                window.snap_sidebar_backup_timer = null;
            }
        });
    });
    
})(jQuery);
