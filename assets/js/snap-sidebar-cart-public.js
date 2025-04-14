/**
 * JavaScript para el funcionamiento del carrito lateral
 */
(function ($) {
  "use strict";

  // Variables globales para configuración de animaciones
  var animationDuration = 300;
  var quantityUpdateDelay = 200;
  var newProductPosition =
    snap_sidebar_cart_params.new_product_position || "top";

  console.log(
    "CONFIG: Posición de nuevos productos configurada como:",
    newProductPosition
  );

  // Función global para detectar si un producto ya está en el carrito
  window.isProductInCart = function (productId) {
    if (!productId) return false;

    var productFound = false;

    // Buscar el producto en todos los elementos del carrito
    $(".snap-sidebar-cart__product").each(function () {
      var dataProductId =
        $(this).attr("data-product-id") || $(this).data("product-id");
      if (dataProductId == productId) {
        productFound = true;
        return false; // Romper el bucle each
      }
    });

    console.log(
      "Verificando producto ID: " +
        productId +
        " en carrito: " +
        (productFound ? "SÍ" : "NO")
    );
    return productFound;
  };

  // Función global para resaltar un producto existente
  window.highlightExistingProduct = function (productId) {
    if (!productId) return;

    console.log("Resaltando producto ID: " + productId);

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
        setTimeout(function () {
          $product.removeClass("product-updated");
          $quantityInput.removeClass("quantity-updated");
        }, 1000);
      }
    }
  };

  // Verificar si es una variación de producto en la URL o botón
  function isProductVariation(url) {
    // Si no se proporciona URL, no podemos determinar
    if (!url) return false;
    
    // Verificamos si la URL contiene el parámetro variation_id o attribute_
    if (url.includes("?") && 
        (url.includes("variation_id=") || 
         url.includes("attribute_") || 
         url.includes("product_type=variable"))) {
      console.log("Variación detectada en URL:", url);
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
        console.log("Botón de producto variable detectado");
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

    // Preparar el preloader según el tipo
    var $loader = $product.find(".snap-sidebar-cart__loader-spinner");

    // Limpiar clases anteriores
    $loader.attr("class", "snap-sidebar-cart__loader-spinner");

    // Añadir clases según la configuración
    $loader.addClass("preloader-" + preloaderType);
    $loader.addClass("preloader-position-" + preloaderPosition);

    // Crear el HTML interno según el tipo de preloader
    if (preloaderType === "dots") {
      $loader.html("<span></span><span></span><span></span>");
    } else {
      $loader.html("");
    }

    // Mostrar el loader
    $product.find(".snap-sidebar-cart__product-loader").show();
  }

  // Función para actualizar la cantidad de un item en el carrito
  function updateCartItemQuantity(cartItemKey, quantity, oldQuantity) {
    if (!cartItemKey) {
      console.error(
        "Error: Clave de producto no válida para actualizar cantidad"
      );
      $(".snap-sidebar-cart__product-loader").hide();
      return;
    }

    console.log(
      "Enviando actualización para clave:",
      cartItemKey,
      "cantidad:",
      quantity
    );

    // Si es solo una actualización de cantidad y no eliminación
    var isQuantityUpdate = quantity > 0 && oldQuantity > 0;
    var $product = $('[data-key="' + cartItemKey + '"]');

    // Si es solo actualización de cantidad, mostrar animación especial
    if (isQuantityUpdate) {
      if ($product.length) {
        // Mostrar el loader con delay si es solo actualización de cantidad
        setTimeout(function () {
          setupAndShowLoader($product);
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
        setupAndShowLoader($product);
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
        console.log("Respuesta de actualización:", response);
        if (response.success) {
          updateCartContent(response.data);
        } else {
          if (response.data && response.data.message) {
            alert(response.data.message);
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
    });
  }

  // Función para actualizar el contenido del carrito
  function updateCartContent(data) {
    console.log("Actualizando contenido del carrito con datos:", data);

    // Actualizar el HTML del carrito
    $(".snap-sidebar-cart__products").html(data.cart_html);

    // Actualizar el contador
    $(".snap-sidebar-cart__count").text(data.cart_count);
    console.log("Actualizando contador a:", data.cart_count);

    // Actualizar los totales
    $(".snap-sidebar-cart__shipping-price").html(data.shipping_total);
    $(".snap-sidebar-cart__subtotal-price").html(data.subtotal);

    // Volver a vincular los eventos a los nuevos elementos del DOM
    bindQuantityEvents();
    
    // Verificar límites de stock
    checkStockLimits();

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
            loadRelatedProducts(productId, currentRelatedProductTab);
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

  // Variable para el tab activo de productos relacionados
  var currentRelatedProductTab = "related";

  // Función para cargar productos relacionados
  function loadRelatedProducts(productId, type) {
    var $targetContainer = $(
      '.snap-sidebar-cart__related-container[data-content="' +
        type +
        '"] .snap-sidebar-cart__slider-track'
    );

    if ($targetContainer.length === 0) {
      console.error("No se encontró el contenedor para productos relacionados de tipo:", type);
      return;
    }

    // Mostrar un preloader mientras se cargan los productos
    $targetContainer.html(
      '<div class="snap-sidebar-cart__loading-products">' +
      '<div class="snap-sidebar-cart__loader-spinner preloader-circle"></div>' +
      '<span>Cargando productos...</span>' +
      '</div>'
    );

    console.log("Solicitando productos relacionados de tipo [" + type + "] para producto ID:", productId);

    $.ajax({
      type: "POST",
      url: snap_sidebar_cart_params.ajax_url,
      data: {
        action: "snap_sidebar_cart_get_related",
        nonce: snap_sidebar_cart_params.nonce,
        product_id: productId,
        type: type,
      },
      success: function (response) {
        console.log("Respuesta obtenida para productos relacionados:", response);
        
        if (response.success && response.data.html && response.data.html.trim() !== '') {
          // Actualizar contenido con los productos obtenidos
          $targetContainer.html(response.data.html);
          console.log("Productos relacionados cargados correctamente");

          // Verificar si hay pocos productos para ocultar/mostrar navegación
          var $items = $targetContainer.children(".snap-sidebar-cart__related-product");
          var childrenCount = $items.length;
          var containerWidth = $targetContainer.width();
          
          // Solo si hay productos
          if (childrenCount > 0) {
            var itemWidth = $items.first().outerWidth(true);
            console.log("Productos:", childrenCount, "Ancho container:", containerWidth, "Ancho item:", itemWidth);

            if (childrenCount * itemWidth <= containerWidth) {
              console.log("Pocos productos, ocultando navegación");
              $targetContainer
                .parent()
                .find(".snap-sidebar-cart__slider-nav")
                .hide();
            } else {
              console.log("Suficientes productos, mostrando navegación");
              $targetContainer
                .parent()
                .find(".snap-sidebar-cart__slider-nav")
                .show();
              
              // Inicializar estado de navegación
              updateSliderNavigation($targetContainer);
            }
            
            // Configurar hover para mostrar imágenes de galería
            setupProductGalleryHover();
            
            // Configurar evento de scroll para actualizar botones de navegación
            $targetContainer.on('scroll', function() {
              updateSliderNavigation($(this));
            });
          } else {
            console.log("No se encontraron productos para mostrar (respuesta HTML vacía)");
            $targetContainer.html(
              '<div class="snap-sidebar-cart__no-products">No se encontraron productos.</div>'
            );
            $targetContainer
              .parent()
              .find(".snap-sidebar-cart__slider-nav")
              .hide();
          }
        } else {
          console.log("No se recibieron productos o respuesta vacía");
          
          // Intentar con un producto diferente si este falla
          tryAlternativeProduct(productId, type, $targetContainer);
        }
      },
      error: function (xhr, status, error) {
        console.error("Error en la petición AJAX:", error);
        
        // Intentar con un producto diferente si este falla
        tryAlternativeProduct(productId, type, $targetContainer);
      },
    });
  }
  
  // Función para intentar cargar con un producto alternativo si el primero falla
  function tryAlternativeProduct(excludeProductId, type, $targetContainer) {
    console.log("Intentando cargar productos con un producto alternativo");
    
    // Obtener otro producto del carrito que no sea el que ya falló
    var alternativeProductId = null;
    
    $(".snap-sidebar-cart__product").each(function() {
      var pid = $(this).data('product-id');
      if (pid && pid != excludeProductId) {
        alternativeProductId = pid;
        return false; // Romper el bucle
      }
    });
    
    if (alternativeProductId) {
      console.log("Intentando con producto alternativo ID:", alternativeProductId);
      
      $.ajax({
        type: "POST",
        url: snap_sidebar_cart_params.ajax_url,
        data: {
          action: "snap_sidebar_cart_get_related",
          nonce: snap_sidebar_cart_params.nonce,
          product_id: alternativeProductId,
          type: type,
        },
        success: function (response) {
          if (response.success && response.data.html && response.data.html.trim() !== '') {
            // Actualizar contenido con los productos obtenidos del producto alternativo
            $targetContainer.html(response.data.html);
            console.log("Productos cargados exitosamente con producto alternativo");
            
            // Configurar navegación y hover
            var $items = $targetContainer.children(".snap-sidebar-cart__related-product");
            var childrenCount = $items.length;
            
            if (childrenCount > 0) {
              var containerWidth = $targetContainer.width();
              var itemWidth = $items.first().outerWidth(true);
              
              if (childrenCount * itemWidth <= containerWidth) {
                $targetContainer.parent().find(".snap-sidebar-cart__slider-nav").hide();
              } else {
                $targetContainer.parent().find(".snap-sidebar-cart__slider-nav").show();
              }
              
              setupProductGalleryHover();
            } else {
              showNoProductsMessage();
            }
          } else {
            showNoProductsMessage();
          }
        },
        error: function() {
          showNoProductsMessage();
        }
      });
    } else {
      showNoProductsMessage();
    }
    
    // Función para mostrar mensaje de no productos encontrados
    function showNoProductsMessage() {
      console.log("No se pudieron cargar productos relacionados");
      $targetContainer.html(
        '<div class="snap-sidebar-cart__no-products">No se encontraron productos de la misma categoría.</div>'
      );
      $targetContainer
        .parent()
        .find(".snap-sidebar-cart__slider-nav")
        .hide();
    }
  }
  
  // Función para configurar el hover que muestra las imágenes de galería
  function setupProductGalleryHover() {
    $(".snap-sidebar-cart__related-product").each(function() {
      var $product = $(this);
      var $primaryImage = $product.find(".primary-image");
      var $hoverImage = $product.find(".hover-image");
      
      if ($hoverImage.length) {
        // Configurar hover
        $product.hover(
          function() {
            // Mouse enter
            $primaryImage.css("opacity", "0");
            $hoverImage.css("opacity", "1");
          },
          function() {
            // Mouse leave
            $primaryImage.css("opacity", "1");
            $hoverImage.css("opacity", "0");
          }
        );
      }
    });
  }

  // Función para vincular eventos a los controles de cantidad
  function bindQuantityEvents() {
    console.log("Vinculando eventos a los controles de cantidad");

    // Asegurarnos de que cada botón tiene un manejador de evento único
    $(".notabutton.quantity-up, .notabutton.quantity-down").off("click");

    // Volver a vincular eventos para incrementar cantidad
    $(".notabutton.quantity-up").on("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      var $button = $(this);
      
      // Si el botón está deshabilitado, no hacer nada
      if ($button.hasClass('disabled') || $button.attr('disabled')) {
          console.log("Botón de incremento deshabilitado - Stock máximo alcanzado");
          return;
      }
      
      var $quantityWrapper = $button.closest(".quantity.buttoned-input");
      var $input = $quantityWrapper.find("input.cart-item__quantity-input");
      var cartItemKey = $quantityWrapper.data("key") || $input.data("key");
      var $product = $button.closest(".snap-sidebar-cart__product");
      
      // Verificar límite de stock
      var maxQty = parseInt($quantityWrapper.data("max-qty"), 10);
      var currentVal = parseInt($input.val(), 10);
      
      if (!cartItemKey && $product.length) {
        cartItemKey = $product.data("key");
      }
      
      // Verificar si va a exceder el stock disponible
      if (!isNaN(maxQty) && currentVal >= maxQty) {
          console.log("Stock máximo alcanzado:", maxQty);
          // Deshabilitar el botón
          $button.addClass('disabled').attr('disabled', 'disabled');
          return;
      }
      
      var newVal = currentVal + 1;
      
      // Si el nuevo valor alcanza el máximo, deshabilitar el botón
      if (!isNaN(maxQty) && newVal >= maxQty) {
          $button.addClass('disabled').attr('disabled', 'disabled');
      }

      console.log(
        "Evento directo - Aumentar cantidad:",
        cartItemKey,
        "de",
        currentVal,
        "a",
        newVal,
        "- Stock máximo:",
        maxQty || "No definido"
      );

      if (!cartItemKey) {
        console.error("Error: No se pudo encontrar la clave del producto");
        return;
      }

      // Actualizar valor de input
      $input.val(newVal);

      // Actualizar carrito con la cantidad antigua para determinar animación
      updateCartItemQuantity(cartItemKey, newVal, currentVal);
    });

    // Volver a vincular eventos para decrementar cantidad
    $(".notabutton.quantity-down").on("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      var $button = $(this);
      var $quantityWrapper = $button.closest(".quantity.buttoned-input");
      var $input = $quantityWrapper.find("input.cart-item__quantity-input");
      var cartItemKey = $quantityWrapper.data("key") || $input.data("key");
      var $product = $button.closest(".snap-sidebar-cart__product");

      if (!cartItemKey && $product.length) {
        cartItemKey = $product.data("key");
      }

      var currentVal = parseInt($input.val(), 10);
      var newVal = currentVal > 1 ? currentVal - 1 : 0; // Permitir llegar a 0 para eliminar

      console.log(
        "Evento directo - Disminuir cantidad:",
        cartItemKey,
        "de",
        currentVal,
        "a",
        newVal
      );

      if (!cartItemKey) {
        console.error("Error: No se pudo encontrar la clave del producto");
        return;
      }

      // Actualizar valor de input
      $input.val(newVal);

      // Actualizar carrito con la cantidad antigua para determinar animación
      updateCartItemQuantity(cartItemKey, newVal, currentVal);
    });
  }

  $(document).ready(function () {
    console.log("Inicializando Snap Sidebar Cart...");

    // Variables principales
    var $body = $("body");
    var $sidebar = $(".snap-sidebar-cart");
    var $overlay = $(".snap-sidebar-cart__overlay");
    var $container = $(".snap-sidebar-cart__products");
    var $productsContainer = $(".snap-sidebar-cart__products-list");
    var addingProduct = false;
    var currentRelatedProductTab = "related"; // Tab activo por defecto

    console.log(
      "Configuración cargada - Posición nuevos productos:",
      newProductPosition
    );

    // Actualizar los valores CSS de las animaciones según configuración
    document.documentElement.style.setProperty(
      "--animation-duration",
      animationDuration + "ms"
    );
    document.documentElement.style.setProperty(
      "--animation-delay",
      quantityUpdateDelay + "ms"
    );

    // Selector específico para los elementos que activan el carrito lateral
    $body.on(
      "click",
      snap_sidebar_cart_params.activation_selectors,
      function (e) {
        var $this = $(this);

        // Verificar si el botón podría ser para una variación de producto
        if (
          $this.hasClass("add_to_cart_button") &&
          (($this.attr("href") && isProductVariation($this.attr("href"))) || 
           $this.hasClass("product_type_variable") ||
           $this.hasClass("variations_form") ||
           $this.closest(".variations_form").length)
        ) {
          console.log("Botón de variación de producto detectado - No abriendo sidebar");
          // No prevenimos el comportamiento por defecto para que WooCommerce maneje la navegación a la página de detalles
          return;
        }

        // Para otros botones, abrimos normalmente el sidebar
        e.preventDefault();
        e.stopPropagation();
        console.log("Botón de producto simple detectado - Abriendo sidebar");
        openSidebar();
      }
    );

    // Abrir cuando se añade un producto al carrito (evento propio de WooCommerce)
    $(document.body).on(
      "added_to_cart",
      function (event, fragments, cart_hash, $button) {
        console.log("Evento added_to_cart detectado");

        // Verificar si es una actualización de un producto existente
        var isProductUpdate = false;
        var productId = null;

        if ($button && $button.data("product_id")) {
          productId = $button.data("product_id");

          // Usar la función global para comprobar si el producto ya está en el carrito
          isProductUpdate = window.isProductInCart(productId);
          console.log(
            "Producto ID:",
            productId,
            "Ya en carrito:",
            isProductUpdate ? "Sí" : "No"
          );
        }

        // Si la apertura automática está habilitada, primero abrimos el sidebar
        if (
          snap_sidebar_cart_params.auto_open === "1" ||
          snap_sidebar_cart_params.auto_open === true
        ) {
          openSidebar();
        }

        // Si es una actualización y no una adición, manejarlo diferente
        if (isProductUpdate) {
          console.log("Actualizando producto existente en el carrito");

          // Actualizar contenido sin animación especial de nuevo producto
          $.ajax({
            type: "POST",
            url: snap_sidebar_cart_params.ajax_url,
            data: {
              action: "snap_sidebar_cart_get_content",
            },
            success: function (response) {
              if (response.success) {
                // Actualizar el contenido del carrito
                updateCartContent(response.data);

                // Mostrar animación de actualización en el producto
                window.highlightExistingProduct(productId);
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
            if (newProductPosition === "top") {
              console.log("Insertando placeholder al inicio del contenedor");
              $productsContainer.prepend($newItemPlaceholder);
            } else {
              console.log("Insertando placeholder al final del contenedor");
              $productsContainer.append($newItemPlaceholder);
            }

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
            $.ajax({
              type: "POST",
              url: snap_sidebar_cart_params.ajax_url,
              data: {
                action: "snap_sidebar_cart_get_content",
              },
              success: function (response) {
                if (response.success) {
                  console.log("Contenido del carrito actualizado via AJAX");

                  // Eliminar el placeholder
                  if ($newItemPlaceholder) {
                    $newItemPlaceholder.remove();
                  }

                  // Actualizar el contenido del carrito
                  updateCartContent(response.data);

                  // Agregar clase para la animación al nuevo producto
                  var $newItem;
                  if (newProductPosition === "top") {
                    $newItem = $(".snap-sidebar-cart__product:first-child");
                  } else {
                    $newItem = $(".snap-sidebar-cart__product:last-child");
                  }

                  if ($newItem.length) {
                    $newItem.addClass("new-item");

                    // Eliminar la clase después de la animación
                    setTimeout(function () {
                      $newItem.removeClass("new-item");
                    }, animationDuration);
                  }

                  // Si tenemos el producto ID, obtener los productos relacionados
                  if (productId) {
                    loadRelatedProducts(productId, currentRelatedProductTab);
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
      $("body").removeClass("snap-sidebar-cart-open");
    }

    // Función para abrir el sidebar
    function openSidebar() {
      console.log("Ejecutando openSidebar()");
      $(".snap-sidebar-cart").addClass("open");
      $(".snap-sidebar-cart__overlay").css("display", "block");
      $("body").addClass("snap-sidebar-cart-open");

      // Cargar productos relacionados si el contenedor activo está vacío
      var $activeContainer = $(
        ".snap-sidebar-cart__related-container.active .snap-sidebar-cart__slider-track"
      );
      if ($activeContainer.length && $activeContainer.children().length === 0) {
        // Obtener el primer producto del carrito para cargar sus relacionados
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
            loadRelatedProducts(productId, currentRelatedProductTab);
          }
        }
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
          $product.addClass("product-updated");
          setTimeout(function () {
            $product.removeClass("product-updated");
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
    $body.on("click", ".snap-sidebar-cart__overlay", function (e) {
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
    $("body").on("click", function(e) {
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

    // Cambiar de pestaña en productos relacionados
    $(document).on("click", ".snap-sidebar-cart__related-tab", function (e) {
      e.preventDefault();
      var $tab = $(this);
      var tabType = $tab.data("tab");

      console.log("Cambiando a pestaña:", tabType, "desde pestaña actual:", currentRelatedProductTab);

      if (tabType === currentRelatedProductTab) {
        return; // Ya está activa
      }

      // Actualizar UI
      $(".snap-sidebar-cart__related-tab").removeClass("active");
      $tab.addClass("active");

      $(".snap-sidebar-cart__related-container").removeClass("active");
      var $targetContent = $('.snap-sidebar-cart__related-container[data-content="' + tabType + '"]');
      $targetContent.addClass("active");

      // Actualizar tab activo
      currentRelatedProductTab = tabType;

      // Cargar productos si el contenedor está vacío
      var $targetContainer = $targetContent.find(".snap-sidebar-cart__slider-track");

      // Mostrar un preloader mientras se cargan los productos
      $targetContainer.html(
        '<div class="snap-sidebar-cart__loading-products">' +
        '<div class="snap-sidebar-cart__loader-spinner preloader-circle"></div>' +
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
        loadRelatedProducts(productIds[0], tabType);
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
      var $track = $(this).siblings(".snap-sidebar-cart__slider-track");
      
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
      var $track = $(this).siblings(".snap-sidebar-cart__slider-track");
      
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
    
    // Función para actualizar la visibilidad de los botones de navegación
    function updateSliderNavigation($track) {
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
          setupAndShowLoader($existingItem);
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
              // Actualizar contenido del carrito
              updateCartContent(response.data);

              // Destacar el producto actualizado
              highlightExistingProduct(productId);
              
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
          
          if (newProductPosition === "top") {
            $productsContainer.prepend($newItemPlaceholder);
          } else {
            $productsContainer.append($newItemPlaceholder);
          }
          
          // Mostrar preloader
          var $preloader = $('<div class="snap-sidebar-cart__product-loader" style="display:block;"><div class="snap-sidebar-cart__loader-spinner preloader-circle"></div></div>');
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
            new_product_position: newProductPosition,
          },
          success: function (response) {
            console.log("Respuesta de añadir producto:", response);
            if (response.success) {
              // Eliminar el placeholder
              if ($newItemPlaceholder && $newItemPlaceholder.length) {
                $newItemPlaceholder.remove();
              }
              
              // Actualizar el contenido del carrito
              updateCartContent(response.data);

              // Destacar el nuevo producto
              var $newItem;
              if (newProductPosition === "top") {
                $newItem = $(".snap-sidebar-cart__product:first-child");
              } else {
                $newItem = $(".snap-sidebar-cart__product:last-child");
              }

              if ($newItem.length) {
                $newItem.addClass("new-item");
                // Eliminar la clase después de la animación
                setTimeout(function () {
                  $newItem.removeClass("new-item");
                }, animationDuration);
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

    // Incrementar cantidad
    $body.on("click", ".snap-sidebar-cart__quantity-up", function () {
      var $button = $(this);
      var $product = $button.closest(".snap-sidebar-cart__product");
      var $input = $product.find(".snap-sidebar-cart__quantity-input");
      var cartItemKey = $product.data("key");
      var currentVal = parseInt($input.val(), 10);
      var newVal = currentVal + 1;

      // Actualizar valor de input
      $input.val(newVal);

      // Actualizar carrito con la cantidad antigua para determinar animación
      updateCartItemQuantity(cartItemKey, newVal, currentVal);
    });

    // Decrementar cantidad
    $body.on("click", ".snap-sidebar-cart__quantity-down", function () {
      var $button = $(this);
      var $product = $button.closest(".snap-sidebar-cart__product");
      var $input = $product.find(".snap-sidebar-cart__quantity-input");
      var cartItemKey = $product.data("key");
      var currentVal = parseInt($input.val(), 10);
      var newVal = currentVal > 1 ? currentVal - 1 : 0; // Permitir llegar a 0 para eliminar

      // Actualizar valor de input
      $input.val(newVal);

      // Actualizar carrito con la cantidad antigua para determinar animación
      updateCartItemQuantity(cartItemKey, newVal, currentVal);
    });

    // Actualizar cantidad con input manualmente
    $body.on("change", ".snap-sidebar-cart__quantity-input", function () {
      var $input = $(this);
      var $product = $input.closest(".snap-sidebar-cart__product");
      var cartItemKey = $product.data("key");
      var oldVal = parseInt($input.data("initial-value"), 10) || 0;
      var newVal = parseInt($input.val(), 10);

      // Validar valor
      if (isNaN(newVal) || newVal < 0) {
        newVal = 0;
        $input.val(newVal);
      }

      // Actualizar carrito con la cantidad antigua para determinar animación
      updateCartItemQuantity(cartItemKey, newVal, oldVal);

      // Actualizar el valor inicial para la próxima vez
      $input.data("initial-value", newVal);
    });

    // Incrementar cantidad (para los nuevos botones SVG)
    $body.on("click", ".notabutton.quantity-up", function (e) {
      e.preventDefault();
      e.stopPropagation();
      var $button = $(this);
      
      // Si el botón está deshabilitado, no hacer nada
      if ($button.hasClass('disabled') || $button.attr('disabled')) {
          console.log("Botón de incremento deshabilitado - Stock máximo alcanzado");
          return;
      }
      
      var $quantityWrapper = $button.closest(".quantity.buttoned-input");
      var $input = $quantityWrapper.find("input.cart-item__quantity-input");
      var cartItemKey = $quantityWrapper.data("key") || $input.data("key");
      var $product = $button.closest(".snap-sidebar-cart__product");
      
      // Verificar límite de stock
      var maxQty = parseInt($quantityWrapper.data("max-qty"), 10);
      var currentVal = parseInt($input.val(), 10);
      
      if (!cartItemKey && $product.length) {
        cartItemKey = $product.data("key");
      }
      
      // Verificar si va a exceder el stock disponible
      if (!isNaN(maxQty) && currentVal >= maxQty) {
          console.log("Stock máximo alcanzado:", maxQty);
          // Deshabilitar el botón
          $button.addClass('disabled').attr('disabled', 'disabled');
          return;
      }
      
      var newVal = currentVal + 1;
      
      // Si el nuevo valor alcanza el máximo, deshabilitar el botón
      if (!isNaN(maxQty) && newVal >= maxQty) {
          $button.addClass('disabled').attr('disabled', 'disabled');
      }

      console.log(
        "Aumentar cantidad:",
        cartItemKey,
        "de",
        currentVal,
        "a",
        newVal,
        "- Stock máximo:",
        maxQty || "No definido"
      );

      if (!cartItemKey) {
        console.error("Error: No se pudo encontrar la clave del producto");
        return;
      }

      // Actualizar valor de input
      $input.val(newVal);

      // Actualizar carrito con animación adecuada
      updateCartItemQuantity(cartItemKey, newVal, currentVal);
    });

    // La función setupAndShowLoader ya está definida al principio del archivo

    // Decrementar cantidad (para los nuevos botones SVG)
    $body.on("click", ".notabutton.quantity-down", function (e) {
      e.preventDefault();
      e.stopPropagation();
      var $button = $(this);
      var $quantityWrapper = $button.closest(".quantity.buttoned-input");
      var $input = $quantityWrapper.find("input.cart-item__quantity-input");
      var cartItemKey = $quantityWrapper.data("key") || $input.data("key");
      var $product = $button.closest(".snap-sidebar-cart__product");

      if (!cartItemKey && $product.length) {
        cartItemKey = $product.data("key");
      }

      var currentVal = parseInt($input.val(), 10);
      var newVal = currentVal > 1 ? currentVal - 1 : 0; // Permitir llegar a 0 para eliminar

      console.log(
        "Disminuir cantidad:",
        cartItemKey,
        "de",
        currentVal,
        "a",
        newVal
      );

      if (!cartItemKey) {
        console.error("Error: No se pudo encontrar la clave del producto");
        return;
      }

      // Si la nueva cantidad es 0, mostrar una animación especial antes de eliminar
      if (newVal === 0) {
        console.log("Eliminando producto del carrito (cantidad 0)");
        
        // Mostrar el preloader para indicar la eliminación
        setupAndShowLoader($product);
        
        // Añadir clase para la animación de eliminación
        $product.addClass("removing");
      }

      // Actualizar valor de input
      $input.val(newVal);

      // Actualizar carrito con animación adecuada
      updateCartItemQuantity(cartItemKey, newVal, currentVal);
      
      // Si se ha habilitado algún botón de incremento de cantidad después de decrementar,
      // actualizamos el estado de los botones
      if (currentVal > 0 && newVal > 0) {
        // Esperar a que se complete la animación antes de verificar
        setTimeout(function() {
          checkStockLimits();
        }, animationDuration);
      }
    });

    // Actualizar cantidad con input manualmente (para el nuevo campo de entrada)
    $body.on("change", ".cart-item__quantity-input", function () {
      var $input = $(this);
      var $product = $input.closest(".snap-sidebar-cart__product");
      var cartItemKey = $product.data("key");
      var oldVal = parseInt($input.data("initial-value"), 10) || 0;
      var newVal = parseInt($input.val(), 10);

      console.log(
        "Cambio manual de cantidad:",
        cartItemKey,
        "de",
        oldVal,
        "a",
        newVal
      );

      // Validar valor
      if (isNaN(newVal) || newVal < 0) {
        newVal = 0;
        $input.val(newVal);
      }

      // Actualizar carrito con animación adecuada
      updateCartItemQuantity(cartItemKey, newVal, oldVal);

      // Actualizar el valor inicial para la próxima vez
      $input.data("initial-value", newVal);
    });

    // El código para eliminar productos ha sido removido
    // Los productos ahora deben ser eliminados reduciendo la cantidad a 0

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
              loadRelatedProducts(productId, currentRelatedProductTab);
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
    bindQuantityEvents();
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
          updateCartContent(response.data);
        }
      },
    });
  });
})(jQuery);

/**
 * Función para verificar si un producto ya está en el carrito
 * @param {number} productId - El ID del producto que se quiere verificar
 * @return {boolean} - true si el producto ya está en el carrito, false en caso contrario
 */
function isProductInCart(productId) {
  if (!productId) return false;

  var productFound = false;

  // Buscar el producto en todos los elementos del carrito
  $(".snap-sidebar-cart__product").each(function () {
    var dataProductId = $(this).attr("data-product-id");
    if (dataProductId == productId) {
      productFound = true;
      return false; // Romper el bucle each
    }
  });

  return productFound;
}

/**
 * Resalta un producto existente en el carrito cuando se actualiza su cantidad
 * @param {number} productId - El ID del producto a resaltar
 */
function highlightExistingProduct(productId) {
  if (!productId) return;

  // Buscar el producto en el carrito
  var $product = $(
    ".snap-sidebar-cart__product[data-product-id='" + productId + "']"
  );

  if ($product.length) {
    // Añadir clase para destacar el elemento completo
    $product.addClass("product-updated");

    // Buscar el input de cantidad para ese producto
    var $quantityInput = $product.find(".cart-item__quantity-input");
    if ($quantityInput.length) {
      $quantityInput.addClass("quantity-updated");

      // Remover las clases después de la animación
      setTimeout(function () {
        $product.removeClass("product-updated");
        $quantityInput.removeClass("quantity-updated");
      }, 1000);
    }
  }
}

/**
 * Actualiza el contenido del carrito
 * @param {Object} data - Datos del contenido a actualizar
 */
function updateCartContent(data) {
  if (data.cart_content) {
    $cartContent.html(data.cart_content);
  }
  if (data.cart_count !== undefined) {
    updateCartCount(data.cart_count);
  }
  if (data.cart_subtotal !== undefined) {
    updateCartSubtotal(data.cart_subtotal);
  }
}
