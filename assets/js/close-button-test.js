/**
 * Script para depurar específicamente el botón de cierre
 */
(function($) {
    'use strict';
    
    console.log('=== SNAP SIDEBAR CART CLOSE BUTTON TEST ===');
    
    // Verificar si el botón de cierre existe
    var $closeButton = $('.snap-sidebar-cart__close, #snap-sidebar-cart-close');
    console.log('Close button found: ' + ($closeButton.length > 0 ? 'YES' : 'NO'));
    
    if ($closeButton.length > 0) {
        // Mostrar información sobre el botón
        console.log('Button classes: ' + $closeButton.attr('class'));
        console.log('Button ID: ' + $closeButton.attr('id'));
        console.log('Button HTML: ' + $closeButton.prop('outerHTML'));
        
        // Agregar handler de evento directo para probar
        $closeButton.on('click', function(e) {
            console.log('*** CLOSE BUTTON CLICKED ***');
            e.preventDefault();
            e.stopPropagation();
            
            // Intento manual de cerrar
            $('.snap-sidebar-cart').removeClass('open');
            $('.snap-sidebar-cart__overlay').css('display', 'none');
            $('body').removeClass('snap-sidebar-cart-open');
            
            console.log('Manual close triggered');
        });
        
        // No se agregan botones de prueba
    }
    
    // Agregar evento para el overlay
    var $overlay = $('.snap-sidebar-cart__overlay');
    console.log('Overlay found: ' + ($overlay.length > 0 ? 'YES' : 'NO'));
    
    if ($overlay.length > 0) {
        $overlay.on('click', function(e) {
            console.log('*** OVERLAY CLICKED ***');
            e.preventDefault();
            e.stopPropagation();
            
            // Intento manual de cerrar
            $('.snap-sidebar-cart').removeClass('open');
            $('.snap-sidebar-cart__overlay').css('display', 'none');
            $('body').removeClass('snap-sidebar-cart-open');
            
            console.log('Manual close from overlay triggered');
        });
    }
    
    console.log('=== CLOSE BUTTON TEST COMPLETE ===');
    
})(jQuery);
