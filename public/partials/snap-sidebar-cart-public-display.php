<?php
/**
 * Plantilla para la vista pública del carrito lateral
 *
 * @since      1.0.0
 */

// Asegurarnos de que WooCommerce está disponible
if (!function_exists('WC') || !WC()->cart) {
    return;
}

// Obtener el conteo actual de items en el carrito
$cart_count = WC()->cart->get_cart_contents_count();
?>

<div id="<?php echo esc_attr($this->options['container_selector']); ?>" class="snap-sidebar-cart">
    <div class="snap-sidebar-cart__overlay"></div>
    
    <div class="snap-sidebar-cart__container">
        <div class="snap-sidebar-cart__header">
            <h2 class="snap-sidebar-cart__title">
                <?php echo esc_html($this->options['title']); ?> (<span class="snap-sidebar-cart__count"><?php echo esc_html($cart_count); ?></span>)
            </h2>
            <button type="button" class="snap-sidebar-cart__close" id="snap-sidebar-cart-close" aria-label="<?php esc_attr_e('Cerrar', 'snap-sidebar-cart'); ?>">
                &times;
            </button>
        </div>
        
        <div class="snap-sidebar-cart__body">
            <div class="snap-sidebar-cart__products">
                <?php
                $cart_items = WC()->cart->get_cart();
                
                if (empty($cart_items)) {
                    ?>
                    <div class="snap-sidebar-cart__empty">
                        <p><?php _e('Tu carrito está vacío.', 'snap-sidebar-cart'); ?></p>
                        <a href="<?php echo esc_url(get_permalink(wc_get_page_id('shop'))); ?>" class="snap-sidebar-cart__button snap-sidebar-cart__button--cart"><?php _e('Continuar comprando', 'snap-sidebar-cart'); ?></a>
                    </div>
                    <?php
                } else {
                    ?>
                    <ul class="snap-sidebar-cart__products-list">
                        <?php
                        foreach ($cart_items as $cart_item_key => $cart_item) {
                            $product = $cart_item['data'];
                            $is_new_item = false;
                            
                            include SNAP_SIDEBAR_CART_PATH . 'public/partials/snap-sidebar-cart-product.php';
                        }
                        ?>
                    </ul>
                    <?php
                }
                ?>
            </div>
            
            <?php if (isset($this->options['related_products']['show']) && $this->options['related_products']['show'] && !empty($cart_items)) : ?>
                <div class="snap-sidebar-cart__related-section">
                    <h3 class="snap-sidebar-cart__related-title"><?php _e('Te puede gustar', 'snap-sidebar-cart'); ?></h3>
                    
                    <div class="snap-sidebar-cart__related-tabs">
                        <?php
                        // Obtener las pestañas activas configuradas en las opciones
                        $active_tabs = isset($this->options['related_products']['active_tabs']) ? 
                            explode(',', $this->options['related_products']['active_tabs']) : 
                            array('related', 'category', 'bestsellers', 'accessories');
                        
                        // Definir las etiquetas por defecto
                        $tab_labels = array(
                            'related' => __('Relacionados', 'snap-sidebar-cart'),
                            'category' => __('Misma categoría', 'snap-sidebar-cart'),
                            'bestsellers' => __('Más vendidos', 'snap-sidebar-cart'),
                            'accessories' => __('Accesorios', 'snap-sidebar-cart'),
                            'custom' => isset($this->options['related_products']['custom_tab_label']) ? $this->options['related_products']['custom_tab_label'] : __('Recomendados', 'snap-sidebar-cart')
                        );
                        
                        // Mostrar sólo las pestañas activas
                        $first_tab = true;
                        foreach ($active_tabs as $tab_key) {
                            if (isset($tab_labels[$tab_key])) {
                                $active_class = $first_tab ? ' active' : '';
                                echo '<button type="button" class="snap-sidebar-cart__related-tab' . $active_class . '" data-tab="' . esc_attr($tab_key) . '">' . esc_html($tab_labels[$tab_key]) . '</button>';
                                $first_tab = false;
                            }
                        }
                        ?>
                    </div>
                    
                    <div class="snap-sidebar-cart__related-content">
                        <?php
                        $first_tab = true;
                        foreach ($active_tabs as $tab_key) {
                            $active_class = $first_tab ? ' active' : '';
                            echo '<div class="snap-sidebar-cart__related-container' . $active_class . '" data-content="' . esc_attr($tab_key) . '">';
                            echo '<div class="snap-sidebar-cart__slider">';
                            echo '<button type="button" class="snap-sidebar-cart__slider-nav snap-sidebar-cart__slider-prev" aria-label="' . esc_attr__('Anterior', 'snap-sidebar-cart') . '">‹</button>';
                            echo '<div class="snap-sidebar-cart__slider-track">';
                            // Los productos se cargarán dinámicamente vía AJAX
                            echo '</div>';
                            echo '<button type="button" class="snap-sidebar-cart__slider-nav snap-sidebar-cart__slider-next" aria-label="' . esc_attr__('Siguiente', 'snap-sidebar-cart') . '">›</button>';
                            echo '</div>';
                            echo '</div>';
                            
                            $first_tab = false;
                        }
                        ?>
                    </div>
                </div>
            <?php endif; ?>
            
            <div class="snap-sidebar-cart__footer">
                <?php if (isset($this->options['show_shipping']) && $this->options['show_shipping']) : ?>
                    <div class="snap-sidebar-cart__shipping">
                        <span><?php _e('Envío:', 'snap-sidebar-cart'); ?></span>
                        <span class="snap-sidebar-cart__shipping-price"><?php echo wc_price(WC()->cart->get_shipping_total() + WC()->cart->get_shipping_tax()); ?></span>
                    </div>
                <?php endif; ?>
                
                <div class="snap-sidebar-cart__subtotal">
                    <span><?php _e('Subtotal (IVA incluido):', 'snap-sidebar-cart'); ?></span>
                    <span class="snap-sidebar-cart__subtotal-price"><?php echo wc_price(WC()->cart->get_subtotal() + WC()->cart->get_subtotal_tax()); ?></span>
                </div>
                
                <?php if (!empty($cart_items)) : ?>
                    <div class="snap-sidebar-cart__buttons">
                        <a href="<?php echo esc_url(wc_get_cart_url()); ?>" class="snap-sidebar-cart__button snap-sidebar-cart__button--cart"><?php _e('Ver carrito', 'snap-sidebar-cart'); ?></a>
                        <a href="<?php echo esc_url(wc_get_checkout_url()); ?>" class="snap-sidebar-cart__button snap-sidebar-cart__button--checkout"><?php _e('Finalizar pedido', 'snap-sidebar-cart'); ?></a>
                    </div>
                <?php endif; ?>
            </div>
        </div>
    </div>
</div>
