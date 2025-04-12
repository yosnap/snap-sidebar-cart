/**
 * Snap Sidebar Cart Admin Scripts
 */

(function($) {
    'use strict';

    $(document).ready(function() {
        // Inicializar color pickers
        $('.snap-color-picker').wpColorPicker({
            change: function(event, ui) {
                // Actualizar vista previa en tiempo real (si quisiéramos implementarlo)
            }
        });
        
        // Mostrar/ocultar campo de cantidad de productos relacionados
        $('#snap_show_related').on('change', function() {
            if ($(this).is(':checked')) {
                $('.snap-related-count-row').show();
            } else {
                $('.snap-related-count-row').hide();
            }
        }).trigger('change');
        
        // Navegación por pestañas
        $('.snap-sidebar-cart-tab').on('click', function(e) {
            e.preventDefault();
            
            // Activar pestaña
            $('.snap-sidebar-cart-tab').removeClass('active');
            $(this).addClass('active');
            
            // Mostrar contenido de la pestaña
            var target = $(this).attr('href');
            $('.snap-sidebar-cart-tab-content').removeClass('active');
            $(target).addClass('active');
        });
    });

})(jQuery);