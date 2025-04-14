/**
 * Script específico para corregir las pestañas del slider de productos relacionados
 */
jQuery(document).ready(function($) {
    console.log('Tabs fix script cargado');
    
    // Función específica para cambiar de pestaña
    function switchTab($tab) {
        var tabType = $tab.data('tab');
        console.log('Cambiando a pestaña:', tabType);
        
        // 1. Actualizar clases de pestañas
        $('.snap-sidebar-cart__related-tab').removeClass('active');
        $tab.addClass('active');
        
        // 2. Actualizar contenedores visibles
        $('.snap-sidebar-cart__related-container').removeClass('active');
        $('.snap-sidebar-cart__related-container[data-content="' + tabType + '"]').addClass('active');
        
        // 3. Cargar productos si es necesario
        var $targetContainer = $('.snap-sidebar-cart__related-container[data-content="' + tabType + '"] .snap-sidebar-cart__slider-track');
        
        // Mostrar preloader
        $targetContainer.html(
            '<div class="snap-sidebar-cart__loading-products">' +
            '<div class="snap-sidebar-cart__loader-spinner preloader-circle"></div>' +
            '<span>Cargando productos...</span>' +
            '</div>'
        );
        
        // Obtener ID del primer producto en el carrito
        var productId = '';
        $('.snap-sidebar-cart__product').each(function() {
            if ($(this).data('product-id')) {
                productId = $(this).data('product-id');
                return false;
            }
        });
        
        if (!productId) {
            console.log('No se encontró ID de producto en el carrito');
            $targetContainer.html('<div class="snap-sidebar-cart__no-products">No hay productos en el carrito para mostrar recomendaciones.</div>');
            return;
        }
        
        console.log('Cargando productos para pestaña', tabType, 'con producto ID:', productId);
        
        // Petición AJAX directa para cargar productos
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
                console.log('Respuesta recibida:', response);
                if (response.success && response.data && response.data.html && response.data.html.trim() !== '') {
                    $targetContainer.html(response.data.html);
                    
                    // Configurar navegación
                    var $items = $targetContainer.children('.snap-sidebar-cart__related-product');
                    if ($items.length > 0) {
                        var containerWidth = $targetContainer.width();
                        var itemWidth = $items.first().outerWidth(true);
                        
                        if ($items.length * itemWidth <= containerWidth) {
                            $targetContainer.parent().find('.snap-sidebar-cart__slider-nav').hide();
                        } else {
                            $targetContainer.parent().find('.snap-sidebar-cart__slider-nav').show();
                        }
                    } else {
                        $targetContainer.html('<div class="snap-sidebar-cart__no-products">No se encontraron productos.</div>');
                        $targetContainer.parent().find('.snap-sidebar-cart__slider-nav').hide();
                    }
                } else {
                    $targetContainer.html('<div class="snap-sidebar-cart__no-products">No se encontraron productos.</div>');
                    $targetContainer.parent().find('.snap-sidebar-cart__slider-nav').hide();
                }
            },
            error: function(xhr, status, error) {
                console.error('Error en petición AJAX:', error);
                $targetContainer.html('<div class="snap-sidebar-cart__error">Error al cargar productos. Por favor, inténtalo más tarde.</div>');
                $targetContainer.parent().find('.snap-sidebar-cart__slider-nav').hide();
            }
        });
    }
    
    // Delegación de evento para pestañas
    $(document).on('click', '.snap-sidebar-cart__related-tab', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('Tab clickeado:', $(this).text());
        switchTab($(this));
    });
    
    // Navegación del slider
    $(document).on('click', '.snap-sidebar-cart__slider-prev', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('Botón prev clickeado');
        var $track = $(this).siblings('.snap-sidebar-cart__slider-track');
        var scrollAmount = $track.width() * 0.8;
        $track.animate({
            scrollLeft: $track.scrollLeft() - scrollAmount
        }, 300);
    });
    
    $(document).on('click', '.snap-sidebar-cart__slider-next', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('Botón next clickeado');
        var $track = $(this).siblings('.snap-sidebar-cart__slider-track');
        var scrollAmount = $track.width() * 0.8;
        $track.animate({
            scrollLeft: $track.scrollLeft() + scrollAmount
        }, 300);
    });
    
    // Añadir al carrito desde productos relacionados
    $(document).on('click', '.snap-sidebar-cart__add-related-product', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        var $button = $(this);
        var productId = $button.data('product-id');
        
        console.log('Botón añadir al carrito clickeado para producto ID:', productId);
        
        if (!productId) {
            console.error('No se pudo obtener ID del producto');
            return;
        }
        
        $button.addClass('loading');
        
        $.ajax({
            type: 'POST',
            url: snap_sidebar_cart_params.ajax_url,
            data: {
                action: 'snap_sidebar_cart_add',
                nonce: snap_sidebar_cart_params.nonce,
                product_id: productId,
                quantity: 1
            },
            success: function(response) {
                console.log('Respuesta añadir al carrito:', response);
                if (response.success) {
                    // La respuesta incluye el nuevo contenido del carrito
                    if (response.data && response.data.cart_html) {
                        $('.snap-sidebar-cart__products').html(response.data.cart_html);
                    }
                    
                    // Actualizar contador
                    if (response.data && response.data.cart_count !== undefined) {
                        $('.snap-sidebar-cart__count').text(response.data.cart_count);
                    }
                    
                    // Actualizar subtotales
                    if (response.data) {
                        if (response.data.subtotal) {
                            $('.snap-sidebar-cart__subtotal-price').html(response.data.subtotal);
                        }
                        if (response.data.shipping_total) {
                            $('.snap-sidebar-cart__shipping-price').html(response.data.shipping_total);
                        }
                    }
                } else {
                    if (response.data && response.data.message) {
                        alert(response.data.message);
                    } else {
                        alert('Error al añadir el producto al carrito');
                    }
                }
            },
            error: function(xhr, status, error) {
                console.error('Error en petición AJAX:', error);
                alert('Error de comunicación con el servidor');
            },
            complete: function() {
                $button.removeClass('loading');
            }
        });
    });
});
