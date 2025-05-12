<?php
/**
 * Plantilla para la pestaña de configuración general
 */

if (!defined('ABSPATH')) {
    exit; // Salir si se accede directamente
}

// Obtener las opciones actuales
$options = get_option('snap_sidebar_cart_options');
?>

<div class="snap-sidebar-cart-settings-content">
    <h2><?php echo esc_html__('Configuración General', 'snap-sidebar-cart'); ?></h2>
    <p><?php echo esc_html__('Configura las opciones básicas del carrito lateral.', 'snap-sidebar-cart'); ?></p>

    <table class="form-table">
        <tr>
            <th scope="row">
                <label for="snap_cart_title"><?php echo esc_html__('Título del carrito', 'snap-sidebar-cart'); ?></label>
            </th>
            <td>
                <input type="text" id="snap_cart_title" name="snap_sidebar_cart_options[title]" value="<?php echo esc_attr($options['title'] ?? ''); ?>" class="regular-text">
                <p class="description"><?php echo esc_html__('Título que se mostrará en la parte superior del carrito.', 'snap-sidebar-cart'); ?></p>
            </td>
        </tr>

        <tr>
            <th scope="row">
                <label for="snap_cart_container_selector"><?php echo esc_html__('ID del contenedor', 'snap-sidebar-cart'); ?></label>
            </th>
            <td>
                <input type="text" id="snap_cart_container_selector" name="snap_sidebar_cart_options[container_selector]" value="<?php echo esc_attr($options['container_selector'] ?? 'snap-sidebar-cart'); ?>" class="regular-text">
                <p class="description"><?php echo esc_html__('ID del contenedor HTML del carrito lateral. No incluir el símbolo #.', 'snap-sidebar-cart'); ?></p>
            </td>
        </tr>

        <tr>
            <th scope="row">
                <label for="snap_cart_activation_selectors"><?php echo esc_html__('Selectores de activación', 'snap-sidebar-cart'); ?></label>
            </th>
            <td>
                <input type="text" id="snap_cart_activation_selectors" name="snap_sidebar_cart_options[activation_selectors]" value="<?php echo esc_attr($options['activation_selectors'] ?? '.cart-contents, .cart-link, .site-header-cart .cart-contents, a.cart-contents, .cart-icon'); ?>" class="large-text">
                <p class="description"><?php echo esc_html__('Selectores CSS separados por comas que, al hacer clic, abrirán el carrito lateral.', 'snap-sidebar-cart'); ?></p>
            </td>
        </tr>

        <tr>
            <th scope="row">
                <label for="snap_cart_delivery_time_text"><?php echo esc_html__('Texto de tiempo de entrega', 'snap-sidebar-cart'); ?></label>
            </th>
            <td>
                <input type="text" id="snap_cart_delivery_time_text" name="snap_sidebar_cart_options[delivery_time_text]" value="<?php echo esc_attr($options['delivery_time_text'] ?? __('Entrega en 1-3 días hábiles', 'snap-sidebar-cart')); ?>" class="regular-text">
                <p class="description"><?php echo esc_html__('Texto que se mostrará debajo de cada producto indicando el tiempo de entrega.', 'snap-sidebar-cart'); ?></p>
            </td>
        </tr>

        <tr>
            <th scope="row">
                <label for="snap_cart_show_delivery_time"><?php echo esc_html__('Mostrar tiempo de entrega', 'snap-sidebar-cart'); ?></label>
            </th>
            <td>
                <label>
                    <input type="checkbox" id="snap_cart_show_delivery_time" name="snap_sidebar_cart_options[show_delivery_time]" value="1" <?php checked(isset($options['show_delivery_time']) ? $options['show_delivery_time'] : true, true); ?>>
                    <?php echo esc_html__('Mostrar el texto de tiempo de entrega debajo de cada producto.', 'snap-sidebar-cart'); ?>
                </label>
            </td>
        </tr>

        <tr>
            <th scope="row">
                <label for="snap_cart_show_shipping"><?php echo esc_html__('Mostrar información de envío', 'snap-sidebar-cart'); ?></label>
            </th>
            <td>
                <label>
                    <input type="checkbox" id="snap_cart_show_shipping" name="snap_sidebar_cart_options[show_shipping]" value="1" <?php checked(isset($options['show_shipping']) ? $options['show_shipping'] : true, true); ?>>
                    <?php echo esc_html__('Mostrar información de coste de envío en el pie del carrito.', 'snap-sidebar-cart'); ?>
                </label>
            </td>
        </tr>

        <tr>
            <th scope="row">
                <label for="snap_cart_auto_open"><?php echo esc_html__('Abrir automáticamente', 'snap-sidebar-cart'); ?></label>
            </th>
            <td>
                <label>
                    <input type="checkbox" id="snap_cart_auto_open" name="snap_sidebar_cart_options[auto_open]" value="1" <?php checked(isset($options['auto_open']) ? $options['auto_open'] : true, true); ?>>
                    <?php echo esc_html__('Abrir automáticamente el carrito lateral cuando se añade un producto.', 'snap-sidebar-cart'); ?>
                </label>
            </td>
        </tr>

        <tr>
            <th scope="row">
                <label for="snap_cart_show_delete_icon_top"><?php echo esc_html__('Icono de eliminación rápida', 'snap-sidebar-cart'); ?></label>
            </th>
            <td>
                <label>
                    <input type="checkbox" id="snap_cart_show_delete_icon_top" name="snap_sidebar_cart_options[show_delete_icon_top]" value="1" <?php checked(isset($options['show_delete_icon_top']) ? $options['show_delete_icon_top'] : true, true); ?>>
                    <?php echo esc_html__('Mostrar el icono de papelera para eliminación rápida de productos en el carrito.', 'snap-sidebar-cart'); ?>
                </label>
            </td>
        </tr>

        <tr>
            <th scope="row">
                <label for="snap_cart_banner_enable"><?php echo esc_html__('Mostrar banner informativo', 'snap-sidebar-cart'); ?></label>
            </th>
            <td>
                <label>
                    <input type="checkbox" id="snap_cart_banner_enable" name="snap_sidebar_cart_options[banner_enable]" value="1" <?php checked(isset($options['banner_enable']) ? $options['banner_enable'] : false, true); ?>>
                    <?php echo esc_html__('Mostrar un banner informativo personalizado después de la lista de productos.', 'snap-sidebar-cart'); ?>
                </label>
            </td>
        </tr>

        <tr class="banner-content-row" style="<?php echo (!isset($options['banner_enable']) || !$options['banner_enable']) ? 'display:none;' : ''; ?>">
            <th scope="row">
                <label for="snap_cart_banner_content"><?php echo esc_html__('Contenido del banner', 'snap-sidebar-cart'); ?></label>
            </th>
            <td>
                <?php
                $banner_content = isset($options['banner_content']) ? $options['banner_content'] : '';
                wp_editor($banner_content, 'snap_cart_banner_content', array(
                    'textarea_name' => 'snap_sidebar_cart_options[banner_content]',
                    'media_buttons' => true,
                    'textarea_rows' => 5,
                    'teeny' => false,
                    'wpautop' => true,
                ));
                ?>
                <p class="description"><?php echo esc_html__('Este contenido se mostrará como un banner después de la lista de productos en el carrito lateral.', 'snap-sidebar-cart'); ?></p>
            </td>
        </tr>
    </table>

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
