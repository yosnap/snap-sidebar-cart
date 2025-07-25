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

$cart_position = isset($this->options['cart_position']) ? $this->options['cart_position'] : 'right';
$sidebar_position_class = 'snap-sidebar-cart--' . $cart_position;
?>

<!-- Overlay fuera del contenedor principal -->
<div class="snap-sidebar-cart__overlay"></div>

<div id="<?php echo esc_attr($this->options['container_selector']); ?>" class="snap-sidebar-cart no-animate <?php echo esc_attr($sidebar_position_class); ?>">
    
    <div class="snap-sidebar-cart__container">
        <div class="snap-sidebar-cart__header">
            <h2 class="snap-sidebar-cart__title">
                <?php 
                    // Mostrar el título con el número de elementos en el carrito
                    echo esc_html($this->options['title']); 
                    echo ' (<span class="snap-sidebar-cart__count">' . esc_html($cart_count) . '</span>)'; 
                ?>
            </h2>
            <button type="button" class="snap-sidebar-cart__close" id="snap-sidebar-cart-close" aria-label="<?php esc_attr_e('Cerrar', 'snap-sidebar-cart'); ?>">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        </div>
        
        <div class="snap-sidebar-cart__body">
            <div class="snap-sidebar-cart__products">
                <?php
                $cart_items = WC()->cart->get_cart();
                // Ordenar los productos por 'time_added' según la opción guardada
                $new_product_position = isset($this->options['animations']['new_product_position'])
                    ? $this->options['animations']['new_product_position']
                    : (isset($this->options['new_product_position']) ? $this->options['new_product_position'] : 'top');
                uasort($cart_items, function($a, $b) use ($new_product_position) {
                    $a_time = isset($a['time_added']) ? $a['time_added'] : 0;
                    $b_time = isset($b['time_added']) ? $b['time_added'] : 0;
                    if ($a_time == $b_time) return 0;
                    if ($new_product_position === 'top') {
                        return ($a_time > $b_time) ? -1 : 1;
                    } else {
                        return ($a_time < $b_time) ? -1 : 1;
                    }
                });
                
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
            
            <?php 
            // Mostrar banner personalizado si está habilitado
            if (isset($this->options['banner_enable']) && $this->options['banner_enable'] && !empty($this->options['banner_content'])) : ?>
                <div class="snap-sidebar-cart__banner-container">
                    <?php echo wp_kses_post(wpautop($this->options['banner_content'])); ?>
                </div>
            <?php endif; ?>
            
            <?php if (isset($this->options['related_products']['show']) && $this->options['related_products']['show']) : ?>
                <div class="snap-sidebar-cart__related-section" <?php echo empty($cart_items) ? 'style="display:none;"' : ''; ?> >
                    <h3 class="snap-sidebar-cart__related-title"><?php echo isset($this->options['related_products']['title']) ? esc_html($this->options['related_products']['title']) : _e('Te puede gustar', 'snap-sidebar-cart'); ?></h3>
                    
                    <div class="snap-sidebar-cart__related-header">
                        <div class="snap-sidebar-cart__related-tabs">
                            <?php
                            // Obtener las pestañas activas configuradas en las opciones
                            $active_tabs = isset($this->options['related_products']['active_tabs']) ? 
                                explode(',', $this->options['related_products']['active_tabs']) : 
                                array('upsells', 'crosssells', 'related', 'bestsellers', 'featured');
                            
                            // Definir las etiquetas por defecto
                            $tab_labels = array(
                                'upsells' => __('Complementos', 'snap-sidebar-cart'),
                                'crosssells' => __('Productos cruzados', 'snap-sidebar-cart'),
                                'related' => __('Misma categoría', 'snap-sidebar-cart'),
                                'bestsellers' => __('Más vendidos', 'snap-sidebar-cart'),
                                'featured' => __('Destacados', 'snap-sidebar-cart'),
                                'custom' => isset($this->options['related_products']['custom_tab_label']) ? $this->options['related_products']['custom_tab_label'] : __('Recomendados', 'snap-sidebar-cart')
                            );
                            
                            // Añadir etiquetas para las queries personalizadas adicionales
                            if (isset($this->options['related_products']['custom_queries']) && is_array($this->options['related_products']['custom_queries'])) {
                                foreach ($this->options['related_products']['custom_queries'] as $index => $query) {
                                    if (!empty($query['name']) && !empty($query['code'])) {
                                        $custom_tab_id = 'custom_' . $index;
                                        $tab_labels[$custom_tab_id] = $query['name'];
                                        
                                        // Añadir a las pestañas activas si no está ya
                                        if (!in_array($custom_tab_id, $active_tabs)) {
                                            $active_tabs[] = $custom_tab_id;
                                        }
                                    }
                                }
                            }
                            
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
                    </div>
                    
                    <div class="snap-sidebar-cart__related-content">
                        <?php
                        $first_tab = true;
                        foreach ($active_tabs as $tab_key) {
                            $active_class = $first_tab ? ' active' : '';
                            echo '<div class="snap-sidebar-cart__related-container' . $active_class . '" data-content="' . esc_attr($tab_key) . '">';
                            echo '<div class="snap-sidebar-cart__slider">';
                            
                            // Implementar Scroll Snap con estructura consistente
                            echo '<div class="snap-sidebar-cart__slider-track swiper-wrapper">';
                            // Los productos se cargarán dinámicamente vía AJAX
                            echo '</div>';
                            
                            // Navegación para Scroll Snap
                            echo '<div class="snap-sidebar-cart__slider-nav snap-sidebar-cart__slider-prev"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg></div>';
                            echo '<div class="snap-sidebar-cart__slider-nav snap-sidebar-cart__slider-next"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg></div>';
                            echo '</div>'; // cierre snap-sidebar-cart__slider
                            echo '</div>'; // cierre snap-sidebar-cart__related-container
                            
                            $first_tab = false;
                        }
                        ?>
                    </div>
                </div>
            <?php endif; ?>
        </div>
        <!-- Mover el footer aquí, fuera del body -->
        <div class="snap-sidebar-cart__footer">
            <?php if (isset(
                $this->options['show_shipping']) && $this->options['show_shipping']) : ?>
                <div class="snap-sidebar-cart__shipping">
                    <span><?php _e('Envío:', 'snap-sidebar-cart'); ?></span>
                    <span class="snap-sidebar-cart__shipping-price"><?php echo wc_price(WC()->cart->get_shipping_total() + WC()->cart->get_shipping_tax()); ?></span>
                </div>
            <?php endif; ?>
            <div class="snap-sidebar-cart__subtotal">
                <span><?php _e('Subtotal (IVA incluido):', 'snap-sidebar-cart'); ?></span>
                <span class="snap-sidebar-cart__subtotal-price"><?php echo wc_price(WC()->cart->get_subtotal() + WC()->cart->get_subtotal_tax()); ?></span>
            </div>
            <div class="snap-sidebar-cart__buttons" style="<?php echo empty($cart_items) ? 'display:none;' : ''; ?>">
                <a href="<?php echo esc_url(wc_get_cart_url()); ?>" class="snap-sidebar-cart__button snap-sidebar-cart__button--cart"><?php _e('Ver carrito', 'snap-sidebar-cart'); ?></a>
                <a href="<?php echo esc_url(wc_get_checkout_url()); ?>" class="snap-sidebar-cart__button snap-sidebar-cart__button--checkout"><?php _e('Finalizar pedido', 'snap-sidebar-cart'); ?></a>
            </div>
        </div>
    </div>
</div>
