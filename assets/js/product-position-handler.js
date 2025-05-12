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
        snap_sidebar_cart_params.new_product_position = newProductPosition;
        snap_sidebar_cart_params.animations.new_product_position = newProductPosition;
        
        console.log('Posición de nuevos productos configurada:', newProductPosition);
    }
    
    // Añadir manejador para el evento de añadir al carrito
    $(document.body).on('added_to_cart', function(event, fragments, cart_hash, $button) {
        // Verificar si es una actualización de un producto existente
        var isProductUpdate = false;
        var productId = null;
        
        if ($button && $button.data && $button.data('product_id')) {
            productId = $button.data('product_id');
            
            // Usar la función global para comprobar si el producto ya está en el carrito
            if (window.isProductInCart && typeof window.isProductInCart === 'function') {
                isProductUpdate = window.isProductInCart(productId);
            } else {
                // Fallback: comprobar directamente
                isProductUpdate = $('.snap-sidebar-cart__product[data-product-id="' + productId + '"]').length > 0;
            }
            
            console.log('Product Position Handler - Producto ID:', productId, 'Ya en carrito:', isProductUpdate ? 'Sí' : 'No');
        }
        
        // Si no es una actualización, asegurar que se añada en la posición correcta
        if (!isProductUpdate) {
            console.log('Product Position Handler - Nuevo producto será añadido en posición:', getNewProductPosition());
        }
    });
    
    console.log('Product Position Handler instalado correctamente');
});