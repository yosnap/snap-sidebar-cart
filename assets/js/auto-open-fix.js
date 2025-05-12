/**
 * Corrección definitiva para el carrito lateral
 * Este script tiene prioridad sobre todos los demás para garantizar que las funcionalidades clave funcionen:
 * - Apertura automática del carrito
 * - Posición de nuevos productos
 * - Animación de eliminación
 * - Preloader configurado
 */
jQuery(document).ready(function($) {
    'use strict';
    
    console.log('=== CORRECCIÓN DEFINITIVA DEL CARRITO CARGADA ===');
    console.log('Configuración inicial:', snap_sidebar_cart_params);

    // Variables globales para usar en todo el script
    var $sidebar = $('.snap-sidebar-cart');
    var $overlay = $('.snap-sidebar-cart__overlay');
    var $body = $('body');
    var $productsContainer = $('.snap-sidebar-cart__products-list');
    var addingProduct = false;
    
    // 1. APERTURA Y CIERRE DEL CARRITO
    // Función definitiva para abrir el sidebar
    function openSidebarDefinitive() {
        console.log('Ejecutando apertura definitiva del sidebar');
        
        // Asegurarnos de que el sidebar existe
        if (!$sidebar.length) {
            console.error('No se encontró el sidebar, intentando con un selector diferente');
            $sidebar = $('#' + snap_sidebar_cart_params.container_selector);
            
            if (!$sidebar.length) {
                console.error('No se pudo encontrar el sidebar. Abortando apertura.');
                return;
            }
        }
        
        // Refrescar las referencias si es necesario
        if (!$overlay.length) {
            $overlay = $('.snap-sidebar-cart__overlay');
        }
        
        // Forzar apertura con múltiples enfoques para garantizar compatibilidad
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
        
        $body.addClass('snap-sidebar-cart-open');
        
        console.log('Sidebar abierto con éxito');
        
        // Cargar productos relacionados (si corresponde)
        maybeLoadRelatedProducts();
    }
    
    // Función definitiva para cerrar el sidebar
    function closeSidebarDefinitive() {
        console.log('Cerrando sidebar (versión definitiva)');
        
        $sidebar.removeClass('open');
        $sidebar.css({
            'transform': 'translateX(100%)'
        });
        
        $overlay.css({
            'display': 'none',
            'opacity': '0'
        });
        
        $body.removeClass('snap-sidebar-cart-open');
    }
    
    // 2. CONFIGURACIÓN DEL PRELOADER
    // Función para configurar y mostrar el preloader
    function setupAndShowPreloader($container) {
        if (!$container || !$container.length) {
            console.error('No se puede mostrar el preloader: Contenedor no válido');
            return;
        }
        
        // Verificar si el contenedor ya tiene un preloader
        var $loader = $container.find('.snap-sidebar-cart__loader-spinner');
        var $productLoader = $container.find('.snap-sidebar-cart__product-loader');
        
        // Si no existe, crear el preloader
        if (!$productLoader.length) {
            $productLoader = $('<div class="snap-sidebar-cart__product-loader"></div>');
            $container.append($productLoader);
        }
        
        if (!$loader.length) {
            $loader = $('<div class="snap-sidebar-cart__loader-spinner"></div>');
            $productLoader.append($loader);
        }
        
        // Obtener las opciones del preloader desde los parámetros del plugin
        var preloaderOptions = {};
        
        // Verificar si snap_sidebar_cart_params existe y contiene la configuración del preloader
        if (typeof snap_sidebar_cart_params !== 'undefined' && snap_sidebar_cart_params.preloader) {
            preloaderOptions = snap_sidebar_cart_params.preloader;
            console.log('Opciones de preloader obtenidas del backend:', preloaderOptions);
        } else {
            console.log('No se encontraron opciones de preloader en el backend, usando valores predeterminados');
        }
        
        // Establecer valores predeterminados si no están definidos
        var preloaderType = preloaderOptions.type || 'circle';
        var preloaderPosition = preloaderOptions.position || 'center';
        var preloaderColor = preloaderOptions.color || '#000000';
        var preloaderSize = preloaderOptions.size || 'medium';
        
        // Limpiar clases anteriores
        $loader.attr('class', 'snap-sidebar-cart__loader-spinner');
        
        // Añadir clases según la configuración
        $loader.addClass('preloader-' + preloaderType);
        $loader.addClass('preloader-position-' + preloaderPosition);
        $loader.addClass('preloader-size-' + preloaderSize);
        
        // Aplicar color personalizado si está definido
        if (preloaderColor) {
            if (preloaderType === 'circle') {
                $loader.css('border-top-color', preloaderColor);
            } else {
                $loader.css('color', preloaderColor);
            }
        }
        
        // Crear el HTML interno según el tipo de preloader
        if (preloaderType === 'dots') {
            $loader.html("<span></span><span></span><span></span>");
        } else if (preloaderType === 'spinner') {
            $loader.html("<i class='fas fa-spinner fa-spin'></i>");
        } else {
            // Para circle o cualquier otro tipo, no necesitamos HTML interno
            $loader.html("");
        }
        
        // Mostrar el loader
        $productLoader.css('display', 'flex');
        
        console.log('Preloader mostrado con tipo:', preloaderType, 'posición:', preloaderPosition, 'color:', preloaderColor, 'tamaño:', preloaderSize);
    }
    
    // 3. MANEJO DE APERTURA AUTOMÁTICA
    // Manejador directo para el evento added_to_cart con prioridad
    $(document.body).on('added_to_cart', function(event, fragments, cart_hash, $button) {
        console.log('Evento added_to_cart detectado (manejador definitivo)');
        
        // Verificar si el carrito estaba vacío antes de agregar este producto
        var cartCount = parseInt($(".snap-sidebar-cart__count").text()) || 0;
        var wasCartEmpty = cartCount <= 1; // Si es 1, significa que acabamos de agregar el primer producto
        console.log("¿El carrito estaba vacío?", wasCartEmpty ? "Sí" : "No", "Conteo actual:", cartCount);
        
        // Verificar auto_open de múltiples formas para garantizar compatibilidad
        var autoOpenValue = snap_sidebar_cart_params.auto_open;
        var shouldAutoOpen = (autoOpenValue === true || 
                             autoOpenValue === "true" || 
                             autoOpenValue === 1 || 
                             autoOpenValue === "1");
        
        console.log('Valor de auto_open:', autoOpenValue, '| Tipo:', typeof autoOpenValue);
        console.log('¿Debería abrirse automáticamente?', shouldAutoOpen);
        
        // Si auto_open está habilitado, abrir el sidebar
        if (shouldAutoOpen) {
            console.log('Auto-open habilitado, abriendo sidebar...');
            
            // Primero abrir el sidebar para asegurarnos de que los elementos del DOM estén disponibles
            openSidebarDefinitive();
            
            // Si el carrito estaba vacío, asegurarnos de que el footer y la sección de productos relacionados sean visibles
            if (wasCartEmpty) {
                console.log('El carrito estaba vacío, asegurando que el footer y productos relacionados sean visibles');
                
                // Asegurar que los contenedores necesarios estén visibles
                $(".snap-sidebar-cart__footer").show();
                $(".snap-sidebar-cart__related-section").show();
                
                // Asegurarnos de que los botones estén presentes
                if ($(".snap-sidebar-cart__buttons").length === 0) {
                    var buttonsHtml =
                      '<div class="snap-sidebar-cart__buttons">' +
                      '<a href="' +
                      wc_cart_fragments_params.cart_url +
                      '" class="snap-sidebar-cart__button snap-sidebar-cart__button--cart">' +
                      "Ver carrito</a>" +
                      '<a href="' +
                      wc_cart_fragments_params.checkout_url +
                      '" class="snap-sidebar-cart__button snap-sidebar-cart__button--checkout">' +
                      "Finalizar pedido</a>" +
                      "</div>";
                    $(".snap-sidebar-cart__footer").append(buttonsHtml);
                }
                
                // Verificar si existe el contenedor de productos, si no, crearlo
                if ($('.snap-sidebar-cart__products-list').length === 0) {
                    console.log('Creando contenedor de productos que no existe');
                    $('.snap-sidebar-cart__products').html('<ul class="snap-sidebar-cart__products-list"></ul>');
                }
                
                // Asegurarnos de que el contenedor de productos vacío no tenga el mensaje de carrito vacío
                if ($('.snap-sidebar-cart__empty').length > 0) {
                    console.log('Eliminando mensaje de carrito vacío');
                    $('.snap-sidebar-cart__empty').remove();
                }
            }
        } else {
            console.log('Auto-open deshabilitado, no se abrirá el sidebar');
        }
        
        // Pequeño retraso para asegurar que el DOM esté actualizado antes de manejar el producto
        setTimeout(function() {
            // No importa si se abrió o no el sidebar, manejar la adición del producto
            handleAddedProduct($button);
        }, 100);
    });
    
    // 4. MANEJO DE POSICIÓN DE NUEVOS PRODUCTOS
    // Función para manejar un producto recién añadido al carrito
    function handleAddedProduct($button) {
        console.log('Manejando producto recién añadido');
        
        // Verificar si el contenedor de productos existe, si no, crearlo
        var $productsSection = $('.snap-sidebar-cart__products');
        if (!$productsSection.length) {
            console.error('No se encontró la sección de productos');
            return;
        }
        
        // Si el carrito estaba vacío, es posible que aún tengamos el mensaje de carrito vacío
        // Asegurémonos de que se haya eliminado
        var $emptyCart = $productsSection.find('.snap-sidebar-cart__empty');
        if ($emptyCart.length) {
            console.log('Eliminando mensaje de carrito vacío');
            $emptyCart.remove();
            
            // Crear el contenedor de productos si no existe
            $productsSection.html('<ul class="snap-sidebar-cart__products-list"></ul>');
        }
        
        // Actualizar las referencias de los contenedores
        if (!$productsContainer || !$productsContainer.length) {
            $productsContainer = $('.snap-sidebar-cart__products-list');
            console.log('Actualizando referencia al contenedor de productos:', $productsContainer.length ? 'Encontrado' : 'No encontrado');
        }
        
        if (!$productsContainer.length) {
            console.error('No se encontró el contenedor de productos');
            return;
        }
        
        // Verificar si es una actualización de un producto existente
        var isProductUpdate = false;
        var productId = null;
        
        if ($button && $button.data && $button.data('product_id')) {
            productId = $button.data('product_id');
            
            // Usar la función global para comprobar si el producto ya está en el carrito
            if (window.isProductInCart && typeof window.isProductInCart === 'function') {
                isProductUpdate = window.isProductInCart(productId);
            } else {
                // Fallback: comprobar directamente
                isProductUpdate = $('.snap-sidebar-cart__product[data-product-id="' + productId + '"]').length > 0;
            }
            
            console.log('Producto ID:', productId, '| Ya en carrito:', isProductUpdate ? 'Sí' : 'No');
        }
        
        // Si es una actualización y no una adición, manejarlo diferente
        if (isProductUpdate) {
            console.log('Actualizando producto existente en el carrito');
            
            // Actualizar contenido sin animación especial de nuevo producto
            getCartContent(function(response) {
                if (response.success) {
                    // Actualizar el contenido del carrito
                    updateCartContent(response.data);
                    
                    // Mostrar animación de actualización en el producto
                    highlightExistingProduct(productId);
                }
            });
        } else {
            // Para nuevos productos, seguir con el comportamiento configurado
            console.log('Agregando nuevo producto al carrito');
            
            // Obtener posición configurada para nuevos productos
            var newProductPosition = getNewProductPosition();
            console.log('Posición para nuevos productos:', newProductPosition);
            
            // Crear un espacio para el nuevo producto con un preloader
            if ($productsContainer.length) {
                var $newItemPlaceholder = $('<li class="snap-sidebar-cart__product placeholder-animation"></li>');
                
                // Agregar al inicio o al final según configuración
                if (newProductPosition === 'top') {
                    console.log('Insertando placeholder al inicio del contenedor');
                    $productsContainer.prepend($newItemPlaceholder);
                } else {
                    console.log('Insertando placeholder al final del contenedor');
                    $productsContainer.append($newItemPlaceholder);
                }
                
                // Mostrar preloader en el placeholder
                setupAndShowPreloader($newItemPlaceholder);
                
                // Actualizar carrito mediante AJAX para obtener el contenido real
                setTimeout(function() {
                    getCartContent(function(response) {
                        if (response.success) {
                            console.log('Contenido del carrito actualizado via AJAX');
                            
                            // Eliminar el placeholder
                            if ($newItemPlaceholder && $newItemPlaceholder.length) {
                                console.log('Eliminando placeholder');
                                $newItemPlaceholder.remove();
                            } else {
                                console.log('No se encontró placeholder para eliminar');
                            }
                            
                            // Actualizar el contenido del carrito
                            updateCartContent(response.data);
                            
                            // Asegurarnos de que el footer y los botones estén visibles
                            $(".snap-sidebar-cart__footer").show();
                            
                            // Asegurarnos de que los botones estén presentes
                            if ($(".snap-sidebar-cart__buttons").length === 0) {
                                var buttonsHtml =
                                  '<div class="snap-sidebar-cart__buttons">' +
                                  '<a href="' +
                                  wc_cart_fragments_params.cart_url +
                                  '" class="snap-sidebar-cart__button snap-sidebar-cart__button--cart">' +
                                  "Ver carrito</a>" +
                                  '<a href="' +
                                  wc_cart_fragments_params.checkout_url +
                                  '" class="snap-sidebar-cart__button snap-sidebar-cart__button--checkout">' +
                                  "Finalizar pedido</a>" +
                                  "</div>";
                                $(".snap-sidebar-cart__footer").append(buttonsHtml);
                            }
                            
                            // Agregar clase para la animación al nuevo producto
                            var $newItem;
                            if (newProductPosition === 'top') {
                                $newItem = $('.snap-sidebar-cart__product:first-child');
                            } else {
                                $newItem = $('.snap-sidebar-cart__product:last-child');
                            }
                            
                            if ($newItem.length) {
                                $newItem.addClass('new-item');
                                
                                // Eliminar la clase después de la animación
                                setTimeout(function() {
                                    $newItem.removeClass('new-item');
                                }, getAnimationDuration());
                            }
                            
                            // Si tenemos el producto ID, obtener los productos relacionados
                            if (productId) {
                                loadRelatedProducts(productId);
                            } else {
                                // Si no tenemos el ID del producto, intentar obtenerlo del primer producto
                                var $firstProduct = $('.snap-sidebar-cart__product').first();
                                if ($firstProduct.length) {
                                    var firstProductId = $firstProduct.data('product-id');
                                    if (firstProductId) {
                                        console.log('Usando ID del primer producto en carrito:', firstProductId);
                                        loadRelatedProducts(firstProductId);
                                    }
                                }
                            }
                        }
                    });
                }, getAnimationDuration() / 3);
            }
        }
    }
    
    // 5. MANEJO DE CANTIDAD Y ELIMINACIÓN
    // Mejorar los manejadores de eventos para los botones de cantidad
    $(document).on('click', '.notabutton.quantity-up, .snap-sidebar-cart__quantity-up', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        var $button = $(this);
        var $product = $button.closest('.snap-sidebar-cart__product');
        var $input = $product.find('input.cart-item__quantity-input, input.snap-sidebar-cart__quantity-input');
        var cartItemKey = $product.data('key');
        
        if (!cartItemKey) {
            console.error('No se pudo encontrar la clave del producto');
            return;
        }
        
        // Obtener el valor actual y calcular el nuevo valor
        var currentVal = parseInt($input.val(), 10);
        if (isNaN(currentVal)) currentVal = 0;
        var newVal = currentVal + 1;
        
        // Actualizar valor de input
        $input.val(newVal);
        
        // Mostrar preloader mientras se actualiza
        setupAndShowPreloader($product);
        
        // Actualizar carrito
        updateCartItemQuantity(cartItemKey, newVal, currentVal);
    });
    
    $(document).on('click', '.notabutton.quantity-down, .snap-sidebar-cart__quantity-down', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        var $button = $(this);
        var $product = $button.closest('.snap-sidebar-cart__product');
        var $input = $product.find('input.cart-item__quantity-input, input.snap-sidebar-cart__quantity-input');
        var cartItemKey = $product.data('key');
        
        if (!cartItemKey) {
            console.error('No se pudo encontrar la clave del producto');
            return;
        }
        
        // Obtener el valor actual y calcular el nuevo valor
        var currentVal = parseInt($input.val(), 10);
        if (isNaN(currentVal)) currentVal = 0;
        var newVal = currentVal > 1 ? currentVal - 1 : 0;
        
        // Actualizar valor de input
        $input.val(newVal);
        
        // Si la nueva cantidad es 0, añadir clase para animación de eliminación
        if (newVal === 0) {
            console.log('Eliminando producto del carrito (cantidad 0)');
            $product.addClass('removing');
        }
        
        // Mostrar preloader mientras se actualiza
        setupAndShowPreloader($product);
        
        // Actualizar carrito después de un breve retraso para permitir la animación
        setTimeout(function() {
            updateCartItemQuantity(cartItemKey, newVal, currentVal);
        }, newVal === 0 ? getAnimationDuration() / 2 : 0);
    });
    
    // 6. UTILIDADES
    // Función para obtener la duración de animación configurada
    function getAnimationDuration() {
        if (snap_sidebar_cart_params.animations && 
            snap_sidebar_cart_params.animations.duration !== undefined) {
            return parseInt(snap_sidebar_cart_params.animations.duration, 10);
        }
        return 300; // Valor por defecto
    }
    
    // Función para obtener la posición de nuevos productos configurada
    function getNewProductPosition() {
        // Verificar primero en el nivel raíz (por retrocompatibilidad)
        if (snap_sidebar_cart_params.new_product_position !== undefined) {
            return snap_sidebar_cart_params.new_product_position;
        }
        
        // Verificar en animations si existe
        if (snap_sidebar_cart_params.animations && 
            snap_sidebar_cart_params.animations.new_product_position !== undefined) {
            return snap_sidebar_cart_params.animations.new_product_position;
        }
        
        return 'top'; // Valor por defecto
    }
    
    // Función para cargar productos relacionados si es necesario
    function maybeLoadRelatedProducts() {
        console.log('Verificando si es necesario cargar productos relacionados');
        
        // Asegurarse de que la sección de productos relacionados sea visible
        $(".snap-sidebar-cart__related-section").show();
        
        // Verificar si hay pestaña activa
        var $activeTab = $('.snap-sidebar-cart__related-tab.active');
        if (!$activeTab.length && $('.snap-sidebar-cart__related-tab').length > 0) {
            // Si no hay pestaña activa pero hay pestañas, activar la primera
            $activeTab = $('.snap-sidebar-cart__related-tab').first();
            $activeTab.addClass('active');
            var tabType = $activeTab.data('tab');
            
            // Desactivar todos los contenedores primero
            $('.snap-sidebar-cart__related-container').removeClass('active');
            
            // Activar el contenedor correspondiente
            $('.snap-sidebar-cart__related-container[data-content="' + tabType + '"]').addClass('active');
            console.log('Activada primera pestaña:', tabType);
        }
        
        if ($activeTab.length) {
            var tabType = $activeTab.data('tab');
            var $container = $('.snap-sidebar-cart__related-container[data-content="' + tabType + '"]');
            
            // Asegurarse de que el contenedor esté activo
            if (!$container.hasClass('active')) {
                $('.snap-sidebar-cart__related-container').removeClass('active');
                $container.addClass('active');
            }
            
            var $productsWrapper = $container.find('.swiper-wrapper');
            
            // Si el contenedor está vacío o solo tiene el preloader
            if ($productsWrapper.length && 
                ($productsWrapper.children().length === 0 || 
                 $productsWrapper.find('.snap-sidebar-cart__loading-products').length > 0)) {
                 
                console.log('Contenedor de productos relacionados vacío, cargando productos...');
                
                // Mostrar un preloader en el contenedor mientras se cargan los productos
                if ($productsWrapper.children().length === 0) {
                    $productsWrapper.html('<div class="snap-sidebar-cart__loading-products">Cargando productos relacionados...</div>');
                }
                
                // Buscar el primer producto en el carrito
                var $firstProduct = $('.snap-sidebar-cart__product').first();
                if ($firstProduct.length) {
                    var productId = $firstProduct.data('product-id');
                    if (productId) {
                        console.log('Cargando productos relacionados para ID:', productId, 'tipo:', tabType);
                        loadRelatedProducts(productId, tabType);
                    } else {
                        console.error('No se pudo obtener el ID del producto');
                    }
                } else {
                    console.error('No se encontraron productos en el carrito');
                }
            } else {
                console.log('El contenedor ya tiene productos relacionados cargados');
            }
        } else {
            console.error('No se encontró ninguna pestaña activa');
        }
    }
    
    // Función para cargar productos relacionados
    function loadRelatedProducts(productId, type) {
        // Si no se proporciona tipo, usar el tab activo
        if (!type) {
            var $activeTab = $('.snap-sidebar-cart__related-tab.active');
            type = $activeTab.length ? $activeTab.data('tab') : 'related';
        }
        
        console.log('Cargando productos relacionados para ID:', productId, 'tipo:', type);
        
        if (window.loadRelatedProducts && typeof window.loadRelatedProducts === 'function') {
            // Usar la función existente si está disponible
            window.loadRelatedProducts(productId, type);
        } else if (window.snapSidebarCartSlider && 
                   typeof window.snapSidebarCartSlider.loadRelatedProducts === 'function') {
            // Alternativamente, usar la función del objeto slider
            window.snapSidebarCartSlider.loadRelatedProducts(productId, type);
        } else {
            // Implementación mínima como fallback
            var $targetContainer = $('.snap-sidebar-cart__related-container[data-content="' + type + '"] .swiper-wrapper');
            
            if ($targetContainer.length) {
                // Mostrar preloader
                $targetContainer.html(
                    '<div class="snap-sidebar-cart__loading-products">' +
                    '<div class="snap-sidebar-cart__loader-spinner preloader-circle"></div>' +
                    '<span>Cargando productos...</span>' +
                    '</div>'
                );
                
                // Realizar la petición AJAX
                $.ajax({
                    type: "POST",
                    url: snap_sidebar_cart_params.ajax_url,
                    data: {
                        action: "snap_sidebar_cart_get_related",
                        nonce: snap_sidebar_cart_params.nonce,
                        product_id: productId,
                        type: type
                    },
                    success: function(response) {
                        if (response.success && response.data && response.data.html) {
                            $targetContainer.html(response.data.html);
                        } else {
                            $targetContainer.html('<div class="snap-sidebar-cart__no-products">No se encontraron productos relacionados.</div>');
                        }
                    },
                    error: function() {
                        $targetContainer.html('<div class="snap-sidebar-cart__no-products">Error al cargar productos relacionados.</div>');
                    }
                });
            }
        }
    }
    
    // Función para obtener el contenido del carrito vía AJAX
    function getCartContent(callback) {
        $.ajax({
            type: "POST",
            url: snap_sidebar_cart_params.ajax_url,
            data: {
                action: "snap_sidebar_cart_get_content",
                nonce: snap_sidebar_cart_params.nonce
            },
            success: function(response) {
                if (typeof callback === 'function') {
                    callback(response);
                }
            },
            error: function(xhr, status, error) {
                console.error("Error al obtener contenido del carrito:", error);
                if (typeof callback === 'function') {
                    callback({success: false, error: error});
                }
            }
        });
    }
    
    // Función para actualizar la cantidad de un item en el carrito
    function updateCartItemQuantity(cartItemKey, quantity, oldQuantity) {
        if (!cartItemKey) {
            console.error("Error: Clave de producto no válida para actualizar cantidad");
            $('.snap-sidebar-cart__product-loader').hide();
            return;
        }
        
        console.log("Enviando actualización para clave:", cartItemKey, "cantidad:", quantity);
        
        // Si es solo una actualización de cantidad y no eliminación
        var isQuantityUpdate = quantity > 0 && oldQuantity > 0;
        
        $.ajax({
            type: "POST",
            url: snap_sidebar_cart_params.ajax_url,
            data: {
                action: "snap_sidebar_cart_update",
                nonce: snap_sidebar_cart_params.nonce,
                cart_item_key: cartItemKey,
                quantity: quantity,
            },
            success: function(response) {
                console.log("Respuesta de actualización:", response);
                if (response.success) {
                    // Actualizar el contenido del carrito
                    updateCartContent(response.data);
                } else {
                    if (response.data && response.data.message) {
                        alert(response.data.message);
                    }
                    // Ocultar loader en caso de error
                    $('.snap-sidebar-cart__product-loader').hide();
                }
            },
            error: function(xhr, status, error) {
                console.error("Error de AJAX:", error);
                alert("Error de comunicación con el servidor");
                // Ocultar loader en caso de error
                $('.snap-sidebar-cart__product-loader').hide();
            }
        });
    }
    
    // Función para resaltar un producto existente 
    function highlightExistingProduct(productId) {
        if (!productId) return;
        
        // Buscar el producto en el carrito
        var $product = $(
            ".snap-sidebar-cart__product[data-product-id='" + productId + "']"
        );
        
        if ($product.length) {
            // Primero, asegurarse de que el producto sea visible (scroll hacia él)
            var $container = $(".snap-sidebar-cart__products");
            var productOffset =
                $product.offset().top -
                $container.offset().top +
                $container.scrollTop();
            $container.animate(
                {
                    scrollTop: productOffset,
                },
                300
            );
            
            // Añadir clase para destacar el elemento completo
            $product.addClass("product-updated");
            
            // Buscar el input de cantidad para ese producto
            var $quantityInput = $product.find(".cart-item__quantity-input");
            if ($quantityInput.length) {
                $quantityInput.addClass("quantity-updated");
                
                // Remover las clases después de la animación
                setTimeout(function() {
                    $product.removeClass("product-updated");
                    $quantityInput.removeClass("quantity-updated");
                }, getAnimationDuration());
            }
        }
    }
    
    // Función para actualizar el contenido del carrito
    function updateCartContent(data) {
        console.log('Actualizando contenido del carrito (fix definitivo):', data);
        
        // Verificar si el carrito estaba vacío antes (basado en el contador actual)
        var currentCount = parseInt($(".snap-sidebar-cart__count").text()) || 0;
        var wasCartEmpty = currentCount === 0;
        var newCount = data.cart_count !== undefined ? parseInt(data.cart_count) : 0;
        var cartNowHasProducts = newCount > 0;
        
        console.log('Estado del carrito - Estaba vacío:', wasCartEmpty, '| Ahora tiene productos:', cartNowHasProducts, '| Contador actual:', currentCount, '| Nuevo contador:', newCount);
        
        // Si el carrito estaba vacío y ahora tiene productos, asegurarnos de que no haya mensaje de carrito vacío
        if (wasCartEmpty && cartNowHasProducts) {
            console.log('Transición de carrito vacío a carrito con productos');
            
            // Eliminar mensaje de carrito vacío si existe
            var $emptyCart = $(".snap-sidebar-cart__empty");
            if ($emptyCart.length) {
                console.log('Eliminando mensaje de carrito vacío');
                $emptyCart.remove();
            }
            
            // Asegurarnos de que el contenedor de productos exista
            if ($('.snap-sidebar-cart__products-list').length === 0) {
                console.log('Creando contenedor de productos que no existe');
                $('.snap-sidebar-cart__products').html('<ul class="snap-sidebar-cart__products-list"></ul>');
            }
        }
        
        // Actualizar el HTML del carrito
        if (data.cart_html) {
            $(".snap-sidebar-cart__products").html(data.cart_html);
            console.log('HTML del carrito actualizado con éxito');
        } else {
            console.error('Error: No se recibió HTML del carrito en la respuesta');
        }
        
        // Actualizar el contador
        if (data.cart_count !== undefined) {
            $(".snap-sidebar-cart__count").text(data.cart_count);
            console.log('Contador actualizado a:', data.cart_count);
        }
        
        // Actualizar los totales
        if (data.shipping_total) {
            $(".snap-sidebar-cart__shipping-price").html(data.shipping_total);
            console.log('Envío actualizado a:', data.shipping_total);
        }
        if (data.subtotal) {
            $(".snap-sidebar-cart__subtotal-price").html(data.subtotal);
            console.log('Subtotal actualizado a:', data.subtotal);
        }
        
        // Actualizar visibilidad del footer y productos relacionados según si hay productos
        if (cartNowHasProducts) {
            console.log('Carrito tiene productos: mostrando footer y sección de productos relacionados');
            
            // Mostrar el footer y la sección de productos relacionados
            $(".snap-sidebar-cart__footer").show();
            $(".snap-sidebar-cart__related-section").show();
            
            // Si no hay botones, añadirlos
            if ($(".snap-sidebar-cart__buttons").length === 0) {
                console.log('Añadiendo botones al footer');
                var buttonsHtml =
                    '<div class="snap-sidebar-cart__buttons">' +
                    '<a href="' + wc_cart_fragments_params.cart_url + '" class="snap-sidebar-cart__button snap-sidebar-cart__button--cart">' +
                    "Ver carrito</a>" +
                    '<a href="' + wc_cart_fragments_params.checkout_url + '" class="snap-sidebar-cart__button snap-sidebar-cart__button--checkout">' +
                    "Finalizar pedido</a>" +
                    "</div>";
                $(".snap-sidebar-cart__footer").append(buttonsHtml);
            }
            
            // Si el carrito estaba vacío y ahora tiene productos, cargar productos relacionados
            if (wasCartEmpty) {
                console.log('El carrito estaba vacío y ahora tiene productos, cargando productos relacionados');
                
                // Obtener el ID del primer producto para cargar productos relacionados
                var $firstProduct = $('.snap-sidebar-cart__product').first();
                if ($firstProduct.length) {
                    var firstProductId = $firstProduct.data('product-id');
                    if (firstProductId) {
                        console.log('Usando ID del primer producto en carrito para cargar relacionados:', firstProductId);
                        setTimeout(function() {
                            loadRelatedProducts(firstProductId);
                        }, 300);
                    } else {
                        console.log('No se pudo obtener el ID del primer producto, intentando cargar relacionados genéricos');
                        setTimeout(function() {
                            maybeLoadRelatedProducts();
                        }, 300);
                    }
                } else {
                    console.log('No se encontró ningún producto en el carrito, intentando cargar relacionados genéricos');
                    setTimeout(function() {
                        maybeLoadRelatedProducts();
                    }, 300);
                }
            }
        } else {
            // Si no hay productos, ocultar el footer y la sección de productos relacionados
            console.log('Carrito vacío: ocultando footer y sección de productos relacionados');
            $(".snap-sidebar-cart__footer").hide();
            
            // Usar múltiples métodos para asegurar que la sección de productos relacionados se oculte
            $(".snap-sidebar-cart__related-section").hide();
            $(".snap-sidebar-cart__related-section").css("display", "none");
            
            // Forzar la ocultación con !important a través de un estilo inline
            $(".snap-sidebar-cart__related-section").attr("style", "display: none !important");
        }
        
        // Disparar un evento personalizado
        $(document.body).trigger("snap_sidebar_cart_updated");
    }
    
    // 7. REEMPLAZAR FUNCIONES GLOBALES PARA GARANTIZAR COMPATIBILIDAD
    // Reemplazar las funciones existentes para asegurar que nuestra versión sea la que se usa
    window.openSidebarDefinitive = openSidebarDefinitive;
    window.forceOpenSidebar = openSidebarDefinitive;
    window.openSidebar = openSidebarDefinitive;
    window.closeSidebar = closeSidebarDefinitive;
    window.highlightExistingProduct = highlightExistingProduct;
    window.updateCartItemQuantity = updateCartItemQuantity;
    window.setupAndShowPreloader = setupAndShowPreloader;
    
    console.log('Corrección definitiva para el carrito instalada correctamente');
});