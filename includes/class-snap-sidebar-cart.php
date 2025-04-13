<?php
/**
 * La clase principal del plugin.
 *
 * @since      1.0.0
 */
class Snap_Sidebar_Cart {

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
        $this->load_options();
        $this->define_admin_hooks();
        $this->define_public_hooks();
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
            'activation_selectors' => '.add_to_cart_button:not(.product_type_variable), .ti-shopping-cart, i.ti-shopping-cart',
            'show_shipping' => true,
            'auto_open' => true,
            'new_product_position' => 'top', // Controla si los productos nuevos se agregan al inicio ('top') o al final ('bottom')
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

        // Obtenemos las opciones guardadas
        $saved_options = get_option('snap_sidebar_cart_options', array());
        
        // Combinamos las opciones por defecto con las guardadas
        $this->options = wp_parse_args($saved_options, $default_options);
        
        // Aseguramos que el array de styles exista
        if (!isset($this->options['styles']) || !is_array($this->options['styles'])) {
            $this->options['styles'] = $default_options['styles'];
        }
        
        // Aseguramos que el array de related_products exista
        if (!isset($this->options['related_products']) || !is_array($this->options['related_products'])) {
            $this->options['related_products'] = $default_options['related_products'];
        }
        
        // Aseguramos que ciertos valores críticos nunca estén vacíos
        if (empty($this->options['container_selector'])) {
            $this->options['container_selector'] = $default_options['container_selector'];
        }
        
        if (empty($this->options['activation_selectors'])) {
            $this->options['activation_selectors'] = $default_options['activation_selectors'];
        }
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
        
        // Añadir timestamp a los productos cuando se agregan al carrito
        add_filter('woocommerce_add_cart_item_data', array($this, 'add_timestamp_to_cart_item'), 10, 3);
    }
    
    /**
     * Añade un timestamp al producto cuando se agrega al carrito.
     * Esto permite ordenar los productos por la fecha/hora de adición.
     *
     * @since    1.0.7
     * @param    array    $cart_item_data    Los datos actuales del artículo del carrito.
     * @param    int      $product_id        ID del producto.
     * @param    int      $variation_id      ID de variación (si aplica).
     * @return   array                       Los datos del artículo con el timestamp añadido.
     */
    public function add_timestamp_to_cart_item($cart_item_data, $product_id, $variation_id) {
        // Verificar si este producto ya existe en el carrito
        $cart = WC()->cart->get_cart();
        $product_in_cart = false;
        $cart_item_key = '';
        
        // Crear un identificador único para este producto + variación
        $product_variation_id = $product_id . '-' . ($variation_id > 0 ? $variation_id : '0');
        
        foreach ($cart as $key => $item) {
            $cart_product_variation_id = $item['product_id'] . '-' . ($item['variation_id'] > 0 ? $item['variation_id'] : '0');
            
            // Comprobamos si es el mismo producto y la misma variación
            if ($cart_product_variation_id === $product_variation_id) {
                $product_in_cart = true;
                $cart_item_key = $key;
                break;
            }
        }
        
        // Log para debug con información adicional
        $product = wc_get_product($product_id);
        $product_name = $product ? $product->get_name() : 'Producto desconocido';
        $timestamp = time();
        error_log('Añadido timestamp al producto ID ' . $product_id . ' (' . $product_name . '): ' . $timestamp . ' - Ya en carrito: ' . ($product_in_cart ? 'Sí' : 'No'));
        
        // Si el producto ya está en el carrito, hay dos opciones:
        // 1. Retornar un array vacío para que WooCommerce maneje la lógica de actualización
        // 2. Llamar directamente a la función de WooCommerce para actualizar la cantidad
        if ($product_in_cart && !empty($cart_item_key)) {
            // Opción 1: Dejar que WooCommerce actualice la cantidad automáticamente
            // Para esto NO agregamos datos personalizados que forzarían a crear un nuevo elemento
            
            // Opción 2: Actualizar manualmente la cantidad (descomentar si se prefiere)
            /*
            // Obtenemos la cantidad actual
            $current_quantity = $cart[$cart_item_key]['quantity'];
            // Actualizamos el carrito con una unidad más
            WC()->cart->set_quantity($cart_item_key, $current_quantity + 1, true);
            // Retornamos FALSE para evitar que se añada un nuevo elemento al carrito
            return false;
            */
            
            // Agregamos solo el timestamp regular pero sin datos personalizados
            $cart_item_data['time_added'] = $timestamp;
            return $cart_item_data;
        } else {
            // Es un nuevo producto, agregamos todos los datos necesarios
            // Asegurarse de que cart_item_data sea un array
            if (!is_array($cart_item_data)) {
                $cart_item_data = array();
            }
            
            // Agregar el timestamp actual a los datos del artículo
            $cart_item_data['time_added'] = $timestamp;
            
            // Generar datos personalizados para productos nuevos
            if (!isset($cart_item_data['custom_data'])) {
                $cart_item_data['custom_data'] = array();
            }
            $cart_item_data['custom_data']['time_added'] = $timestamp;
            
            return $cart_item_data;
        }
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
        
        add_action('wp_ajax_snap_sidebar_cart_get_content', array($plugin_ajax, 'get_cart_content'));
        add_action('wp_ajax_nopriv_snap_sidebar_cart_get_content', array($plugin_ajax, 'get_cart_content'));
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
