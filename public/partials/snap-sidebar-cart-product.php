<?php
/**
 * Plantilla para mostrar un producto en el carrito lateral
 *
 * @since      1.0.0
 * @var        WC_Product    $product           El producto.
 * @var        array         $cart_item         Datos del item en el carrito.
 * @var        string        $cart_item_key     La clave única del item en el carrito.
 * @var        bool          $is_new_item       Si es un item recién añadido.
 */

if (!defined('ABSPATH')) {
    exit; // Salir si se accede directamente
}

// Información básica del producto
$product_id = $product->get_id();
$product_permalink = $product->get_permalink();
$product_name = $product->get_name();
$quantity = $cart_item['quantity'];
$price = WC()->cart->get_product_price($product);
$regular_price = $product->get_regular_price();
$sale_price = $product->get_sale_price();
$has_discount = $sale_price && $regular_price > $sale_price;
$discount_percentage = $has_discount ? round(($regular_price - $sale_price) / $regular_price * 100) : 0;

// Obtener la imagen del producto
$thumbnail = $product->get_image(array(100, 100));

// Verificar si el producto tiene variación
$product_variation_data = '';
if (isset($cart_item['variation']) && is_array($cart_item['variation'])) {
    foreach ($cart_item['variation'] as $name => $value) {
        $taxonomy = str_replace('attribute_', '', $name);
        $label = wc_attribute_label($taxonomy, $product);
        
        // Intentar convertir el slug del atributo a su nombre
        $term_name = $value;
        
        // Si el atributo es una taxonomía, obtenemos el término real
        if (taxonomy_exists($taxonomy)) {
            $term = get_term_by('slug', $value, $taxonomy);
            if ($term && !is_wp_error($term)) {
                $term_name = $term->name;
            }
        }
        
        $product_variation_data .= '<span class="snap-sidebar-cart__product-variation">' . $label . ': ' . $term_name . '</span>';
    }
}

// Información de stock
$stock_quantity = $product->get_stock_quantity();
$manage_stock = $product->get_manage_stock();
$is_in_stock = $product->is_in_stock();
$max_purchase = '';

// Determinar la cantidad máxima que se puede comprar
if ($manage_stock && $stock_quantity !== null) {
    $max_purchase = $stock_quantity;
    if (isset($cart_item['quantity'])) {
        // Si el producto ya está en el carrito, añadir esa cantidad al máximo disponible
        $max_purchase = $stock_quantity;
    }
} elseif (!$is_in_stock) {
    $max_purchase = $quantity; // No permitir aumentar si no hay stock
}

// Atributo para JavaScript para saber si deshabilitar el botón
$max_qty_attr = $max_purchase !== '' ? 'data-max-qty="' . esc_attr($max_purchase) . '"' : '';
$is_at_max = ($max_purchase !== '' && $quantity >= $max_purchase) ? 'disabled' : '';

// Información de envío estimado
$shipping_days = 3; // Por defecto, 3 días - esto podría ser configurable o calculado dinámicamente

// Clase adicional para productos nuevos
$item_class = $is_new_item ? 'snap-sidebar-cart__product new-item' : 'snap-sidebar-cart__product';
?>

