<?php
/**
 * Plugin Name: Snap Sidebar Cart
 * Plugin URI: https://github.com/yosnap/snap-sidebar-cart-wp
 * Description: Un carrito lateral para WooCommerce que muestra productos cuando se agregan al carrito y productos relacionados con animaciones personalizables.
 * Version: 1.2.7
 * Author: Sn4p.dev
 * Author URI: https://sn4p.dev
 * Text Domain: snap-sidebar-cart
 * Domain Path: /languages
 * Requires at least: 5.0
 * Requires PHP: 7.3
 * WC requires at least: 4.0
 * WC tested up to: 8.5
 *
 * Woo: 12345:342928dfsfhsf8429842374wdf4234sfd
 * WC requires at least: 4.0
 * WC tested up to: 8.5
 *
 * @package Snap_Sidebar_Cart
 */

// Si este archivo es llamado directamente, abortar.
if ( ! defined( 'WPINC' ) ) {
    die;
}

// Definir constantes
define( 'SNAP_SIDEBAR_CART_VERSION', '1.2.7' );
define( 'SNAP_SIDEBAR_CART_PATH', plugin_dir_path( __FILE__ ) );
define( 'SNAP_SIDEBAR_CART_URL', plugin_dir_url( __FILE__ ) );
define( 'SNAP_SIDEBAR_CART_BASENAME', plugin_basename( __FILE__ ) );

/**
 * Inicialización principal del plugin
 * Todas las funcionalidades se cargan aquí para asegurar que se carguen en el momento correcto
 */
function snap_sidebar_cart_init() {
    // Cargar archivos principales
    require_once SNAP_SIDEBAR_CART_PATH . 'includes/class-snap-sidebar-cart.php';
    
    // Iniciar el plugin si WooCommerce está activo
    if (snap_sidebar_cart_check_woocommerce()) {
        $plugin = new Snap_Sidebar_Cart();
        $plugin->run();
    }
}

// Cargar traducciones correctamente
function snap_sidebar_cart_load_textdomain() {
    load_plugin_textdomain('snap-sidebar-cart', false, dirname(plugin_basename(__FILE__)) . '/languages');
}

// Declarar compatibilidad con HPOS de WooCommerce
function snap_sidebar_cart_declare_compatibility() {
    if (class_exists('\Automattic\WooCommerce\Utilities\FeaturesUtil')) {
        \Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility('custom_order_tables', __FILE__, true);
    }
}

// Registrar hooks en el momento correcto
add_action('plugins_loaded', 'snap_sidebar_cart_init');
add_action('init', 'snap_sidebar_cart_load_textdomain');
add_action('before_woocommerce_init', 'snap_sidebar_cart_declare_compatibility');

// Verificar si WooCommerce está activo
function snap_sidebar_cart_check_woocommerce() {
    if (!function_exists('is_plugin_active')) {
        include_once(ABSPATH . 'wp-admin/includes/plugin.php');
    }
    
    if (!is_plugin_active('woocommerce/woocommerce.php')) {
        add_action('admin_notices', 'snap_sidebar_cart_woocommerce_notice');
        return false;
    }
    
    return true;
}

// Aviso si WooCommerce no está activo
function snap_sidebar_cart_woocommerce_notice() {
    ?>
    <div class="error">
        <p>Snap Sidebar Cart requiere que WooCommerce esté instalado y activado.</p>
    </div>
    <?php
}

// Registrar la activación del plugin
register_activation_hook(__FILE__, 'snap_sidebar_cart_activate');

// Función de activación
function snap_sidebar_cart_activate() {
    // Configuración por defecto al activar
    $default_options = array(
        'title' => 'Carrito de compra',
        'container_selector' => 'sidebar-cart-container',
        'activation_selectors' => '.add_to_cart_button, .ti-shopping-cart, i.ti-shopping-cart',
        'delivery_time_text' => 'Entrega en 1-3 días hábiles',
        'show_delivery_time' => true,
        'show_shipping' => true,
        'auto_open' => true,
        'styles' => array(
            'sidebar_width' => '400px',
            'products_background' => '#ffffff',
            'related_section_background' => '#f9f9f9',
            'footer_background' => '#f8f8f8',
            'header_background' => '#f8f8f8',
            'header_text_color' => '#333333',
            'product_text_color' => '#333333',
            'button_background' => '#2c6aa0',
            'button_text_color' => '#ffffff',
        ),
        'related_products' => array(
            'show' => true,
            'count' => 4,
            'columns' => 2,
            'orderby' => 'rand',
            'slides_to_scroll' => 2,
            'show_last_chance' => true,
            'last_chance_stock_limit' => 5,
            'last_chance_title' => 'ÚLTIMA OPORTUNIDAD',
            'last_chance_bg_color' => '#e74c3c',
            'last_chance_text_color' => '#ffffff',
        ),
        'preloader' => array(
            'type' => 'circle',
            'size' => '40px',
            'color' => '#3498db',
            'color2' => '#e74c3c',
            'position' => 'center',
        ),
        'animations' => array(
            'duration' => 300,
            'quantity_update_delay' => 200,
            'new_product_position' => 'top',
        ),
    );
    
    add_option('snap_sidebar_cart_options', $default_options);
}
