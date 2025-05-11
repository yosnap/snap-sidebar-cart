/**
 * Script de depuración para identificar problemas con la apertura del sidebar
 */
jQuery(function($) {
    'use strict';
    
    console.log('=== DEBUG SIDEBAR CARGADO ===');
    console.log('Verificando configuración:', snap_sidebar_cart_params);
    
    // Verificar si los selectores de activación están definidos correctamente
    console.log('Selectores de activación:', snap_sidebar_cart_params.activation_selectors);
    
    // Verificar si el sidebar existe en el DOM
    var $sidebar = $('.snap-sidebar-cart');
    console.log('Sidebar encontrado:', $sidebar.length > 0 ? 'Sí' : 'No');
    
    // Verificar si hay elementos que coincidan con los selectores de activación
    var activationSelectors = snap_sidebar_cart_params.activation_selectors.split(',');
    activationSelectors.forEach(function(selector) {
        selector = selector.trim();
        var $elements = $(selector);
        console.log('Elementos para selector "' + selector + '":', $elements.length);
    });
    
    // Agregar manejador de eventos directo para los selectores de activación
    $(document).on('click', snap_sidebar_cart_params.activation_selectors + ', .minicart-header', function(e) {
        console.log('=== CLICK EN ACTIVADOR DETECTADO (DEBUG) ===');
        console.log('Elemento clickeado:', this);
        console.log('Clases del elemento:', $(this).attr('class'));
        
        // Forzar apertura del sidebar
        $('.snap-sidebar-cart').addClass('open');
        $('.snap-sidebar-cart__overlay').css('display', 'block');
        $('body').addClass('snap-sidebar-cart-open');
        
        console.log('Sidebar abierto forzadamente');
        
        // Prevenir comportamiento por defecto solo si no es un botón de variación
        if (!$(this).hasClass('product_type_variable') && !$(this).hasClass('variations_form')) {
            e.preventDefault();
            e.stopPropagation();
        }
    });
    
    // Verificar también el evento added_to_cart
    $(document.body).on('added_to_cart', function(event, fragments, cart_hash, $button) {
        console.log('=== EVENTO ADDED_TO_CART DETECTADO (DEBUG) ===');
        
        // Verificar configuración de apertura automática
        var autoOpenValue = snap_sidebar_cart_params.auto_open;
        var shouldAutoOpen = (autoOpenValue === "1" || autoOpenValue === 1 || autoOpenValue === true || autoOpenValue === "true");
        
        console.log('Valor de auto_open:', autoOpenValue, 'Tipo:', typeof autoOpenValue);
        console.log('¿Debería abrirse automáticamente?', shouldAutoOpen);
        
        if (shouldAutoOpen) {
            console.log('Abriendo sidebar automáticamente...');
            
            // Forzar apertura del sidebar
            $('.snap-sidebar-cart').addClass('open');
            $('.snap-sidebar-cart__overlay').css('display', 'block');
            $('body').addClass('snap-sidebar-cart-open');
            
            console.log('Sidebar abierto forzadamente');
        }
    });
    
    // Verificar si hay otros scripts que puedan estar interfiriendo
    console.log('Scripts cargados:');
    $('script').each(function() {
        var src = $(this).attr('src');
        if (src && src.indexOf('snap-sidebar-cart') !== -1) {
            console.log('- ' + src);
        }
    });
});