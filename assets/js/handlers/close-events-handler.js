/**
 * Maneja los eventos de cierre del sidebar de carrito
 * 
 * Este archivo se encarga de:
 * - Cerrar el sidebar al presionar ESC
 * - Cerrar el sidebar al hacer clic fuera
 * - Cerrar el sidebar con el botón X
 */
(function ($) {
    'use strict';

    /**
     * Controlador de eventos de cierre del carrito
     * 
     * @class CloseEventsHandler
     */
    var CloseEventsHandler = {
        
        /**
         * Inicialización y vinculación de eventos
         */
        init: function() {
            this.bindEvents();
        },

        /**
         * Vincula todos los eventos de cierre
         */
        bindEvents: function() {
            var self = this;
            
            // Cerrar al hacer clic en el botón X
            $(document).on('click', '.snap-sidebar-cart__close, #snap-sidebar-cart-close', function(e) {
                e.preventDefault();
                e.stopPropagation();
                self.closeSidebar();
            });
            
            // Cierre al hacer clic en el overlay
            $(document).on('click', '.snap-sidebar-cart__overlay', function(e) {
                e.preventDefault();
                e.stopPropagation();
                self.closeSidebar();
            });
            
            // Cerrar con tecla ESC - Usando keydown para mejor compatibilidad entre navegadores
            $(document).on('keydown', function(e) {
                if ((e.key === 'Escape' || e.keyCode === 27) && $('.snap-sidebar-cart').hasClass('open')) {
                    e.preventDefault(); // Prevenir comportamiento por defecto
                    self.closeSidebar();
                }
            });
            
            // Cerrar al hacer clic en cualquier parte fuera del sidebar
            $(document).on('mousedown', function(e) {
                var $sidebar = $('.snap-sidebar-cart');
                
                // Solo proceder si el sidebar está abierto
                if (!$sidebar.hasClass('open')) {
                    return;
                }
                
                var $container = $('.snap-sidebar-cart__container');
                var activationSelectors = window.snap_sidebar_cart_params ? 
                    window.snap_sidebar_cart_params.activation_selectors : '.add_to_cart_button';
                
                // Selecciones a excluir (no cerrar si hacemos clic en estos elementos)
                var $excludeElements = $(activationSelectors)
                    .add($sidebar)
                    .add('.modal')  // Excluimos modales de WooCommerce
                    .add('.mfp-wrap') // Excluimos popups de Magnific Popup
                    .add('#wpwrap'); // Excluir la UI de admin de WordPress
                
                // Verificar si el clic fue dentro de un área excluida
                var clickedInExcluded = false;
                $excludeElements.each(function() {
                    if ($(this).length && $.contains(this, e.target)) {
                        clickedInExcluded = true;
                        return false; // Salir del bucle
                    }
                });
                
                // Si el clic no está en el sidebar ni en un elemento excluido, cerrar
                if (!clickedInExcluded &&
                    !$(e.target).closest($container).length && 
                    !$(e.target).closest(activationSelectors).length) {
                    self.closeSidebar();
                }
            });
            
            // Evitar que los clics dentro del sidebar lo cierren
            $('.snap-sidebar-cart').on('click', function(e) {
                e.stopPropagation();
            });
            
            // Evitar cerrar cuando se hace clic dentro del contenedor
            $('.snap-sidebar-cart__container').on('click', function(e) {
                e.stopPropagation();
            });
            
            // Fijo para dispositivos táctiles - cerrar explícitamente con toques en el overlay
            $(document).on('touchstart', '.snap-sidebar-cart__overlay', function(e) {
                e.preventDefault();
                e.stopPropagation();
                self.closeSidebar();
            });
        },
        
        /**
         * Cierra el sidebar
         */
        closeSidebar: function() {
            $('.snap-sidebar-cart').removeClass('open');
            $('.snap-sidebar-cart__overlay').hide();
            $('body').removeClass('snap-sidebar-cart-open');
            
            // Disparar evento para notificar que se cerró el sidebar
            $(document.body).trigger('snap_sidebar_cart_closed');
        }
    };

    // Inicializar cuando el DOM esté listo
    $(document).ready(function() {
        CloseEventsHandler.init();
    });

    // Exportar para uso en otros scripts
    window.SnapSidebarCartCloseHandler = CloseEventsHandler;

})(jQuery);
