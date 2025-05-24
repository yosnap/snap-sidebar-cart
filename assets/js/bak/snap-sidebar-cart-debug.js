/**
 * Script de depuración para Snap Sidebar Cart
 * 
 * Este script verifica la carga de todos los módulos y reporta su estado
 */
(function($) {
    'use strict';
    
    console.log('=== SNAP SIDEBAR CART DEBUG ===');
    console.log('Version: ' + (window.snap_sidebar_cart_params ? window.snap_sidebar_cart_params.version : 'Unknown'));
    
    // Verificar parámetros
    console.log('Parameters loaded: ' + (window.snap_sidebar_cart_params ? 'YES' : 'NO'));
    if (window.snap_sidebar_cart_params) {
        console.log('Activation selectors: ' + window.snap_sidebar_cart_params.activation_selectors);
        console.log('Auto open: ' + window.snap_sidebar_cart_params.auto_open);
        console.log('New product position: ' + window.snap_sidebar_cart_params.new_product_position);
    }
    
    // Verificar si los módulos están cargados
    console.log('Main module loaded: ' + (typeof window.SnapSidebarCart !== 'undefined' ? 'YES' : 'NO'));
    console.log('UI module loaded: ' + (typeof window.SnapSidebarCartUI !== 'undefined' ? 'YES' : 'NO'));
    console.log('Close module loaded: ' + (typeof window.SnapSidebarCartCloseHandler !== 'undefined' ? 'YES' : 'NO'));
    console.log('Quantity module loaded: ' + (typeof window.SnapSidebarCartQuantity !== 'undefined' ? 'YES' : 'NO'));
    console.log('Related module loaded: ' + (typeof window.SnapSidebarCartRelated !== 'undefined' ? 'YES' : 'NO'));
    
    // Verificar elementos DOM
    console.log('Sidebar element: ' + ($('.snap-sidebar-cart').length ? 'Found' : 'Not found'));
    console.log('Sidebar container: ' + ($('.snap-sidebar-cart__container').length ? 'Found' : 'Not found'));
    console.log('Close button: ' + ($('.snap-sidebar-cart__close').length ? 'Found' : 'Not found'));
    console.log('Overlay: ' + ($('.snap-sidebar-cart__overlay').length ? 'Found' : 'Not found'));
    
    // Reportar los activadores configurados
    if (window.snap_sidebar_cart_params && window.snap_sidebar_cart_params.activation_selectors) {
        console.log('Activation elements found: ' + $(window.snap_sidebar_cart_params.activation_selectors).length);
    }
    
    // Verificar eventos
    console.log('Trying to bind test events...');
    
    // Para depuración: agregar eventos de prueba
    $(document).on('snap_sidebar_cart_opened', function() {
        console.log('Event detected: snap_sidebar_cart_opened');
    });
    
    $(document).on('snap_sidebar_cart_closed', function() {
        console.log('Event detected: snap_sidebar_cart_closed');
    });
    
    $(document).on('snap_sidebar_cart_updated', function() {
        console.log('Event detected: snap_sidebar_cart_updated');
    });
    
    // Intentar agregar eventos personalizados a los botones
    $('.snap-sidebar-cart__close').on('click', function() {
        console.log('Close button clicked directly');
    });
    
    // Código de depuración sin botones de prueba
    
    console.log('=== DEBUG INITIALIZATION COMPLETE ===');

})(jQuery);
