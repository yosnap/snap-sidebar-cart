<?php
/**
 * La clase principal del plugin.
 *
 * @since      1.0.0
 */
class Snap_Sidebar_Cart {

    /**
     * El cargador que es responsable de mantener y registrar todos los hooks del plugin.
     *
     * @since    1.0.0
     * @access   protected
     * @var      array    $loader    Mantiene y registra todos los hooks para el plugin.
     */
    protected $loader;

    /**
     * Las opciones del plugin.
     *
     * @since    1.0.0
     * @access   private
     * @var      array    $options    Las opciones del plugin.
     */
    private $options;

    /**
     * Define el nombre y la versión del plugin.
     * Carga las dependencias e instancia el cargador.
     *
     * @since    1.0.0
     */
    public function __construct() {
        $this->load_dependencies();
        $this->define_admin_hooks();
        $this->define_public_hooks();
        $this->load_options();
    }

    /**
     * Carga las dependencias requeridas para este plugin.
     *
     * @since    1.0.0
     * @access   private
     */
    private function load_dependencies() {
        require_once SNAP_SIDEBAR_CART_PATH . 'includes/class-snap-sidebar-cart-admin.php';
        require_once SNAP_SIDEBAR_CART_PATH . 'includes/class-snap-sidebar-cart-public.php';
        require_once SNAP_SIDEBAR_CART_PATH . 'includes/class-snap-sidebar-cart-ajax.php';
    }

    /**
     * Carga las opciones del plugin.
     *
     * @since    1.0.0
     * @access   private
     */
    private function load_options() {
        $default_options = array(
            'title' => __('Carrito de compra', 'snap-sidebar-cart'),
            'container_selector' => 'sidebar-cart-container',
            'activation_selectors' => '.add_to_cart_button, .ti-shopping-cart, i.ti-shopping-cart',
            'show_shipping' => true,
            'auto_open' => true,
            'styles' => array(
                'sidebar_width' => '400px',
                'sidebar_background' => '#ffffff',
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
            ),
        );

        $this->options = get_option('snap_sidebar_cart_options', $default_options);
    }

    /**
     * Registra todos los hooks relacionados con la funcionalidad del área de admin.
     *
     * @since    1.0.0
     * @access   private
     */
    private function define_admin_hooks() {
        $plugin_admin = new Snap_Sidebar_Cart_Admin($this->get_options());
        
        add_action('admin_menu', array($plugin_admin, 'add_plugin_admin_menu'));
        add_action('admin_init', array($plugin_admin, 'register_settings'));
        add_action('admin_enqueue_scripts', array($plugin_admin, 'enqueue_styles'));
        add_action('admin_enqueue_scripts', array($plugin_admin, 'enqueue_scripts'));
        
        // Agregar enlace a ajustes en la página de plugins
        add_filter('plugin_action_links_' . SNAP_SIDEBAR_CART_BASENAME, array($plugin_admin, 'add_action_links'));
    }

    /**
     * Registra todos los hooks relacionados con la funcionalidad del área pública.
     *
     * @since    1.0.0
     * @access   private
     */
    private function define_public_hooks() {
        $plugin_public = new Snap_Sidebar_Cart_Public($this->get_options());
        
        add_action('wp_enqueue_scripts', array($plugin_public, 'enqueue_styles'));
        add_action('wp_enqueue_scripts', array($plugin_public, 'enqueue_scripts'));
        add_action('wp_footer', array($plugin_public, 'render_sidebar_cart'));
    }

    /**
     * Ejecuta el cargador para ejecutar todos los hooks con WordPress.
     *
     * @since    1.0.0
     */
    public function run() {
        $this->define_ajax_hooks();
    }

    /**
     * Registra todos los hooks relacionados con la funcionalidad AJAX.
     *
     * @since    1.0.0
     * @access   private
     */
    private function define_ajax_hooks() {
        $plugin_ajax = new Snap_Sidebar_Cart_Ajax($this->get_options());
        
        add_action('wp_ajax_snap_sidebar_cart_add', array($plugin_ajax, 'add_to_cart'));
        add_action('wp_ajax_nopriv_snap_sidebar_cart_add', array($plugin_ajax, 'add_to_cart'));
        
        add_action('wp_ajax_snap_sidebar_cart_remove', array($plugin_ajax, 'remove_from_cart'));
        add_action('wp_ajax_nopriv_snap_sidebar_cart_remove', array($plugin_ajax, 'remove_from_cart'));
        
        add_action('wp_ajax_snap_sidebar_cart_update', array($plugin_ajax, 'update_cart'));
        add_action('wp_ajax_nopriv_snap_sidebar_cart_update', array($plugin_ajax, 'update_cart'));
        
        add_action('wp_ajax_snap_sidebar_cart_get_related', array($plugin_ajax, 'get_related_products'));
        add_action('wp_ajax_nopriv_snap_sidebar_cart_get_related', array($plugin_ajax, 'get_related_products'));
    }

    /**
     * Obtiene las opciones del plugin.
     *
     * @since     1.0.0
     * @return    array    Las opciones del plugin.
     */
    public function get_options() {
        return $this->options;
    }
}
