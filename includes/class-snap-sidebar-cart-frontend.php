<?php
/**
 * Frontend class
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

class Snap_Sidebar_Cart_Frontend {
    /**
     * Plugin options
     */
    private $options;

    /**
     * Constructor
     */
    public function __construct($options) {
        $this->options = $options;
    }

    /**
     * Initialize frontend
     */
    public function init() {
        // Register shortcodes
        add_shortcode('sidebar_cart', array($this, 'sidebar_cart_shortcode'));
        add_shortcode('sidebar_cart_button', array($this, 'sidebar_cart_button_shortcode'));

        // Enqueue scripts and styles
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));

        // Add sidebar cart to footer
        add_action('wp_footer', array($this, 'render_sidebar_cart'));

        // Add hooks for extension
        add_action('snap_sidebar_cart_before_content', array($this, 'before_content'));
        add_action('snap_sidebar_cart_after_content', array($this, 'after_content'));
    }

    /**
     * Enqueue frontend scripts and styles
     */
    public function enqueue_scripts() {
        if (!is_admin()) {
            // Los estilos y scripts se añadirán más adelante
        }
    }

    /**
     * Sidebar cart shortcode
     */
    public function sidebar_cart_shortcode($atts) {
        $atts = shortcode_atts(
            array(
                'id' => 'mi-carrito',
                'class' => 'mi-clase'
            ),
            $atts,
            'sidebar_cart'
        );

        ob_start();
        echo '<div id="' . esc_attr($atts['id']) . '" class="snap-sidebar-cart-container ' . esc_attr($atts['class']) . '"></div>';
        return ob_get_clean();
    }

    /**
     * Sidebar cart button shortcode
     */
    public function sidebar_cart_button_shortcode($atts) {
        $atts = shortcode_atts(
            array(
                'text' => __('Ver carrito', 'snap-sidebar-cart'),
                'class' => 'mi-boton'
            ),
            $atts,
            'sidebar_cart_button'
        );

        ob_start();
        echo '<button class="snap-sidebar-cart-open-button ' . esc_attr($atts['class']) . '">' . esc_html($atts['text']) . '</button>';
        return ob_get_clean();
    }

    /**
     * Render sidebar cart
     */
    public function render_sidebar_cart() {
        if (!is_admin()) {
            // Placeholder para mantener la compatibilidad
            echo '<div id="snap-sidebar-cart" class="snap-sidebar-cart-container">';
            echo '<div class="snap-sidebar-cart-header">';
            echo '<h2>' . esc_html($this->options['cart_title']) . '</h2>';
            echo '</div>';
            echo '</div>';
        }
    }

    /**
     * Before content hook
     */
    public function before_content() {
        // Hook para desarrolladores
    }

    /**
     * After content hook
     */
    public function after_content() {
        // Hook para desarrolladores
    }
}