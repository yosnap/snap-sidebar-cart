/**
 * Script combinado para el carrito lateral con todas las funcionalidades
 * - Navegación de pestañas
 * - Navegación de slider
 * - Manejo de preloader
 * 
 * @since 1.1.1
 */
(function($) {
    "use strict";
    
    // Objeto global para almacenar métodos y estado
    window.snap_sidebar_cart = window.snap_sidebar_cart || {};
    
    // Inicializar cuando el DOM esté listo
    $(document).ready(function() {
        console.log('Snap Sidebar Cart: Script combinado cargado');
        
        // Constantes de tipos de tabs
        const TAB_TYPES = {
            UPSELLS: 'upsells',         // Ventas complementarias
            CROSSSELLS: 'crosssells',   // Ventas cruzadas
            RELATED: 'related',         // Misma categoría/subcategoría
            BESTSELLERS: 'bestsellers', // Más vendidos
            FEATURED: 'featured',       // Destacados
            CUSTOM: 'custom'           // Consulta personalizada
        };
        
        // Cargar pestañas con contenido
        var loadedTabs = {};
        
        // ===========================
        // FUNCIONES PARA LAS PESTAÑAS
        // ===========================
        
        /**
         * Cambia entre pestañas y carga el contenido correspondiente
         */
        function switchTab($tab, forceReload = false) {
            var tabType = $tab.data('tab');
            console.log('Cambiando a pestaña:', tabType);
            
            // Si la pestaña ya está activa y no se fuerza recarga, no hacer nada
            if ($tab.hasClass('active') && !forceReload) {
                console.log('La pestaña ya está activa');
                return;
            }
            
            // 1. Actualizar clases de pestañas
            $('.snap-sidebar-cart__related-tab').removeClass('active');
            $tab.addClass('active');
            
            // 2. Actualizar contenedores visibles
            $('.snap-sidebar-cart__related-container').removeClass('active');
            var $tabContainer = $('.snap-sidebar-cart__related-container[data-content="' + tabType + '"]');
            $tabContainer.addClass('active');
            
            // 3. Cargar productos para esta pestaña si el contenedor está vacío
            var $targetContainer = $tabContainer.find('.snap-sidebar-cart__slider-track');
            
            // Verificar si ya tenemos productos cargados y no se fuerza recarga
            if (!forceReload && loadedTabs[tabType] && $targetContainer.children('.snap-sidebar-cart__related-product').length > 0) {
                console.log('Usando productos en caché para pestaña:', tabType);
                initSliderNavigation($targetContainer);
                return;
            }
            
            // Mostrar preloader
            
            // Obtener configuración del preloader desde los parámetros globales
            var preloaderType = 'circle';
            var preloaderPosition = 'center';
            var preloaderColor = '#3498db';
            var preloaderColor2 = '#e74c3c';
            var preloaderSize = '40px';
            
            // Si existen los parámetros, usarlos
            if (typeof snap_sidebar_cart_params !== 'undefined' && snap_sidebar_cart_params.preloader) {
                preloaderType = snap_sidebar_cart_params.preloader.type || 'circle';
                preloaderPosition = snap_sidebar_cart_params.preloader.position || 'center';
                preloaderColor = snap_sidebar_cart_params.preloader.color || '#3498db';
                preloaderColor2 = snap_sidebar_cart_params.preloader.color2 || '#e74c3c';
                preloaderSize = snap_sidebar_cart_params.preloader.size || '40px';
            }
            
            console.log('snap-sidebar-cart-combined.js - Configuración del preloader:', {
                type: preloaderType,
                position: preloaderPosition,
                color: preloaderColor,
                color2: preloaderColor2,
                size: preloaderSize
            });
            
            // Crear clases del preloader
            var preloaderClasses = 'snap-sidebar-cart__loader-spinner ' + 
                                  'preloader-' + preloaderType + ' ' +
                                  'preloader-position-' + preloaderPosition;
            
            // Crear estilos inline para el preloader
            var inlineStyles = '';
            
            // Aplicar estilos según el tipo de preloader
            if (preloaderType === 'circle') {
                inlineStyles = 'width: ' + preloaderSize + '; ' +
                              'height: ' + preloaderSize + '; ' +
                              'border-color: ' + preloaderColor + '; ' +
                              'border-top-color: ' + preloaderColor2 + ';';
            } else {
                inlineStyles = 'width: ' + preloaderSize + '; ' +
                              'height: ' + preloaderSize + ';';
            }
            
            // Crear el HTML del preloader
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
            
            $targetContainer.html(
                '<div class="snap-sidebar-cart__loading-products">' +
                preloaderHTML +
                '<span>Cargando productos...</span>' +
                '</div>'
            );
            
            // Obtener ID del primer producto en el carrito
            var productId = '';
            $('.snap-sidebar-cart__product').each(function() {
                var pid = $(this).data('product-id');
                if (pid) {
                    productId = pid;
                    return false; // Salir del bucle
                }
            });
            
            if (!productId) {
                console.log('No se encontró ID de producto en el carrito');
                $targetContainer.html('<div class="snap-sidebar-cart__no-products">No hay productos en el carrito para mostrar recomendaciones.</div>');
                $targetContainer.parent().find('.snap-sidebar-cart__slider-nav').hide();
                return;
            }
            
            console.log('Cargando productos para pestaña', tabType, 'con producto ID:', productId);
            
            // Petición AJAX para cargar productos
            $.ajax({
                type: 'POST',
                url: snap_sidebar_cart_params.ajax_url,
                data: {
                    action: 'snap_sidebar_cart_get_related',
                    nonce: snap_sidebar_cart_params.nonce,
                    product_id: productId,
                    type: tabType
                },
                success: function(response) {
                    console.log('Respuesta recibida para pestaña', tabType, ':', response);
                    
                    if (response.success && response.data && response.data.html && response.data.html.trim() !== '') {
                        $targetContainer.html(response.data.html);
                        loadedTabs[tabType] = true; // Marcar pestaña como cargada
                        
                        // Inicializar efectos de hover si es necesario
                        initProductHoverEffects($targetContainer);
                        
                        // Configurar navegación del slider
                        initSliderNavigation($targetContainer);
                    } else {
                        console.log('No se encontraron productos para la pestaña', tabType);
                        $targetContainer.html('<div class="snap-sidebar-cart__no-products">No se encontraron productos para mostrar.</div>');
                        $targetContainer.parent().find('.snap-sidebar-cart__slider-nav').hide();
                    }
                },
                error: function(xhr, status, error) {
                    console.error('Error en petición AJAX:', error);
                    $targetContainer.html(
                        '<div class="snap-sidebar-cart__error">' +
                        'Error al cargar productos. Por favor, inténtalo más tarde.' +
                        '<button class="snap-sidebar-cart__retry-button">Reintentar</button>' +
                        '</div>'
                    );
                    $targetContainer.parent().find('.snap-sidebar-cart__slider-nav').hide();
                    
                    // Agregar funcionalidad para reintentar
                    $targetContainer.find('.snap-sidebar-cart__retry-button').on('click', function() {
                        switchTab($tab, true); // Forzar recarga
                    });
                }
            });
        }
        
        // Exponer la función al objeto global
        window.snap_sidebar_cart.switchTab = switchTab;
        
        // ===========================
        // FUNCIONES PARA EL SLIDER
        // ===========================
        
        /**
         * Inicializa la navegación del slider
         */
        function initSliderNavigation($track) {
            if (!$track || !$track.length) return;
            
            var $items = $track.children('.snap-sidebar-cart__related-product');
            var $sliderContainer = $track.closest('.snap-sidebar-cart__slider');
            var $prevButton = $sliderContainer.find('.snap-sidebar-cart__slider-prev');
            var $nextButton = $sliderContainer.find('.snap-sidebar-cart__slider-next');
            
            // Verificar si hay suficientes productos para necesitar navegación
            if ($items.length === 0) {
                $prevButton.hide();
                $nextButton.hide();
                return;
            }
            
            // Calcular si los elementos ocupan más ancho que el contenedor
            var containerWidth = $track.width();
            var totalItemsWidth = 0;
            
            $items.each(function() {
                totalItemsWidth += $(this).outerWidth(true);
            });
            
            console.log('Ancho total de items:', totalItemsWidth, 'Ancho de contenedor:', containerWidth);
            
            // Mostrar/ocultar navegación según sea necesario
            if (totalItemsWidth <= containerWidth) {
                $prevButton.hide();
                $nextButton.hide();
            } else {
                $prevButton.show();
                $nextButton.show();
                
                // Inicializar estado de botones
                updateButtonState($track);
                
                // Agregar evento de scroll si no existe
                $track.off('scroll.sliderNav').on('scroll.sliderNav', function() {
                    updateButtonState($(this));
                });
            }
        }
        
        /**
         * Actualiza el estado visual de los botones según la posición del scroll
         */
        function updateButtonState($track) {
            if (!$track.length || !$track[0]) return;
            
            var $prevButton = $track.siblings('.snap-sidebar-cart__slider-prev');
            var $nextButton = $track.siblings('.snap-sidebar-cart__slider-next');
            var currentScrollLeft = $track.scrollLeft();
            var maxScrollLeft = $track[0].scrollWidth - $track.outerWidth();
            
            // Actualizar botón anterior
            if (currentScrollLeft <= 0) {
                $prevButton.addClass('disabled').css('opacity', '0.5');
            } else {
                $prevButton.removeClass('disabled').css('opacity', '1');
            }
            
            // Actualizar botón siguiente
            if (currentScrollLeft >= maxScrollLeft - 5) { // 5px margen para redondeo
                $nextButton.addClass('disabled').css('opacity', '0.5');
            } else {
                $nextButton.removeClass('disabled').css('opacity', '1');
            }
        }
        
        /**
         * Inicializa efectos de hover en imágenes de productos
         */
        function initProductHoverEffects($container) {
            // La implementación del efecto hover está principalmente en CSS
            // y en la estructura HTML generada en el servidor
            console.log('Efectos de hover inicializados para productos');
        }
        
        // ===========================
        // REGISTRO DE EVENTOS
        // ===========================
        
        // Delegación de evento para pestañas - usando namespaces para evitar duplicados
        $(document).off('click.tabSwitch').on('click.tabSwitch', '.snap-sidebar-cart__related-tab', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Tab clickeado:', $(this).text());
            switchTab($(this));
        });
        
        // Navegación del slider mejorada
        $(document).off('click.sliderPrev').on('click.sliderPrev', '.snap-sidebar-cart__slider-prev:not(.disabled)', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Botón prev clickeado');
            
            var $track = $(this).siblings('.snap-sidebar-cart__slider-track');
            if (!$track.length) {
                console.error('No se encontró el track del slider');
                return;
            }
            
            // Calcular desplazamiento basado en tamaño de items
            var $item = $track.find('.snap-sidebar-cart__related-product').first();
            if (!$item.length) return;
            
            // Calcular cuántos items son visibles completamente
            var itemWidth = $item.outerWidth(true);
            var visibleItems = Math.floor($track.width() / itemWidth);
            // Usar al menos 1 item o la cantidad visible menos 1
            var itemsToScroll = Math.max(1, visibleItems - 1);
            var scrollAmount = itemWidth * itemsToScroll;
            
            console.log('Desplazando slider ' + itemsToScroll + ' items (' + scrollAmount + 'px) a la izquierda');
            $track.stop().animate({
                scrollLeft: $track.scrollLeft() - scrollAmount
            }, 300, function() {
                // Actualizar estado de botones después de la animación
                updateButtonState($track);
            });
        });
        
        $(document).off('click.sliderNext').on('click.sliderNext', '.snap-sidebar-cart__slider-next:not(.disabled)', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Botón next clickeado');
            
            var $track = $(this).siblings('.snap-sidebar-cart__slider-track');
            if (!$track.length) {
                console.error('No se encontró el track del slider');
                return;
            }
            
            // Calcular desplazamiento basado en tamaño de items
            var $item = $track.find('.snap-sidebar-cart__related-product').first();
            if (!$item.length) return;
            
            // Calcular cuántos items son visibles completamente
            var itemWidth = $item.outerWidth(true);
            var visibleItems = Math.floor($track.width() / itemWidth);
            // Usar al menos 1 item o la cantidad visible menos 1
            var itemsToScroll = Math.max(1, visibleItems - 1);
            var scrollAmount = itemWidth * itemsToScroll;
            
            console.log('Desplazando slider ' + itemsToScroll + ' items (' + scrollAmount + 'px) a la derecha');
            $track.stop().animate({
                scrollLeft: $track.scrollLeft() + scrollAmount
            }, 300, function() {
                // Actualizar estado de botones después de la animación
                updateButtonState($track);
            });
        });
        
        // ===========================
        // INICIALIZACIÓN
        // ===========================
        
        // Inicializar la primera pestaña activa al cargar
        function initFirstActiveTab() {
            var $activeTab = $('.snap-sidebar-cart__related-tab.active');
            if ($activeTab.length) {
                console.log('Inicializando primera pestaña activa:', $activeTab.data('tab'));
                switchTab($activeTab);
            } else {
                // Si no hay pestaña activa, activar la primera
                var $firstTab = $('.snap-sidebar-cart__related-tab').first();
                if ($firstTab.length) {
                    console.log('No hay pestaña activa, activando la primera:', $firstTab.data('tab'));
                    switchTab($firstTab);
                }
            }
        }
        
        // Inicializar todo al cargar la página
        setTimeout(function() {
            initFirstActiveTab();
        }, 300);
        
        // Reinicializar cuando se actualiza el carrito
        $(document.body).on('snap_sidebar_cart_updated', function() {
            console.log('Evento de actualización de carrito detectado - reinicializando');
            
            // Vaciar caché de pestañas
            loadedTabs = {};
            
            // Reinicializar pestaña activa
            setTimeout(function() {
                var $activeTab = $('.snap-sidebar-cart__related-tab.active');
                if ($activeTab.length) {
                    switchTab($activeTab, true); // Forzar recarga
                } else {
                    initFirstActiveTab();
                }
            }, 300);
        });
        
        // Detectar cuando se abre el carrito lateral
        $(document).on('click', snap_sidebar_cart_params.activation_selectors, function() {
            console.log('Carrito abierto - reinicializando componentes');
            setTimeout(function() {
                var $activeTab = $('.snap-sidebar-cart__related-tab.active');
                if ($activeTab.length) {
                    switchTab($activeTab);
                }
            }, 500);
        });
    });
    
})(jQuery);