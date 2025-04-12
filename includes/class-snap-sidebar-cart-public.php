<?php
/**
 * La funcionalidad específica del área pública del plugin.
 *
 * @since      1.0.0
 */
class Snap_Sidebar_Cart_Public {

    /**
     * Las opciones del plugin.
     *
     * @since    1.0.0
     * @access   private
     * @var      array    $options    Las opciones del plugin.
     */
    private $options;

    /**
     * Inicializa la clase y establece sus propiedades.
     *
     * @since    1.0.0
     * @param    array    $options    Las opciones del plugin.
     */
    public function __construct($options) {
        $this->options = $options;
    }

    /**
     * Registra los estilos para el área pública.
     *
     * @since    1.0.0
     */
    public function enqueue_styles() {
        wp_enqueue_style('snap-sidebar-cart-public', SNAP_SIDEBAR_CART_URL . 'assets/css/snap-sidebar-cart-public.css', array(), SNAP_SIDEBAR_CART_VERSION, 'all');
        
        // Estilos personalizados desde las opciones
        $custom_css = $this->generate_custom_css();
        wp_add_inline_style('snap-sidebar-cart-public', $custom_css);
    }

    /**
     * Registra los scripts para el área pública.
     *
     * @since    1.0.0
     */
    public function enqueue_scripts() {
        // Registramos el script
        wp_register_script('snap-sidebar-cart-public', SNAP_SIDEBAR_CART_URL . 'assets/js/snap-sidebar-cart-public.js', array('jquery'), SNAP_SIDEBAR_CART_VERSION, true);
        
        // Localizamos el script para usar AJAX
        wp_localize_script('snap-sidebar-cart-public', 'snap_sidebar_cart_params', array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('snap-sidebar-cart-nonce'),
            'container_selector' => '.' . $this->options['container_selector'],
            'activation_selectors' => $this->options['activation_selectors'],
            'auto_open' => isset($this->options['auto_open']) ? (bool) $this->options['auto_open'] : true,
        ));
        
        // Encolamos el script
        wp_enqueue_script('snap-sidebar-cart-public');
    }

    /**
     * Genera CSS personalizado desde las opciones.
     *
     * @since    1.0.0
     * @return   string    CSS personalizado.
     */
    private function generate_custom_css() {
        $styles = $this->options['styles'];
        
        $css = "
            .snap-sidebar-cart {
                width: {$styles['sidebar_width']};
                background-color: {$styles['sidebar_background']};
            }
            .snap-sidebar-cart__header {
                background-color: {$styles['header_background']};
                color: {$styles['header_text_color']};
            }
            .snap-sidebar-cart__product-name,
            .snap-sidebar-cart__product-price {
                color: {$styles['product_text_color']};
            }
            .snap-sidebar-cart__button {
                background-color: {$styles['button_background']};
                color: {$styles['button_text_color']};
            }
        ";
        
        return $css;
    }

    /**
     * Renderiza el carrito lateral en el footer.
     *
     * @since    1.0.0
     */
    public function render_sidebar_cart() {
        include_once SNAP_SIDEBAR_CART_PATH . 'public/partials/snap-sidebar-cart-public-display.php';
    }
}
