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
    
    /**
     * Función definitiva para abrir el sidebar
     * Esta función tiene prioridad sobre cualquier otra
     */
    function openSidebarDefinitive() {
        console.log('Ejecutando apertura definitiva del sidebar');
        
        // Asegurarnos de que el sidebar existe antes de intentar abrirlo
        if (!$sidebar.length) {
            console.error('Error: No se encontró el elemento del sidebar');
            $sidebar = $('.snap-sidebar-cart'); // Intentar obtenerlo de nuevo
            
            if (!$sidebar.length) {
                console.error('Error: No se pudo encontrar el sidebar después de reintentar');
                return;
            }
        }
        
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
        
        $('body').addClass('snap-sidebar-cart-open');
        
        // Forzar un reflow para asegurar que los cambios se apliquen inmediatamente
        try {
            if ($sidebar[0]) {
                $sidebar[0].offsetHeight;
            }
        } catch (error) {
            console.warn('No se pudo forzar el reflow, pero el sidebar debería mostrarse igualmente');
        }
        
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
        
        $('body').removeClass('snap-sidebar-cart-open');
    }
    
    // Exponer la función globalmente para que otros scripts puedan usarla
    window.openSidebarDefinitive = openSidebarDefinitive;
    window.closeSidebarDefinitive = closeSidebarDefinitive;
    
    // 1. Manejador para los selectores de activación
    $(document).on('click', snap_sidebar_cart_params.activation_selectors, function(e) {
        console.log('Click en selector de activación detectado');
        console.log('Elemento:', e.currentTarget);
        
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
        if ($sidebar.hasClass('open')) {
            var clickedOnSidebar = false;
            var clickedOnTrigger = false;
            
            try {
                // Verificar si se hizo clic en el sidebar
                clickedOnSidebar = $(e.target).closest('.snap-sidebar-cart').length > 0;
                
                // Verificar si se hizo clic en un selector de activación
                if (snap_sidebar_cart_params.activation_selectors) {
                    clickedOnTrigger = $(e.target).closest(snap_sidebar_cart_params.activation_selectors).length > 0;
                }
            } catch (error) {
                console.warn('Error al verificar el objetivo del clic:', error);
            }
            
            if (!clickedOnSidebar && !clickedOnTrigger) {
                console.log('Click fuera del sidebar - Cerrando');
                closeSidebarDefinitive();
            }
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