<?php
/**
 * Admin settings template
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

?>
<div class="wrap snap-sidebar-cart-settings">
    <h1><?php echo esc_html__('Configuración del Carrito Lateral', 'snap-sidebar-cart'); ?></h1>
    
    <form method="post" action="">
        <div class="snap-sidebar-cart-settings-section">
            <h2><?php echo esc_html__('Configura las opciones para el carrito lateral de WooCommerce', 'snap-sidebar-cart'); ?></h2>

            <table class="form-table">
                <tr>
                    <th scope="row">
                        <label for="snap_cart_title"><?php echo esc_html__('Título del carrito', 'snap-sidebar-cart'); ?></label>
                    </th>
                    <td>
                        <input type="text" id="snap_cart_title" name="snap_sidebar_cart_options[cart_title]" value="<?php echo esc_attr($this->options['cart_title']); ?>" class="regular-text">
                    </td>
                </tr>
            </table>

            <p class="submit">
                <input type="submit" class="button button-primary" value="<?php echo esc_attr__('Guardar cambios', 'snap-sidebar-cart'); ?>">
            </p>
        </div>
    </form>
</div>