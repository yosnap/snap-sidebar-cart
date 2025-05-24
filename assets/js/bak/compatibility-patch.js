/**
 * Parche de compatibilidad para resolver conflictos entre diferentes scripts
 * y asegurar que las funcionalidades clave funcionen correctamente
 */
jQuery(document).ready(function($) {
    'use strict';
    
    // Esperar a que todos los scripts se carguen
    setTimeout(function() {
        console.log('=== PARCHE DE COMPATIBILIDAD APLICADO ===');
        
        // 1. VERIFICAR LA CONFIGURACIÓN
        if (typeof snap_sidebar_cart_params !== 'undefined') {
            console.log('Verificando configuración del carrito...');
            
            // Normalizar auto_open a booleano
            var autoOpenValue = snap_sidebar_cart_params.auto_open;
            snap_sidebar_cart_params.auto_open = (autoOpenValue === true || 
                                                autoOpenValue === "true" || 
                                                autoOpenValue === 1 || 
                                                autoOpenValue === "1");
            
            // Asegurar que la configuración de posición de nuevos productos esté disponible en todas partes
            if (typeof snap_sidebar_cart_params.animations === 'undefined') {
                snap_sidebar_cart_params.animations = {};
            }
            
            // Si no existe en animations pero sí en la raíz
            if (typeof snap_sidebar_cart_params.animations.new_product_position === 'undefined' && 
                typeof snap_sidebar_cart_params.new_product_position !== 'undefined') {
                snap_sidebar_cart_params.animations.new_product_position = snap_sidebar_cart_params.new_product_position;
            } 
            // Si no existe en la raíz pero sí en animations
            else if (typeof snap_sidebar_cart_params.animations.new_product_position !== 'undefined' && 
                    typeof snap_sidebar_cart_params.new_product_position === 'undefined') {
                snap_sidebar_cart_params.new_product_position = snap_sidebar_cart_params.animations.new_product_position;
            }
            // Si no existe en ninguno, establecer valor por defecto
            else if (typeof snap_sidebar_cart_params.animations.new_product_position === 'undefined' && 
                    typeof snap_sidebar_cart_params.new_product_position === 'undefined') {
                snap_sidebar_cart_params.animations.new_product_position = 'top';
                snap_sidebar_cart_params.new_product_position = 'top';
            }
            
            console.log('Configuración final:', snap_sidebar_cart_params);
        }
        
        // 2. COMPROBACIÓN DE FUNCIONES CRÍTICAS
        var criticalFunctions = [
            {name: 'openSidebarDefinitive', fallback: openSidebar},
            {name: 'updateCartItemQuantity', fallback: function() { console.error('Función updateCartItemQuantity no disponible');}},
            {name: 'getCartContent', fallback: function() { console.error('Función getCartContent no disponible');}},
            {name: 'setupAndShowPreloader', fallback: function() { console.error('Función setupAndShowPreloader no disponible');}}
        ];
        
        criticalFunctions.forEach(function(func) {
            if (typeof window[func.name] !== 'function') {
                console.warn('Función crítica ' + func.name + ' no encontrada. Estableciendo función de respaldo.');
                window[func.name] = func.fallback;
            }
        });
        
        // Implementación básica de apertura del sidebar si no existe
        function openSidebar() {
            console.log('Ejecutando apertura del sidebar (respaldo)');
            
            var $sidebar = $('.snap-sidebar-cart');
            var $overlay = $('.snap-sidebar-cart__overlay');
            
            if ($sidebar.length) {
                $sidebar.addClass('open');
                $sidebar.css({
                    'display': 'block',
                    'visibility': 'visible',
                    'opacity': '1',
                    'transform': 'translateX(0)',
                    'right': '0'
                });
                
                $overlay.css({
                    'display': 'block',
                    'opacity': '1'
                });
                
                $('body').addClass('snap-sidebar-cart-open');
                
                console.log('Sidebar abierto con éxito');
            } else {
                console.error('No se encontró el sidebar');
            }
        }
        
        // 3. AJUSTAR EVENTOS
        // Asegurarse de que el manejador de added_to_cart se ejecute correctamente
        $(document.body).on('added_to_cart', function(event, fragments, cart_hash, $button) {
            console.log('Parche: Evento added_to_cart detectado');
            
            if (snap_sidebar_cart_params.auto_open) {
                console.log('Parche: Auto-open habilitado, abriendo sidebar...');
                if (typeof window.openSidebarDefinitive === 'function') {
                    window.openSidebarDefinitive();
                } else {
                    openSidebar();
                }
            } else {
                console.log('Parche: Auto-open deshabilitado');
            }
        });
        
        // 4. AÑADIR PARCHES ESPECÍFICOS
        // Arreglar la apertura manual del carrito (clic en botones)
        $(document).on('click', snap_sidebar_cart_params.activation_selectors, function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('Parche: Clic en selector de activación detectado');
            
            if (typeof window.openSidebarDefinitive === 'function') {
                window.openSidebarDefinitive();
            } else {
                openSidebar();
            }
        });
        
        // Arreglar los botones de cantidad
        $(document).on('click', '.notabutton.quantity-up, .snap-sidebar-cart__quantity-up', function(e) {
            // No preventDefault para no interferir con otros manejadores
            
            var $button = $(this);
            var $product = $button.closest('.snap-sidebar-cart__product');
            
            if ($product.length) {
                console.log('Parche: Botón de aumentar cantidad clickeado');
                // El parche solo registra el evento, deja que los manejadores existentes hagan el trabajo
            }
        });
        
        $(document).on('click', '.notabutton.quantity-down, .snap-sidebar-cart__quantity-down', function(e) {
            // No preventDefault para no interferir con otros manejadores
            
            var $button = $(this);
            var $product = $button.closest('.snap-sidebar-cart__product');
            
            if ($product.length) {
                console.log('Parche: Botón de disminuir cantidad clickeado');
                // El parche solo registra el evento, deja que los manejadores existentes hagan el trabajo
            }
        });
        
        console.log('Parche de compatibilidad completado con éxito');
    }, 500); // Esperar a que otros scripts se carguen
});