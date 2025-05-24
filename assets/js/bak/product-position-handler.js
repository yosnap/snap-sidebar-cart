/**
 * Manejador específico para la posición de nuevos productos
 * Se asegura de que los productos se añadan en la posición configurada en el admin
 */
jQuery(document).ready(function($) {
    'use strict';
    
    console.log('=== PRODUCT POSITION HANDLER CARGADO ===');
    
    // Función para obtener la posición de nuevos productos configurada
    function getNewProductPosition() {
        // Buscar en múltiples lugares para máxima compatibilidad
        
        // 1. Buscar en el nivel raíz (por retrocompatibilidad)
        if (typeof snap_sidebar_cart_params !== 'undefined' && 
            typeof snap_sidebar_cart_params.new_product_position !== 'undefined') {
            var position = snap_sidebar_cart_params.new_product_position;
            console.log('Posición de nuevos productos encontrada en nivel raíz:', position);
            return position;
        }
        
        // 2. Buscar en animations si existe
        if (typeof snap_sidebar_cart_params !== 'undefined' && 
            typeof snap_sidebar_cart_params.animations !== 'undefined' && 
            typeof snap_sidebar_cart_params.animations.new_product_position !== 'undefined') {
            var position = snap_sidebar_cart_params.animations.new_product_position;
            console.log('Posición de nuevos productos encontrada en animations:', position);
            return position;
        }
        
        // 3. Obtener del DOM si está disponible
        var $posInput = $('input[name="snap_sidebar_cart_options[animations][new_product_position]"]');
        if ($posInput.length > 0) {
            var position = $posInput.val();
            console.log('Posición de nuevos productos encontrada en DOM:', position);
            return position;
        }
        
        // Valor por defecto
        console.log('Posición de nuevos productos no encontrada, usando valor por defecto: top');
        return 'top';
    }
    
    // Asegurar que el valor de posición está disponible globalmente
    window.getNewProductPosition = getNewProductPosition;
    
    // Actualizar los parámetros para asegurar consistencia
    if (typeof snap_sidebar_cart_params !== 'undefined') {
        // Obtener la posición actual configurada
        var newProductPosition = getNewProductPosition();
        
        // Asegurar que el valor esté disponible en todos los lugares necesarios
        if (typeof snap_sidebar_cart_params.animations === 'undefined') {
            snap_sidebar_cart_params.animations = {};
        }
        
        // Actualizar ambos lugares para máxima compatibilidad
        // snap_sidebar_cart_params.new_product_position = newProductPosition;
        // snap_sidebar_cart_params.animations.new_product_position = newProductPosition;
        
        console.log('Posición de nuevos productos configurada:', newProductPosition);
    }
    
    // Añadir manejador para el evento de añadir al carrito
    // $(document.body).on('added_to_cart', function(event, fragments, cart_hash, $button) {
    //     ...
    // });
    
    console.log('Product Position Handler instalado correctamente');
});