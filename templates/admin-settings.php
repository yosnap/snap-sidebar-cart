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
                
                <tr>
                    <th scope="row">
                        <label for="snap_cart_banner_enable"><?php echo esc_html__('Mostrar banner informativo', 'snap-sidebar-cart'); ?></label>
                    </th>
                    <td>
                        <input type="checkbox" id="snap_cart_banner_enable" name="snap_sidebar_cart_options[banner_enable]" value="1" <?php checked(isset($this->options['banner_enable']) ? $this->options['banner_enable'] : false, true); ?>>
                        <span class="description"><?php echo esc_html__('Habilitar banner informativo después de la lista de productos', 'snap-sidebar-cart'); ?></span>
                    </td>
                </tr>
                
                <tr class="banner-content-row" <?php echo (!isset($this->options['banner_enable']) || !$this->options['banner_enable']) ? 'style="display:none;"' : ''; ?>>
                    <th scope="row">
                        <label for="snap_cart_banner_content"><?php echo esc_html__('Contenido del banner', 'snap-sidebar-cart'); ?></label>
                    </th>
                    <td>
                        <?php
                        $banner_content = isset($this->options['banner_content']) ? $this->options['banner_content'] : '';
                        wp_editor($banner_content, 'snap_cart_banner_content', array(
                            'textarea_name' => 'snap_sidebar_cart_options[banner_content]',
                            'media_buttons' => true,
                            'textarea_rows' => 5,
                            'teeny' => true,
                        ));
                        ?>
                        <p class="description"><?php echo esc_html__('Este contenido se mostrará como un banner después de la lista de productos en el carrito lateral.', 'snap-sidebar-cart'); ?></p>
                    </td>
                </tr>
            </table>

            <p class="submit">
                <input type="submit" class="button button-primary" value="<?php echo esc_attr__('Guardar cambios', 'snap-sidebar-cart'); ?>">
            </p>
        </div>
    </form>
    
    <script type="text/javascript">
    jQuery(document).ready(function($) {
        // Mostrar/ocultar el editor WYSIWYG según la casilla de verificación
        $('#snap_cart_banner_enable').on('change', function() {
            if ($(this).is(':checked')) {
                $('.banner-content-row').show();
            } else {
                $('.banner-content-row').hide();
            }
        });
    });
    </script>
</div>