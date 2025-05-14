/**
 * Fix directo para los problemas de tabs y navegación del slider
 * Este script anula cualquier otro manejador de eventos y aplica soluciones directas
 */
jQuery(document).ready(function($) {
    console.log('Direct Fix cargado - Solucionando tabs y navegación');
    
    // Función para verificar si el carrito está abierto y cargar la primera pestaña
    function checkCartOpenAndLoadTab() {
        if ($('.snap-sidebar-cart').hasClass('open')) {
            console.log('Carrito detectado como abierto - Verificando productos');
            
            // Verificar si hay productos en el carrito
            var hasProducts = $('.snap-sidebar-cart__product').length > 0;
            
            if (hasProducts) {
                console.log('Hay productos en el carrito, cargando productos relacionados');
                forceLoadFirstTab();
            } else {
                console.log('No hay productos en el carrito, no se mostrarán pestañas');
                // Ocultar la sección de pestañas si no hay productos
                $('.snap-sidebar-cart__related-tabs').hide();
                $('.snap-sidebar-cart__related-content').hide();
            }
        }
    }
    
    // Cargar productos inmediatamente al abrir el carrito
    $(document).on('snap_sidebar_cart_opened', function() {
        console.log('Evento snap_sidebar_cart_opened detectado');
        
        // Pequeño retraso para asegurar que el DOM está completamente cargado
        setTimeout(checkCartOpenAndLoadTab, 300);
    });
    
    // Verificar periódicamente si el carrito está abierto (para capturar aperturas que no disparan el evento)
    var checkInterval = setInterval(function() {
        if ($('.snap-sidebar-cart').hasClass('open')) {
            console.log('Carrito detectado como abierto por intervalo');
            checkCartOpenAndLoadTab();
            clearInterval(checkInterval); // Detener el intervalo una vez que se ha detectado
        }
    }, 500);
    
    // Solución inmediata - Retrasar para asegurar que el DOM esté completamente cargado
    setTimeout(function() {
        fixTabs();
        fixSliderNavigation();
        
        // Forzar carga inicial si el carrito ya está abierto
        if ($('.snap-sidebar-cart').hasClass('open')) {
            forceLoadFirstTab();
        }
    }, 500);
    
    // Forzar carga de la primera pestaña
    function forceLoadFirstTab() {
        console.log('==== FORZANDO CARGA DE PRIMERA PESTAÑA ====');
        
        // Verificar si hay productos en el carrito
        var hasProducts = $('.snap-sidebar-cart__product').length > 0;
        
        if (!hasProducts) {
            console.log('No hay productos en el carrito, no se mostrarán pestañas');
            $('.snap-sidebar-cart__related-tabs').hide();
            $('.snap-sidebar-cart__related-content').hide();
            return;
        }
        
        // Mostrar las pestañas si hay productos
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
                
                console.log('ID del producto para cargar relacionados:', productId, 'Tipo de pestaña:', activeTabType);
                
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
                    beforeSend: function() {
                        // Usar el HTML de carga del admin
                        if (typeof snap_sidebar_cart_params !== 'undefined' && snap_sidebar_cart_params.loading_html) {
                            $activeTrack.html(snap_sidebar_cart_params.loading_html);
                        } else {
                            $activeTrack.html('<p>Cargando productos relacionados...</p>');
                        }
                    },
                    success: function(response) {
                        console.log('Respuesta AJAX recibida:', response);
                        if (response.success && response.data && response.data.html) {
                            $activeTrack.html(response.data.html);
                            
                            // Inicializar navegación
                            setTimeout(fixSliderNavigation, 100);
                        } else {
                            $activeTrack.html('<p>No se encontraron productos para mostrar.</p>');
                        }
                    },
                    error: function(xhr, status, error) {
                        console.error('Error AJAX:', error);
                        $activeTrack.html('<p>Error al cargar productos. <a href="#" class="retry-load">Reintentar</a></p>');
                        
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
    
    /**
     * Arreglar las pestañas de productos relacionados
     */
    function fixTabs() {
        console.log('==== DIAGNÓSTICO DE TABS ====');
        console.log('Aplicando fix para tabs');
        console.log('Número de tabs encontrados:', $('.snap-sidebar-cart__related-tab').length);
        
        // Quitar todos los handlers de click existentes
        $('.snap-sidebar-cart__related-tab').off('click');
        
        // Aplicar nuevos handlers
        $('.snap-sidebar-cart__related-tab').on('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            var $clickedTab = $(this);
            var tabType = $clickedTab.data('tab');
            
            console.log('==== DIAGNÓSTICO DE CLICK EN TAB ====');
            console.log('Tab clickeado:', tabType);
            console.log('Tab tiene clase active:', $clickedTab.hasClass('active'));
            
            // 1. Cambiar estado activo de tabs
            $('.snap-sidebar-cart__related-tab').removeClass('active');
            $clickedTab.addClass('active');
            
            // 2. Mostrar el contenedor correspondiente
            $('.snap-sidebar-cart__related-container').removeClass('active');
            var $targetContainer = $('.snap-sidebar-cart__related-container[data-content="' + tabType + '"]');
            $targetContainer.addClass('active');
            
            console.log('Target container encontrado:', $targetContainer.length > 0);
            console.log('Target container ID:', $targetContainer.attr('id') || 'No tiene ID');
            console.log('Target container data-content:', $targetContainer.data('content'));
            
            var $track = $targetContainer.find('.snap-sidebar-cart__slider-track');
            console.log('Track encontrado:', $track.length > 0);
            console.log('Track tiene productos:', $track.children('.snap-sidebar-cart__related-product').length);
            
            // 3. Cargar productos si el contenedor está vacío
            if ($track.children('.snap-sidebar-cart__related-product').length === 0) {
                console.log('DIAGNÓSTICO: Track vacío, cargando productos para pestaña ' + tabType);
                loadRelatedProducts(tabType, $track);
            } else {
                console.log('DIAGNÓSTICO: Track ya tiene productos, no es necesario cargar');
            }
        });
        
        // Activar la primera pestaña por defecto
        console.log('==== DIAGNÓSTICO DE ACTIVACIÓN DE PRIMERA PESTAÑA ====');
        var $activeTab = $('.snap-sidebar-cart__related-tab.active');
        console.log('Tab activa encontrada:', $activeTab.length > 0);
        
        if (!$activeTab.length) {
            console.log('No hay tab activa, activando la primera');
            $activeTab = $('.snap-sidebar-cart__related-tab').first().addClass('active');
            console.log('Primera tab activada:', $activeTab.length > 0);
        }
        
        // FORZAR la carga de productos de la primera pestaña SIEMPRE
        if ($activeTab.length) {
            var activeTabType = $activeTab.data('tab');
            var $activeContainer = $('.snap-sidebar-cart__related-container[data-content="' + activeTabType + '"]');
            var $activeTrack = $activeContainer.find('.snap-sidebar-cart__slider-track');
            
            console.log('==== DIAGNÓSTICO DE CARGA INICIAL ====');
            console.log('FORZANDO carga de productos de la primera pestaña:', activeTabType);
            console.log('Container activo encontrado:', $activeContainer.length > 0);
            console.log('Container activo ID:', $activeContainer.attr('id') || 'No tiene ID');
            console.log('Container activo data-content:', $activeContainer.data('content'));
            console.log('Track activo encontrado:', $activeTrack.length > 0);
            console.log('Track activo selector:', $activeTrack.selector || 'No disponible');
            console.log('Track activo HTML inicial:', $activeTrack.html());
            
            // Activar el contenedor correspondiente
            $('.snap-sidebar-cart__related-container').removeClass('active');
            $activeContainer.addClass('active');
            console.log('Container activado, tiene clase active:', $activeContainer.hasClass('active'));
            
            // Vaciar el track para asegurar que se cargue de nuevo
            $activeTrack.empty();
            console.log('Track vaciado, contenido actual:', $activeTrack.html());
            
            // Cargar productos SIEMPRE, sin verificar si está vacío
            console.log('Llamando a loadRelatedProducts para la primera pestaña');
            loadRelatedProducts(activeTabType, $activeTrack);
        } else {
            console.log('ERROR: No se encontró ninguna pestaña activa para cargar productos');
        }
    }
    
    /**
     * Cargar productos relacionados para una pestaña
     */
    function loadRelatedProducts(tabType, $targetTrack) {
        console.log('==== DIAGNÓSTICO DE CARGA ====');
        console.log('Direct-fix: Cargando productos relacionados para la pestaña:', tabType);
        console.log('Target Track existe:', $targetTrack.length > 0);
        console.log('Target Track selector:', $targetTrack.selector || 'No disponible');
        console.log('Target Track HTML inicial:', $targetTrack.html());
        console.log('Target Track parent:', $targetTrack.parent().attr('class'));
        
        // Mostrar loader con la configuración del admin
        if (typeof snap_sidebar_cart_params !== 'undefined' && snap_sidebar_cart_params.loading_html) {
            // Usar el HTML de carga proporcionado por el sistema
            console.log('DIAGNÓSTICO: Usando HTML de carga del admin');
            $targetTrack.html(snap_sidebar_cart_params.loading_html);
        } else {
            // Fallback simple si no hay HTML de carga disponible
            console.log('DIAGNÓSTICO: No se encontró HTML de carga del admin, usando fallback');
            $targetTrack.html('<p>Cargando productos relacionados...</p>');
        }
        
        // Obtener ID del primer producto en el carrito
        var productId = '';
        $('.snap-sidebar-cart__product').each(function() {
            var pid = $(this).data('product-id');
            if (pid) {
                productId = pid;
                return false; // break
            }
        });
        
        // Usar un ID de producto de ejemplo si no hay productos en el carrito (solo para desarrollo)
        if (!productId) {
            console.log('No hay productos en el carrito, usando ID de ejemplo para desarrollo');
            productId = $('.snap-sidebar-cart').data('example-product-id') || 123; // ID de ejemplo o 123 como fallback
        }
        
        // Datos para la petición AJAX
        var ajaxData = {
            action: 'snap_sidebar_cart_get_related',
            nonce: snap_sidebar_cart_params.nonce,
            product_id: productId,
            type: tabType
        };
        
        console.log('DIAGNÓSTICO: Enviando petición AJAX con datos:', ajaxData);
        console.log('DIAGNÓSTICO: URL de AJAX:', snap_sidebar_cart_params.ajax_url);
        
        // Hacer la petición AJAX
        $.ajax({
            type: 'POST',
            url: snap_sidebar_cart_params.ajax_url,
            data: ajaxData,
            beforeSend: function() {
                console.log('DIAGNÓSTICO: Iniciando petición AJAX para pestaña ' + tabType);
            },
            success: function(response) {
                console.log('DIAGNÓSTICO: Respuesta AJAX recibida para pestaña ' + tabType + ':', response);
                
                if (response.success && response.data && response.data.html) {
                    console.log('DIAGNÓSTICO: Respuesta exitosa con HTML, longitud:', response.data.html.length);
                    
                    // Aplicar el HTML al contenedor
                    $targetTrack.html(response.data.html);
                    
                    // Verificar si se aplicó correctamente el HTML
                    console.log('DIAGNÓSTICO: HTML después de aplicar:', $targetTrack.html().length);
                    console.log('DIAGNÓSTICO: Número de productos cargados:', $targetTrack.children('.snap-sidebar-cart__related-product').length);
                    
                    // Inicializar navegación
                    setTimeout(function() {
                        console.log('DIAGNÓSTICO: Aplicando navegación del slider para pestaña ' + tabType);
                        fixSliderNavigation();
                    }, 100);
                } else {
                    console.log('DIAGNÓSTICO: Respuesta sin HTML o con error para pestaña ' + tabType + ':', response);
                    $targetTrack.html('<p>No se encontraron productos para mostrar.</p>');
                }
            },
            error: function(xhr, status, error) {
                console.log('DIAGNÓSTICO: Error en petición AJAX para pestaña ' + tabType + ':', status, error);
                console.log('DIAGNÓSTICO: Respuesta de error:', xhr.responseText);
                
                $targetTrack.html('<p>Error al cargar productos. <a href="#" class="retry-load">Reintentar</a></p>');
                
                // Agregar handler para reintentar
                $targetTrack.find('.retry-load').on('click', function(e) {
                    e.preventDefault();
                    console.log('DIAGNÓSTICO: Reintentando carga para pestaña ' + tabType);
                    loadRelatedProducts(tabType, $targetTrack);
                });
            }
        });
        
        if (!productId) {
            $targetTrack.html('<p>No hay productos en el carrito para mostrar recomendaciones.</p>');
            return;
        }
        
        // Hacer la petición AJAX
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
                if (response.success && response.data && response.data.html) {
                    $targetTrack.html(response.data.html);
                    
                    // Inicializar navegación
                    setTimeout(fixSliderNavigation, 100);
                } else {
                    $targetTrack.html('<p>No se encontraron productos para mostrar.</p>');
                }
            },
            error: function() {
                $targetTrack.html('<p>Error al cargar productos. <a href="#" class="retry-load">Reintentar</a></p>');
                
                // Agregar handler para reintentar
                $targetTrack.find('.retry-load').on('click', function(e) {
                    e.preventDefault();
                    loadRelatedProducts(tabType, $targetTrack);
                });
            }
        });
    }
    
    /**
     * Arreglar la navegación del slider
     */
    function fixSliderNavigation() {
        console.log('Aplicando fix para navegación del slider');
        
        // Quitar todos los handlers de click existentes
        $('.snap-sidebar-cart__slider-nav').off('click');
        
        // Aplicar nuevos handlers
        $('.snap-sidebar-cart__slider-prev').on('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Botón PREV clickeado');
            
            var $track = $(this).siblings('.snap-sidebar-cart__slider-track');
            if (!$track.length) return;
            
            // Calcular scroll
            var scrollDistance = $track.width() * 0.8; // 80% del ancho visible
            
            // Animar scroll
            $track.animate({
                scrollLeft: Math.max(0, $track.scrollLeft() - scrollDistance)
            }, 300);
        });
        
        $('.snap-sidebar-cart__slider-next').on('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Botón NEXT clickeado');
            
            var $track = $(this).siblings('.snap-sidebar-cart__slider-track');
            if (!$track.length) return;
            
            // Calcular scroll máximo posible
            var maxScroll = $track[0].scrollWidth - $track.width();
            
            // Calcular scroll
            var scrollDistance = $track.width() * 0.8; // 80% del ancho visible
            
            // Animar scroll
            $track.animate({
                scrollLeft: Math.min(maxScroll, $track.scrollLeft() + scrollDistance)
            }, 300);
        });
        
        // Mostrar/ocultar flechas según contenido
        $('.snap-sidebar-cart__slider-track').each(function() {
            var $track = $(this);
            var $prevBtn = $track.siblings('.snap-sidebar-cart__slider-prev');
            var $nextBtn = $track.siblings('.snap-sidebar-cart__slider-next');
            
            // Si no tiene suficiente contenido para hacer scroll, ocultar las flechas
            if ($track[0].scrollWidth <= $track.width()) {
                $prevBtn.hide();
                $nextBtn.hide();
            } else {
                $prevBtn.show();
                $nextBtn.show();
            }
            
            // Agregar evento de scroll para actualizar visibilidad
            $track.on('scroll', function() {
                if ($track.scrollLeft() <= 0) {
                    $prevBtn.addClass('disabled');
                } else {
                    $prevBtn.removeClass('disabled');
                }
                
                if ($track.scrollLeft() >= $track[0].scrollWidth - $track.width() - 5) {
                    $nextBtn.addClass('disabled');
                } else {
                    $nextBtn.removeClass('disabled');
                }
            });
            
            // Disparar evento de scroll para inicializar estado
            $track.trigger('scroll');
        });
    }
    
    // Manejar actualizaciones del carrito
    $(document.body).on('snap_sidebar_cart_updated', function(e, data) {
        console.log('Evento de actualización detectado:', data);
        
        // Solo volver a cargar si se ha añadido un nuevo producto (no si solo se ha actualizado cantidad)
        var shouldReload = true;
        
        if (data && data.updated_key && data.quantity_changed === true) {
            console.log('Solo cambió la cantidad, no recargar productos relacionados');
            shouldReload = false;
        }
        
        if (shouldReload) {
            // Recargar las pestañas activas
            setTimeout(function() {
                fixTabs();
                fixSliderNavigation();
            }, 300);
        } else {
            // Solo asegurar que la navegación funcione
            setTimeout(fixSliderNavigation, 300);
        }
    });
    
    // También aplicar fix cuando se abre el carrito
    $(document).on('click', snap_sidebar_cart_params.activation_selectors, function() {
        setTimeout(function() {
            fixTabs();
            fixSliderNavigation();
        }, 500);
    });
});