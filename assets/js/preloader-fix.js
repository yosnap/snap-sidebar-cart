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
                
                // Agregar variables CSS para el preloader con !important para forzar la prioridad
                document.documentElement.style.setProperty('--preloader-size', preloaderOptions.size || '40px', 'important');
                document.documentElement.style.setProperty('--preloader-color', preloaderOptions.color || '#3498db', 'important');
                document.documentElement.style.setProperty('--preloader-color2', preloaderOptions.color2 || '#e74c3c', 'important');
                
                // Aplicar estilos directamente a los elementos existentes
                $('.snap-sidebar-cart__loader-spinner').each(function() {
                    $(this).css({
                        'width': preloaderOptions.size || '40px',
                        'height': preloaderOptions.size || '40px'
                    });
                    
                    // Aplicar colores específicos según el tipo
                    if ($(this).hasClass('preloader-circle') || $(this).hasClass('preloader-square')) {
                        $(this).css('border-top-color', preloaderOptions.color || '#3498db');
                    } else if ($(this).hasClass('preloader-dots')) {
                        $(this).find('span').css('background-color', preloaderOptions.color || '#3498db');
                    }
                });
                
                console.log('Estilos de preloader aplicados:', preloaderOptions);
            }
        }
        
        // Función mejorada para configurar y mostrar el preloader
        function setupAndShowLoader($product) {
            if (!$product || !$product.length) return;
            
            // Obtener las opciones del preloader desde los parámetros
            var preloaderType = 'circle';
            var preloaderPosition = 'center';
            var preloaderSize = '40px';
            var preloaderColor = '#3498db';
            var preloaderColor2 = '#e74c3c';
            
            if (typeof snap_sidebar_cart_params !== 'undefined' && snap_sidebar_cart_params.preloader) {
                const options = snap_sidebar_cart_params.preloader;
                preloaderType = options.type || 'circle';
                preloaderPosition = options.position || 'center';
                preloaderSize = options.size || '40px';
                preloaderColor = options.color || '#3498db';
                preloaderColor2 = options.color2 || '#e74c3c';
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
            
            // Aplicar estilos directamente para evitar conflictos
            $loader.css({
                'width': preloaderSize,
                'height': preloaderSize
            });
            
            // Crear el HTML interno según el tipo de preloader
            if (preloaderType === 'dots') {
                $loader.html('<span></span><span></span><span></span>');
                $loader.find('span').css('background-color', preloaderColor);
            } else if (preloaderType === 'circle' || preloaderType === 'square') {
                $loader.html('');
                $loader.css({
                    'border': '2px solid rgba(0, 0, 0, 0.1)',
                    'border-top': '2px solid ' + preloaderColor
                });
                
                if (preloaderType === 'circle') {
                    $loader.css('border-radius', '50%');
                }
            } else if (preloaderType === 'spinner') {
                $loader.html('');
                // El spinner tiene sus propios pseudoelementos que toman los colores de las variables CSS
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
        
        // También aplicar cuando se abre el carrito
        $(document.body).on('snap_sidebar_cart_opened', function() {
            applyPreloaderStyles();
        });
    });
    
})(jQuery);
