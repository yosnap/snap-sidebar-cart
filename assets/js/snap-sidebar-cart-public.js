/**
 * JavaScript para el funcionamiento del carrito lateral
 */
(function ($) {
  "use strict";

  // Variables globales para jQuery
  var $sidebar;
  var $productsContainer; // Contenedor de la lista de productos ul.snap-sidebar-cart__products-list
  var $cartProducts;    // Contenedor principal de los productos div.snap-sidebar-cart__products

  // Variables globales para configuración de animaciones
  var animationDuration = 300;
  var quantityUpdateDelay = 200;
  var newProductPosition =
    snap_sidebar_cart_params.new_product_position || "top";

  // Verificar si es una variación de producto en la URL o botón
  function isProductVariation(url) {
    // Si no se proporciona URL, no podemos determinar
    if (!url) return false;
    
    // Verificamos si la URL contiene el parámetro variation_id o attribute_
    if (url.includes("?") && 
        (url.includes("variation_id=") || 
         url.includes("attribute_") || 
         url.includes("product_type=variable"))) {
      return true;
    }
    
    // Verificar si la URL es para un producto variable
    if (url.includes("/product-category/") || url.includes("?add-to-cart=")) {
      // Intentar obtener el product_type del elemento
      var $button = $('a[href="' + url + '"]');
      if ($button.length && 
          ($button.hasClass("product_type_variable") || 
           $button.hasClass("variations_form") || 
           $button.closest(".variations_form").length)) {
        return true;
      }
    }
    
    return false;
  }

  // Función para configurar y mostrar el preloader
  function setupAndShowLoader($product) {
    if (!$product || !$product.length) return;

    // Obtener las opciones del preloader
    var preloaderType = snap_sidebar_cart_params.preloader
      ? snap_sidebar_cart_params.preloader.type || "circle"
      : "circle";
    var preloaderPosition = snap_sidebar_cart_params.preloader
      ? snap_sidebar_cart_params.preloader.position || "center"
      : "center";
    var preloaderColor = snap_sidebar_cart_params.preloader
      ? snap_sidebar_cart_params.preloader.color || "#3498db"
      : "#3498db";
    var preloaderColor2 = snap_sidebar_cart_params.preloader
      ? snap_sidebar_cart_params.preloader.color2 || "#e74c3c"
      : "#e74c3c";
    var preloaderSize = snap_sidebar_cart_params.preloader
      ? snap_sidebar_cart_params.preloader.size || "40px"
      : "40px";

    // Preparar el preloader según el tipo
    var $loader = $product.find(".snap-sidebar-cart__loader-spinner");

    // Limpiar clases anteriores
    $loader.attr("class", "snap-sidebar-cart__loader-spinner");

    // Añadir clases según la configuración
    $loader.addClass("preloader-" + preloaderType);
    $loader.addClass("preloader-position-" + preloaderPosition);

    // Aplicar estilos inline para colores y tamaño
    var inlineStyles = {};
    
    // Aplicar estilos según el tipo de preloader
    if (preloaderType === "circle") {
      inlineStyles = {
        "width": preloaderSize,
        "height": preloaderSize,
        "border-color": preloaderColor,
        "border-top-color": preloaderColor2
      };
    } else {
      inlineStyles = {
        "width": preloaderSize,
        "height": preloaderSize
      };
    }
    
    // Aplicar estilos inline
    $loader.css(inlineStyles);

    // Crear el HTML interno según el tipo de preloader
    if (preloaderType === "dots") {
      $loader.html(
        '<span style="background-color: ' + preloaderColor + ';"></span>' +
        '<span style="background-color: ' + preloaderColor + ';"></span>' +
        '<span style="background-color: ' + preloaderColor + ';"></span>'
      );
    } else {
      $loader.html("");
    }

    // Mostrar el loader
    $product.find(".snap-sidebar-cart__product-loader").show();
  }

  // Función para actualizar la cantidad de un item en el carrito
  function updateCartItemQuantity(cartItemKey, quantity, oldQuantity) {
    if (!cartItemKey) {
      $(".snap-sidebar-cart__product-loader").hide();
      return;
    }

    // Si es solo una actualización de cantidad y no eliminación
    var isQuantityUpdate = quantity > 0 && oldQuantity > 0;
    var $product = $('[data-key="' + cartItemKey + '"]');

    // Si es solo actualización de cantidad, mostrar animación especial
    if (isQuantityUpdate) {
      if ($product.length) {
        // Mostrar el loader con delay si es solo actualización de cantidad
        setTimeout(function () {
          window.setupAndShowLoader($product);
        }, quantityUpdateDelay);

        // Preparar el elemento para la animación
        var $quantityDisplay = $product.find(".cart-item__quantity-input");
        if ($quantityDisplay.length) {
          $quantityDisplay.addClass("quantity-updated");
          setTimeout(function () {
            $quantityDisplay.removeClass("quantity-updated");
          }, quantityUpdateDelay + animationDuration);
        }
      }
    } else {
      // Si es eliminación o adición, mostrar loader inmediatamente
      if ($product.length) {
        window.setupAndShowLoader($product);
      }
    }

    $.ajax({
      type: "POST",
      url: snap_sidebar_cart_params.ajax_url,
      data: {
        action: "snap_sidebar_cart_update",
        nonce: snap_sidebar_cart_params.nonce,
        cart_item_key: cartItemKey,
        quantity: quantity,
      },
      success: function (response) {
        if (response.success) {
          if (response.data.cart_html) {
            if (typeof window.actualizarSidebarCartHTML === 'function') {
              window.actualizarSidebarCartHTML(response.data.cart_html, response.data.cart_count);
            } else {
              $(".snap-sidebar-cart .snap-sidebar-cart__products-list").replaceWith(response.data.cart_html);
              // Eliminar footers incrustados dentro del listado de productos
              $(".snap-sidebar-cart__products .snap-sidebar-cart__footer, .snap-sidebar-cart__products-list .snap-sidebar-cart__footer").remove();
              // Aplicar animación de fondo amarillo al producto recién agregado
              if (typeof animateNewOrUpdatedProduct === 'function' && productId) {
                let position = (typeof snap_sidebar_cart_params !== 'undefined' && snap_sidebar_cart_params.new_product_position) ? snap_sidebar_cart_params.new_product_position : 'top';
                animateNewOrUpdatedProduct(productId, true, position);
              }
            }
            if (typeof window.bindQuantityEvents === 'function') window.bindQuantityEvents();
          }
          if (response.data.cart_count !== undefined) {
            $(".snap-sidebar-cart .snap-sidebar-cart__count").text(response.data.cart_count);
          }
          if (response.data.subtotal !== undefined) {
            $(".snap-sidebar-cart .snap-sidebar-cart__subtotal-price, .snap-sidebar-cart .snap-sidebar-cart__subtotal-value").html(response.data.subtotal);
          }
          checkStockLimits();
        } else {
          if (quantity > 0 && response.data && response.data.message) {
            alert(response.data.message);
          }
          $(".snap-sidebar-cart__product-loader").hide();
        }
      },
      error: function (xhr, status, error) {
        if (quantity > 0) {
          alert("Error de comunicación con el servidor");
        }
        $(".snap-sidebar-cart__product-loader").hide();
      },
    });
  }
  
  /**
   * Fuerza una actualización completa del carrito para obtener el precio total actualizado
   */
  function forceCartRefresh() {
    // Calcular el total manualmente primero
    var manualTotal = 0;
    var totalItems = 0;
    
    // Recorrer todos los productos en el carrito
    $('.snap-sidebar-cart__product').each(function() {
      var $product = $(this);
      var quantity = parseInt($product.find('input.cart-item__quantity-input, input.snap-sidebar-cart__quantity-input').val(), 10) || 0;
      var price = parseFloat($product.find('.snap-sidebar-cart__product-price .woocommerce-Price-amount').text().replace(/[^0-9,\.]/g, '').replace(',', '.')) || 0;
      
      var itemTotal = quantity * price;
      manualTotal += itemTotal;
      totalItems += quantity;
    });
    
    // Formatear el total calculado manualmente
    var formattedTotal = manualTotal.toFixed(2).replace('.', ',') + ' €';
    var formattedTotalHtml = '<span class="woocommerce-Price-amount amount"><bdi>' + formattedTotal + '</bdi></span>';
    
    // Actualizar el subtotal con el valor calculado manualmente
    $('.snap-sidebar-cart .snap-sidebar-cart__subtotal-price').html(formattedTotalHtml);
    $('.snap-sidebar-cart .snap-sidebar-cart__subtotal-value').html(formattedTotalHtml);
    
    // Actualizar el contador de ítems
    $('.snap-sidebar-cart .snap-sidebar-cart__count').text(totalItems);
    
    // También realizar la petición AJAX para mantener sincronizado el backend
    $.ajax({
      type: "POST",
      url: snap_sidebar_cart_params.ajax_url,
      data: {
        action: "snap_sidebar_cart_get_cart",
        nonce: snap_sidebar_cart_params.nonce
      },
      success: function(response) {
        // Ocultar cualquier loader que pueda estar visible
        $(".snap-sidebar-cart__product-loader").hide();
      },
      error: function(xhr, status, error) {
        $(".snap-sidebar-cart__product-loader").hide();
      }
    });
  }
  
  // Función auxiliar para manejar el método closest de manera segura
  function safeClosest($element, selector) {
    try {
      if ($element && $element.closest) {
        return $element.closest(selector);
      } else {
        // Alternativa manual si closest no está disponible
        var $current = $element;
        while ($current.length) {
          if ($current.is(selector)) {
            return $current;
          }
          $current = $current.parent();
          if (!$current.length) break;
        }
        return $();
      }
    } catch (error) {
      return $();
    }
  }
  
  function applyCartPositionClass() {
    var $sidebar = $('.snap-sidebar-cart');
    var pos = (typeof snap_sidebar_cart_params !== 'undefined' && snap_sidebar_cart_params.cart_position) ? snap_sidebar_cart_params.cart_position : 'right';
    $sidebar.removeClass('snap-sidebar-cart--right snap-sidebar-cart--left snap-sidebar-cart--modal');
    $sidebar.addClass('snap-sidebar-cart--' + pos);
  }

  function getCartAnimationDuration() {
    return (typeof snap_sidebar_cart_params !== 'undefined' && snap_sidebar_cart_params.cart_animation_duration) ? parseInt(snap_sidebar_cart_params.cart_animation_duration, 10) : 300;
  }

  // Función para forzar la apertura del sidebar
  function forceOpenSidebar() {
    try {
      if (!$sidebar || $sidebar.length === 0) {
        $sidebar = $(".snap-sidebar-cart");
      }
      if (!$sidebar || $sidebar.length === 0) { return; }
      applyCartPositionClass();
      $sidebar.addClass("open");
      $(".snap-sidebar-cart__overlay").addClass("open");
      $('body').addClass("snap-sidebar-cart-open");
      if ($(window).width() < 768) {
        $sidebar.css({ "width": "100%", "max-width": "100%" });
      }
      setTimeout(function() {
        // Verificar el estado del carrito nuevamente
        var cartCount = parseInt($(".snap-sidebar-cart .snap-sidebar-cart__count").text()) || 0;
        
        // Solo proceder si hay productos en el carrito
        if (cartCount > 0) {
          // Verificar si hay pestaña activa
          var $activeTab = $('.snap-sidebar-cart__related-tab.active');
          
          if ($activeTab.length) {
            var activeTabType = $activeTab.data('tab');
            
            var $activeContainer = $('.snap-sidebar-cart__related-container[data-content="' + activeTabType + '"]');
            var $productsWrapper = $activeContainer.find('.swiper-wrapper');
            
            if ($productsWrapper.length && ($productsWrapper.children().length === 0 || $productsWrapper.find('.snap-sidebar-cart__loading-products').length > 0)) {
              
              // Obtener el primer producto del carrito
              var $firstProduct = $('.snap-sidebar-cart__product').first();
              if ($firstProduct.length) {
                var productId = $firstProduct.data('product-id');
                if (productId) {
                  if (window.snapSidebarCartSlider && typeof window.snapSidebarCartSlider.loadRelatedProducts === 'function') {
                    window.snapSidebarCartSlider.loadRelatedProducts(activeTabType, productId);
                  }
                }
              }
            }
          } else if ($('.snap-sidebar-cart__related-tab').length > 0) {
            // No hay pestaña activa pero hay pestañas disponibles
            var $firstTab = $('.snap-sidebar-cart__related-tab').first();
            $firstTab.addClass('active');
            var tabType = $firstTab.data('tab');
            var $container = $('.snap-sidebar-cart__related-container[data-content="' + tabType + '"]');
            $container.addClass('active');
            
            // Cargar productos relacionados para esta pestaña
            var $firstProduct = $('.snap-sidebar-cart__product').first();
            if ($firstProduct.length) {
              var productId = $firstProduct.data('product-id');
              if (productId) {
                if (window.snapSidebarCartSlider && typeof window.snapSidebarCartSlider.loadRelatedProducts === 'function') {
                  window.snapSidebarCartSlider.loadRelatedProducts(tabType, productId);
                }
              }
            }
          }
        } else {
          $(".snap-sidebar-cart__related-section").hide();
        }
      }, getCartAnimationDuration());
    } catch (error) {}
  }
  
  $(document).ready(function () {
    // Declarar $sidebar y $productsContainer al inicio del ready para asegurar su disponibilidad global en este closure
    $sidebar = $(".snap-sidebar-cart"); 
    $productsContainer = $(".snap-sidebar-cart__products-list"); 
    $cartProducts = $(".snap-sidebar-cart__products"); // Initialize $cartProducts here

    // Verificar el estado inicial del carrito y actualizar la visibilidad del footer
    var initialCartCount = parseInt($(".snap-sidebar-cart .snap-sidebar-cart__count").text()) || 0;
    updateFooterVisibility(initialCartCount);
    
    // Añadir manejador directo para el botón de carrito del tema
    $(".cart-contents, .ti-shopping-cart, .site-header-cart a").on("click", function(e) {
      e.preventDefault();
      e.stopPropagation();
      forceOpenSidebar();
      return false;
    });
    var currentRelatedProductTab = "related"; // Tab activo por defecto

    // Actualizar los valores CSS de las animaciones según configuración
    $('body').css({
      "--animation-duration": animationDuration + "ms",
      "--animation-delay": quantityUpdateDelay + "ms"
    });

    // Selector específico para los elementos que activan el carrito lateral
    $('body').on(
      "click",
      snap_sidebar_cart_params.activation_selectors + ", .minicart-header, .snap-sidebar-cart-trigger, .ti-shopping-cart, .cart-contents",
      function (e) {
        var $this = $(this);
        
        try {
          // Verificar si el botón podría ser para una variación de producto
          if (
            $this.hasClass("add_to_cart_button") &&
            (($this.attr("href") && isProductVariation($this.attr("href"))) || 
             $this.hasClass("product_type_variable") ||
             $this.hasClass("variations_form") ||
             (safeClosest($this, ".variations_form").length > 0))
          ) {
            // No prevenimos el comportamiento por defecto para que WooCommerce maneje la navegación a la página de detalles
            return;
          }

          // Para otros botones, abrimos normalmente el sidebar
          e.preventDefault();
          e.stopPropagation();
          
          // Usar la función forceOpenSidebar para abrir el sidebar de manera segura
          forceOpenSidebar();
        } catch (error) {
          // Intento de apertura directa en caso de error
          forceOpenSidebar();
        }
      }
    );

    // Abrir cuando se añade un producto al carrito (evento propio de WooCommerce)
    $(document.body).on(
      "added_to_cart",
      function (event, fragments, cart_hash, $button) {
        // Verificar si la apertura automática está habilitada
        var autoOpenValue = snap_sidebar_cart_params.auto_open;
        var shouldAutoOpen = (autoOpenValue === "1" || autoOpenValue === 1 || autoOpenValue === true || autoOpenValue === "true");
        
        // Verificar si el carrito estaba vacío antes de agregar este producto
        var cartCount = parseInt($(".snap-sidebar-cart .snap-sidebar-cart__count").text()) || 0;
        var wasCartEmpty = cartCount <= 1; // Si es 1, significa que acabamos de agregar el primer producto
        
        // Solo abrir el sidebar si la apertura automática está habilitada
        if (shouldAutoOpen) {
            // Si el carrito estaba vacío, asegurarnos de que el footer y la sección de productos relacionados sean visibles
            if (wasCartEmpty) {
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
            }
            
            // Usar la función global para abrir el sidebar de manera definitiva
            if (window.openSidebarDefinitive) {
                window.openSidebarDefinitive();
            } else {
                forceOpenSidebar();
            }
            
            // Esperar a que el sidebar esté abierto para verificar productos relacionados
            setTimeout(function() {
                // Verificar nuevamente si hay pestañas activas
                var $activeTab = $('.snap-sidebar-cart__related-tab.active');
                
                // Si no hay pestaña activa pero hay pestañas disponibles, activar la primera
                if (!$activeTab.length && $('.snap-sidebar-cart__related-tab').length > 0) {
                    $activeTab = $('.snap-sidebar-cart__related-tab').first();
                    $activeTab.addClass('active');
                }
                
                var activeTabType = $activeTab.length ? $activeTab.data('tab') : null;
                
                // Activar el contenedor correspondiente
                if (activeTabType) {
                    $('.snap-sidebar-cart__related-container').removeClass('active');
                    $('.snap-sidebar-cart__related-container[data-content="' + activeTabType + '"]').addClass('active');
                }
                
                var $activeContainer = $('.snap-sidebar-cart__related-container[data-content="' + activeTabType + '"]');
                var $productsWrapper = $activeContainer.find('.swiper-wrapper');
                
                // Obtener el producto añadido (si es posible) o el primer producto del carrito
                var productId = null;
                
                if ($button && $button.data("product_id")) {
                    productId = $button.data("product_id");
                } else {
                    var $firstProduct = $('.snap-sidebar-cart__product').first();
                    if ($firstProduct.length) {
                        productId = $firstProduct.data("product-id");
                    }
                }
                
                if (productId && activeTabType) {
                    if (window.snapSidebarCartSlider && typeof window.snapSidebarCartSlider.loadRelatedProducts === 'function') {
                        window.snapSidebarCartSlider.loadRelatedProducts(activeTabType, productId);
                    }
                }
            }, 600);
        } else {
        }
        
        // Asegurarnos de que el contenedor de productos esté definido
        if (!$productsContainer || $productsContainer.length === 0) {
          $productsContainer = $(".snap-sidebar-cart__products-list");
        }

        // Verificar si es una actualización de un producto existente
        var isProductUpdate = false;
        var productId = null;

        if ($button && $button.data("product_id")) {
          productId = $button.data("product_id");

          // Usar la función global para comprobar si el producto ya está en el carrito
          isProductUpdate = window.isProductInCart(productId);
        }
        // La apertura automática ya se verificó al inicio del manejador
        // Si es una actualización y no una adición, manejarlo diferente
        if (isProductUpdate) {
          // Actualizar contenido sin animación especial de nuevo producto
          $.ajax({
            type: "POST",
            url: snap_sidebar_cart_params.ajax_url,
            data: {
              action: "snap_sidebar_cart_get_content",
            },
            success: function (response) {
              if (response.success) {
                // Mostrar animación de actualización en el producto
                // window.highlightExistingProduct(productId); // Animación desactivada temporalmente
              }
            },
          });
        } else {
          // Para nuevos productos, seguir con el comportamiento normal
          console.log("Agregando nuevo producto al carrito");

          // Crear un espacio para el nuevo producto con un preloader
          if ($productsContainer.length) {
            var $newItemPlaceholder = $(
              '<li class="snap-sidebar-cart__product placeholder-animation"></li>'
            );

            // Agregar al inicio o al final según configuración
            $productsContainer.append($newItemPlaceholder);

            // Mostrar preloader en el placeholder
            var $preloader = $(
              '<div class="snap-sidebar-cart__product-loader" style="display:block;"><div class="snap-sidebar-cart__loader-spinner"></div></div>'
            );
            $newItemPlaceholder.append($preloader);

            // Configurar el preloader según las opciones
            var preloaderType = snap_sidebar_cart_params.preloader
              ? snap_sidebar_cart_params.preloader.type || "circle"
              : "circle";
            var preloaderPosition = snap_sidebar_cart_params.preloader
              ? snap_sidebar_cart_params.preloader.position || "center"
              : "center";

            console.log("Configurando preloader:", preloaderType, "en posición:", preloaderPosition);

            var $spinner = $preloader.find(
              ".snap-sidebar-cart__loader-spinner"
            );
            $spinner.addClass("preloader-" + preloaderType);
            $spinner.addClass("preloader-position-" + preloaderPosition);

            if (preloaderType === "dots") {
              $spinner.html("<span></span><span></span><span></span>");
            }
          }

          // Actualizar contenido del carrito mediante AJAX
          setTimeout(function () {
            // Asegurarnos de que los contenedores estén definidos antes de hacer la solicitud AJAX
            if (!$cartProducts || $cartProducts.length === 0) {
              $cartProducts = $(".snap-sidebar-cart__products");
              console.log("Redefiniendo $cartProducts antes de AJAX:", $cartProducts.length > 0 ? "Encontrado" : "No encontrado");
            }
            
            if (!$productsContainer || $productsContainer.length === 0) {
              $productsContainer = $(".snap-sidebar-cart__products-list");
              console.log("Redefiniendo $productsContainer antes de AJAX:", $productsContainer.length > 0 ? "Encontrado" : "No encontrado");
            }
            
            console.log("Realizando solicitud AJAX para obtener contenido del carrito");
            $.ajax({
              type: "POST",
              url: snap_sidebar_cart_params.ajax_url,
              data: {
                action: "snap_sidebar_cart_get_content",
              },
              success: function (response) {
                console.log("Respuesta AJAX recibida:", response);
                if (response.success) {
                  console.log("Contenido del carrito actualizado via AJAX");

                  // Eliminar el placeholder
                  if ($newItemPlaceholder && $newItemPlaceholder.length > 0) {
                    console.log("Eliminando placeholder");
                    $newItemPlaceholder.remove();
                  } else {
                    console.log("No se encontró placeholder para eliminar");
                  }

                  // Agregar clase para la animación al nuevo producto
                  var $newItem;
                  $newItem = $(".snap-sidebar-cart__product:last-child");

                  if ($newItem.length) {
                    // $newItem.addClass("new-item"); // Animación desactivada temporalmente
                    // setTimeout(function () {
                    //   $newItem.removeClass("new-item");
                    // }, animationDuration);
                  }

                  // Si tenemos el producto ID, obtener los productos relacionados
                  if (productId) {
                    if (window.snapSidebarCartSlider && typeof window.snapSidebarCartSlider.loadRelatedProducts === 'function') {
                        window.snapSidebarCartSlider.loadRelatedProducts(currentRelatedProductTab, productId);
                    } else {
                        console.warn("loadRelatedProducts no está disponible globalmente ni en snapSidebarCartSlider para currentRelatedProductTab.");
                    }
                  }
                }
              },
            });
          }, animationDuration / 3);
        }
      }
    );

    // Función para cerrar el sidebar
    function closeSidebar() {
      console.log("Ejecutando closeSidebar()");
      $(".snap-sidebar-cart").removeClass("open");
      $(".snap-sidebar-cart__overlay").css("display", "none");
      $('body').removeClass("snap-sidebar-cart-open");
    }

    // Función para abrir el sidebar
    function openSidebar() {
      console.log("Ejecutando openSidebar()");
      
      // Usar la función forceOpenSidebar para abrir el sidebar de manera segura
      forceOpenSidebar();
      
      // Verificar el estado del carrito y actualizar la visibilidad de elementos
      var cartCount = parseInt($(".snap-sidebar-cart .snap-sidebar-cart__count").text()) || 0;
      console.log("Conteo de carrito al abrir sidebar:", cartCount);
      
      // Actualizar visibilidad del footer y productos relacionados según el estado del carrito
      updateFooterVisibility(cartCount);
      
      try {
        // Verificar si hay pestaña activa
        var $activeTab = $('.snap-sidebar-cart__related-tab.active');
        var activeTabType = $activeTab.length ? $activeTab.data('tab') : null;
        
        // Si no hay pestaña activa pero hay pestañas, activar la primera
        if (!activeTabType && $('.snap-sidebar-cart__related-tab').length > 0 && cartCount > 0) {
          console.log('No hay pestaña activa, activando la primera');
          $activeTab = $('.snap-sidebar-cart__related-tab').first();
          $activeTab.addClass('active');
          activeTabType = $activeTab.data('tab');
          $('.snap-sidebar-cart__related-container[data-content="' + activeTabType + '"]').addClass('active');
        }
        
        // Obtener el contenedor activo
        var $activeContainer = $(".snap-sidebar-cart__related-container.active");
        var $productsWrapper = $activeContainer.find(".swiper-wrapper");
        
        console.log("Contenedor activo:", $activeContainer.length ? "Encontrado" : "No encontrado");
        console.log("Wrapper de productos:", $productsWrapper.length ? "Encontrado" : "No encontrado");
        
        // Determinar si necesitamos cargar productos relacionados
        var shouldLoadRelated = false;
        
        if ($productsWrapper.length) {
          if ($productsWrapper.children().length === 0) {
            console.log("Contenedor activo vacío, cargando productos relacionados");
            shouldLoadRelated = true;
          } else if ($productsWrapper.find('.snap-sidebar-cart__loading-products').length > 0) {
            console.log("Solo hay preloader, cargando productos relacionados");
            shouldLoadRelated = true;
          }
        }
        
        if (shouldLoadRelated) {
          // Obtener el primer producto del carrito para cargar sus relacionados
          var firstProduct = $(".snap-sidebar-cart__product").first();
          
          if (firstProduct.length) {
            var productId = firstProduct.data("product-id");
            
            // Si no se encuentra con data-product-id, intentar obtenerlo de otras formas
            if (!productId) {
              var hrefAttr = firstProduct.find("a").first().attr("href");
              if (hrefAttr) {
                productId = hrefAttr.split("/").filter(Boolean).pop();
              }
            }
            
            if (productId) {
              console.log("Cargando productos relacionados para ID:", productId, "tipo:", activeTabType);
              if (window.snapSidebarCartSlider && typeof window.snapSidebarCartSlider.loadRelatedProducts === 'function') {
                window.snapSidebarCartSlider.loadRelatedProducts(activeTabType, productId);
              } else {
                console.warn("loadRelatedProducts no está disponible globalmente ni en snapSidebarCartSlider al abrir sidebar.");
              }
            } else {
              console.log("No se pudo obtener ID del producto");
            }
          } else {
            console.log("No hay productos en el carrito");
          }
        } else {
          console.log("No es necesario cargar productos relacionados");
        }
        
        // Asegurarse de que los sliders existentes estén inicializados
        if (typeof initSliders === 'function') {
          console.log("Inicializando sliders existentes");
          initSliders();
        }
        
        // Verificar el estado del carrito y actualizar la visibilidad del footer
        var cartCount = parseInt($(".snap-sidebar-cart .snap-sidebar-cart__count").text()) || 0;
        updateFooterVisibility(cartCount);
      } catch (error) {
        console.error("Error al cargar productos relacionados:", error);
      }
    }

    // Función global para detectar si un producto ya está en el carrito
    function isProductInCart(productId) {
      var inCart = false;
      $(".snap-sidebar-cart__product").each(function () {
        var itemProductId = $(this).data("product-id");
        if (itemProductId == productId) {
          inCart = true;
          return false; // Salir del bucle each
        }
      });
      return inCart;
    }

    // Función para resaltar visualmente un producto existente en el carrito
    function highlightExistingProduct(productId) {
      $(".snap-sidebar-cart__product").each(function () {
        var $product = $(this);
        if ($product.data("product-id") == productId) {
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

          // Aplicar animación al contador de cantidad
          var $quantityInput = $product.find(".cart-item__quantity-input");
          if ($quantityInput.length) {
            $quantityInput.addClass("quantity-updated");
            setTimeout(function () {
              $quantityInput.removeClass("quantity-updated");
            }, animationDuration * 2);
          }

          // Resaltar brevemente el producto entero
          // $product.addClass("product-updated"); // Animación desactivada temporalmente
          setTimeout(function () {
            // $product.removeClass("product-updated");
          }, animationDuration * 2);

          return false; // Salir del bucle each
        }
      });
    }

    // Cerrar el carrito al hacer clic en el botón X (múltiples selectores para mayor compatibilidad)
    $(document).on(
      "click",
      ".snap-sidebar-cart__close, #snap-sidebar-cart-close",
      function (e) {
        console.log("Botón de cerrar clickeado");
        e.preventDefault();
        e.stopPropagation();
        closeSidebar();
      }
    );

    // Handler directo para el botón de cerrar por ID
    $("#snap-sidebar-cart-close").on("click", function (e) {
      console.log("Handler directo botón cerrar clickeado");
      e.preventDefault();
      e.stopPropagation();
      closeSidebar();
    });

    // Cierre al hacer clic en el overlay
    $('body').on("click", ".snap-sidebar-cart__overlay", function (e) {
      e.preventDefault();
      e.stopPropagation();
      closeSidebar();
    });

    // Cerrar con Escape
    $(document).on("keyup", function (e) {
      if (e.key === "Escape" && $sidebar.hasClass("open")) {
        console.log("Tecla ESC detectada - Cerrando sidebar");
        closeSidebar();
      }
    });

    // Cerrar al hacer clic en cualquier parte de la página fuera del sidebar
    $(document).on("click", function (e) {
      // Solo cerrar si el sidebar está abierto y el clic no fue dentro del sidebar ni un botón de activación
      if (
        $sidebar.hasClass("open") &&
        !$(e.target).closest(".snap-sidebar-cart__container").length &&
        !$(e.target).closest(snap_sidebar_cart_params.activation_selectors)
          .length
      ) {
        console.log("Clic detectado fuera del sidebar - Ejecutando closeSidebar()");
        closeSidebar();
      }
    });

    // Asegurarse de que el evento de clic se propague correctamente
    $('body').on("click", function(e) {
      if (!$(e.target).closest(".snap-sidebar-cart__container").length &&
          !$(e.target).closest(snap_sidebar_cart_params.activation_selectors).length &&
          $sidebar.hasClass("open")) {
        console.log("Evento de clic en body detectado fuera del sidebar");
        e.stopPropagation();
        closeSidebar();
      }
    });

    // Evitar que los clics dentro del sidebar lo cierren
    $sidebar.on("click", function (e) {
      e.stopPropagation();
    });

    /*
    // Cambiar de pestaña en productos relacionados
    $(document).on("click", ".snap-sidebar-cart__related-tab", function (e) {
      e.preventDefault();
      var $tab = $(this);
      var tabType = $tab.data("tab");

      console.log("=== CAMBIO DE PESTAÑA ===");
      console.log("Cambiando a pestaña:", tabType, "desde pestaña actual:", currentRelatedProductTab);
      console.log("Tab clickeada:", $tab.text());
      console.log("Datos del tab:", "data-tab='" + tabType + "'");

      if (tabType === currentRelatedProductTab) {
        console.log("La pestaña seleccionada ya está activa. No se realizará ninguna acción.");
        return; // Ya está activa
      }

      // Actualizar UI
      console.log("Actualizando interfaz de usuario:");
      console.log("- Quitando clase 'active' de todas las pestañas");
      $(".snap-sidebar-cart__related-tab").removeClass("active");
      
      console.log("- Añadiendo clase 'active' a la pestaña seleccionada:", $tab.text());
      $tab.addClass("active");

      console.log("- Quitando clase 'active' de todos los contenedores");
      $(".snap-sidebar-cart__related-container").removeClass("active");
      
      var $targetContent = $('.snap-sidebar-cart__related-container[data-content="' + tabType + '"]');
      console.log("- Buscando contenedor para mostrar:", "[data-content='" + tabType + "']", "¿Encontrado?", $targetContent.length > 0 ? "Sí" : "No");
      $targetContent.addClass("active");

      // Actualizar tab activo
      console.log("Actualizando tab activo de", currentRelatedProductTab, "a", tabType);
      currentRelatedProductTab = tabType;

      // Cargar productos si el contenedor está vacío
      var $targetContainer = $targetContent.find(".swiper-wrapper");
      console.log("Contenedor de productos:", "¿Encontrado?", $targetContainer.length > 0 ? "Sí" : "No");

      // Mostrar un preloader mientras se cargan los productos
      console.log("Mostrando preloader en el contenedor");
      
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
      
      console.log('Preloader en contenedor - Configuración:', {
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

      console.log("Contenedor actualizado, cargando productos para la pestaña:", tabType);
      
      // Obtener todos los productos del carrito para referencia
      // Esto aumenta las posibilidades de encontrar productos relacionados
      var productIds = [];
      $(".snap-sidebar-cart__product").each(function() {
        var $item = $(this);
        var productId = $item.data('product-id');
        if (productId) {
          productIds.push(productId);
        }
      });
      
      if (productIds.length > 0) {
        console.log("IDs de productos en el carrito:", productIds.join(", "));
        // Usar el primer producto como referencia principal
        if (window.snapSidebarCartSlider && typeof window.snapSidebarCartSlider.loadRelatedProducts === 'function') {
          window.snapSidebarCartSlider.loadRelatedProducts(tabType, productIds[0]);
        } else {
          console.warn("loadRelatedProducts no está disponible globalmente ni en snapSidebarCartSlider (desde cambio de pestaña).");
          $targetContainer.html(
            '<div class="snap-sidebar-cart__no-products">Error al cargar productos relacionados. La función no está disponible.</div>'
          );
        }
      } else {
        console.log("No hay productos en el carrito para usar como referencia");
        $targetContainer.html(
          '<div class="snap-sidebar-cart__no-products">No hay productos en el carrito para mostrar sugerencias.</div>'
        );
        $targetContainer
          .parent()
          .find(".snap-sidebar-cart__slider-nav")
          .hide();
      }
    });

    // Navegación del slider (botones prev/next)
    $(document).on("click", ".snap-sidebar-cart__slider-prev", function (e) {
      e.preventDefault();
      e.stopPropagation();
      console.log("Botón prev del slider clickeado");
      var $track = $(this).siblings(".swiper-wrapper");
      
      // Calcular el ancho de un elemento del slider para el desplazamiento
      var $item = $track.find(".snap-sidebar-cart__related-product").first();
      var itemWidth = $item.outerWidth(true);
      
      // Si no hay productos o no podemos calcular el ancho, usar un valor fijo
      var scrollAmount = itemWidth ? itemWidth * 2 : $track.width() * 0.5;
      
      console.log("Desplazando slider: " + scrollAmount + "px a la izquierda");
      $track.stop().animate(
        {
          scrollLeft: $track.scrollLeft() - scrollAmount,
        },
        300,
        function() {
          updateSliderNavigation($track);
        }
      );
    });

    $(document).on("click", ".snap-sidebar-cart__slider-next", function (e) {
      e.preventDefault();
      e.stopPropagation();
      console.log("Botón next del slider clickeado");
      var $track = $(this).siblings(".swiper-wrapper");
      
      // Calcular el ancho de un elemento del slider para el desplazamiento
      var $item = $track.find(".snap-sidebar-cart__related-product").first();
      var itemWidth = $item.outerWidth(true);
      
      // Si no hay productos o no podemos calcular el ancho, usar un valor fijo
      var scrollAmount = itemWidth ? itemWidth * 2 : $track.width() * 0.5;
      
      console.log("Desplazando slider: " + scrollAmount + "px a la derecha");
      $track.stop().animate(
        {
          scrollLeft: $track.scrollLeft() + scrollAmount,
        },
        300,
        function() {
          updateSliderNavigation($track);
        }
      );
    });
    */

    // Función para actualizar la visibilidad de los botones de navegación del slider
    window.updateSliderNavigation = function($track) {
      var maxScrollLeft = $track[0].scrollWidth - $track.outerWidth();
      var currentScrollLeft = $track.scrollLeft();
      
      var $prevButton = $track.siblings(".snap-sidebar-cart__slider-prev");
      var $nextButton = $track.siblings(".snap-sidebar-cart__slider-next");
      
      // Mostrar u ocultar botones según la posición del scroll
      if (currentScrollLeft <= 0) {
        $prevButton.addClass('disabled').css('opacity', '0.5');
      } else {
        $prevButton.removeClass('disabled').css('opacity', '1');
      }
      
      if (currentScrollLeft >= maxScrollLeft - 5) { // 5px de margen para evitar problemas de redondeo
        $nextButton.addClass('disabled').css('opacity', '0.5');
      } else {
        $nextButton.removeClass('disabled').css('opacity', '1');
      }
    }

    // Añadir productos relacionados al carrito
    $(document).on("click", ".snap-sidebar-cart__add-related-product", function (e) {
      e.preventDefault();

      if (addingProduct) {
        console.log("Ya se está añadiendo un producto, espere...");
        return; // Evitar múltiples clics simultáneos
      }

      var $button = $(this);
      var productId = $button.data("product-id");

      console.log("Añadiendo producto relacionado ID:", productId);

      // Verificar primero si el producto ya está en el carrito
      var existingProduct = false;
      var existingProductKey = null;
      var existingProductQuantity = 0;

      $(".snap-sidebar-cart__product").each(function () {
        if ($(this).data("product-id") == productId) {
          existingProduct = true;
          existingProductKey = $(this).data("key");
          existingProductQuantity = parseInt($(this).find(".cart-item__quantity-input").val(), 10) || 0;
          return false; // Romper el bucle
        }
      });

      console.log("Producto ya en carrito:", existingProduct ? "SÍ (clave: " + existingProductKey + ", cantidad: " + existingProductQuantity + ")" : "NO");

      // Mostrar estado de carga en el botón
      $button.addClass("loading");
      addingProduct = true;

      if (existingProduct && existingProductKey) {
        // Si el producto ya existe, incrementar su cantidad
        var newQuantity = existingProductQuantity + 1;
        console.log("Incrementando cantidad de", existingProductQuantity, "a", newQuantity);

        // Preparar para mostrar preloader
        var $existingItem = $(".snap-sidebar-cart__product[data-key='" + existingProductKey + "']");
        if ($existingItem.length) {
          window.setupAndShowLoader($existingItem);
        }

        // Actualizar cantidad mediante AJAX
        $.ajax({
          type: "POST",
          url: snap_sidebar_cart_params.ajax_url,
          data: {
            action: "snap_sidebar_cart_update",
            nonce: snap_sidebar_cart_params.nonce,
            cart_item_key: existingProductKey,
            quantity: newQuantity,
          },
          success: function (response) {
            console.log("Respuesta de actualización:", response);
            if (response.success) {
              // Destacar el producto actualizado
              window.highlightExistingProduct(productId);
              
              // Verificar límites de stock después de actualizar
              checkStockLimits();
            } else {
              if (response.data && response.data.message) {
                alert(response.data.message);
              } else {
                alert("Error al actualizar el producto en el carrito");
              }
              // Ocultar loader en caso de error
              $(".snap-sidebar-cart__product-loader").hide();
            }
          },
          error: function (xhr, status, error) {
            console.error("Error de AJAX:", error);
            alert("Error de comunicación con el servidor");
            // Ocultar loader en caso de error
            $(".snap-sidebar-cart__product-loader").hide();
          },
          complete: function () {
            $button.removeClass("loading");
            addingProduct = false;
          },
        });
      } else {
        // Si es un producto nuevo, añadirlo
        console.log("Añadiendo nuevo producto al carrito");

        // Crear un espacio para el preloader
        var $newItemPlaceholder = null;
        if ($productsContainer && $productsContainer.length) {
          $newItemPlaceholder = $('<li class="snap-sidebar-cart__product placeholder-animation"></li>');
          
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
          
          console.log('Nuevo producto - Configuración del preloader:', {
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
          var spinnerStyles = '';
          
          // Aplicar estilos según el tipo de preloader
          if (preloaderType === 'circle') {
              spinnerStyles = 'width: ' + preloaderSize + '; ' +
                            'height: ' + preloaderSize + '; ' +
                            'border-color: ' + preloaderColor + '; ' +
                            'border-top-color: ' + preloaderColor2 + ';';
          } else {
              spinnerStyles = 'width: ' + preloaderSize + '; ' +
                            'height: ' + preloaderSize + ';';
          }
          
          // Crear el HTML del preloader
          var spinnerHTML = '<div class="' + preloaderClasses + '" style="' + spinnerStyles + '"';
          
          // Añadir contenido específico según el tipo de preloader
          if (preloaderType === 'dots') {
              spinnerHTML += '><span style="background-color: ' + preloaderColor + ';"></span>' +
                           '<span style="background-color: ' + preloaderColor + ';"></span>' +
                           '<span style="background-color: ' + preloaderColor + ';"></span>';
          } else {
              spinnerHTML += '>';
          }
          
          // Cerrar la etiqueta div
          spinnerHTML += '</div>';
          
          // Mostrar preloader
          var $preloader = $('<div class="snap-sidebar-cart__product-loader" style="display:block;">' + spinnerHTML + '</div>');
          $newItemPlaceholder.append($preloader);
        }

        $.ajax({
          type: "POST",
          url: snap_sidebar_cart_params.ajax_url,
          data: {
            action: "snap_sidebar_cart_add",
            nonce: snap_sidebar_cart_params.nonce,
            product_id: productId,
            quantity: 1,
          },
          success: function (response) {
            console.log("Respuesta de añadir producto:", response);
            if (response.success) {
              // Eliminar el placeholder
              if ($newItemPlaceholder && $newItemPlaceholder.length > 0) {
                $newItemPlaceholder.remove();
              }
              
              // Destacar el nuevo producto
              var $newItem;
              $newItem = $(".snap-sidebar-cart__product:last-child");

              if ($newItem.length) {
                // $newItem.addClass("new-item"); // Animación desactivada temporalmente
                // setTimeout(function () {
                //   $newItem.removeClass("new-item");
                // }, animationDuration);
              }
              
              // Verificar límites de stock después de añadir
              checkStockLimits();
            } else {
              if (response.data && response.data.message) {
                alert(response.data.message);
              } else {
                alert("Error al añadir el producto al carrito");
              }
              // Eliminar el placeholder en caso de error
              if ($newItemPlaceholder && $newItemPlaceholder.length) {
                $newItemPlaceholder.remove();
              }
            }
          },
          error: function (xhr, status, error) {
            console.error("Error de AJAX:", error);
            alert("Error de comunicación con el servidor");
            // Eliminar el placeholder en caso de error
            if ($newItemPlaceholder && $newItemPlaceholder.length) {
                $newItemPlaceholder.remove();
            }
          },
          complete: function () {
            $button.removeClass("loading");
            addingProduct = false;
          },
        });
      }
    });

    // Inicializar slider cuando el DOM esté listo
    function initSliders() {
      // Actualizar botones según el estado del carrito
      if (data.cart_count > 0) {
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

        // Si hay productos pero no hay productos relacionados cargados, cargar para el primer producto
        if (
          $(".snap-sidebar-cart__related-section").length &&
          $(
            ".snap-sidebar-cart__related-container.active .snap-sidebar-cart__slider-track"
          ).children().length === 0
        ) {
          var firstProduct = $(".snap-sidebar-cart__product").first();
          if (firstProduct.length) {
            var productId = firstProduct
              .find("a")
              .first()
              .attr("href")
              .split("/")
              .filter(Boolean)
              .pop();
            if (productId) {
              loadRelatedProducts(currentRelatedProductTab, productId);
            }
          }
        }
      } else {
        $(".snap-sidebar-cart__buttons").remove();

        // Si no hay productos, limpiar los productos relacionados
        $(
          ".snap-sidebar-cart__related-container .snap-sidebar-cart__slider-track"
        ).empty();
      }

      // Disparar un evento personalizado
      $(document.body).trigger("snap_sidebar_cart_updated");
    }

    // Inicializar slider cuando el DOM esté listo
    function initSliders() {
      $(".snap-sidebar-cart__slider-track").each(function () {
        var $track = $(this);
        var childrenCount = $track.children().length;
        var containerWidth = $track.width();
        var itemWidth = $track.children().first().outerWidth(true);

        if (childrenCount * itemWidth <= containerWidth) {
          $track.parent().find(".snap-sidebar-cart__slider-nav").hide();
        } else {
          $track.parent().find(".snap-sidebar-cart__slider-nav").show();
        }
      });
    }

    // Función para verificar límites de stock y deshabilitar botones si es necesario
    window.checkStockLimits = function() {
      console.log("Verificando límites de stock para todos los productos");
      
      try {
        // Recorrer cada contenedor de cantidad
        $(".quantity.buttoned-input").each(function() {
          var $wrapper = $(this);
          var maxQty = parseInt($wrapper.data("max-qty"), 10);
          
          // Solo si hay un máximo definido
          if (!isNaN(maxQty) && maxQty > 0) {
            var $input = $wrapper.find("input.cart-item__quantity-input");
            var currentVal = parseInt($input.val(), 10);
            var $increaseBtn = $wrapper.find(".notabutton.quantity-up");
            
            console.log("Verificando producto - Max:", maxQty, "Actual:", currentVal, "¿Botón?", $increaseBtn.length ? "Sí" : "No");
            
            // Si la cantidad actual ha alcanzado o superado el máximo
            if (currentVal >= maxQty) {
              // Deshabilitar el botón de incremento
              $increaseBtn.addClass('disabled').attr('disabled', 'disabled');
              console.log("Botón deshabilitado para producto con stock máximo:", maxQty, "cantidad actual:", currentVal);
            } else {
              // Habilitar el botón de incremento
              $increaseBtn.removeClass('disabled').removeAttr('disabled');
              console.log("Botón habilitado para producto con stock disponible:", maxQty - currentVal, "unidades restantes");
            }
          }
        });
      } catch (error) {
        console.error("Error al verificar límites de stock:", error);
      }
    }
    
    // Ejecutar después de que el DOM esté listo
    initSliders();
    checkStockLimits(); // Verificar stock inicial

    // Ejecutar también cuando cambie el tamaño de la ventana
    $(window).on("resize", function () {
      initSliders();
    });

    // Recargar el carrito al cargar la página para asegurar que está actualizado
    $.ajax({
      type: "POST",
      url: snap_sidebar_cart_params.ajax_url,
      data: {
        action: "snap_sidebar_cart_get_content",
      },
      success: function (response) {
        if (response.success) {
          console.log("Contenido del carrito actualizado al cargar la página");
        }
      },
    });

    // Función para animar el producto nuevo o actualizado según la posición
    function animateNewOrUpdatedProduct(productId, isNew, position) {
      var $items = $('.snap-sidebar-cart__products-list .snap-sidebar-cart__product[data-product-id="' + productId + '"]');
      if ($items.length) {
        // Determinar el producto correcto según la posición
        var $item;
        if ($items.length === 1) {
          $item = $items;
        } else if (position === 'top') {
          $item = $items.first();
        } else {
          $item = $items.last();
        }
        if (isNew) {
          $item.addClass('new-item');
          setTimeout(function () {
            $item.removeClass('new-item');
          }, animationDuration * 3);
        } else {
          $item.addClass('product-updated');
          setTimeout(function () {
            $item.removeClass('product-updated');
          }, animationDuration * 2);
        }
      }
    }

    // Guardar IDs de productos antes de la actualización
    let prevProductIds = [];
    function getCurrentProductIds() {
      return $('.snap-sidebar-cart__products-list .snap-sidebar-cart__product').map(function() {
        return $(this).data('product-id');
      }).get();
    }
    prevProductIds = getCurrentProductIds();

    // Modificar el handler global para sincronizar el sidebar tras cualquier cambio en el carrito
    $(document.body).on('added_to_cart updated_cart_totals', function(event, fragments, cart_hash, $button) {
      let productId = null;
      if ($button && $button.data && $button.data('product_id')) {
        productId = $button.data('product_id');
      }
      prevProductIds = getCurrentProductIds();
      $.ajax({
        type: "POST",
        url: snap_sidebar_cart_params.ajax_url,
        data: {
          action: "snap_sidebar_cart_get_content",
        },
        success: function (response) {
          if (response.success) {
            if (response.data.cart_html) {
              if (typeof window.actualizarSidebarCartHTML === 'function') {
                window.actualizarSidebarCartHTML(response.data.cart_html, response.data.cart_count);
              } else {
                $(".snap-sidebar-cart .snap-sidebar-cart__products-list").replaceWith(response.data.cart_html);
                // Eliminar footers incrustados dentro del listado de productos
                $(".snap-sidebar-cart__products .snap-sidebar-cart__footer, .snap-sidebar-cart__products-list .snap-sidebar-cart__footer").remove();
                // Aplicar animación de fondo amarillo al producto recién agregado
                if (typeof animateNewOrUpdatedProduct === 'function' && productId) {
                  let position = (typeof snap_sidebar_cart_params !== 'undefined' && snap_sidebar_cart_params.new_product_position) ? snap_sidebar_cart_params.new_product_position : 'top';
                  animateNewOrUpdatedProduct(productId, true, position);
                }
              }
            }
            if (response.data.cart_count !== undefined) {
              $(".snap-sidebar-cart .snap-sidebar-cart__count").text(response.data.cart_count);
            }
            if (response.data.subtotal !== undefined) {
              $(".snap-sidebar-cart .snap-sidebar-cart__subtotal-price, .snap-sidebar-cart .snap-sidebar-cart__subtotal-value").html(response.data.subtotal);
            }
            if (typeof window.bindQuantityEvents === 'function') window.bindQuantityEvents();
            if (typeof checkStockLimits === 'function') checkStockLimits();
            let newProductIds = getCurrentProductIds();
            let isNew = false;
            if (productId && newProductIds.includes(productId)) {
              isNew = !prevProductIds.includes(productId);
            }
            let position = 'top';
            if (typeof window.getNewProductPosition === 'function') {
              position = window.getNewProductPosition();
            } else if (typeof snap_sidebar_cart_params !== 'undefined' && snap_sidebar_cart_params.new_product_position) {
              position = snap_sidebar_cart_params.new_product_position;
            }
            if (productId) {
              animateNewOrUpdatedProduct(productId, isNew, position);
            }
          }
        }
      });
    });

    // Ejecutar después de que el DOM esté listo
    initSliders();
    //window.bindQuantityEvents();
    checkStockLimits(); // Verificar stock inicial

    // Definición de bindQuantityEvents
    function bindQuantityEvents() {
      // Desenlazar eventos previos para evitar duplicados
      $(document).off('click', '.quantity-up');
      $(document).off('click', '.quantity-down');
      $(document).off('change', '.cart-item__quantity-input');
      $(document).off('input', '.cart-item__quantity-input');

      // Botón de aumentar cantidad
      $(document).on('click', '.quantity-up', function (e) {
        e.preventDefault();
        var $wrapper = $(this).closest('.quantity.buttoned-input');
        var $input = $wrapper.find('input.cart-item__quantity-input');
        var cartItemKey = $wrapper.data('key') || $input.data('key'); // Fallback al input
        var oldQuantity = parseInt($input.val(), 10) || 0;
        var maxQty = parseInt($wrapper.data('max-qty'), 10);
        var newQuantity = oldQuantity + 1;
        if (!isNaN(maxQty) && newQuantity > maxQty) {
          newQuantity = maxQty;
        }
        $input.val(newQuantity);
        if (!cartItemKey) {
          alert("Error: No se pudo determinar la clave del producto");
          return;
        }
        updateCartItemQuantity(cartItemKey, newQuantity, oldQuantity);
      });

      // Botón de disminuir cantidad
      $(document).on('click', '.quantity-down', function (e) {
        e.preventDefault();
        var $wrapper = $(this).closest('.quantity.buttoned-input');
        var $input = $wrapper.find('input.cart-item__quantity-input');
        var cartItemKey = $wrapper.data('key') || $input.data('key'); // Fallback al input
        var oldQuantity = parseInt($input.val(), 10) || 0;
        var newQuantity = oldQuantity - 1;
        if (newQuantity < 0) newQuantity = 0;
        $input.val(newQuantity);
        if (!cartItemKey) {
          alert("Error: No se pudo determinar la clave del producto");
          return;
        }
        updateCartItemQuantity(cartItemKey, newQuantity, oldQuantity);
      });

      // Cambio manual en el input de cantidad
      $(document).on('change', '.cart-item__quantity-input', function (e) {
        var $input = $(this);
        var $wrapper = $input.closest('.quantity.buttoned-input');
        var cartItemKey = $wrapper.data('key') || $input.data('key'); // Fallback al input
        var oldQuantity = parseInt($input.data('old-value'), 10) || 0;
        var newQuantity = parseInt($input.val(), 10) || 0;
        if (newQuantity < 0) newQuantity = 0;
        $input.val(newQuantity);
        if (!cartItemKey) {
          alert("Error: No se pudo determinar la clave del producto");
          return;
        }
        updateCartItemQuantity(cartItemKey, newQuantity, oldQuantity);
      });

      // Guardar el valor anterior al enfocar el input
      $(document).on('focus', '.cart-item__quantity-input', function () {
        $(this).data('old-value', $(this).val());
      });
    }
    window.bindQuantityEvents = bindQuantityEvents;

    // Definición de updateFooterVisibility
    function updateFooterVisibility(cartCount) {
      if (cartCount === 0) {
        $('.snap-sidebar-cart__footer').hide();
        $('.snap-sidebar-cart__related-section').hide();
        $('body').addClass('cart-empty');
        console.log("Carrito vacío: ocultando footer y productos relacionados");
      } else {
        $('.snap-sidebar-cart__footer').show();
        $('.snap-sidebar-cart__related-section').show();
        $('body').removeClass('cart-empty');
        console.log("Carrito con productos: mostrando footer y productos relacionados");
      }
    }
    window.updateFooterVisibility = updateFooterVisibility;
  });
})(jQuery);
