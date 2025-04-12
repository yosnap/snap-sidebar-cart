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
        // Load text domain
        load_plugin_textdomain('snap-sidebar-cart', false, dirname(plugin_basename(__FILE__)) . '/../languages');
        
        // Load default options
        $this->load_options();

        // Include files
        $this->includes();

        // Register hooks
        $this->register_hooks();
        
        // Log plugin initialization for debugging
        $this->log('Plugin initialized');
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
        
        // Register activation and deactivation hooks
        register_activation_hook(SNAP_SIDEBAR_CART_PLUGIN_DIR . 'snap-sidebar-cart.php', array($this, 'activate'));
        register_deactivation_hook(SNAP_SIDEBAR_CART_PLUGIN_DIR . 'snap-sidebar-cart.php', array($this, 'deactivate'));
    }

    /**
     * Plugin activation
     */
    public function activate() {
        $this->log('Plugin activated');
        
        // Add plugin version to database
        update_option('snap_sidebar_cart_version', SNAP_SIDEBAR_CART_VERSION);
    }

    /**
     * Plugin deactivation
     */
    public function deactivate() {
        $this->log('Plugin deactivated');
    }

    /**
     * Get plugin options
     */
    public function get_options() {
        return $this->options;
    }
    
    /**
     * Simple logging function
     */
    private function log($message) {
        if (defined('WP_DEBUG') && WP_DEBUG === true) {
            error_log('Snap Sidebar Cart: ' . $message);
        }
    }
}
