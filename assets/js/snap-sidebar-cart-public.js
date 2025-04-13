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

  // Verificar si es una variación de producto en la URL
  function isProductVariation(url) {
    // Verificamos si la URL contiene el parámetro variation_id o attribute_
    return (
      url.includes("?") &&
      (url.includes("variation_id=") || url.includes("attribute_"))
    );
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
      return;
    }

    $targetContainer.html(
      '<div class="snap-sidebar-cart__loading-products">Cargando productos...</div>'
    );

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
        if (response.success && response.data.html) {
          $targetContainer.html(response.data.html);

          // Verificar si hay pocos productos para ocultar navegación
          var childrenCount = $targetContainer.children().length;
          var containerWidth = $targetContainer.width();
          var itemWidth = $targetContainer.children().first().outerWidth(true);

          if (childrenCount * itemWidth <= containerWidth) {
            $targetContainer
              .parent()
              .find(".snap-sidebar-cart__slider-nav")
              .hide();
          } else {
            $targetContainer
              .parent()
              .find(".snap-sidebar-cart__slider-nav")
              .show();
          }
        } else {
          $targetContainer.html(
            '<div class="snap-sidebar-cart__no-products">No se encontraron productos.</div>'
          );
        }
      },
      error: function () {
        $targetContainer.html(
          '<div class="snap-sidebar-cart__error">Error al cargar productos.</div>'
        );
      },
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
          $this.attr("href") &&
          isProductVariation($this.attr("href"))
        ) {
          // No prevenimos el comportamiento por defecto para que WooCommerce maneje la navegación a la página de detalles
          return;
        }

        // Para otros botones, abrimos normalmente el sidebar
        e.preventDefault();
        e.stopPropagation();
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
              $productsContainer.prepend($newItemPlaceholder);
            } else {
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
        closeSidebar();
      }
    });

    // Evitar que los clics dentro del sidebar lo cierren
    $sidebar.on("click", function (e) {
      e.stopPropagation();
    });

    // Cambiar de pestaña en productos relacionados
    $body.on("click", ".snap-sidebar-cart__related-tab", function (e) {
      e.preventDefault();
      var $tab = $(this);
      var tabType = $tab.data("tab");

      if (tabType === currentRelatedProductTab) {
        return; // Ya está activa
      }

      // Actualizar UI
      $(".snap-sidebar-cart__related-tab").removeClass("active");
      $tab.addClass("active");

      $(".snap-sidebar-cart__related-container").removeClass("active");
      $(
        '.snap-sidebar-cart__related-container[data-content="' + tabType + '"]'
      ).addClass("active");

      // Actualizar tab activo
      currentRelatedProductTab = tabType;

      // Cargar productos si el contenedor está vacío
      var $targetContainer = $(
        '.snap-sidebar-cart__related-container[data-content="' +
          tabType +
          '"] .snap-sidebar-cart__slider-track'
      );

      if ($targetContainer.children().length === 0) {
        // Obtener el primer producto del carrito para referencia
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
            loadRelatedProducts(productId, tabType);
          }
        }
      }
    });

    // Navegación del slider (botones prev/next)
    $body.on("click", ".snap-sidebar-cart__slider-prev", function () {
      var $track = $(this).siblings(".snap-sidebar-cart__slider-track");
      var scrollAmount = $track.width() * 0.8;
      $track.animate(
        {
          scrollLeft: $track.scrollLeft() - scrollAmount,
        },
        300
      );
    });

    $body.on("click", ".snap-sidebar-cart__slider-next", function () {
      var $track = $(this).siblings(".snap-sidebar-cart__slider-track");
      var scrollAmount = $track.width() * 0.8;
      $track.animate(
        {
          scrollLeft: $track.scrollLeft() + scrollAmount,
        },
        300
      );
    });

    // Añadir productos relacionados al carrito
    $body.on("click", ".snap-sidebar-cart__add-related-product", function (e) {
      e.preventDefault();

      if (addingProduct) {
        return; // Evitar múltiples clics simultáneos
      }

      var $button = $(this);
      var productId = $button.data("product-id");

      $button.addClass("loading");
      addingProduct = true;

      $.ajax({
        type: "POST",
        url: snap_sidebar_cart_params.ajax_url,
        data: {
          action: "snap_sidebar_cart_add",
          nonce: snap_sidebar_cart_params.nonce,
          product_id: productId,
          quantity: 1,
          new_product_position: "top", // Forzar posición al inicio
        },
        success: function (response) {
          if (response.success) {
            // Verificar si el producto ya existía en el carrito
            var existingProductKey = null;
            $(".snap-sidebar-cart__product").each(function () {
              if ($(this).data("product-id") == productId) {
                existingProductKey = $(this).data("key");
                return false; // Romper el bucle
              }
            });

            if (existingProductKey) {
              // Si el producto ya existe, sólo actualizar la cantidad
              console.log("Producto ya en el carrito, actualizando cantidad");
              // Actualizar el contenido del carrito
              updateCartContent(response.data);

              // Animar el cambio de cantidad
              var $existingItem = $(
                ".snap-sidebar-cart__product[data-key='" +
                  existingProductKey +
                  "']"
              );
              $existingItem
                .find(".cart-item__quantity-input")
                .addClass("quantity-updated");

              // Eliminar la clase después de la animación
              setTimeout(function () {
                $existingItem
                  .find(".cart-item__quantity-input")
                  .removeClass("quantity-updated");
              }, 600);
            } else {
              // Si es un producto nuevo
              console.log("Agregando nuevo producto al inicio del carrito");
              // Preparar espacio para el nuevo producto con animación
              if ($productsContainer.length) {
                var $newItemPlaceholder = $(
                  '<li class="snap-sidebar-cart__product placeholder"></li>'
                );
                $productsContainer.prepend($newItemPlaceholder);
              }

              // Actualizar el contenido del carrito
              updateCartContent(response.data);

              // Agregar clase para la animación al nuevo producto
              var $newItem = $(".snap-sidebar-cart__product:first-child");
              $newItem.addClass("new-item");

              // Eliminar la clase después de la animación
              setTimeout(function () {
                $newItem.removeClass("new-item");
              }, 600);
            }
          } else {
            if (response.data && response.data.message) {
              alert(response.data.message);
            } else {
              alert("Error al añadir el producto al carrito");
            }
          }
        },
        error: function () {
          alert("Error de comunicación con el servidor");
        },
        complete: function () {
          $button.removeClass("loading");
          addingProduct = false;
        },
      });
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

      // Actualizar valor de input
      $input.val(newVal);

      // Actualizar carrito con animación adecuada
      updateCartItemQuantity(cartItemKey, newVal, currentVal);
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
    function checkStockLimits() {
      console.log("Verificando límites de stock para todos los productos");
      
      // Recorrer cada contenedor de cantidad
      $(".quantity.buttoned-input").each(function() {
        var $wrapper = $(this);
        var maxQty = parseInt($wrapper.data("max-qty"), 10);
        
        // Solo si hay un máximo definido
        if (!isNaN(maxQty)) {
          var $input = $wrapper.find("input.cart-item__quantity-input");
          var currentVal = parseInt($input.val(), 10);
          var $increaseBtn = $wrapper.find(".notabutton.quantity-up");
          
          // Si la cantidad actual ha alcanzado o superado el máximo
          if (currentVal >= maxQty) {
            // Deshabilitar el botón de incremento
            $increaseBtn.addClass('disabled').attr('disabled', 'disabled');
            console.log("Botón deshabilitado para producto con stock máximo:", maxQty, "cantidad actual:", currentVal);
          } else {
            // Habilitar el botón de incremento
            $increaseBtn.removeClass('disabled').removeAttr('disabled');
          }
        }
      });
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
