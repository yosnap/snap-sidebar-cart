<?php
/**
 * Plantilla para un producto relacionado en el carrito lateral
 *
 * @since      1.0.0
 */

global $product;
$product_id = $related_product->get_id();
$thumbnail_id = $related_product->get_image_id();
$gallery_images = $related_product->get_gallery_image_ids();
?>

<div class="snap-sidebar-cart__related-product">
    <div class="snap-sidebar-cart__related-product-image">
        <a href="<?php echo esc_url($related_product->get_permalink()); ?>">
            <?php echo $related_product->get_image(); ?>
            
            <?php if (!empty($gallery_images)) : ?>
                <div class="snap-sidebar-cart__related-product-hover-image">
                    <?php echo wp_get_attachment_image($gallery_images[0], 'woocommerce_thumbnail'); ?>
                </div>
            <?php endif; ?>
        </a>
    </div>
    
    <div class="snap-sidebar-cart__related-product-details">
        <h4 class="snap-sidebar-cart__related-product-title">
            <a href="<?php echo esc_url($related_product->get_permalink()); ?>">
                <?php echo wp_kses_post($related_product->get_name()); ?>
            </a>
        </h4>
        
        <div class="snap-sidebar-cart__related-product-price">
            <?php echo $related_product->get_price_html(); ?>
        </div>
        
        <button class="snap-sidebar-cart__add-related-product" data-product-id="<?php echo esc_attr($product_id); ?>">
            <?php _e('Añadir al carrito', 'snap-sidebar-cart'); ?>
        </button>
    </div>
</div>
