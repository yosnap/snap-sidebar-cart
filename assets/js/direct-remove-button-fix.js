/**
 * Solución directa para el botón de eliminar productos
 * Este script usa un enfoque simple y directo para asegurar que el botón funcione
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando manejador directo para botones de eliminar');
    
    // Delegación de eventos directa usando addEventListener en el documento
    document.addEventListener('click', function(event) {
        // Verificar si el elemento clickeado o alguno de sus padres tiene la clase 'snap-sidebar-cart__remove-product'
        let target = event.target;
        let removeButton = null;
        
        // Buscar el botón de eliminar en el target o sus padres
        while (target && target !== document) {
            if (target.classList && target.classList.contains('snap-sidebar-cart__remove-product')) {
                removeButton = target;
                break;
            }
            target = target.parentNode;
        }
        
        // Si encontramos un botón de eliminar
        if (removeButton) {
            event.preventDefault();
            event.stopPropagation();
            
            console.log('Botón eliminar clickeado (manejador directo)');
            
            // Obtener la key del producto
            const cartItemKey = removeButton.getAttribute('data-key');
            if (!cartItemKey) {
                console.error('Error: No se pudo encontrar la clave del producto');
                return;
            }
            
            console.log('Eliminando producto con clave:', cartItemKey);
            
            // Encontrar el producto contenedor
            const productElement = removeButton.closest('.snap-sidebar-cart__product');
            if (productElement) {
                // Añadir clase para animación de eliminación
                productElement.classList.add('removing');
                
                // Mostrar el preloader
                const loaderElement = productElement.querySelector('.snap-sidebar-cart__product-loader');
                if (loaderElement) {
                    loaderElement.style.display = 'flex';
                }
            }
            
            // Realizar petición AJAX usando XMLHttpRequest para máxima compatibilidad
            const xhr = new XMLHttpRequest();
            xhr.open('POST', snap_sidebar_cart_params.ajax_url, true);
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        try {
                            const response = JSON.parse(xhr.responseText);
                            
                            if (response.success) {
                                console.log('Producto eliminado correctamente');
                                
                                // Actualizar el HTML del carrito
                                const productsContainer = document.querySelector('.snap-sidebar-cart__products');
                                if (productsContainer && response.data.cart_html) {
                                    productsContainer.innerHTML = response.data.cart_html;
                                }
                                
                                // Actualizar el contador
                                const countElements = document.querySelectorAll('.snap-sidebar-cart__count');
                                if (countElements.length && response.data.cart_count !== undefined) {
                                    countElements.forEach(function(el) {
                                        el.textContent = response.data.cart_count;
                                    });
                                }
                                
                                // Actualizar los precios
                                if (response.data.subtotal) {
                                    const subtotalElements = document.querySelectorAll('.snap-sidebar-cart__subtotal-price');
                                    subtotalElements.forEach(function(el) {
                                        el.innerHTML = response.data.subtotal;
                                    });
                                }
                                
                                if (response.data.shipping_total) {
                                    const shippingElements = document.querySelectorAll('.snap-sidebar-cart__shipping-price');
                                    shippingElements.forEach(function(el) {
                                        el.innerHTML = response.data.shipping_total;
                                    });
                                }
                            } else {
                                console.error('Error al eliminar producto:', response.data?.message || 'Error desconocido');
                                
                                // Ocultar loader y quitar clase de eliminación
                                if (productElement) {
                                    productElement.classList.remove('removing');
                                    if (loaderElement) {
                                        loaderElement.style.display = 'none';
                                    }
                                }
                            }
                        } catch (error) {
                            console.error('Error al procesar la respuesta JSON:', error);
                        }
                    } else {
                        console.error('Error AJAX:', xhr.status);
                        
                        // Ocultar loader y quitar clase de eliminación
                        if (productElement) {
                            productElement.classList.remove('removing');
                            if (loaderElement) {
                                loaderElement.style.display = 'none';
                            }
                        }
                    }
                }
            };
            
            // Preparar los datos
            const data = 'action=snap_sidebar_cart_remove' + 
                         '&nonce=' + encodeURIComponent(snap_sidebar_cart_params.nonce) + 
                         '&cart_item_key=' + encodeURIComponent(cartItemKey);
            
            // Enviar la petición
            xhr.send(data);
        }
    });
});
