<?php
/**
 * Maneja las peticiones AJAX del plugin.
 *
 * @since      1.0.0
 */
class Snap_Sidebar_Cart_Ajax {

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
     * Agrega un producto al carrito vía AJAX.
     *
     * @since    1.0.0
     */
    public function add_to_cart() {
        check_ajax_referer('snap-sidebar-cart-nonce', 'nonce');
        
        if (!isset($_POST['product_id'])) {
            wp_send_json_error(array('message' => __('No se proporcionó un ID de producto', 'snap-sidebar-cart')));
        }
        
        $product_id = absint($_POST['product_id']);
        $quantity = isset($_POST['quantity']) ? absint($_POST['quantity']) : 1;
        $variation_id = isset($_POST['variation_id']) ? absint($_POST['variation_id']) : 0;
        $variation = isset($_POST['variation']) ? $_POST['variation'] : array();
        
        // Verificar que el producto existe
        $product = wc_get_product($product_id);
        if (!$product) {
            wp_send_json_error(array('message' => __('Producto no encontrado', 'snap-sidebar-cart')));
        }
        
        // Agregar al carrito
        $cart_item_key = WC()->cart->add_to_cart($product_id, $quantity, $variation_id, $variation);
        
        if ($cart_item_key) {
            $this->get_cart_contents($cart_item_key);
        } else {
            wp_send_json_error(array('message' => __('Error al añadir al carrito', 'snap-sidebar-cart')));
        }
        
        wp_die();
    }

    /**
     * Elimina un producto del carrito vía AJAX.
     *
     * @since    1.0.0
     */
    public function remove_from_cart() {
        check_ajax_referer('snap-sidebar-cart-nonce', 'nonce');
        
        if (!isset($_POST['cart_item_key'])) {
            wp_send_json_error(array('message' => __('No se proporcionó una clave de producto', 'snap-sidebar-cart')));
        }
        
        $cart_item_key = sanitize_text_field($_POST['cart_item_key']);
        
        // Verificar que el item existe en el carrito
        if (!isset(WC()->cart->get_cart()[$cart_item_key])) {
            wp_send_json_error(array('message' => __('Producto no encontrado en el carrito', 'snap-sidebar-cart')));
        }
        
        // Eliminar del carrito
        $removed = WC()->cart->remove_cart_item($cart_item_key);
        
        if ($removed) {
            $this->get_cart_contents();
        } else {
            wp_send_json_error(array('message' => __('Error al eliminar del carrito', 'snap-sidebar-cart')));
        }
        
        wp_die();
    }

    /**
     * Actualiza la cantidad de un producto en el carrito vía AJAX.
     *
     * @since    1.0.0
     */
    public function update_cart() {
        check_ajax_referer('snap-sidebar-cart-nonce', 'nonce');
        
        if (!isset($_POST['cart_item_key']) || !isset($_POST['quantity'])) {
            wp_send_json_error(array('message' => __('Parámetros insuficientes', 'snap-sidebar-cart')));
        }
        
        $cart_item_key = sanitize_text_field($_POST['cart_item_key']);
        $quantity = absint($_POST['quantity']);
        
        // Verificar que el item existe en el carrito
        if (!isset(WC()->cart->get_cart()[$cart_item_key])) {
            wp_send_json_error(array('message' => __('Producto no encontrado en el carrito', 'snap-sidebar-cart')));
        }
        
        // Si la cantidad es 0, eliminar el producto
        if ($quantity === 0) {
            $removed = WC()->cart->remove_cart_item($cart_item_key);
            
            if ($removed) {
                $this->get_cart_contents();
            } else {
                wp_send_json_error(array('message' => __('Error al eliminar del carrito', 'snap-sidebar-cart')));
            }
        } else {
            // Actualizar cantidad
            $updated = WC()->cart->set_quantity($cart_item_key, $quantity);
            
            if ($updated) {
                $this->get_cart_contents();
            } else {
                wp_send_json_error(array('message' => __('Error al actualizar el carrito', 'snap-sidebar-cart')));
            }
        }
        
        wp_die();
    }

