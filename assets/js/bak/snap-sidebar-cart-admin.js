/**
 * JavaScript para el área de administración
 */
(function($) {
    'use strict';

    $(document).ready(function() {
        // Inicializar los selectores de color
        $('.snap-color-picker').wpColorPicker();
        
        // Manejar las pestañas
        $('.nav-tab').on('click', function(e) {
            e.preventDefault();
            
            var tab = $(this).attr('href').split('tab=')[1];
            
            // Actualizar la URL sin recargar la página
            var newUrl = window.location.href.split('&tab=')[0] + '&tab=' + tab;
            history.pushState({}, '', newUrl);
            
            // Activar la pestaña correcta
            $('.nav-tab').removeClass('nav-tab-active');
            $(this).addClass('nav-tab-active');
            
            // Mostrar la sección correcta
            $('.snap-sidebar-cart-settings-section').hide();
            $('#' + tab + '-settings').show();
        });
    });
})(jQuery);
