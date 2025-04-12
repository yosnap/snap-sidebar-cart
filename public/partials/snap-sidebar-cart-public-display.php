<?php
/**
 * Plantilla para la vista pública del carrito lateral
 *
 * @since      1.0.0
 */
?>

<div id="<?php echo esc_attr($this->options['container_selector']); ?>" class="snap-sidebar-cart <?php echo esc_attr($this->options['container_selector']); ?>">
    <div class="snap-sidebar-cart__overlay"></div>
    
    <div class="snap-sidebar-cart__container">
        <div class="snap-sidebar-cart__header">
            <h2 class="snap-sidebar-cart__title">
                <?php echo esc_html($this->options['title']); ?> (<span class="snap-sidebar-cart__count"><?php echo WC()->cart->get_cart_contents_count(); ?></span>)
            </h2>
            <button class="snap-sidebar-cart__close">×</button>
        </div>
        
        <div class="snap-sidebar-cart__body">
            <div class="snap-sidebar-cart__products">
                <?php include SNAP_SIDEBAR_CART_PATH . 'public/partials/snap-sidebar-cart-contents.php'; ?>
            </div>
            
            <?php if ($this->options['related_products']['show']) : ?>
                <div class="snap-sidebar-cart__related-products">
                    <h3><?php _e('Productos relacionados', 'snap-sidebar-cart'); ?></h3>
                    <div class="snap-sidebar-cart__related-products-container"></div>
                </div>
            <?php endif; ?>
        </div>
        
        <div class="snap-sidebar-cart__footer">
            <?php if ($this->options['show_shipping']) : ?>
                <div class="snap-sidebar-cart__shipping">
                    <span><?php _e('Envío:', 'snap-sidebar-cart'); ?></span>
                    <span class="snap-sidebar-cart__shipping-price"><?php echo wc_price(WC()->cart->get_shipping_total() + WC()->cart->get_shipping_tax()); ?></span>
                </div>
            <?php endif; ?>
            
            <div class="snap-sidebar-cart__subtotal">
                <span><?php _e('Subtotal (IVA incluido):', 'snap-sidebar-cart'); ?></span>
                <span class="snap-sidebar-cart__subtotal-price"><?php echo wc_price(WC()->cart->get_subtotal() + WC()->cart->get_subtotal_tax()); ?></span>
            </div>
            
            <div class="snap-sidebar-cart__buttons">
                <a href="<?php echo wc_get_cart_url(); ?>" class="snap-sidebar-cart__button snap-sidebar-cart__button--cart"><?php _e('Ver carrito', 'snap-sidebar-cart'); ?></a>
                <a href="<?php echo wc_get_checkout_url(); ?>" class="snap-sidebar-cart__button snap-sidebar-cart__button--checkout"><?php _e('Finalizar compra', 'snap-sidebar-cart'); ?></a>
            </div>
        </div>
    </div>
</div>