    /**
     * Obtiene productos relacionados vía AJAX.
     *
     * @since    1.0.0
     */
    public function get_related_products() {
        check_ajax_referer('snap-sidebar-cart-nonce', 'nonce');
        
        if (!isset($_POST['product_id'])) {
            wp_send_json_error(array('message' => __('No se proporcionó un ID de producto', 'snap-sidebar-cart')));
        }
        
        $product_id = absint($_POST['product_id']);
        $product = wc_get_product($product_id);
        
        if (!$product) {
            wp_send_json_error(array('message' => __('Producto no encontrado', 'snap-sidebar-cart')));
        }
        
        $type = isset($_POST['type']) ? sanitize_text_field($_POST['type']) : 'related';
        
        switch ($type) {
            case 'category':
                $products = $this->get_same_category_products($product);
                break;
            case 'bestsellers':
                $products = $this->get_bestseller_products();
                break;
            case 'accessories':
                $products = $this->get_accessory_products($product);
                break;
            case 'related':
            default:
                $products = $this->get_product_related_products($product);
                break;
        }
        
        $html = '';
        
        if ($products) {
            ob_start();
            
            foreach ($products as $related_product) {
                if (!$related_product || !$related_product->is_purchasable() || !$related_product->is_in_stock()) {
                    continue;
                }
                
                $post_object = get_post($related_product->get_id());
                setup_postdata($GLOBALS['post'] =& $post_object);
                
                // Incluir plantilla para cada producto relacionado
                include SNAP_SIDEBAR_CART_PATH . 'public/partials/snap-sidebar-cart-related-product.php';
            }
            
            wp_reset_postdata();
            
            $html = ob_get_clean();
        }
        
        wp_send_json_success(array(
            'html' => $html
        ));
        
        wp_die();
    }

    /**
     * Obtiene productos relacionados según las relaciones definidas del producto.
     *
     * @since    1.0.0
     * @param    WC_Product    $product    El producto base.
     * @return   array                     Lista de productos relacionados.
     */
    private function get_product_related_products($product) {
        $related_limit = isset($this->options['related_products']['count']) ? intval($this->options['related_products']['count']) : 4;
        
        // Primero intentamos obtener productos relacionados definidos por el usuario
        $related_ids = $product->get_upsell_ids();
        
        // Si no hay suficientes, añadimos productos relacionados calculados automáticamente
        if (count($related_ids) < $related_limit) {
            $calculated_related = wc_get_related_products(
                $product->get_id(),
                $related_limit - count($related_ids),
                array_merge($related_ids, array($product->get_id()))
            );
            
            $related_ids = array_merge($related_ids, $calculated_related);
        }
        
        // Filtrar productos que ya están en el carrito
        $cart_product_ids = array();
        foreach (WC()->cart->get_cart() as $cart_item) {
            $cart_product_ids[] = $cart_item['product_id'];
        }
        $related_ids = array_diff($related_ids, $cart_product_ids);
        
        // Limitar al número máximo
        $related_ids = array_slice($related_ids, 0, $related_limit);
        
        // Convertir IDs a objetos de producto
        return array_filter(array_map('wc_get_product', $related_ids));
    }

    /**
     * Obtiene productos de la misma categoría.
     *
     * @since    1.0.0
     * @param    WC_Product    $product    El producto base.
     * @return   array                     Lista de productos de la misma categoría.
     */
    private function get_same_category_products($product) {
        $related_limit = isset($this->options['related_products']['count']) ? intval($this->options['related_products']['count']) : 4;
        $related_orderby = isset($this->options['related_products']['orderby']) ? esc_attr($this->options['related_products']['orderby']) : 'rand';
        
        // Obtener categorías del producto
        $product_categories = wc_get_product_term_ids($product->get_id(), 'product_cat');
        
        if (empty($product_categories)) {
            return array();
        }
        
        // Filtrar productos que ya están en el carrito
        $cart_product_ids = array();
        foreach (WC()->cart->get_cart() as $cart_item) {
            $cart_product_ids[] = $cart_item['product_id'];
        }
        $cart_product_ids[] = $product->get_id(); // Excluir el producto actual
        
        // Consultar productos de la misma categoría
        $args = array(
            'post_type'           => 'product',
            'post_status'         => 'publish',
            'posts_per_page'      => $related_limit,
            'orderby'             => $related_orderby,
            'post__not_in'        => $cart_product_ids,
            'tax_query'           => array(
                array(
                    'taxonomy'    => 'product_cat',
                    'field'       => 'term_id',
                    'terms'       => array_shift($product_categories),
                ),
            ),
        );
        
        $products = get_posts($args);
        
        return array_filter(array_map('wc_get_product', wp_list_pluck($products, 'ID')));
    }

    /**
     * Obtiene los productos más vendidos.
     *
     * @since    1.0.0
     * @return   array    Lista de productos más vendidos.
     */
    private function get_bestseller_products() {
        $related_limit = isset($this->options['related_products']['count']) ? intval($this->options['related_products']['count']) : 4;
        
        // Filtrar productos que ya están en el carrito
        $cart_product_ids = array();
        foreach (WC()->cart->get_cart() as $cart_item) {
            $cart_product_ids[] = $cart_item['product_id'];
        }
        
        // Consultar productos más vendidos
        $args = array(
            'post_type'           => 'product',
            'post_status'         => 'publish',
            'posts_per_page'      => $related_limit + count($cart_product_ids), // Obtenemos más para compensar los filtrados
            'meta_key'            => 'total_sales',
            'orderby'             => 'meta_value_num',
            'order'               => 'DESC',
            'post__not_in'        => $cart_product_ids,
        );
        
        $products = get_posts($args);
        $products = array_slice(array_filter(array_map('wc_get_product', wp_list_pluck($products, 'ID'))), 0, $related_limit);
        
        return $products;
    }

