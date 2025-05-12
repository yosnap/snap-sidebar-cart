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

    // Determinar si es "Last Chance" basado en la configuración
    $stock_quantity = $related_product->get_stock_quantity();
    $show_last_chance = isset($this->options['related_products']['show_last_chance']) ? $this->options['related_products']['show_last_chance'] : false;
    $last_chance_limit = isset($this->options['related_products']['last_chance_stock_limit']) ? intval($this->options['related_products']['last_chance_stock_limit']) : 5;
    
    error_log('Cantidad en stock: ' . ($stock_quantity !== null ? $stock_quantity : 'No gestionado'));
    error_log('Mostrar badge Last Chance: ' . ($show_last_chance ? 'Sí' : 'No'));
    error_log('Límite para Last Chance: ' . $last_chance_limit);
    
    $is_last_chance = $show_last_chance && $stock_quantity !== null && $stock_quantity <= $last_chance_limit;
    error_log('¿Es última oportunidad?: ' . ($is_last_chance ? 'Sí' : 'No'));

    // Determinar el color (si está disponible como atributo)
    $color = $related_product->get_attribute('color') ? $related_product->get_attribute('color') : '';
    error_log('Color: ' . ($color ? $color : 'No definido'));
    
    error_log('Producto relacionado listo para renderizar');
    
    // Depuración: Obtener la imagen directamente para ver qué está pasando
    $thumbnail_id = $related_product->get_image_id();
    $thumbnail_url = wp_get_attachment_image_url($thumbnail_id, 'woocommerce_thumbnail');
    error_log('ID de imagen destacada: ' . $thumbnail_id);
    error_log('URL de imagen destacada: ' . ($thumbnail_url ? $thumbnail_url : 'No disponible'));
    error_log('HTML de imagen generado por WooCommerce: ' . htmlspecialchars($thumbnail));
    
} catch (Exception $e) {
    error_log('ERROR al procesar producto relacionado: ' . $e->getMessage());
}
?>

<?php 
// Determinar si el producto tiene imágenes de galería
$has_gallery = !empty($gallery_images);
$product_classes = 'snap-sidebar-cart__related-product';
if (!$has_gallery) {
    $product_classes .= ' no-gallery-server';
    // Generar un color aleatorio para productos sin galería (solo para pruebas)
    $hue = rand(0, 360);
    $saturation = rand(25, 65);
    $lightness = rand(75, 90);
    $random_color = "hsl($hue, $saturation%, $lightness%)";
    error_log("Producto sin galería: $product_name - Color asignado: $random_color");
}
?>
<div class="<?php echo esc_attr($product_classes); ?>"
<?php if (!$has_gallery): ?>
     style="background-color: <?php echo esc_attr($random_color); ?>;"
