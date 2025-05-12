<?php
/**
 * Plugin Name: Snap Sidebar Cart
 * Plugin URI: https://github.com/yosnap/snap-sidebar-cart-wp
 * Description: Un carrito lateral para WooCommerce que muestra productos cuando se agregan al carrito y productos relacionados con animaciones personalizables.
 * Version: 1.2.5
 * Author: Paulo
 * Author URI: 
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
define( 'SNAP_SIDEBAR_CART_VERSION', '1.2.5' );
define( 'SNAP_SIDEBAR_CART_PATH', plugin_dir_path( __FILE__ ) );
define( 'SNAP_SIDEBAR_CART_URL', plugin_dir_url( __FILE__ ) );
define( 'SNAP_SIDEBAR_CART_BASENAME', plugin_basename( __FILE__ ) );

// Cargar archivos principales
require_once SNAP_SIDEBAR_CART_PATH . 'includes/class-snap-sidebar-cart.php';

// Declarar compatibilidad con HPOS de WooCommerce
add_action( 'before_woocommerce_init', function() {
    if ( class_exists( \Automattic\WooCommerce\Utilities\FeaturesUtil::class ) ) {
        \Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility( 'custom_order_tables', __FILE__, true );
    }
} );

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
        <p><?php _e('Snap Sidebar Cart requiere que WooCommerce esté instalado y activado.', 'snap-sidebar-cart'); ?></p>
    </div>
    <?php
}

// Iniciar el plugin
function run_snap_sidebar_cart() {
    if (snap_sidebar_cart_check_woocommerce()) {
        $plugin = new Snap_Sidebar_Cart();
        $plugin->run();
    }
}

// Registrar la activación del plugin
register_activation_hook(__FILE__, 'snap_sidebar_cart_activate');

// Función de activación
function snap_sidebar_cart_activate() {
    // Configuración por defecto al activar
    $default_options = array(
        'title' => __('Carrito de compra', 'snap-sidebar-cart'),
        'container_selector' => 'sidebar-cart-container',
        'activation_selectors' => '.add_to_cart_button, .ti-shopping-cart, i.ti-shopping-cart',
        'delivery_time_text' => __('Entrega en 1-3 días hábiles', 'snap-sidebar-cart'),
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
            'last_chance_title' => __('ÚLTIMA OPORTUNIDAD', 'snap-sidebar-cart'),
            'last_chance_bg_color' => '#e74c3c',
            'last_chance_text_color' => '#ffffff',
        ),
        'preloader' => array(
            'type' => 'circle',  // Opciones: circle, square, dots, spinner
            'size' => '40px',     // Tamaño del preloader
            'color' => '#3498db', // Color principal del preloader
            'color2' => '#e74c3c', // Color secundario (para algunos tipos)
            'position' => 'center', // Posición: center, top-left, top-right, bottom-left, bottom-right
        ),
        'animations' => array(
            'duration' => 300,       // Duración de la animación en ms
            'quantity_update_delay' => 200, // Delay para mostrar cambios de cantidad en ms
            'new_product_position' => 'top', // Posición de nuevos productos: top, bottom
        ),
    );
    
    add_option('snap_sidebar_cart_options', $default_options);
}

run_snap_sidebar_cart();
