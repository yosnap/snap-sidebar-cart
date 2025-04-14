<?php
/**
 * Plantilla para mostrar un producto relacionado en el carrito lateral
 *
 * @since      1.0.0
 * @var        WC_Product    $related_product    El producto relacionado.
 */

if (!defined('ABSPATH')) {
    exit; // Salir si se accede directamente
}

// Información básica del producto
$product_id = $related_product->get_id();
$product_permalink = $related_product->get_permalink();
$product_name = $related_product->get_name();
$product_price = $related_product->get_price_html();
$regular_price = $related_product->get_regular_price();
$sale_price = $related_product->get_sale_price();
$has_discount = $sale_price && $regular_price > $sale_price;
$discount_percentage = $has_discount ? round(($regular_price - $sale_price) / $regular_price * 100) : 0;

// Obtener la imagen principal del producto
$thumbnail = $related_product->get_image();

// Obtener imágenes de galería para el efecto hover
$gallery_images = $related_product->get_gallery_image_ids();
$gallery_html = '';

if (!empty($gallery_images)) {
    // Usamos la primera imagen de la galería como imagen de hover
    $hover_image_id = reset($gallery_images);
    $hover_image_src = wp_get_attachment_image_src($hover_image_id, 'woocommerce_thumbnail');
    if ($hover_image_src) {
        $gallery_html = '<div class="product-gallery-image">' .
            '<img src="' . esc_url($hover_image_src[0]) . '" alt="' . esc_attr($product_name) . ' Gallery">' .
            '</div>';
    }
}

// Información de envío estimado
$shipping_days = 3; // Por defecto, 3 días - esto podría ser configurable o calculado dinámicamente

// Determinar si es "Last Chance" (ejemplo con stock bajo)
$is_last_chance = $related_product->get_stock_quantity() && $related_product->get_stock_quantity() <= 5;

// Determinar el color (si está disponible como atributo)
$color = $related_product->get_attribute('color') ? $related_product->get_attribute('color') : '';
?>

<div class="snap-sidebar-cart__related-product">
    <?php if ($is_last_chance) : ?>
        <div class="snap-sidebar-cart__product-badge last-chance">
            <?php _e('Last Chance', 'snap-sidebar-cart'); ?>
        </div>
    <?php endif; ?>
    
    <a href="<?php echo esc_url($product_permalink); ?>" class="product-card-link">
        <div class="snap-sidebar-cart__related-product-image">
            <div class="primary-image">
                <?php echo $thumbnail; ?>
            </div>
            <?php 
            // Mostrar la primera imagen de la galería para el efecto hover
            if (!empty($gallery_images)) : 
                $image_id = reset($gallery_images);
                $image_url = wp_get_attachment_image_url($image_id, 'woocommerce_thumbnail');
                if ($image_url) : 
                    $image_alt = get_post_meta($image_id, '_wp_attachment_image_alt', true);
                    $image_alt = $image_alt ? $image_alt : sprintf('%s - %s', 
                        esc_attr($product_name), 
                        __('Imagen alternativa', 'snap-sidebar-cart')
                    );
                    ?>
                    <div class="product-gallery-image hover-image">
                        <img src="<?php echo esc_url($image_url); ?>" 
                            alt="<?php echo esc_attr($image_alt); ?>"
                            loading="lazy">
                    </div>
                    <?php
                endif;
            endif;
            ?>
        </div>

        <div class="snap-sidebar-cart__related-product-details">
            <h4 class="snap-sidebar-cart__related-product-title">
                <?php echo esc_html($product_name); ?>
            </h4>
            
            <?php if ($color) : ?>
                <div class="snap-sidebar-cart__related-product-variant">
                    <?php echo esc_html($color); ?>
                </div>
            <?php endif; ?>

            <?php if (!empty($product_price)) : ?>
                <div class="snap-sidebar-cart__related-product-price-container">
                    <?php if ($has_discount) : ?>
                        <span class="snap-sidebar-cart__related-product-regular-price"><?php echo wc_price($regular_price); ?></span>
                        <span class="snap-sidebar-cart__related-product-discount">-<?php echo $discount_percentage; ?>%</span>
                    <?php endif; ?>
                    <span class="snap-sidebar-cart__related-product-price"><?php echo $product_price; ?></span>
                </div>
            <?php endif; ?>

            <?php 
            // Mostrar calificación/estrellas del producto si está disponible
            $average_rating = $related_product->get_average_rating();
            $review_count = $related_product->get_review_count();
            
            if ($average_rating > 0) : ?>
                <div class="snap-sidebar-cart__related-product-ratings">
                    <div class="star-rating" title="<?php echo sprintf(__('Calificación de %s de 5', 'snap-sidebar-cart'), $average_rating); ?>">
                        <span style="width:<?php echo esc_attr(($average_rating / 5) * 100); ?>%">
                            <strong class="rating"><?php echo esc_html($average_rating); ?></strong> <?php _e('de 5', 'snap-sidebar-cart'); ?>
                        </span>
                    </div>
                    <?php if ($review_count > 0) : ?>
                        <span class="review-count"><?php echo esc_html($review_count); ?> <?php echo _n('reseña', 'reseñas', $review_count, 'snap-sidebar-cart'); ?></span>
                    <?php endif; ?>
                </div>
            <?php endif; ?>
        </div>
    </a>
</div>
