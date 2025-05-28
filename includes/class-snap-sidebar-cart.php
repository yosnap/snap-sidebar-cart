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
        require_once SNAP_SIDEBAR_CART_PATH . 'includes/class-snap-sidebar-cart-logger.php';
        require_once SNAP_SIDEBAR_CART_PATH . 'includes/class-snap-sidebar-cart-admin.php';
        require_once SNAP_SIDEBAR_CART_PATH . 'includes/class-snap-sidebar-cart-public.php';
        require_once SNAP_SIDEBAR_CART_PATH . 'includes/class-snap-sidebar-cart-ajax.php';
        
        // Inicializar el sistema de logging
        Snap_Sidebar_Cart_Logger::init();
        //Snap_Sidebar_Cart_Logger::info('Plugin inicializado - Versión ' . SNAP_SIDEBAR_CART_VERSION);
    }

    /**
     * Carga las opciones del plugin.
     *
     * @since    1.0.0
     * @access   private
     */
    private function load_options() {
        $default_options = array(
            'title' => 'Carrito de compra', // Sin usar función de traducción
            'container_selector' => 'sidebar-cart-container',
            'activation_selectors' => '.add_to_cart_button:not(.product_type_variable), .ti-shopping-cart, i.ti-shopping-cart',
            'delivery_time_text' => 'Entrega en 1-3 días hábiles', // Sin usar función de traducción
            'show_delivery_time' => true,
            'show_shipping' => true,
            'show_delete_icon' => true,
            'show_delete_icon_top' => true,
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
                'products_background' => '#ffffff',
                'related_section_background' => '#f9f9f9',
                'footer_background' => '#f8f8f8',
            ),
            'related_products' => array(
                'show' => true,
                'count' => 4,
                'columns' => 2,
                'orderby' => 'rand',
                'slides_to_scroll' => 2,
                'show_last_chance' => true,
                'last_chance_stock_limit' => 5,
                'last_chance_title' => 'ÚLTIMA OPORTUNIDAD', // Sin usar función de traducción
                'last_chance_bg_color' => '#e74c3c',
                'last_chance_text_color' => '#ffffff',
            ),
            'preloader' => array(
                'type' => 'circle',
                'size' => '40px',
                'color' => '#3498db',
                'color2' => '#e74c3c',
                'position' => 'center',
            ),
            'animations' => array(
                'duration' => 300,
                'quantity_update_delay' => 200,
                'new_product_position' => 'top',
            ),
        );

        // Obtenemos las opciones guardadas
        $saved_options = get_option('snap_sidebar_cart_options', array());
        
        // Combinamos las opciones por defecto con las guardadas de manera recursiva
        $this->options = $this->array_merge_recursive_distinct($default_options, $saved_options);
        
        // Aseguramos que el array de styles exista y tenga todos los valores por defecto
        if (!isset($this->options['styles']) || !is_array($this->options['styles'])) {
            $this->options['styles'] = $default_options['styles'];
        } else {
            // Asegurar que cada estilo tenga un valor por defecto si no está definido
            foreach ($default_options['styles'] as $style_key => $style_value) {
                if (!isset($this->options['styles'][$style_key])) {
                    $this->options['styles'][$style_key] = $style_value;
                }
            }
        }
        
        // Aseguramos que el array de related_products exista y tenga todos los valores por defecto
        if (!isset($this->options['related_products']) || !is_array($this->options['related_products'])) {
            $this->options['related_products'] = $default_options['related_products'];
        } else {
            // Asegurar que cada opción tenga un valor por defecto si no está definida
            foreach ($default_options['related_products'] as $rel_key => $rel_value) {
                if (!isset($this->options['related_products'][$rel_key])) {
                    $this->options['related_products'][$rel_key] = $rel_value;
                }
            }
        }
        
        // Aseguramos que el array de preloader exista y tenga todos los valores por defecto
        if (!isset($this->options['preloader']) || !is_array($this->options['preloader'])) {
            $this->options['preloader'] = $default_options['preloader'];
        } else {
            // Asegurar que cada opción tenga un valor por defecto si no está definida
            foreach ($default_options['preloader'] as $preloader_key => $preloader_value) {
                if (!isset($this->options['preloader'][$preloader_key])) {
                    $this->options['preloader'][$preloader_key] = $preloader_value;
                }
            }
        }
        
        // Aseguramos que el array de animations exista y tenga todos los valores por defecto
        if (!isset($this->options['animations']) || !is_array($this->options['animations'])) {
            $this->options['animations'] = $default_options['animations'];
        } else {
            // Asegurar que cada opción tenga un valor por defecto si no está definida
            foreach ($default_options['animations'] as $anim_key => $anim_value) {
                if (!isset($this->options['animations'][$anim_key])) {
                    $this->options['animations'][$anim_key] = $anim_value;
                }
            }
        }
        
        // Aseguramos que ciertos valores críticos nunca estén vacíos
        if (empty($this->options['container_selector'])) {
            $this->options['container_selector'] = $default_options['container_selector'];
        }
        
        if (empty($this->options['activation_selectors'])) {
            $this->options['activation_selectors'] = $default_options['activation_selectors'];
        }
        
        if (empty($this->options['delivery_time_text'])) {
            $this->options['delivery_time_text'] = $default_options['delivery_time_text'];
        }
        
        // Asegurar que las opciones booleanas tengan un valor por defecto
        if (!isset($this->options['show_delivery_time'])) {
            $this->options['show_delivery_time'] = $default_options['show_delivery_time'];
        }
        
        if (!isset($this->options['show_shipping'])) {
            $this->options['show_shipping'] = $default_options['show_shipping'];
        }
        
        if (!isset($this->options['show_delete_icon'])) {
            $this->options['show_delete_icon'] = $default_options['show_delete_icon'];
        }
        
        if (!isset($this->options['show_delete_icon_top'])) {
            $this->options['show_delete_icon_top'] = $default_options['show_delete_icon_top'];
        }
        
        if (!isset($this->options['auto_open'])) {
            $this->options['auto_open'] = $default_options['auto_open'];
        }
    }
    
    /**
     * Fusion recursiva de arrays, diferente de la función array_merge_recursive().
     * Los arrays se fusionan recursivamente, pero los valores con el mismo string key en arrays asociativos
     * se sobrescriben en lugar de combinarse en un array.
     *
     * @since    1.2.2
     * @param    array    $array1    Array base.
     * @param    array    $array2    Array a fusionar.
     * @return   array                El array resultante.
     */
    private function array_merge_recursive_distinct(array $array1, array $array2) {
        $merged = $array1;
        
        foreach ($array2 as $key => $value) {
            if (is_array($value) && isset($merged[$key]) && is_array($merged[$key])) {
                $merged[$key] = $this->array_merge_recursive_distinct($merged[$key], $value);
            } else {
                $merged[$key] = $value;
            }
        }
        
        return $merged;
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
        if (
            isset($_POST['action']) &&
            $_POST['action'] === 'snap_sidebar_cart_update'
        ) {
            return $cart_item_data;
        }
        $cart = WC()->cart;
        if (!$cart) {
            return $cart_item_data;
        }
        $product_in_cart = false;
        $existing_cart_item_key = '';
        // Normalizar variación del request
        $requested_variation = array();
        if (isset($_REQUEST['variation']) && is_array($_REQUEST['variation'])) {
            foreach ($_REQUEST['variation'] as $k => $v) {
                $requested_variation[strtolower(trim($k))] = strtolower(trim($v));
            }
        }
        ksort($requested_variation);
        // Detectar y añadir automáticamente todos los campos personalizados relevantes
        $custom_fields_request = array();
        foreach ($_REQUEST as $key => $value) {
            if (is_string($key) && (
                strpos(strtolower($key), 'engraving') !== false ||
                strpos(strtolower($key), 'grabado') !== false ||
                strpos(strtolower($key), 'custom') !== false ||
                strpos(strtolower($key), 'personaliz') !== false ||
                strpos(strtolower($key), 'etiqueta') !== false
            )) {
                $custom_fields_request[$key] = is_array($value) ? json_encode($value) : (string)$value;
            }
        }
        ksort($custom_fields_request);
        $requested_serialized = serialize($requested_variation) . '|' . serialize($custom_fields_request);
        foreach ($cart->get_cart() as $cart_item_key => $cart_item) {
            if ($cart_item['product_id'] == $product_id && $cart_item['variation_id'] == $variation_id) {
                // Normalizar variación del carrito
                $cart_variation = array();
                if (!empty($cart_item['variation']) && is_array($cart_item['variation'])) {
                    foreach ($cart_item['variation'] as $k => $v) {
                        $cart_variation[strtolower(trim($k))] = strtolower(trim($v));
                    }
                }
                ksort($cart_variation);
                // Normalizar campos personalizados del carrito
                $custom_fields_cart = array();
                foreach ($cart_item as $k => $v) {
                    if (is_string($k) && (
                        strpos(strtolower($k), 'engraving') !== false ||
                        strpos(strtolower($k), 'grabado') !== false ||
                        strpos(strtolower($k), 'custom') !== false ||
                        strpos(strtolower($k), 'personaliz') !== false ||
                        strpos(strtolower($k), 'etiqueta') !== false
                    )) {
                        $custom_fields_cart[$k] = is_array($v) ? json_encode($v) : (string)$v;
                    }
                }
                ksort($custom_fields_cart);
                $cart_serialized = serialize($cart_variation) . '|' . serialize($custom_fields_cart);
                if ($cart_serialized === $requested_serialized) {
                    $product_in_cart = true;
                    $existing_cart_item_key = $cart_item_key;
                    return false;
                }
            }
        }
        $product = wc_get_product($product_id);
        $timestamp = time();
        if (!is_array($cart_item_data)) {
            $cart_item_data = array();
        }
        $cart_item_data['time_added'] = $timestamp;
        // Guardar todos los campos personalizados detectados en el cart_item_data
        foreach ($custom_fields_request as $k => $v) {
            $cart_item_data[$k] = $v;
        }
        return $cart_item_data;
    }

    /**
     * Ejecuta el cargador para ejecutar todos los hooks con WordPress.
     *
     * @since    1.0.0
     */
    public function run() {
        // Purgar cualquier caché antes de ejecutar
        $this->purge_cache();
        
        // Definir hooks AJAX
        $this->define_ajax_hooks();
    }
    
    /**
     * Intenta purgar cachés conocidos para asegurar que los cambios se apliquen
     *
     * @since    1.1.1
     */
    private function purge_cache() {
        // Limpiar cache de WordPress
        if (function_exists('wp_cache_flush')) {
            wp_cache_flush();
        }
        
        // Limpiar caché del navegador para CSS y JS forzando una URL única
        add_filter('style_loader_src', array($this, 'add_cache_busting_parameter'), 10, 2);
        add_filter('script_loader_src', array($this, 'add_cache_busting_parameter'), 10, 2);
        
        // Intentar limpiar caché de plugins populares
        // WP Super Cache
        if (function_exists('wp_cache_clear_cache')) {
            wp_cache_clear_cache();
        }
        
        // W3 Total Cache
        if (function_exists('w3tc_flush_all')) {
            w3tc_flush_all();
        }
        
        // Autoptimize
        if (class_exists('autoptimizeCache') && method_exists('autoptimizeCache', 'clearall')) {
            autoptimizeCache::clearall();
        }
        
        // WP Rocket
        if (function_exists('rocket_clean_domain')) {
            rocket_clean_domain();
        }
    }
    
    /**
     * Añade un parámetro para evitar la caché en los archivos del plugin
     *
     * @since    1.1.1
     */
    public function add_cache_busting_parameter($src, $handle) {
        // Solo modificar URLs de nuestro plugin
        if (strpos($handle, 'snap-sidebar-cart') !== false || strpos($src, 'snap-sidebar-cart') !== false) {
            $src = add_query_arg('ver', SNAP_SIDEBAR_CART_VERSION . '.' . time(), $src);
        }
        return $src;
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
        
        // Endpoint para sincronización del carrito desde la página del carrito
        add_action('wp_ajax_snap_sidebar_cart_get_cart', array($plugin_ajax, 'get_sidebar_cart'));
        add_action('wp_ajax_nopriv_snap_sidebar_cart_get_cart', array($plugin_ajax, 'get_sidebar_cart'));
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
