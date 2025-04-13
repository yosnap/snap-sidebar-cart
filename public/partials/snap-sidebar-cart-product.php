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
        $label = wc_attribute_label(str_replace('attribute_', '', $name), $product);
        $product_variation_data .= '<span class="snap-sidebar-cart__product-variation">' . $label . ': ' . $value . '</span>';
    }
}

// Información de envío estimado
$shipping_days = 3; // Por defecto, 3 días - esto podría ser configurable o calculado dinámicamente

// Clase adicional para productos nuevos
$item_class = $is_new_item ? 'snap-sidebar-cart__product new-item' : 'snap-sidebar-cart__product';
?>

<li class="<?php echo esc_attr($item_class); ?>" data-key="<?php echo esc_attr($cart_item_key); ?>" data-product-id="<?php echo esc_attr($product_id); ?>">
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
                
                <div class="snap-sidebar-cart__product-shipping">
                    <?php printf(__('Entrega en 1-%d días hábiles', 'snap-sidebar-cart'), $shipping_days); ?>
                </div>
            </div>
            
            <button type="button" class="snap-sidebar-cart__remove-product" aria-label="<?php esc_attr_e('Eliminar este producto', 'snap-sidebar-cart'); ?>">×</button>
        </div>

        <div class="snap-sidebar-cart__product-footer">
            <div class="quantity buttoned-input" data-key="<?php echo esc_attr($cart_item_key); ?>">
                <button type="button" class="notabutton quantity-down" aria-label="<?php esc_attr_e('Reducir', 'snap-sidebar-cart'); ?>">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="feather feather-minus">
                        <title><?php esc_html_e('Menos', 'snap-sidebar-cart'); ?></title>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                </button>
                <input class="cart-item__quantity-input" type="number" size="2" id="updates_<?php echo esc_attr($cart_item_key); ?>" name="updates[]" data-key="<?php echo esc_attr($cart_item_key); ?>" data-initial-value="<?php echo esc_attr($quantity); ?>" data-line="1" value="<?php echo esc_attr($quantity); ?>" min="0" aria-label="<?php esc_attr_e('Cantidad', 'snap-sidebar-cart'); ?>">
                <button type="button" class="notabutton quantity-up" aria-label="<?php esc_attr_e('Aumentar', 'snap-sidebar-cart'); ?>">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="feather feather-plus">
                        <title><?php esc_html_e('Más', 'snap-sidebar-cart'); ?></title>
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                </button>
            </div>

            <div class="snap-sidebar-cart__product-price-container">
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
            </div>
        </div>
        
        <!-- Loader para actualizaciones y eliminaciones -->
        <div class="snap-sidebar-cart__product-loader">
            <!-- El tipo de preloader se añadirá dinámicamente mediante JS -->
            <div class="snap-sidebar-cart__loader-spinner"></div>
        </div>
    </div>
</li>
