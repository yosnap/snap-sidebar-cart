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
        <div class="snap-sidebar-cart__product-badge">
            <?php _e('Last Chance', 'snap-sidebar-cart'); ?>
        </div>
    <?php endif; ?>
    
    <div class="snap-sidebar-cart__related-product-image">
        <a href="<?php echo esc_url($product_permalink); ?>" class="product-image-container">
            <div class="primary-image">
                <?php echo $thumbnail; ?>
            </div>
            <?php if (!empty($gallery_images)) : 
                $hover_image_id = reset($gallery_images);
                $hover_image_url = wp_get_attachment_image_url($hover_image_id, 'woocommerce_thumbnail');
                if ($hover_image_url) : ?>
                <div class="hover-image">
                    <img src="<?php echo esc_url($hover_image_url); ?>" alt="<?php echo esc_attr($product_name); ?> - Imagen alternativa">
                </div>
            <?php endif; endif; ?>
        </a>
    </div>

    <div class="snap-sidebar-cart__related-product-details">
        <h4 class="snap-sidebar-cart__related-product-title">
            <a href="<?php echo esc_url($product_permalink); ?>"><?php echo esc_html($product_name); ?></a>
        </h4>
        
        <?php if ($color) : ?>
            <div class="snap-sidebar-cart__related-product-color">
                <?php echo esc_html($color); ?>
            </div>
        <?php endif; ?>
        
        <div class="snap-sidebar-cart__related-product-shipping">
            <?php printf(__('Entrega en 1-%d días hábiles', 'snap-sidebar-cart'), $shipping_days); ?>
        </div>
    
        <div class="snap-sidebar-cart__related-product-price-container">
            <?php if ($has_discount) : ?>
                <span class="snap-sidebar-cart__related-product-regular-price">
                    <?php echo wc_price($regular_price); ?>
                </span>
                <span class="snap-sidebar-cart__related-product-discount">
                    <?php echo sprintf('-%d%%', $discount_percentage); ?>
                </span>
            <?php endif; ?>
            <span class="snap-sidebar-cart__related-product-price">
                <?php echo $product_price; ?>
            </span>
        </div>
    </div>

    <button type="button" class="snap-sidebar-cart__add-related-product" data-product-id="<?php echo esc_attr($product_id); ?>">
        <?php _e('Añadir al carrito', 'snap-sidebar-cart'); ?>
    </button>
</div>
