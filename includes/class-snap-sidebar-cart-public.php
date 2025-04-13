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
     * Registrar los scripts y estilos para el área pública.
     *
     * @since    1.0.14
     */
    public function enqueue_scripts() {
        // Incluir scripts sólo si WooCommerce está activo
        if (!function_exists('WC')) {
            return;
        }
        
        // Script principal del carrito
        wp_enqueue_script('snap-sidebar-cart-public', SNAP_SIDEBAR_CART_URL . 'assets/js/snap-sidebar-cart-public.js', array('jquery'), SNAP_SIDEBAR_CART_VERSION, true);
        
        // Script para manejar la última unidad (soluciona problema de visualización)
        wp_enqueue_script('snap-sidebar-cart-last-unit-handler', SNAP_SIDEBAR_CART_URL . 'assets/js/last-unit-handler.js', array('jquery', 'snap-sidebar-cart-public'), SNAP_SIDEBAR_CART_VERSION, true);
        
        // Script para gestionar límites de stock y el botón eliminar
        wp_enqueue_script('snap-sidebar-cart-stock-and-remove', SNAP_SIDEBAR_CART_URL . 'assets/js/stock-and-remove-handler.js', array('jquery', 'snap-sidebar-cart-public'), SNAP_SIDEBAR_CART_VERSION, true);
        
        // Script mejorado con alertas visuales para solucionar el problema del botón eliminar
        wp_enqueue_script('snap-sidebar-cart-remove-button-fix-enhanced', SNAP_SIDEBAR_CART_URL . 'assets/js/remove-button-fix-enhanced.js', array('jquery', 'snap-sidebar-cart-public'), SNAP_SIDEBAR_CART_VERSION, true);
        
        // Opciones para el script
        $script_options = array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('snap-sidebar-cart-nonce'),
            'activation_selectors' => $this->options['activation_selectors'],
            'auto_open' => isset($this->options['auto_open']) ? $this->options['auto_open'] : false,
            // Posición para los nuevos productos (top o bottom)
            'new_product_position' => isset($this->options['new_product_position']) ? 
                                     $this->options['new_product_position'] : 'top',
            // Opciones para animaciones
            'animations' => array(
                'duration' => isset($this->options['animations']['duration']) ? 
                             intval($this->options['animations']['duration']) : 300,
                'quantity_update_delay' => isset($this->options['animations']['quantity_update_delay']) ? 
                                         intval($this->options['animations']['quantity_update_delay']) : 200,
                'enabled' => isset($this->options['animations']['enabled']) ? 
                           (bool)$this->options['animations']['enabled'] : true
            ),
            // Opciones para el preloader
            'preloader' => array(
                'type' => isset($this->options['preloader']['type']) ? 
                        $this->options['preloader']['type'] : 'circle',
                'position' => isset($this->options['preloader']['position']) ? 
                            $this->options['preloader']['position'] : 'center'
            )
        );
        
        wp_localize_script('snap-sidebar-cart-public', 'snap_sidebar_cart_params', $script_options);
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
        
        // Opciones del preloader
        $preloader = isset($this->options['preloader']) ? $this->options['preloader'] : array();
        $preloader_type = isset($preloader['type']) ? esc_attr($preloader['type']) : 'circle';
        $preloader_size = isset($preloader['size']) ? esc_attr($preloader['size']) : '40px';
        $preloader_color = isset($preloader['color']) ? esc_attr($preloader['color']) : '#3498db';
        $preloader_color2 = isset($preloader['color2']) ? esc_attr($preloader['color2']) : '#e74c3c';
        $preloader_position = isset($preloader['position']) ? esc_attr($preloader['position']) : 'center';
        
        // Opciones de animaciones
        $animations = isset($this->options['animations']) ? $this->options['animations'] : array();
        $animation_duration = isset($animations['duration']) ? intval($animations['duration']) : 300;
        $quantity_update_delay = isset($animations['quantity_update_delay']) ? intval($animations['quantity_update_delay']) : 200;
        
        $css = "
            :root {
                --animation-duration: " . $animation_duration . "ms;
                --animation-delay: " . $quantity_update_delay . "ms;
            }
            
            #" . esc_attr($this->options['container_selector']) . " {
                width: " . esc_attr($styles['sidebar_width']) . ";
            }
            
            /* Estilos personalizados para el preloader */
            .snap-sidebar-cart__loader-spinner {
                width: " . $preloader_size . ";
                height: " . $preloader_size . ";
                position: absolute;
            }
            
            /* Estilos específicos según el tipo de preloader */
            .snap-sidebar-cart__loader-spinner.preloader-circle {
                border: 2px solid rgba(0, 0, 0, 0.1);
                border-top: 2px solid " . $preloader_color . ";
            }
            
            .snap-sidebar-cart__loader-spinner.preloader-square {
                border: 2px solid rgba(0, 0, 0, 0.1);
                border-top: 2px solid " . $preloader_color . ";
            }
            
            .snap-sidebar-cart__loader-spinner.preloader-dots span {
                background-color: " . $preloader_color . ";
            }
            
            .snap-sidebar-cart__loader-spinner.preloader-spinner:before {
                border-top-color: " . $preloader_color . ";
            }
            
            .snap-sidebar-cart__loader-spinner.preloader-spinner:after {
                border-bottom-color: " . $preloader_color2 . ";
            }
            
            /* Posicionamiento del preloader */
            .snap-sidebar-cart__loader-spinner.preloader-position-center {
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
            }
            
            .snap-sidebar-cart__loader-spinner.preloader-position-top-left {
                top: 10px;
                left: 10px;
            }
            
            .snap-sidebar-cart__loader-spinner.preloader-position-top-right {
                top: 10px;
                right: 10px;
            }
            
            .snap-sidebar-cart__loader-spinner.preloader-position-bottom-left {
                bottom: 10px;
                left: 10px;
            }
            
            .snap-sidebar-cart__loader-spinner.preloader-position-bottom-right {
                bottom: 10px;
                right: 10px;
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
                position: relative;
                overflow: hidden;
            }
            
            /* Animaciones para nuevos productos */
            .snap-sidebar-cart__product.new-item {
                animation: fadeIn var(--animation-duration) ease-out;
            }
            
            /* Animación para cambio de cantidad */
            .cart-item__quantity-input.quantity-updated {
                animation: quantityUpdated var(--animation-duration) ease-out;
            }
            
            /* Animación para productos que se eliminan */
            .snap-sidebar-cart__product.removing {
                animation: fadeOut var(--animation-duration) ease-out;
            }
            
            /* Animación para el hover de productos relacionados */
            .snap-sidebar-cart__related-product .product-gallery-image {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                opacity: 0;
                transition: opacity 0.3s ease-in-out;
                z-index: 1;
            }
            
            .snap-sidebar-cart__related-product:hover .product-gallery-image {
                opacity: 1;
            }
            
            /* Keyframes para las animaciones */
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            @keyframes fadeOut {
                from { opacity: 1; transform: translateY(0); }
                to { opacity: 0; transform: translateY(20px); }
            }
            
            @keyframes quantityUpdated {
                0% { background-color: rgba(" . $this->hex2rgb($preloader_color) . ", 0.1); }
                50% { background-color: rgba(" . $this->hex2rgb($preloader_color) . ", 0.3); }
                100% { background-color: transparent; }
            }
        ";
        
        return $css;
    }

    /**
     * Convierte un color hexadecimal a formato RGB.
     * 
     * @since    1.0.6
     * @param    string    $hex    El color en formato hexadecimal.
     * @return   string            El color en formato RGB (valores de 0-255).
     */
    private function hex2rgb($hex) {
        $hex = str_replace('#', '', $hex);
        
        if(strlen($hex) == 3) {
            $r = hexdec(substr($hex, 0, 1).substr($hex, 0, 1));
            $g = hexdec(substr($hex, 1, 1).substr($hex, 1, 1));
            $b = hexdec(substr($hex, 2, 1).substr($hex, 2, 1));
        } else {
            $r = hexdec(substr($hex, 0, 2));
            $g = hexdec(substr($hex, 2, 2));
            $b = hexdec(substr($hex, 4, 2));
        }
        
        return $r . ',' . $g . ',' . $b;
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
