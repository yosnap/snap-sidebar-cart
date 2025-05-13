/**
 * JavaScript para el área de administración
 */
(function($) {
    'use strict';

    $(document).ready(function() {
        // Inicializar los selectores de color
        $('.snap-sidebar-cart-color-picker').wpColorPicker();
        
        // Mostrar/ocultar opciones de productos relacionados
        function toggleRelatedProducts() {
            var showRelated = $('input[name="snap_sidebar_cart_options[related_products][show]"]').is(':checked');
            
            var $relatedFields = $('input[name="snap_sidebar_cart_options[related_products][count]"]').closest('tr');
            $relatedFields = $relatedFields.add($('input[name="snap_sidebar_cart_options[related_products][columns]"]').closest('tr'));
            $relatedFields = $relatedFields.add($('select[name="snap_sidebar_cart_options[related_products][orderby]"]').closest('tr'));
            
            if (showRelated) {
                $relatedFields.show();
            } else {
                $relatedFields.hide();
            }
        }
        
        // Inicializar estado
        toggleRelatedProducts();
        
        // Actualizar cuando cambia el checkbox
        $('input[name="snap_sidebar_cart_options[related_products][show]"]').on('change', toggleRelatedProducts);
        
        // Mostrar/ocultar opciones de envío
        function toggleShipping() {
            var showShipping = $('input[name="snap_sidebar_cart_options[show_shipping]"]').is(':checked');
            
            // Opcional: si hay opciones específicas de envío para mostrar/ocultar
            // var $shippingFields = $('...').closest('tr');
            // 
            // if (showShipping) {
            //     $shippingFields.show();
            // } else {
            //     $shippingFields.hide();
            // }
        }
        
        // Inicializar estado
        toggleShipping();
        
        // Actualizar cuando cambia el checkbox
        $('input[name="snap_sidebar_cart_options[show_shipping]"]').on('change', toggleShipping);
        
        // Mostrar/ocultar opciones del icono de eliminación
        function toggleDeleteIcon() {
            var showDeleteIcon = $('#snap_cart_show_delete_icon_top').is(':checked');
            
            if (showDeleteIcon) {
                $('.delete-icon-options').show();
            } else {
                $('.delete-icon-options').hide();
            }
        }
        
        // Inicializar estado
        toggleDeleteIcon();
        
        // Actualizar cuando cambia el checkbox
        $('#snap_cart_show_delete_icon_top').on('change', toggleDeleteIcon);
        
        // Gestión de queries personalizadas para productos relacionados
        var customQueriesContainer = $('#custom-queries-container');
        var customQueryTemplate = $('#custom-query-template').html();
        
        // Añadir nueva query personalizada
        $('#add-custom-query').on('click', function() {
            var newIndex = customQueriesContainer.find('.custom-query-item').length;
            var newItem = customQueryTemplate.replace(/\{\{index\}\}/g, newIndex);
            customQueriesContainer.append(newItem);
            
            // Inicializar cualquier componente en la nueva query (si es necesario)
            customQueriesContainer.find('.custom-query-item:last-child .snap-sidebar-cart-color-picker').wpColorPicker();
        });
        
        // Eliminar query personalizada
        customQueriesContainer.on('click', '.remove-custom-query', function() {
            $(this).closest('.custom-query-item').remove();
            
            // Reindexar los elementos restantes para mantener índices consecutivos
            customQueriesContainer.find('.custom-query-item').each(function(index) {
                var $item = $(this);
                $item.attr('data-index', index);
                
                // Actualizar nombres de los campos
                $item.find('.custom-query-name').attr('name', 'snap_sidebar_cart_options[related_products][custom_queries][' + index + '][name]');
                $item.find('.custom-query-code').attr('name', 'snap_sidebar_cart_options[related_products][custom_queries][' + index + '][code]');
            });
        });
        
        // Actualizar el campo oculto de pestañas activas cuando cambian los checkboxes
        $('input[name="snap_sidebar_cart_options[related_products][active_tabs_arr][]"]').on('change', function() {
            updateActiveTabsField();
        });
        
        // Actualizar las pestañas activas cuando se cambian los nombres de las queries personalizadas
        customQueriesContainer.on('change', '.custom-query-name', function() {
            updateActiveTabsField();
        });
        
        // Función para actualizar el campo de pestañas activas
        function updateActiveTabsField() {
            var activeTabs = [];
            
            // Recopilar pestañas seleccionadas
            $('input[name="snap_sidebar_cart_options[related_products][active_tabs_arr][]"]:checked').each(function() {
                activeTabs.push($(this).val());
            });
            
            // Añadir pestañas personalizadas adicionales
            customQueriesContainer.find('.custom-query-item').each(function(index) {
                var name = $(this).find('.custom-query-name').val();
                if (name) {
                    activeTabs.push('custom_' + index);
                }
            });
            
            // Actualizar el campo oculto con las pestañas activas
            $('#active_tabs_hidden').val(activeTabs.join(','));
        }
    });

})(jQuery);
