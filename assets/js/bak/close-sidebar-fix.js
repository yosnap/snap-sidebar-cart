/**
 * Script específico para corregir el cierre del sidebar al hacer clic fuera
 */
jQuery(document).ready(function($) {
    console.log('Close sidebar fix script cargado');
    
    // Función para cerrar el sidebar
    function closeSidebarFix() {
        console.log('closeSidebarFix ejecutado');
        $('.snap-sidebar-cart').removeClass('open');
        $('.snap-sidebar-cart__overlay').css('display', 'none');
        $('body').removeClass('snap-sidebar-cart-open');
    }
    
    // Evento de clic en el documento (utiliza captura de eventos)
    $(document).on('click', function(e) {
        if ($('.snap-sidebar-cart').hasClass('open')) {
            // Si el clic fue fuera del contenedor del sidebar y no fue en un botón de activación
            if (!$(e.target).closest('.snap-sidebar-cart__container').length && 
                !$(e.target).closest('.add_to_cart_button, .ti-shopping-cart, i.ti-shopping-cart').length) {
                console.log('Clic detectado fuera del sidebar - Ejecutando cierre forzado');
                // Usar setTimeout para asegurarnos de que se ejecuta después de otros eventos
                setTimeout(function() {
                    closeSidebarFix();
                }, 10);
            }
        }
    });
    
    // Cierre directo mediante botón
    $(document).on('click', '.snap-sidebar-cart__close, #snap-sidebar-cart-close', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('Botón cerrar clickeado - Cierre forzado');
        closeSidebarFix();
    });
    
    // Cierre mediante tecla Escape
    $(document).on('keyup', function(e) {
        if (e.key === 'Escape' && $('.snap-sidebar-cart').hasClass('open')) {
            console.log('Tecla Escape detectada - Cierre forzado');
            closeSidebarFix();
        }
    });
    
    // Cierre haciendo clic en el overlay
    $(document).on('click', '.snap-sidebar-cart__overlay', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('Clic en overlay - Cierre forzado');
        closeSidebarFix();
    });
});
