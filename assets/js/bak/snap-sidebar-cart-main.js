/**
 * Archivo principal del Snap Sidebar Cart
 * 
 * Este archivo coordina todos los módulos del plugin
 * y maneja la inicialización principal.
 * 
 * @since 1.1.0
 */
(function($) {
    'use strict';

    /**
     * Gestor principal del carrito lateral
     */
    var SnapSidebarCart = {
        /**
         * Inicializa el carrito lateral
         */
        init: function() {
            console.log('Inicializando Snap Sidebar Cart v1.1.0');
            
            // Configurar valores CSS para animaciones
            this.setupCssVariables();
            
            // Registrar eventos después de que los módulos estén cargados
            $(document).on('snap_sidebar_cart_modules_loaded', this.bindGlobalEvents.bind(this));
            
            // Cargar módulos
            this.loadModules();
        },
        
        /**
         * Configura variables CSS para animaciones
         */
        setupCssVariables: function() {
            // Cargar valores de configuración
            var animationDuration = 300;
            var animationDelay = 200;
            var sidebarWidth = '540px';
            
            if (window.snap_sidebar_cart_params) {
                if (window.snap_sidebar_cart_params.animations) {
                    animationDuration = parseInt(window.snap_sidebar_cart_params.animations.duration, 10) || 300;
                    animationDelay = parseInt(window.snap_sidebar_cart_params.animations.quantity_update_delay, 10) || 200;
                }
                
                if (window.snap_sidebar_cart_params.styles && window.snap_sidebar_cart_params.styles.sidebar_width) {
                    sidebarWidth = window.snap_sidebar_cart_params.styles.sidebar_width;
                }
            }
            
            // Establecer variables CSS
            document.documentElement.style.setProperty('--animation-duration', animationDuration + 'ms');
            document.documentElement.style.setProperty('--animation-delay', animationDelay + 'ms');
            document.documentElement.style.setProperty('--sidebar-width', sidebarWidth);
        },
        
        /**
         * Carga todos los módulos del carrito lateral
         */
        loadModules: function() {
            // Los módulos ya están cargados a través de los archivos individuales
            // Esta función se mantiene por si en el futuro se necesita cargar módulos dinámicamente
            
            // Notificar que los módulos están cargados
            setTimeout(function() {
                $(document).trigger('snap_sidebar_cart_modules_loaded');
            }, 10);
        },
        
        /**
         * Vincula eventos globales que afectan a múltiples módulos
         */
        bindGlobalEvents: function() {
            var self = this;
            
            // Actualizar cuando cambia el tamaño de la ventana
            $(window).on('resize', function() {
                self.handleResize();
            });
            
            // Comunicación entre módulos
            $(document.body).on('snap_sidebar_cart_opened', function() {
                console.log('Evento: Carrito abierto');
            });
            
            $(document.body).on('snap_sidebar_cart_closed', function() {
                console.log('Evento: Carrito cerrado');
            });
            
            $(document.body).on('snap_sidebar_cart_updated', function() {
                console.log('Evento: Carrito actualizado');
            });
        },
        
        /**
         * Maneja el cambio de tamaño de la ventana
         */
        handleResize: function() {
            // Actualizar navegación de sliders
            if (window.SnapSidebarCartRelated) {
                $('.snap-sidebar-cart__slider-track').each(function() {
                    window.SnapSidebarCartRelated.updateSliderNavigation($(this));
                });
            }
        },
        
        /**
         * Método público para abrir el carrito programáticamente
         */
        open: function() {
            if (window.SnapSidebarCartUI) {
                window.SnapSidebarCartUI.openSidebar();
            }
        },
        
        /**
         * Método público para cerrar el carrito programáticamente
         */
        close: function() {
            if (window.SnapSidebarCartCloseHandler) {
                window.SnapSidebarCartCloseHandler.closeSidebar();
            }
        },
        
        /**
         * Método público para actualizar el contenido del carrito
         */
        refresh: function() {
            if (window.SnapSidebarCartUI) {
                window.SnapSidebarCartUI.loadInitialContent();
            }
        }
    };

    // Inicializar cuando el DOM esté listo
    $(document).ready(function() {
        SnapSidebarCart.init();
    });

    // Exponer para uso global
    window.SnapSidebarCart = SnapSidebarCart;

})(jQuery);
