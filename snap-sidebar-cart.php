<?php
/**
 * Plugin Name: Snap Sidebar Cart
 * Plugin URI: https://github.com/username/snap-sidebar-cart
 * Description: Un carrito lateral para WooCommerce que muestra productos cuando se agregan al carrito y productos relacionados.
 * Version: 1.0.0
 * Author: Paulo
 * Author URI: 
 * Text Domain: snap-sidebar-cart
 * Domain Path: /languages
 * Requires at least: 5.0
 * Requires PHP: 7.3
 * WC requires at least: 4.0
 * WC tested up to: 8.0
 */

// Si este archivo es llamado directamente, abortar.
if ( ! defined( 'WPINC' ) ) {
    die;
}

// Definir constantes
define( 'SNAP_SIDEBAR_CART_VERSION', '1.0.0' );
define( 'SNAP_SIDEBAR_CART_PATH', plugin_dir_path( __FILE__ ) );
define( 'SNAP_SIDEBAR_CART_URL', plugin_dir_url( __FILE__ ) );
define( 'SNAP_SIDEBAR_CART_BASENAME', plugin_basename( __FILE__ ) );

// Cargar archivos principales
require_once SNAP_SIDEBAR_CART_PATH . 'includes/class-snap-sidebar-cart.php';

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
run_snap_sidebar_cart();
