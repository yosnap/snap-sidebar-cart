<?php
/**
 * Plantilla para el contenido del carrito lateral
 *
 * @since      1.0.0
 */

$cart_items = WC()->cart->get_cart();
?>

<?php if (empty($cart_items)) : ?>
    <div class="snap-sidebar-cart__empty">
        <p><?php _e('Tu carrito está vacío.', 'snap-sidebar-cart'); ?></p>
    </div>
<?php else : ?>
    <div class="snap-sidebar-cart__products-list">
        <?php foreach ($cart_items as $cart_item_key => $cart_item) : 
            $product = $cart_item['data'];
            $product_id = $cart_item['product_id'];
            $quantity = $cart_item['quantity'];
            $product_permalink = $product->get_permalink();
            $thumbnail = $product->get_image();
            $price = WC()->cart->get_product_price($product);
            $subtotal = WC()->cart->get_product_subtotal($product, $quantity);
        ?>
            <div class="snap-sidebar-cart__product" data-key="<?php echo esc_attr($cart_item_key); ?>">
                <div class="snap-sidebar-cart__product-image">
                    <a href="<?php echo esc_url($product_permalink); ?>">
                        <?php echo $thumbnail; ?>
                    </a>
                </div>
                
                <div class="snap-sidebar-cart__product-details">
                    <div class="snap-sidebar-cart__product-name">
                        <a href="<?php echo esc_url($product_permalink); ?>">
                            <?php echo wp_kses_post($product->get_name()); ?>
                        </a>
                    </div>
                    
                    <div class="snap-sidebar-cart__product-price">
                        <?php echo $price; ?>
                    </div>
                    
                    <div class="snap-sidebar-cart__product-quantity">
                        <button class="snap-sidebar-cart__quantity-down">-</button>
                        <input type="number" class="snap-sidebar-cart__quantity-input" value="<?php echo esc_attr($quantity); ?>" min="1" />
                        <button class="snap-sidebar-cart__quantity-up">+</button>
                    </div>
                    
                    <div class="snap-sidebar-cart__product-subtotal">
                        <?php echo $subtotal; ?>
                    </div>
                    
                    <button class="snap-sidebar-cart__remove-product">×</button>
                </div>
                
                <div class="snap-sidebar-cart__product-loader">
                    <div class="snap-sidebar-cart__loader-spinner"></div>
                </div>
            </div>
        <?php endforeach; ?>
    </div>
<?php endif; ?>