<?php endif; ?>
    <?php if ($is_last_chance) : ?>
        <div class="snap-sidebar-cart__product-badge last-chance">
            <?php 
            $badge_text = isset($this->options['related_products']['last_chance_title']) ? 
                esc_html($this->options['related_products']['last_chance_title']) : 
                esc_html__('ÚLTIMA OPORTUNIDAD', 'snap-sidebar-cart'); 
            echo $badge_text;
            ?>
        </div>
    <?php endif; ?>
    
    <a href="<?php echo esc_url($product_permalink); ?>" class="product-card-link">
        <div class="snap-sidebar-cart__related-product-image">
            <?php
            // Obtener la imagen destacada del producto
            $thumbnail_id = $related_product->get_image_id();
            $placeholder_image = wc_placeholder_img_src('woocommerce_thumbnail');
            
            // URL de la imagen principal
            $main_image_url = $thumbnail_id ? 
                wp_get_attachment_image_url($thumbnail_id, 'woocommerce_thumbnail') : 
                $placeholder_image;
                
            // Alt text para la imagen principal
            $main_image_alt = '';
            if ($thumbnail_id) {
                $main_image_alt = get_post_meta($thumbnail_id, '_wp_attachment_image_alt', true);
            }
            $main_image_alt = $main_image_alt ? $main_image_alt : esc_attr($product_name);
            
            // Imagen de galería para hover
            $hover_image_url = '';
            $hover_image_alt = '';
            $has_gallery = false;
            
            if (!empty($gallery_images)) {
                $gallery_image_id = reset($gallery_images);
                $gallery_image_url = wp_get_attachment_image_url($gallery_image_id, 'woocommerce_thumbnail');
                
                if ($gallery_image_url && $gallery_image_url != $placeholder_image) {
                    $hover_image_url = $gallery_image_url;
                    $hover_image_alt = get_post_meta($gallery_image_id, '_wp_attachment_image_alt', true);
                    $hover_image_alt = $hover_image_alt ? $hover_image_alt : sprintf('%s - %s', 
                        esc_attr($product_name), 
                        __('Imagen alternativa', 'snap-sidebar-cart')
                    );
                    $has_gallery = true;
                }
            }
            ?>
            
            <!-- Imagen Principal -->
            <img src="<?php echo esc_url($main_image_url); ?>" 
                 alt="<?php echo esc_attr($main_image_alt); ?>" 
                 class="primary-image" />
                 
            <?php if ($has_gallery) : ?>
            <!-- Imagen de Hover -->
            <img src="<?php echo esc_url($hover_image_url); ?>" 
                 alt="<?php echo esc_attr($hover_image_alt); ?>" 
                 class="hover-image" />
            <?php endif; ?>
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
            
            <?php 
            // Verificar si el producto tiene metadatos de grabado
            $has_engraving = false;
            $engraving_text = '';
            
            // Comprobar en metadatos del producto
            $product_meta = $related_product->get_meta_data();
            foreach ($product_meta as $meta) {
                $meta_data = $meta->get_data();
                if (isset($meta_data['key']) && isset($meta_data['value']) && 
                    (strtolower($meta_data['key']) === 'grabado' || 
                    strpos(strtolower($meta_data['key']), 'grabado') !== false)) {
                    $has_engraving = true;
                    $engraving_text = is_string($meta_data['value']) ? $meta_data['value'] : print_r($meta_data['value'], true);
                    break;
                }
            }
            
            // Si tiene grabado, mostrarlo
            if ($has_engraving && !empty($engraving_text)) : ?>
                <div class="snap-sidebar-cart__related-product-engraving">
                    <strong><?php esc_html_e('Grabado:', 'snap-sidebar-cart'); ?></strong> 
                    <?php echo esc_html($engraving_text); ?>
                </div>
            <?php endif; ?>

            <?php if (!empty($product_price)) : ?>
                <div class="snap-sidebar-cart__related-product-price-container">
                    <?php if ($has_discount) : ?>
                        <span class="snap-sidebar-cart__related-product-regular-price"><?php echo wc_price($regular_price); ?></span>
                        <span class="snap-sidebar-cart__related-product-price"><?php echo wc_price($sale_price); ?></span>
                        <span class="snap-sidebar-cart__related-product-discount">-<?php echo $discount_percentage; ?>%</span>
                    <?php else : ?>
                        <span class="snap-sidebar-cart__related-product-price"><?php echo $product_price; ?></span>
                    <?php endif; ?>
                </div>
            <?php endif; ?>

            <?php 
            // Mostrar el tiempo de entrega solo si está habilitado
            $show_delivery_time = isset($this->options['show_delivery_time']) ? $this->options['show_delivery_time'] : true;
            if ($show_delivery_time) {
                // Mostrar el tiempo de entrega si está disponible
                if (method_exists($this, 'get_delivery_time_text')) {
                    echo '<div class="snap-sidebar-cart__related-product-delivery-time">';
                    echo esc_html($this->get_delivery_time_text($related_product->get_id()));
                    echo '</div>';
                } else {
                    // Obtener el tiempo de entrega para este producto
                    $product_delivery_days = get_post_meta($related_product->get_id(), '_delivery_time_days', true);
                    $shipping_days = !empty($product_delivery_days) ? intval($product_delivery_days) : 3;
                    echo '<div class="snap-sidebar-cart__related-product-delivery-time">';
                    echo esc_html(sprintf(__('Entrega en 1-%d días hábiles', 'snap-sidebar-cart'), $shipping_days));
                    echo '</div>';
                }
            }
            
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
