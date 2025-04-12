<?php
/**
 * Plugin Name: Snap Sidebar Cart
 * Plugin URI: https://github.com/yosnap/snap-sidebar-cart
 * Description: Un carrito lateral personalizable para WooCommerce con productos relacionados
 * Version: 1.0.0
 * Author: Snap Developer
 * Text Domain: snap-sidebar-cart
 * Domain Path: /languages
 * Requires at least: 5.6
 * Requires PHP: 7.3
 * WC requires at least: 5.0
 * WC tested up to: 8.3
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

// Define plugin constants
define('SNAP_SIDEBAR_CART_VERSION', '1.0.0');
define('SNAP_SIDEBAR_CART_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('SNAP_SIDEBAR_CART_PLUGIN_URL', plugin_dir_url(__FILE__));

// Check if WooCommerce is active
if (!in_array('woocommerce/woocommerce.php', apply_filters('active_plugins', get_option('active_plugins')))) {
    add_action('admin_notices', function() {
        echo '<div class="notice notice-error"><p>' . esc_html__('Snap Sidebar Cart requiere que WooCommerce esté instalado y activado.', 'snap-sidebar-cart') . '</p></div>';
    });
    return;
}

// Include required files
require_once SNAP_SIDEBAR_CART_PLUGIN_DIR . 'includes/class-snap-sidebar-cart.php';

// Initialize the plugin
function snap_sidebar_cart_init() {
    $snap_sidebar_cart = new Snap_Sidebar_Cart();
    $snap_sidebar_cart->init();
}

add_action('plugins_loaded', 'snap_sidebar_cart_init');
