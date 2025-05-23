<?php
/**
 * Proporciona una vista de área de administración para el plugin
 *
 * @since      1.0.0
 */

// Obtener la pestaña activa actual, por defecto "general"
$current_tab = isset($_GET['tab']) ? sanitize_text_field($_GET['tab']) : 'general';

// Definir las pestañas disponibles
$tabs = array(
    'general' => __('Configuración General', 'snap-sidebar-cart'),
    'styles' => __('Personalización de Estilos', 'snap-sidebar-cart'),
    'preloader' => __('Configuración del Preloader', 'snap-sidebar-cart'),
    'animations' => __('Configuración de Animaciones', 'snap-sidebar-cart'),
    'related' => __('Productos Relacionados', 'snap-sidebar-cart'),
);
?>

<div class="wrap">
    <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
    
    <nav class="nav-tab-wrapper">
        <?php foreach ($tabs as $tab_key => $tab_caption) : ?>
            <a href="<?php echo esc_url(add_query_arg(array('tab' => $tab_key))); ?>" 
               class="nav-tab <?php echo $current_tab === $tab_key ? 'nav-tab-active' : ''; ?>">
                <?php echo esc_html($tab_caption); ?>
            </a>
        <?php endforeach; ?>
    </nav>
    
    <div class="snap-sidebar-cart-admin-wrapper">
        <form method="post" action="options.php">
            <?php
            settings_fields('snap_sidebar_cart_options');
            
            // Mostrar solo las secciones correspondientes a la pestaña actual, pero
            // incluir todos los valores existentes como campos ocultos
            $options = get_option('snap_sidebar_cart_options');
            
            // Preservar campos de la pestaña general
            if ($current_tab != 'general' && !empty($options)) {
                // Preservar checkboxes de la pestaña general
                $general_checkboxes = array('show_delivery_time', 'show_shipping', 'auto_open', 'show_delete_icon_top', 'banner_enable');
                foreach ($general_checkboxes as $checkbox) {
                    if (isset($options[$checkbox]) && $options[$checkbox]) {
                        echo '<input type="hidden" name="snap_sidebar_cart_options[' . esc_attr($checkbox) . ']" value="1">';
                    }
                }
                
                // Preservar campos de texto de la pestaña general
                $general_text_fields = array('title', 'container_selector', 'activation_selectors', 'delivery_time_text');
                foreach ($general_text_fields as $field) {
                    if (isset($options[$field])) {
                        echo '<input type="hidden" name="snap_sidebar_cart_options[' . esc_attr($field) . ']" value="' . esc_attr($options[$field]) . '">';
                    }
                }
                
                // Preservar opciones del icono de eliminación
                $delete_icon_fields = array('delete_icon_type', 'delete_icon_size', 'delete_icon_color', 'delete_icon_hover_color');
                foreach ($delete_icon_fields as $field) {
                    if (isset($options[$field])) {
                        echo '<input type="hidden" name="snap_sidebar_cart_options[' . esc_attr($field) . ']" value="' . esc_attr($options[$field]) . '">';
                    }
                }
                
                // Preservar contenido del banner
                if (isset($options['banner_content'])) {
                    echo '<input type="hidden" name="snap_sidebar_cart_options[banner_content]" value="' . esc_attr($options['banner_content']) . '">';
                }
            }
            
            // Preservar estilos
            if ($current_tab != 'styles' && !empty($options) && isset($options['styles'])) {
                foreach ($options['styles'] as $key => $value) {
                    echo '<input type="hidden" name="snap_sidebar_cart_options[styles][' . esc_attr($key) . ']" value="' . esc_attr($value) . '">';
                }
            }
            
            // Preservar preloader
            if ($current_tab != 'preloader' && !empty($options) && isset($options['preloader'])) {
                foreach ($options['preloader'] as $key => $value) {
                    echo '<input type="hidden" name="snap_sidebar_cart_options[preloader][' . esc_attr($key) . ']" value="' . esc_attr($value) . '">';
                }
            }
            
            // Preservar animaciones
            if ($current_tab != 'animations' && !empty($options) && isset($options['animations'])) {
                foreach ($options['animations'] as $key => $value) {
                    echo '<input type="hidden" name="snap_sidebar_cart_options[animations][' . esc_attr($key) . ']" value="' . esc_attr($value) . '">';
                }
            }
            
            // Preservar productos relacionados
            if ($current_tab != 'related' && !empty($options) && isset($options['related_products'])) {
                foreach ($options['related_products'] as $key => $value) {
                    if (is_array($value)) continue; // Saltar arrays anidados
                    echo '<input type="hidden" name="snap_sidebar_cart_options[related_products][' . esc_attr($key) . ']" value="' . esc_attr($value) . '">';
                }
            }
            
            // Mostrar las secciones correspondientes a la pestaña actual
            switch ($current_tab) {
                case 'general':
                    // Usar nuestra plantilla personalizada en lugar de la función do_settings_sections
                    include_once SNAP_SIDEBAR_CART_PATH . 'admin/partials/general-settings.php';
                    break;
                case 'styles':
                    do_settings_sections('snap-sidebar-cart-settings-styles');
                    break;
                case 'preloader':
                    do_settings_sections('snap-sidebar-cart-settings-preloader');
                    break;
                case 'animations':
                    do_settings_sections('snap-sidebar-cart-settings-animations');
                    break;
                case 'related':
                    do_settings_sections('snap-sidebar-cart-settings-related');
                    break;
            }
            
            submit_button(__('Guardar cambios', 'snap-sidebar-cart'));
            ?>
        </form>
        
        <div class="snap-sidebar-cart-admin-sidebar">
            <div class="snap-sidebar-cart-admin-box">
                <h3><?php _e('Sobre este plugin', 'snap-sidebar-cart'); ?></h3>
                <p><?php _e('Snap Sidebar Cart es un plugin para WooCommerce que añade un carrito lateral con animaciones y productos relacionados.', 'snap-sidebar-cart'); ?></p>
                
                <h4><?php _e('Características principales', 'snap-sidebar-cart'); ?></h4>
                <ul>
                    <li><?php _e('Carrito lateral que se muestra cuando se añaden productos', 'snap-sidebar-cart'); ?></li>
                    <li><?php _e('Productos relacionados en un slider configurable', 'snap-sidebar-cart'); ?></li>
                    <li><?php _e('Estilos personalizables para todo el carrito', 'snap-sidebar-cart'); ?></li>
                    <li><?php _e('Animaciones al añadir o eliminar productos', 'snap-sidebar-cart'); ?></li>
                    <li><?php _e('Compatible con todos los temas de WooCommerce', 'snap-sidebar-cart'); ?></li>
                </ul>
            </div>
            
            <div class="snap-sidebar-cart-admin-box">
                <h3><?php _e('Soporte', 'snap-sidebar-cart'); ?></h3>
                <p><?php _e('Si necesitas ayuda con el plugin, por favor contacta con el desarrollador.', 'snap-sidebar-cart'); ?></p>
                
                <p><a href="https://github.com/yosnap/snap-sidebar-cart-wc" target="_blank" class="button button-secondary"><?php _e('Documentación', 'snap-sidebar-cart'); ?></a></p>
            </div>
        </div>
    </div>
</div>

<style>
    .snap-sidebar-cart-admin-wrapper {
        display: flex;
        margin-top: 20px;
    }
    .snap-sidebar-cart-admin-wrapper form {
        flex: 1;
        margin-right: 20px;
    }
    .snap-sidebar-cart-admin-sidebar {
        width: 300px;
    }
    .snap-sidebar-cart-admin-box {
        background: #fff;
        border: 1px solid #ccd0d4;
        box-shadow: 0 1px 1px rgba(0,0,0,.04);
        margin-bottom: 20px;
        padding: 15px;
    }
    .snap-sidebar-cart-admin-box h3 {
        margin-top: 0;
    }
    .snap-sidebar-cart-admin-box ul {
        list-style-type: disc;
        padding-left: 20px;
    }
</style>
