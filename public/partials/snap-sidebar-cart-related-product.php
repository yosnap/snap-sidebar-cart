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

// Depuración - Registrar información del producto
error_log('=== INICIO Renderizando producto relacionado ===');
error_log('Datos del producto:');

try {
    // Información básica del producto
    $product_id = $related_product->get_id();
    error_log('ID del producto: ' . $product_id);
    
    $product_permalink = $related_product->get_permalink();
    error_log('URL del producto: ' . $product_permalink);
    
    $product_name = $related_product->get_name();
    error_log('Nombre del producto: ' . $product_name);
    
    $product_price = $related_product->get_price_html();
    error_log('HTML del precio: ' . $product_price);
    
    $regular_price = $related_product->get_regular_price();
    error_log('Precio regular: ' . $regular_price);
    
    $sale_price = $related_product->get_sale_price();
    error_log('Precio de oferta: ' . ($sale_price ? $sale_price : 'No en oferta'));
    
    $has_discount = $sale_price && $regular_price > $sale_price;
    $discount_percentage = $has_discount ? round(($regular_price - $sale_price) / $regular_price * 100) : 0;
    error_log('¿Tiene descuento?: ' . ($has_discount ? 'Sí (' . $discount_percentage . '%)' : 'No'));

    // Obtener la imagen principal del producto
    $thumbnail = $related_product->get_image();
    error_log('¿Tiene imagen?: ' . (!empty($thumbnail) ? 'Sí' : 'No'));

    // Obtener imágenes de galería para el efecto hover
    $gallery_images = $related_product->get_gallery_image_ids();
    $gallery_html = '';
    error_log('Imágenes de galería: ' . count($gallery_images));

    if (!empty($gallery_images)) {
        // Usamos la primera imagen de la galería como imagen de hover
        $hover_image_id = reset($gallery_images);
        error_log('ID de la primera imagen de galería: ' . $hover_image_id);
        
        $hover_image_src = wp_get_attachment_image_src($hover_image_id, 'woocommerce_thumbnail');
        if ($hover_image_src) {
            error_log('URL de la imagen hover: ' . $hover_image_src[0]);
            $gallery_html = '<div class="product-gallery-image">' .
                '<img src="' . esc_url($hover_image_src[0]) . '" alt="' . esc_attr($product_name) . ' Gallery">' .
                '</div>';
        } else {
            error_log('No se pudo obtener la URL de la imagen hover');
        }
    }

    // Información de envío estimado
    $shipping_days = 3; // Por defecto, 3 días - esto podría ser configurable o calculado dinámicamente

    // Determinar si es "Last Chance" (ejemplo con stock bajo)
    $stock_quantity = $related_product->get_stock_quantity();
    error_log('Cantidad en stock: ' . ($stock_quantity !== null ? $stock_quantity : 'No gestionado'));
    
    $is_last_chance = $stock_quantity && $stock_quantity <= 5;
    error_log('¿Es última oportunidad?: ' . ($is_last_chance ? 'Sí' : 'No'));

    // Determinar el color (si está disponible como atributo)
    $color = $related_product->get_attribute('color') ? $related_product->get_attribute('color') : '';
    error_log('Color: ' . ($color ? $color : 'No definido'));
    
    error_log('Producto relacionado listo para renderizar');
    
} catch (Exception $e) {
    error_log('ERROR al procesar producto relacionado: ' . $e->getMessage());
}
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
