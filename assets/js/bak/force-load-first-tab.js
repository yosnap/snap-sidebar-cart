/**
 * Script independiente para forzar la carga de la primera pestaña del sidebar
 * Este script se ejecuta de forma aislada para evitar conflictos con otros scripts
 */
(function($) {
    'use strict';

    // Ejecutar cuando el DOM esté listo
    $(document).ready(function() {
        console.log('=== FORCE LOAD FIRST TAB SCRIPT LOADED ===');
        
        // Función para cargar la primera pestaña
        function forceLoadFirstTab() {
            console.log('Ejecutando forceLoadFirstTab()');
            
            // Verificar si el sidebar está abierto
            if (!$('.snap-sidebar-cart').hasClass('open')) {
                console.log('El sidebar no está abierto, no se cargará la pestaña');
                return;
            }
            
            // Verificar si hay productos en el carrito
            var hasProducts = $('.snap-sidebar-cart__product').length > 0;
            
            if (!hasProducts) {
                console.log('No hay productos en el carrito, ocultando pestañas');
                $('.snap-sidebar-cart__related-tabs').hide();
                $('.snap-sidebar-cart__related-content').hide();
                return;
            }
            
            // Mostrar las pestañas
            $('.snap-sidebar-cart__related-tabs').show();
            $('.snap-sidebar-cart__related-content').show();
            
            // Obtener todas las pestañas
            var $tabs = $('.snap-sidebar-cart__related-tab');
            console.log('Número de pestañas encontradas:', $tabs.length);
            
            if ($tabs.length === 0) {
                console.log('No se encontraron pestañas');
                return;
            }
            
            // Si no hay pestañas activas, activar la primera
            if ($('.snap-sidebar-cart__related-tab.active').length === 0) {
                $tabs.first().addClass('active');
                console.log('Activando primera pestaña:', $tabs.first().data('tab'));
            }
            
            // Obtener la pestaña activa
            var $activeTab = $('.snap-sidebar-cart__related-tab.active');
            
            if ($activeTab.length) {
                var activeTabType = $activeTab.data('tab');
                console.log('Forzando carga de productos para pestaña:', activeTabType);
                
                // Asegurar que todas las pestañas inactivas estén desactivadas
                $('.snap-sidebar-cart__related-tab').not($activeTab).removeClass('active');
                $('.snap-sidebar-cart__related-container').removeClass('active');
                
                // Obtener el contenedor y track correspondientes
                var $activeContainer = $('.snap-sidebar-cart__related-container[data-content="' + activeTabType + '"]');
                $activeContainer.addClass('active'); // Asegurar que esté activo
                console.log('Contenedor activo:', $activeContainer.length ? 'Encontrado' : 'No encontrado');
                
                var $activeTrack = $activeContainer.find('.snap-sidebar-cart__slider-track');
                console.log('Track activo:', $activeTrack.length ? 'Encontrado' : 'No encontrado');
                
                // Verificar si el track ya tiene productos
                var hasLoadedProducts = $activeTrack.children('.snap-sidebar-cart__related-product').not('.snap-sidebar-cart__loading-products').length > 0;
                console.log('El track ya tiene productos:', hasLoadedProducts);
                
                // Solo cargar si no hay productos o si está vacío
                if (!hasLoadedProducts || $activeTrack.is(':empty')) {
                    console.log('Recargando productos...');
                    
                    // Obtener ID del último producto en el carrito
                    var productId = '';
                    var $products = $('.snap-sidebar-cart__product');
                    
                    // Obtener el último producto (el más reciente añadido)
                    var $lastProduct = $products.last();
                    productId = $lastProduct.data('product-id');
                    console.log('Usando el último producto del carrito (ID:', productId, ')');
                    
                    // Crear un preloader único centrado (sin columnas)
                    console.log('Creando preloader único centrado con las clases correctas');
                    
                    // Obtener configuración del preloader desde los parámetros
                    var preloaderType = 'dots'; // Tipo predeterminado para asegurar que se muestren los puntos morados
                    var preloaderPosition = 'center';
                    var preloaderColor = '#9b59b6'; // Color morado predeterminado
                    var preloaderColor2 = '#8e44ad';
                    var preloaderSize = '40px';
                    
                    // Si existen los parámetros, usarlos
                    if (typeof snap_sidebar_cart_params !== 'undefined' && snap_sidebar_cart_params.preloader) {
                        preloaderType = snap_sidebar_cart_params.preloader.type || 'dots';
                        preloaderPosition = snap_sidebar_cart_params.preloader.position || 'center';
                        preloaderColor = snap_sidebar_cart_params.preloader.color || '#9b59b6';
                        preloaderColor2 = snap_sidebar_cart_params.preloader.color2 || '#8e44ad';
                        preloaderSize = snap_sidebar_cart_params.preloader.size || '40px';
                    }
                    
                    // Crear clases del preloader (usando las mismas clases que en related-products-handler.js)
                    var preloaderClasses = 'snap-sidebar-cart__loader-spinner ' + 
                                          'preloader-' + preloaderType + ' ' +
                                          'preloader-position-' + preloaderPosition;
                    
                    // Crear estilos inline para el preloader
                    var inlineStyles = '';
                    
                    // Aplicar estilos según el tipo de preloader
                    if (preloaderType === 'circle' || preloaderType === 'spinner') {
                        inlineStyles = 'width: ' + preloaderSize + '; ' +
                                      'height: ' + preloaderSize + '; ' +
                                      'border-color: ' + preloaderColor + '; ' +
                                      'border-top-color: ' + preloaderColor2 + ';';
                    } else {
                        inlineStyles = 'width: ' + preloaderSize + '; ' +
                                      'height: ' + preloaderSize + ';';
                    }
                    
                    // Crear el HTML del preloader con estilos inline
                    var preloaderHTML = '<div class="' + preloaderClasses + '" style="' + inlineStyles + '"';
                    
                    // Añadir contenido específico según el tipo de preloader
                    if (preloaderType === 'dots') {
                        preloaderHTML += '><span style="background-color: ' + preloaderColor + ';"></span>' +
                                       '<span style="background-color: ' + preloaderColor + ';"></span>' +
                                       '<span style="background-color: ' + preloaderColor + ';"></span>';
                    } else {
                        preloaderHTML += '>';
                    }
                    
                    // Cerrar la etiqueta div
                    preloaderHTML += '</div>';
                    
                    // Crear un único preloader centrado (sin columnas)
                    $activeTrack.html(
                        '<div class="snap-sidebar-cart__loading-products">' +
                        preloaderHTML +
                        '<span>Cargando productos...</span>' +
                        '</div>'
                    );
                    
                    // Hacer la petición AJAX directamente
                    $.ajax({
                        type: 'POST',
                        url: snap_sidebar_cart_params.ajax_url,
                        data: {
                            action: 'snap_sidebar_cart_get_related',
                            nonce: snap_sidebar_cart_params.nonce,
                            product_id: productId,
                            type: activeTabType
                        },
                        success: function(response) {
                            console.log('Respuesta AJAX recibida');
                            if (response.success && response.data && response.data.html) {
                                $activeTrack.html(response.data.html);
                                
                                // Inicializar navegación si existe la función
                                if (typeof fixSliderNavigation === 'function') {
                                    setTimeout(fixSliderNavigation, 100);
                                }
                            } else {
                                $activeTrack.html('<div class="snap-sidebar-cart__no-products">No se encontraron productos para mostrar.</div>');
                            }
                        },
                        error: function(xhr, status, error) {
                            console.error('Error AJAX:', error);
                            $activeTrack.html('<div class="snap-sidebar-cart__error">Error al cargar productos. <a href="#" class="retry-load">Reintentar</a></div>');
                            
                            // Agregar handler para reintentar
                            $activeTrack.find('.retry-load').on('click', function(e) {
                                e.preventDefault();
                                forceLoadFirstTab();
                            });
                        }
                    });
                } else {
                    console.log('No es necesario recargar, ya hay productos');
                }
            } else {
                console.log('No se encontró ninguna pestaña activa');
            }
        }
        
        // Escuchar el evento de apertura del sidebar
        $(document).on('snap_sidebar_cart_opened', function() {
            console.log('Evento snap_sidebar_cart_opened detectado');
            
            // Pequeño retraso para asegurar que el DOM está completamente cargado
            setTimeout(forceLoadFirstTab, 500);
        });
        
        // Verificar periódicamente si el sidebar está abierto (para casos donde el evento no se dispara)
        var checkInterval = setInterval(function() {
            if ($('.snap-sidebar-cart').hasClass('open')) {
                console.log('Sidebar detectado como abierto por intervalo');
                forceLoadFirstTab();
                clearInterval(checkInterval); // Detener el intervalo una vez que se ha detectado
            }
        }, 1000);
        
        // También ejecutar cuando se hace clic en el trigger del sidebar
        $(document).on('click', '.snap-sidebar-cart-trigger', function() {
            console.log('Clic en trigger del sidebar detectado');
            
            // Pequeño retraso para asegurar que el sidebar se ha abierto
            setTimeout(forceLoadFirstTab, 500);
        });
        
        // Ejecutar inmediatamente si el sidebar ya está abierto
        if ($('.snap-sidebar-cart').hasClass('open')) {
            console.log('Sidebar ya está abierto al cargar la página');
            setTimeout(forceLoadFirstTab, 500);
        }
    });
    
})(jQuery);