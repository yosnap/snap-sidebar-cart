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
        // Solo cargar estilos en páginas de WooCommerce
        if (!is_woocommerce() && !is_cart() && !is_checkout() && !is_product() && !is_shop()) {
            return;
        }
        
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
        // Solo cargar scripts en páginas de WooCommerce
        if (!is_woocommerce() && !is_cart() && !is_checkout() && !is_product() && !is_shop()) {
            return;
        }
        
        // Registramos el script
        wp_register_script('snap-sidebar-cart-public', SNAP_SIDEBAR_CART_URL . 'assets/js/snap-sidebar-cart-public.js', array('jquery'), SNAP_SIDEBAR_CART_VERSION, true);
        
        // Localizamos el script para usar AJAX
        wp_localize_script('snap-sidebar-cart-public', 'snap_sidebar_cart_params', array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('snap-sidebar-cart-nonce'),
            'container_selector' => esc_attr($this->options['container_selector']),
            'activation_selectors' => esc_attr($this->options['activation_selectors']),
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
        if (!isset($this->options['styles']) || !is_array($this->options['styles'])) {
            return '';
        }
        
        $styles = $this->options['styles'];
        $columns = isset($this->options['related_products']['columns']) ? intval($this->options['related_products']['columns']) : 2;
        $column_width = 100 / $columns;
        
        $css = "
            #" . esc_attr($this->options['container_selector']) . " {
                width: " . esc_attr($styles['sidebar_width']) . ";
            }
            
            .snap-sidebar-cart {
                width: " . esc_attr($styles['sidebar_width']) . ";
                background-color: " . esc_attr($styles['sidebar_background']) . ";
            }
            
            .snap-sidebar-cart__header {
                background-color: " . esc_attr($styles['header_background']) . ";
                color: " . esc_attr($styles['header_text_color']) . ";
            }
            
            .snap-sidebar-cart__title,
            .snap-sidebar-cart__close {
                color: " . esc_attr($styles['header_text_color']) . ";
            }
            
            .snap-sidebar-cart__product-name,
            .snap-sidebar-cart__product-price,
            .snap-sidebar-cart__related-product-title {
                color: " . esc_attr($styles['product_text_color']) . ";
            }
            
            .snap-sidebar-cart__button--checkout {
                background-color: " . esc_attr($styles['button_background']) . ";
                color: " . esc_attr($styles['button_text_color']) . ";
            }
            
            .snap-sidebar-cart__related-product {
                width: calc(" . $column_width . "% - 20px);
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
        // Solo renderizar en páginas de WooCommerce
        if (!is_woocommerce() && !is_cart() && !is_checkout() && !is_product() && !is_shop()) {
            return;
        }
        
        // Asegurarse de que WooCommerce está activo y el carrito está disponible
        if (!function_exists('WC') || !WC()->cart) {
            return;
        }
        
        include_once SNAP_SIDEBAR_CART_PATH . 'public/partials/snap-sidebar-cart-public-display.php';
    }
}
