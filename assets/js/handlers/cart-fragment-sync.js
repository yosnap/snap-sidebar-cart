// Log para comprobar que el handler se carga
console.log('[SnapSidebarCart] Handler de sincronización cargado');

// Sincroniza los fragmentos WooCommerce tras cada actualización del sidebar
jQuery(document).on('snap_sidebar_cart_updated', function(e, data) {
    console.log('[SnapSidebarCart] Evento snap_sidebar_cart_updated recibido', data);
    // 1. Refrescar fragmentos WooCommerce
    if (typeof wc_cart_fragments_params !== 'undefined') {
        jQuery.ajax({
            url: wc_cart_fragments_params.wc_ajax_url.toString().replace('%%endpoint%%', 'get_refreshed_fragments'),
            type: 'POST',
            success: function(response) {
                if (response && response.fragments) {
                    jQuery.each(response.fragments, function(key, value) {
                        jQuery(key).replaceWith(value);
                    });
                    if (typeof sessionStorage !== 'undefined') {
                        sessionStorage.setItem(wc_cart_fragments_params.fragment_name, JSON.stringify(response.fragments));
                        sessionStorage.setItem('wc_cart_hash', response.cart_hash);
                    }
                    jQuery(document.body).trigger('wc_fragments_refreshed');
                }
                // 2. Actualizar contador personalizado en el header
                if (response && response.cart_hash && response.fragments) {
                    var $tmp = jQuery('<div>').append(response.fragments['.cart-contents']);
                    var count = $tmp.find('.count').text() || $tmp.text();
                    if (count) {
                        jQuery('.minicart-header').text(count);
                    }
                }
                // 3. Si estamos en la página del carrito, recargar el contenido principal del carrito SOLO después de refrescar fragmentos
                if (jQuery('body').hasClass('woocommerce-cart')) {
                    jQuery.ajax({
                        url: window.location.href,
                        type: 'GET',
                        dataType: 'html',
                        success: function(html) {
                            var $newCart = jQuery(html).find('.woocommerce-cart-form');
                            var $newTotals = jQuery(html).find('.cart_totals');
                            if ($newCart.length) {
                                jQuery('.woocommerce-cart-form').replaceWith($newCart);
                                console.log('[SnapSidebarCart] Tabla del carrito reemplazada vía AJAX');
                            }
                            if ($newTotals.length) {
                                jQuery('.cart_totals').replaceWith($newTotals);
                                console.log('[SnapSidebarCart] Totales del carrito reemplazados vía AJAX');
                            }
                            // Disparar eventos estándar de WooCommerce
                            jQuery(document.body).trigger('updated_cart_totals');
                            if ($newCart.length === 0) {
                                jQuery(document.body).trigger('wc_cart_emptied');
                            }
                        },
                        error: function() {
                            console.error('[SnapSidebarCart] Error al recargar la tabla del carrito vía AJAX');
                        }
                    });
                }
            }
        });
    }
}); 