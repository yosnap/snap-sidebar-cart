<?php
/**
 * La funcionalidad específica de administración del plugin.
 *
 * @since      1.0.0
 */
class Snap_Sidebar_Cart_Admin {

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
     * Registra los estilos para el área de administración.
     *
     * @since    1.0.0
     */
    public function enqueue_styles($hook) {
        if ('settings_page_snap-sidebar-cart' !== $hook) {
            return;
        }
        
        wp_enqueue_style('wp-color-picker');
        wp_enqueue_style('snap-sidebar-cart-admin', SNAP_SIDEBAR_CART_URL . 'assets/css/snap-sidebar-cart-admin.css', array(), SNAP_SIDEBAR_CART_VERSION, 'all');
    }

    /**
     * Registra los scripts para el área de administración.
     *
     * @since    1.0.0
     */
    public function enqueue_scripts($hook) {
        if ('settings_page_snap-sidebar-cart' !== $hook) {
            return;
        }
        
        wp_enqueue_script('wp-color-picker');
        wp_enqueue_script('snap-sidebar-cart-admin', SNAP_SIDEBAR_CART_URL . 'assets/js/snap-sidebar-cart-admin.js', array('jquery', 'wp-color-picker'), SNAP_SIDEBAR_CART_VERSION, false);
    }

    /**
     * Agrega la página de opciones al menú de administración.
     *
     * @since    1.0.0
     */
    public function add_plugin_admin_menu() {
        add_menu_page(
            __('Snap Sidebar Cart', 'snap-sidebar-cart'),
            __('Sidebar Cart', 'snap-sidebar-cart'),
            'manage_options',
            'snap-sidebar-cart',
            array($this, 'display_plugin_admin_page'),
            'dashicons-cart',
            58
        );
    }
    
    /**
     * Añade enlaces de acción en la página de plugins
     *
     * @since    1.0.0
     * @param    array    $links    Los enlaces de acción del plugin.
     */
    public function add_action_links($links) {
        $settings_link = '<a href="' . admin_url('admin.php?page=snap-sidebar-cart') . '">' . __('Configuración', 'snap-sidebar-cart') . '</a>';
        array_unshift($links, $settings_link);
        return $links;
    }

    /**
     * Renderiza la página de administración.
     *
     * @since    1.0.0
     */
    public function display_plugin_admin_page() {
        include_once SNAP_SIDEBAR_CART_PATH . 'admin/partials/snap-sidebar-cart-admin-display.php';
    }

    /**
     * Registra las opciones del plugin.
     *
     * @since    1.0.0
     */
    public function register_settings() {
        register_setting(
            'snap_sidebar_cart_options_group',
            'snap_sidebar_cart_options',
            array($this, 'validate_options')
        );
    }

    /**
     * Valida las opciones del plugin.
     *
     * @since    1.0.0
     * @param    array    $input    Array con todas las opciones.
     */
    public function validate_options($input) {
        // Cargar opciones actuales para mantener valores que no se actualizaron
        $options = get_option('snap_sidebar_cart_options', array());
        
        // Opciones generales
        if (isset($input['title'])) {
            $options['title'] = sanitize_text_field($input['title']);
        }
        
        if (isset($input['container_selector'])) {
            $options['container_selector'] = sanitize_text_field($input['container_selector']);
        }
        
        if (isset($input['activation_selectors'])) {
            $options['activation_selectors'] = sanitize_text_field($input['activation_selectors']);
        }
        
        // Opciones boolean - necesitan manejo especial para checkboxes
        $options['show_shipping'] = isset($input['show_shipping']) ? true : false;
        $options['auto_open'] = isset($input['auto_open']) ? true : false;
        
        // Estilos
        if (!isset($options['styles'])) {
            $options['styles'] = array();
        }
        
        if (isset($input['styles']['sidebar_width'])) {
            $options['styles']['sidebar_width'] = sanitize_text_field($input['styles']['sidebar_width']);
        }
        
        if (isset($input['styles']['sidebar_background'])) {
            $options['styles']['sidebar_background'] = sanitize_hex_color($input['styles']['sidebar_background']);
        }
        
        if (isset($input['styles']['header_background'])) {
            $options['styles']['header_background'] = sanitize_hex_color($input['styles']['header_background']);
        }
        
        if (isset($input['styles']['header_text_color'])) {
            $options['styles']['header_text_color'] = sanitize_hex_color($input['styles']['header_text_color']);
        }
        
        if (isset($input['styles']['product_text_color'])) {
            $options['styles']['product_text_color'] = sanitize_hex_color($input['styles']['product_text_color']);
        }
        
        if (isset($input['styles']['button_background'])) {
            $options['styles']['button_background'] = sanitize_hex_color($input['styles']['button_background']);
        }
        
        if (isset($input['styles']['button_text_color'])) {
            $options['styles']['button_text_color'] = sanitize_hex_color($input['styles']['button_text_color']);
        }
        
        // Productos relacionados
        if (!isset($options['related_products'])) {
            $options['related_products'] = array();
        }
        
        $options['related_products']['show'] = isset($input['related_products']['show']) ? true : false;
        
        if (isset($input['related_products']['count'])) {
            $options['related_products']['count'] = absint($input['related_products']['count']);
        }
        
        if (isset($input['related_products']['columns'])) {
            $options['related_products']['columns'] = absint($input['related_products']['columns']);
        }
        
        if (isset($input['related_products']['orderby'])) {
            $options['related_products']['orderby'] = sanitize_text_field($input['related_products']['orderby']);
        }
        
        // Debug
        error_log('Opciones guardadas: ' . print_r($options, true));
        
        return $options;
    }
}
