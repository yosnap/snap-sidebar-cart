/**
 * Solución específica para los problemas de apertura del sidebar
 * Este script tiene prioridad sobre cualquier otro manejador de eventos
 */
jQuery(function($) {
    'use strict';
    
    console.log('=== SIDEBAR OPENER FIX CARGADO ===');
    
    // Asegurarnos de que las variables globales estén definidas
    var $sidebar = $('.snap-sidebar-cart');
    var $overlay = $('.snap-sidebar-cart__overlay');
    var $body = $('body');
    
    /**
     * Función definitiva para abrir el sidebar
     * Esta función tiene prioridad sobre cualquier otra
     */
    function openSidebarDefinitive() {
        console.log('Ejecutando apertura definitiva del sidebar');
        
        // Aplicar estilos directamente para garantizar que se muestre
        $sidebar.addClass('open').css({
            'display': 'block',
            'visibility': 'visible',
            'opacity': '1',
            'transform': 'translateX(0)'
        });
        
        $overlay.css({
            'display': 'block',
            'opacity': '1'
        });
        
        $body.addClass('snap-sidebar-cart-open');
        
        // Forzar un reflow para asegurar que los cambios se apliquen inmediatamente
        $sidebar[0].offsetHeight;
        
        console.log('Sidebar abierto con éxito:', $sidebar.hasClass('open'));
    }
    
    /**
     * Función para cerrar el sidebar
     */
    function closeSidebarDefinitive() {
        console.log('Cerrando sidebar');
        
        $sidebar.removeClass('open').css({
            'transform': 'translateX(100%)'
        });
        
        $overlay.css({
            'display': 'none',
            'opacity': '0'
        });
        
        $body.removeClass('snap-sidebar-cart-open');
    }
    
    // Exponer la función globalmente para que otros scripts puedan usarla
    window.openSidebarDefinitive = openSidebarDefinitive;
    window.closeSidebarDefinitive = closeSidebarDefinitive;
    
    // 1. Manejador para los selectores de activación
    $(document).on('click', snap_sidebar_cart_params.activation_selectors + ', .minicart-header, .snap-sidebar-cart-trigger, .ti-shopping-cart, .cart-contents', function(e) {
        console.log('Click en selector de activación detectado');
        console.log('Elemento:', this);
        
        // No abrir el sidebar si es un botón de variación
        if ($(this).hasClass('product_type_variable') || 
            $(this).hasClass('variations_form') ||
            $(this).closest('.variations_form').length > 0) {
            console.log('Es un botón de variación - No abriendo sidebar');
            return;
        }
        
        // Prevenir comportamiento por defecto
        e.preventDefault();
        e.stopPropagation();
        
        // Abrir el sidebar
        openSidebarDefinitive();
    });
    
    // 2. Manejador para el evento added_to_cart
    $(document.body).on('added_to_cart', function(event, fragments, cart_hash, $button) {
        console.log('Evento added_to_cart detectado');
        
        // Verificar si la apertura automática está habilitada
        var autoOpenValue = snap_sidebar_cart_params.auto_open;
        var shouldAutoOpen = (autoOpenValue === "1" || autoOpenValue === 1 || autoOpenValue === true || autoOpenValue === "true");
        
        console.log('Valor de auto_open:', autoOpenValue, 'Tipo:', typeof autoOpenValue);
        console.log('¿Debería abrirse automáticamente?', shouldAutoOpen);
        
        if (shouldAutoOpen) {
            console.log('Abriendo sidebar automáticamente después de añadir al carrito');
            openSidebarDefinitive();
        }
    });
    
    // 3. Manejador para cerrar el sidebar
    $(document).on('click', '.snap-sidebar-cart__close, .snap-sidebar-cart__overlay', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('Click en botón de cierre o overlay');
        closeSidebarDefinitive();
    });
    
    // 4. Cerrar al hacer clic fuera del sidebar
    $(document).on('click', function(e) {
        if ($sidebar.hasClass('open') && 
            !$(e.target).closest('.snap-sidebar-cart').length && 
            !$(e.target).closest(snap_sidebar_cart_params.activation_selectors).length) {
            
            console.log('Click fuera del sidebar - Cerrando');
            closeSidebarDefinitive();
        }
    });
    
    // 5. Cerrar con la tecla ESC
    $(document).on('keyup', function(e) {
        if (e.key === 'Escape' && $sidebar.hasClass('open')) {
            console.log('Tecla ESC presionada - Cerrando sidebar');
            closeSidebarDefinitive();
        }
    });
    
    console.log('Manejadores de eventos para el sidebar instalados correctamente');
});