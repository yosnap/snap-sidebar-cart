/**
 * Script para asegurar que la sección de productos relacionados se oculte cuando el carrito está vacío
 * 
 * Este script se ejecuta después de cualquier actualización del carrito y verifica si el carrito
 * está vacío. Si está vacío, oculta la sección de productos relacionados.
 */
jQuery(function($) {
    'use strict';

    // Función para verificar si el carrito está vacío y ocultar la sección de productos relacionados
    function checkEmptyCartAndHideRelated() {
        // Verificar si el carrito está vacío
        var cartCount = parseInt($(".snap-sidebar-cart__count").text()) || 0;
        var hasEmptyMessage = $(".snap-sidebar-cart__empty").length > 0;
        
        console.log("Verificando carrito vacío: Contador =", cartCount, "Mensaje vacío =", hasEmptyMessage ? "Sí" : "No");
        
        if (cartCount === 0 || hasEmptyMessage) {
            console.log("Carrito detectado como vacío, ocultando sección de productos relacionados");
            
            // Marcar el carrito como vacío
            $(".snap-sidebar-cart").addClass("cart-is-empty");
            
            // Ocultar el footer y la sección de productos relacionados
            $(".snap-sidebar-cart__footer").hide();
            
            // Usar múltiples métodos para asegurar que la sección de productos relacionados se oculte
            var $relatedSection = $(".snap-sidebar-cart__related-section");
            
            // Aplicar múltiples métodos de ocultación
            $relatedSection.hide();
            $relatedSection.css("display", "none");
            $relatedSection.attr("style", "display: none !important");
            
            // Eliminar cualquier contenido de la sección de productos relacionados
            $relatedSection.find(".snap-sidebar-cart__related-container").empty();
            
            console.log("Sección de productos relacionados ocultada");
        } else {
            console.log("Carrito no está vacío, contador =", cartCount);
            $(".snap-sidebar-cart").removeClass("cart-is-empty");
        }
    }
    
    // Ejecutar la verificación cuando se carga la página
    $(document).ready(function() {
        console.log("Empty cart fix cargado");
        setTimeout(checkEmptyCartAndHideRelated, 500);
    });
    
    // Ejecutar la verificación cuando se actualiza el carrito
    $(document.body).on("snap_sidebar_cart_updated", function() {
        console.log("Evento de actualización de carrito detectado");
        setTimeout(checkEmptyCartAndHideRelated, 100);
    });
    
    // Ejecutar la verificación cuando se elimina un producto
    $(document.body).on("snap_sidebar_cart_empty", function() {
        console.log("Evento de carrito vacío detectado");
        setTimeout(checkEmptyCartAndHideRelated, 100);
    });
    
    // Ejecutar la verificación cuando se abre el sidebar
    $(document.body).on("snap_sidebar_cart_opened", function() {
        console.log("Evento de sidebar abierto detectado");
        setTimeout(checkEmptyCartAndHideRelated, 100);
    });
    
    // También verificar periódicamente (cada 2 segundos) mientras el sidebar está abierto
    setInterval(function() {
        if ($(".snap-sidebar-cart").hasClass("open")) {
            console.log("Verificación periódica mientras el sidebar está abierto");
            checkEmptyCartAndHideRelated();
        }
    }, 2000);
    
    // Agregar una regla CSS dinámica para asegurar que la sección de productos relacionados se oculte
    $("<style>")
        .prop("type", "text/css")
        .html(`
            .snap-sidebar-cart.cart-is-empty .snap-sidebar-cart__related-section,
            .snap-sidebar-cart__empty ~ .snap-sidebar-cart__related-section,
            .snap-sidebar-cart__products:empty ~ .snap-sidebar-cart__related-section {
                display: none !important;
                visibility: hidden !important;
                height: 0 !important;
                opacity: 0 !important;
                overflow: hidden !important;
                margin: 0 !important;
                padding: 0 !important;
                border: none !important;
            }
        `)
        .appendTo("head");
});