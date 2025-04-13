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
                'sidebar_width' => '540px',
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
     * También gestiona la agrupación de productos idénticos actualizando la cantidad.
     *
     * @since    1.0.8
     * @param    array    $cart_item_data    Los datos actuales del artículo del carrito.
     * @param    int      $product_id        ID del producto.
     * @param    int      $variation_id      ID de variación (si aplica).
     * @return   array|false                 Los datos del artículo con el timestamp añadido o false para prevenir adición.
     */
    public function add_timestamp_to_cart_item($cart_item_data, $product_id, $variation_id) {
        // Obtener la instancia actual del carrito de WooCommerce
        $cart = WC()->cart;
        if (!$cart) {
            error_log('Error en add_timestamp_to_cart_item: WC()->cart no está disponible');
            return $cart_item_data; // Fallback seguro
        }
        
        // Verificar si este producto ya existe en el carrito
        $product_in_cart = false;
        $existing_cart_item_key = '';
        
        // Buscar si el producto ya existe comparando exactamente producto y variación
        foreach ($cart->get_cart() as $cart_item_key => $cart_item) {
            // Comparamos por ID de producto y variación (o ambas son 0)
            if ($cart_item['product_id'] == $product_id && $cart_item['variation_id'] == $variation_id) {
                // Verificar también atributos de variación si los hay
                $variation_match = true;
                if (!empty($cart_item['variation']) && isset($_REQUEST['variation'])) {
                    $requested_variation = $_REQUEST['variation'];
                    foreach ($requested_variation as $attribute => $value) {
                        if (!isset($cart_item['variation'][$attribute]) || $cart_item['variation'][$attribute] !== $value) {
                            $variation_match = false;
                            break;
                        }
                    }
                }
                
                if ($variation_match) {
                    $product_in_cart = true;
                    $existing_cart_item_key = $cart_item_key;
                    break;
                }
            }
        }
        
        // Log para debug con información adicional
        $product = wc_get_product($product_id);
        $product_name = $product ? $product->get_name() : 'Producto desconocido';
        $timestamp = time();
        
        error_log('Proceso para producto ID ' . $product_id . ' (' . $product_name . '): Timestamp=' . $timestamp . ', Ya en carrito: ' . ($product_in_cart ? 'Sí (clave:' . $existing_cart_item_key . ')' : 'No'));
        
        // Si el producto ya está en el carrito y tenemos su clave
        if ($product_in_cart && !empty($existing_cart_item_key)) {
            // Obtener la cantidad actual y la nueva cantidad a añadir
            $cart_items = $cart->get_cart();
            $current_quantity = $cart_items[$existing_cart_item_key]['quantity'];
            $quantity_to_add = isset($_REQUEST['quantity']) ? absint($_REQUEST['quantity']) : 1;
            $new_quantity = $current_quantity + $quantity_to_add;
            
            error_log('Actualizando cantidad del producto existente de ' . $current_quantity . ' a ' . $new_quantity);
            
            // Actualizar la cantidad del producto existente
            $cart->set_quantity($existing_cart_item_key, $new_quantity, true);
            
            // Actualizar el timestamp para mantener el producto en la posición correcta según configuración
            // Esto es importante para preservar la ordenación por nuevos/antiguos
            $cart_items = $cart->get_cart();
            if (isset($cart_items[$existing_cart_item_key])) {
                $cart_items[$existing_cart_item_key]['time_added'] = $timestamp;
                $cart->set_cart_contents($cart_items);
                error_log('Timestamp actualizado para el producto existente: ' . $timestamp);
            }
            
            // Verificar después de la actualización para confirmar la cantidad correcta
            $cart_items = $cart->get_cart();
            if (isset($cart_items[$existing_cart_item_key])) {
                $updated_quantity = $cart_items[$existing_cart_item_key]['quantity'];
                error_log('Cantidad después de actualizar: ' . $updated_quantity . ' (esperada: ' . $new_quantity . ')');
            }
            
            // IMPORTANTE: Retornar false para que WooCommerce no añada un nuevo item al carrito
            return false;
        } else {
            // Es un nuevo producto, agregamos los datos necesarios
            if (!is_array($cart_item_data)) {
                $cart_item_data = array();
            }
            
            // Agregar el timestamp al ítem para ordenar después
            $cart_item_data['time_added'] = $timestamp;
            error_log('Nuevo producto añadido con timestamp: ' . $timestamp);
            
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
