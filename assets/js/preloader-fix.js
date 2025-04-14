/**
 * Fix para el preloader - Asegura que respete las opciones configuradas
 */
(function($) {
    "use strict";
    
    $(document).ready(function() {
        console.log('Inicializando fix para el preloader');
        
        // Aplicar variables CSS para el preloader desde las opciones
        function applyPreloaderStyles() {
            if (typeof snap_sidebar_cart_params !== 'undefined' && snap_sidebar_cart_params.preloader) {
                const preloaderOptions = snap_sidebar_cart_params.preloader;
                
                // Agregar variables CSS para el preloader
                document.documentElement.style.setProperty('--preloader-size', preloaderOptions.size || '40px');
                document.documentElement.style.setProperty('--preloader-color', preloaderOptions.color || '#3498db');
                document.documentElement.style.setProperty('--preloader-color2', preloaderOptions.color2 || '#e74c3c');
                
                console.log('Estilos de preloader aplicados:', preloaderOptions);
            }
        }
        
        // Función mejorada para configurar y mostrar el preloader
        function setupAndShowLoader($product) {
            if (!$product || !$product.length) return;
            
            // Obtener las opciones del preloader desde los parámetros
            var preloaderType = 'circle';
            var preloaderPosition = 'center';
            
            if (typeof snap_sidebar_cart_params !== 'undefined' && snap_sidebar_cart_params.preloader) {
                preloaderType = snap_sidebar_cart_params.preloader.type || 'circle';
                preloaderPosition = snap_sidebar_cart_params.preloader.position || 'center';
            }
            
            console.log('Configurando preloader:', preloaderType, 'en posición:', preloaderPosition);
            
            // Preparar el preloader según el tipo
            var $loader = $product.find('.snap-sidebar-cart__loader-spinner');
            
            // Si no existe el loader, crearlo
            if (!$loader.length) {
                var $loaderContainer = $product.find('.snap-sidebar-cart__product-loader');
                
                // Si no existe el contenedor del loader, crearlo
                if (!$loaderContainer.length) {
                    $loaderContainer = $('<div class="snap-sidebar-cart__product-loader"></div>');
                    $product.append($loaderContainer);
                }
                
                $loader = $('<div class="snap-sidebar-cart__loader-spinner"></div>');
                $loaderContainer.append($loader);
            }
            
            // Limpiar clases anteriores
            $loader.attr('class', 'snap-sidebar-cart__loader-spinner');
            
            // Añadir clases según la configuración
            $loader.addClass('preloader-' + preloaderType);
            $loader.addClass('preloader-position-' + preloaderPosition);
            
            // Crear el HTML interno según el tipo de preloader
            if (preloaderType === 'dots') {
                $loader.html('<span></span><span></span><span></span>');
            } else {
                $loader.html('');
            }
            
            // Mostrar el loader
            $product.find('.snap-sidebar-cart__product-loader').css('display', 'flex');
        }
        
        // Sobrescribir la función global original
        window.setupAndShowLoader = setupAndShowLoader;
        
        // Aplicar estilos inmediatamente
        applyPreloaderStyles();
        
        // Volver a aplicar cuando el carrito se actualiza
        $(document.body).on('snap_sidebar_cart_updated', function() {
            applyPreloaderStyles();
        });
    });
    
})(jQuery);