<li class="<?php echo esc_attr($item_class); ?>" data-key="<?php echo esc_attr($cart_item_key); ?>" data-product-id="<?php echo esc_attr($product_id); ?>" data-debug="product-item-<?php echo esc_attr($product_id); ?>">
    <!-- Información de depuración -->
    <span style="display: none; font-size: 0;" class="cart-item-debug-info" data-cart-key="<?php echo esc_attr($cart_item_key); ?>">
        CartItemKey: <?php echo esc_html($cart_item_key); ?>
    </span>
    <div class="snap-sidebar-cart__product-image">
        <?php if ($product_permalink) : ?>
            <a href="<?php echo esc_url($product_permalink); ?>">
                <?php echo $thumbnail; ?>
            </a>
        <?php else : ?>
            <?php echo $thumbnail; ?>
        <?php endif; ?>
    </div>

    <div class="snap-sidebar-cart__product-details">
        <div class="snap-sidebar-cart__product-header">
            <div class="snap-sidebar-cart__product-title">
                <?php echo esc_html($product_name); ?>
                
                <?php if (!empty($product->get_attribute('color')) || !empty($product_variation_data)) : ?>
                    <div class="snap-sidebar-cart__product-variant">
                        <?php if (!empty($product->get_attribute('color'))) : ?>
                            <?php echo esc_html($product->get_attribute('color')); ?>
                        <?php endif; ?>
                        
                        <?php echo $product_variation_data; ?>
                    </div>
                <?php endif; ?>
                
                <?php
                // Mostrar campos personalizados del carrito (como Grabado)
                if (!empty($cart_item) && is_array($cart_item)) :
                    // Verificar si existe el campo de grabado directamente en el item del carrito
                    if (isset($cart_item['grabado'])) : ?>
                        <div class="snap-sidebar-cart__product-custom-field snap-sidebar-cart__product-engraving">
                            <strong><?php esc_html_e('Grabado:', 'snap-sidebar-cart'); ?></strong> 
                            <?php echo esc_html($cart_item['grabado']); ?>
                        </div>
                    <?php elseif (isset($cart_item['Grabado'])) : ?>
                        <div class="snap-sidebar-cart__product-custom-field snap-sidebar-cart__product-engraving">
                            <strong><?php esc_html_e('Grabado:', 'snap-sidebar-cart'); ?></strong> 
                            <?php echo esc_html($cart_item['Grabado']); ?>
                        </div>
                    <?php endif;
                    
                    // Buscar en cualquier campo personalizado que pueda contener la palabra "grabado"
                    foreach ($cart_item as $key => $value) :
                        if (is_string($key) && is_string($value) && 
                            !empty($value) && 
                            (strtolower($key) === 'grabado' || 
                             strpos(strtolower($key), 'grabado') !== false ||
                             strpos(strtolower($key), 'engraving') !== false ||
                             strpos(strtolower($key), 'custom_text') !== false ||
                             strpos(strtolower($key), 'personalización') !== false)) :
                            
                            // Formatear el nombre del campo para mostrar
                            $display_key = $key;
                            
                            // Si es un campo tipo engraving_text, mostrar solo "Grabado"
                            if (strpos(strtolower($key), 'engraving_text') !== false) {
                                $display_key = __('Grabado', 'snap-sidebar-cart');
                            } else if (strpos(strtolower($key), 'engraving') !== false) {
                                $display_key = __('Grabado', 'snap-sidebar-cart');
                            } else {
                                // Conservar el nombre original pero formatearlo mejor
                                $display_key = ucfirst(str_replace('_', ' ', $key));
                            }
                    ?>
                            <div class="snap-sidebar-cart__product-custom-field snap-sidebar-cart__product-engraving">
                                <strong><?php echo esc_html($display_key); ?>:</strong> 
                                <?php echo esc_html($value); ?>
                            </div>
                    <?php
                        endif;
                    endforeach;
                    
                    // Buscar en campos de metadata de WooCommerce
                    if (isset($cart_item['data']) && is_object($cart_item['data'])) :
                        $metadata = $cart_item['data']->get_meta_data();
                        foreach ($metadata as $meta) :
                            $data = $meta->get_data();
                            if (isset($data['key']) && isset($data['value']) && 
                                !empty($data['value']) && 
                                (strtolower($data['key']) === 'grabado' || 
                                 strpos(strtolower($data['key']), 'grabado') !== false ||
                                 strpos(strtolower($data['key']), 'engraving') !== false)) :
                                
                                // Formatear el nombre del campo para mostrar
                                $display_key = $data['key'];
                                
                                // Si es un campo tipo engraving_text, mostrar solo "Grabado"
                                if (strpos(strtolower($data['key']), 'engraving_text') !== false) {
                                    $display_key = __('Grabado', 'snap-sidebar-cart');
                                } else if (strpos(strtolower($data['key']), 'engraving') !== false) {
                                    $display_key = __('Grabado', 'snap-sidebar-cart');
                                } else {
                                    // Conservar el nombre original pero formatearlo mejor
                                    $display_key = ucfirst(str_replace('_', ' ', $data['key']));
                                }
                    ?>
                                <div class="snap-sidebar-cart__product-custom-field snap-sidebar-cart__product-engraving">
                                    <strong><?php echo esc_html($display_key); ?>:</strong> 
                                    <?php echo is_string($data['value']) ? esc_html($data['value']) : esc_html(print_r($data['value'], true)); ?>
                                </div>
                    <?php
                            endif;
                        endforeach;
                    endif;
                    
                    // Verificar en _product_options
                    if (isset($cart_item['_product_options']) && is_array($cart_item['_product_options'])) :
                        foreach ($cart_item['_product_options'] as $option_key => $option_value) :
                            if (is_string($option_key) && !empty($option_value) && 
                                (strtolower($option_key) === 'grabado' || 
                                 strpos(strtolower($option_key), 'grabado') !== false ||
                                 strpos(strtolower($option_key), 'engraving') !== false)) :
                                
                                // Formatear el nombre del campo para mostrar
                                $display_key = $option_key;
                                
                                // Si es un campo tipo engraving_text, mostrar solo "Grabado"
                                if (strpos(strtolower($option_key), 'engraving_text') !== false) {
                                    $display_key = __('Grabado', 'snap-sidebar-cart');
                                } else if (strpos(strtolower($option_key), 'engraving') !== false) {
                                    $display_key = __('Grabado', 'snap-sidebar-cart');
                                } else {
                                    // Conservar el nombre original pero formatearlo mejor
                                    $display_key = ucfirst(str_replace('_', ' ', $option_key));
                                }
                    ?>
                                <div class="snap-sidebar-cart__product-custom-field snap-sidebar-cart__product-engraving">
                                    <strong><?php echo esc_html($display_key); ?>:</strong> 
                                    <?php echo is_string($option_value) ? esc_html($option_value) : esc_html(print_r($option_value, true)); ?>
                                </div>
                    <?php
                            endif;
                        endforeach;
                    endif;
                    
                    // Verificar en campos _custom_options (usado por algunos plugins)
                    if (isset($cart_item['_custom_options']) && is_array($cart_item['_custom_options'])) :
                        foreach ($cart_item['_custom_options'] as $option_key => $option_value) :
                            if (is_string($option_key) && !empty($option_value) && 
                                (strtolower($option_key) === 'grabado' || 
                                 strpos(strtolower($option_key), 'grabado') !== false ||
                                 strpos(strtolower($option_key), 'engraving') !== false)) :
                                
                                // Formatear el nombre del campo para mostrar
                                $display_key = $option_key;
                                
                                // Si es un campo tipo engraving_text, mostrar solo "Grabado"
                                if (strpos(strtolower($option_key), 'engraving_text') !== false) {
                                    $display_key = __('Grabado', 'snap-sidebar-cart');
                                } else if (strpos(strtolower($option_key), 'engraving') !== false) {
                                    $display_key = __('Grabado', 'snap-sidebar-cart');
                                } else {
                                    // Conservar el nombre original pero formatearlo mejor
                                    $display_key = ucfirst(str_replace('_', ' ', $option_key));
                                }
                    ?>
                                <div class="snap-sidebar-cart__product-custom-field snap-sidebar-cart__product-engraving">
                                    <strong><?php echo esc_html($display_key); ?>:</strong> 
                                    <?php echo is_string($option_value) ? esc_html($option_value) : esc_html(print_r($option_value, true)); ?>
                                </div>
                    <?php
                            endif;
                        endforeach;
                    endif;
                endif;
                ?>
                
                <?php
                // Mostrar el tiempo de entrega solo si está habilitado
                $show_delivery_time = isset($this->options['show_delivery_time']) ? $this->options['show_delivery_time'] : true;
                if ($show_delivery_time) : ?>
                <div class="snap-sidebar-cart__product-shipping">
                    <?php
                    // Si tenemos la función disponible, la usamos
                    if (method_exists($this, 'get_delivery_time_text')) {
                        echo esc_html($this->get_delivery_time_text($product_id));
                    } else {
                        // Fallback por si acaso
                        $delivery_text = isset($this->options['delivery_time_text']) ? $this->options['delivery_time_text'] : __('Entrega en 1-3 días hábiles', 'snap-sidebar-cart');
                        echo esc_html($delivery_text);
                    }
                    ?>
                </div>
                <?php endif; ?>
            </div>
        </div>

        <div class="snap-sidebar-cart__product-footer">
            <div class="quantity buttoned-input" data-key="<?php echo esc_attr($cart_item_key); ?>" <?php echo $max_qty_attr; ?>>
                <button type="button" class="notabutton quantity-down" aria-label="<?php esc_attr_e('Reducir', 'snap-sidebar-cart'); ?>">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="feather feather-minus">
                        <title><?php esc_html_e('Menos', 'snap-sidebar-cart'); ?></title>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                </button>
                <input class="cart-item__quantity-input" type="number" size="2" id="updates_<?php echo esc_attr($cart_item_key); ?>" name="updates[]" data-key="<?php echo esc_attr($cart_item_key); ?>" data-initial-value="<?php echo esc_attr($quantity); ?>" data-line="1" value="<?php echo esc_attr($quantity); ?>" min="0" <?php echo $max_purchase !== '' ? 'max="' . esc_attr($max_purchase) . '"' : ''; ?> aria-label="<?php esc_attr_e('Cantidad', 'snap-sidebar-cart'); ?>">
                <button type="button" class="notabutton quantity-up" aria-label="<?php esc_attr_e('Aumentar', 'snap-sidebar-cart'); ?>" <?php echo $is_at_max; ?>>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="feather feather-plus">
                        <title><?php esc_html_e('Más', 'snap-sidebar-cart'); ?></title>
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                </button>
            </div>

            <div class="snap-sidebar-cart__product-price-container">
                <?php
                // Verificar si la opción para mostrar el icono de eliminación superior está habilitada
                $show_delete_icon_top = isset($this->options['show_delete_icon_top']) ? $this->options['show_delete_icon_top'] : true;
                if ($show_delete_icon_top) : ?>
                <button type="button" class="snap-sidebar-cart__product-remove-top" data-key="<?php echo esc_attr($cart_item_key); ?>" aria-label="<?php esc_attr_e('Eliminar producto', 'snap-sidebar-cart'); ?>">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-trash-2">
                        <title><?php esc_html_e('Eliminar', 'snap-sidebar-cart'); ?></title>
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                </button>
                <?php endif; ?>
                <?php if ($has_discount) : ?>
                    <span class="snap-sidebar-cart__product-regular-price">
                        <?php echo wc_price($regular_price); ?>
                    </span>
                    <span class="snap-sidebar-cart__product-discount">
                        <?php echo sprintf('-%d%%', $discount_percentage); ?>
                    </span>
                <?php endif; ?>
                <span class="snap-sidebar-cart__product-price">
                    <?php echo $price; ?>
                </span>
                <?php /* Icono de X eliminado para simplificar la interfaz */ ?>
            </div>
        </div>
        
        <!-- Loader para actualizaciones y eliminaciones -->
        <div class="snap-sidebar-cart__product-loader">
            <!-- El tipo de preloader se añadirá dinámicamente mediante JS -->
            <div class="snap-sidebar-cart__loader-spinner"></div>
        </div>
    </div>
</li>
