/**
 * JavaScript para el área de administración
 */
(function($) {
    'use strict';

    $(document).ready(function() {
        // Inicializar los selectores de color
        $('.snap-sidebar-cart-color-picker').wpColorPicker();
        
        // Mostrar/ocultar opciones de productos relacionados
        function toggleRelatedProducts() {
            var showRelated = $('input[name="snap_sidebar_cart_options[related_products][show]"]').is(':checked');
            
            var $relatedFields = $('input[name="snap_sidebar_cart_options[related_products][count]"]').closest('tr');
            $relatedFields = $relatedFields.add($('input[name="snap_sidebar_cart_options[related_products][columns]"]').closest('tr'));
            $relatedFields = $relatedFields.add($('select[name="snap_sidebar_cart_options[related_products][orderby]"]').closest('tr'));
            
            if (showRelated) {
                $relatedFields.show();
            } else {
                $relatedFields.hide();
            }
        }
        
        // Inicializar estado
        toggleRelatedProducts();
        
        // Actualizar cuando cambia el checkbox
        $('input[name="snap_sidebar_cart_options[related_products][show]"]').on('change', toggleRelatedProducts);
        
        // Mostrar/ocultar opciones de envío
        function toggleShipping() {
            var showShipping = $('input[name="snap_sidebar_cart_options[show_shipping]"]').is(':checked');
            
            // Opcional: si hay opciones específicas de envío para mostrar/ocultar
            // var $shippingFields = $('...').closest('tr');
            // 
            // if (showShipping) {
            //     $shippingFields.show();
            // } else {
            //     $shippingFields.hide();
            // }
        }
        
        // Inicializar estado
        toggleShipping();
        
        // Actualizar cuando cambia el checkbox
        $('input[name="snap_sidebar_cart_options[show_shipping]"]').on('change', toggleShipping);
    });

})(jQuery);
