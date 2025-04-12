<?php
/**
 * Main plugin class
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

class Snap_Sidebar_Cart {
    /**
     * Plugin instance
     */
    private static $instance = null;

    /**
     * Plugin options
     */
    private $options;

    /**
     * Get plugin instance
     */
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Initialize plugin
     */
    public function init() {
        // Load default options
        $this->load_options();

        // Include files
        $this->includes();

        // Register hooks
        $this->register_hooks();
    }

    /**
     * Include required files
     */
    private function includes() {
        require_once SNAP_SIDEBAR_CART_PLUGIN_DIR . 'includes/class-snap-sidebar-cart-admin.php';
        require_once SNAP_SIDEBAR_CART_PLUGIN_DIR . 'includes/class-snap-sidebar-cart-frontend.php';
    }

    /**
     * Load plugin options
     */
    private function load_options() {
        $defaults = [
            'cart_title' => __('Carrito de compra', 'snap-sidebar-cart'),
            'container_selector' => 'sidebar-cart-container',
            'activation_selectors' => '.add_to_cart_button',
            'primary_color' => '#1e9e9e',
            'secondary_color' => '#ffffff',
            'cart_width' => '400px',
            'show_related_products' => true,
            'related_products_count' => 4,
            'show_shipping_cost' => true
        ];

        $this->options = get_option('snap_sidebar_cart_options', $defaults);
    }

    /**
     * Register plugin hooks
     */
    private function register_hooks() {
        // Initialize admin
        $admin = new Snap_Sidebar_Cart_Admin($this->options);
        $admin->init();

        // Initialize frontend
        $frontend = new Snap_Sidebar_Cart_Frontend($this->options);
        $frontend->init();
    }

    /**
     * Get plugin options
     */
    public function get_options() {
        return $this->options;
    }
}