    /**
     * Obtiene productos que son accesorios del producto base.
     * Esto es una consulta personalizada que puede adaptarse según las necesidades.
     *
     * @since    1.0.0
     * @param    WC_Product    $product    El producto base.
     * @return   array                     Lista de productos accesorios.
     */
    private function get_accessory_products($product) {
        $related_limit = isset($this->options['related_products']['count']) ? intval($this->options['related_products']['count']) : 4;
        
        // Aquí se implementaría la lógica específica para productos accesorios
        // Por defecto, podríamos usar productos marcados como cross-sells
        $accessory_ids = $product->get_cross_sell_ids();
        
        // Si no hay suficientes, podríamos buscar productos con una categoría "accesorios" relacionada
        if (count($accessory_ids) < $related_limit) {
            // Ejemplo: buscar productos con una categoría "accesorio" o etiqueta específica
            $accessory_tax_query = array();
            
            // Verificar si existe la categoría "accesorios"
            $accessory_cat = get_term_by('slug', 'accesorios', 'product_cat');
            if ($accessory_cat) {
                $accessory_tax_query[] = array(
                    'taxonomy'    => 'product_cat',
                    'field'       => 'term_id',
                    'terms'       => $accessory_cat->term_id,
                );
            }
            
            // Verificar si existe la etiqueta "accesorio"
            $accessory_tag = get_term_by('slug', 'accesorio', 'product_tag');
            if ($accessory_tag) {
                $accessory_tax_query[] = array(
                    'taxonomy'    => 'product_tag',
                    'field'       => 'term_id',
                    'terms'       => $accessory_tag->term_id,
                );
                
                // Relación OR entre taxonomías
                if (count($accessory_tax_query) > 1) {
                    $accessory_tax_query['relation'] = 'OR';
                }
            }
            
            // Solo ejecutar la consulta si tenemos taxonomías para filtrar
            if (!empty($accessory_tax_query)) {
                // Filtrar productos que ya están en el carrito
                $cart_product_ids = array();
                foreach (WC()->cart->get_cart() as $cart_item) {
                    $cart_product_ids[] = $cart_item['product_id'];
                }
                $cart_product_ids[] = $product->get_id(); // Excluir el producto actual
                
                // Consultar accesorios
                $args = array(
                    'post_type'           => 'product',
                    'post_status'         => 'publish',
                    'posts_per_page'      => $related_limit - count($accessory_ids),
                    'orderby'             => 'rand',
                    'post__not_in'        => array_merge($cart_product_ids, $accessory_ids),
                    'tax_query'           => $accessory_tax_query,
                );
                
                $accessories = get_posts($args);
                
                foreach ($accessories as $accessory) {
                    $accessory_ids[] = $accessory->ID;
                }
            }
        }
        
        // Limitar al número máximo
        $accessory_ids = array_slice($accessory_ids, 0, $related_limit);
        
        // Convertir IDs a objetos de producto
        return array_filter(array_map('wc_get_product', $accessory_ids));
    }

    /**
     * Obtiene el contenido del carrito y lo envía como respuesta JSON.
     *
     * @since    1.0.0
     * @param    string    $new_item_key    Clave del nuevo item añadido (opcional).
     */
    private function get_cart_contents($new_item_key = '') {
        $cart_items = WC()->cart->get_cart();
        $cart_count = WC()->cart->get_cart_contents_count();
        $subtotal = WC()->cart->get_subtotal() + WC()->cart->get_subtotal_tax();
        $shipping_total = WC()->cart->get_shipping_total() + WC()->cart->get_shipping_tax();
        
        ob_start();
        
        if (empty($cart_items)) {
            echo '<div class="snap-sidebar-cart__empty">';
            echo '<p>' . __('Tu carrito está vacío.', 'snap-sidebar-cart') . '</p>';
            echo '<a href="' . esc_url(get_permalink(wc_get_page_id('shop'))) . '" class="snap-sidebar-cart__button snap-sidebar-cart__button--cart">' . __('Continuar comprando', 'snap-sidebar-cart') . '</a>';
            echo '</div>';
        } else {
            echo '<ul class="snap-sidebar-cart__products-list">';
            
            foreach ($cart_items as $cart_item_key => $cart_item) {
                $product = $cart_item['data'];
                $is_new_item = ($new_item_key === $cart_item_key);
                
                include SNAP_SIDEBAR_CART_PATH . 'public/partials/snap-sidebar-cart-product.php';
            }
            
            echo '</ul>';
        }
        
        $cart_html = ob_get_clean();
        
        $data = array(
            'cart_html' => $cart_html,
            'cart_count' => $cart_count,
            'subtotal' => wc_price($subtotal),
            'shipping_total' => wc_price($shipping_total),
            'total' => wc_price($subtotal + $shipping_total)
        );
        
        wp_send_json_success($data);
    }
}
