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
     * @since    1.0.11
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
        
        // DEBUG: Información detallada sobre la operación
        error_log('==== INICIO add_to_cart() AJAX ====');
        error_log('Producto a añadir ID: ' . $product_id . ', Cantidad: ' . $quantity);
        error_log('Variación ID: ' . $variation_id . ', Atributos: ' . json_encode($variation));
        error_log('Configuración de posición de nuevos productos: ' . (isset($this->options['new_product_position']) ? $this->options['new_product_position'] : 'No definido'));
        
        // Verificar que el producto existe
        $product = wc_get_product($product_id);
        if (!$product) {
            error_log('Error: Producto no encontrado');
            wp_send_json_error(array('message' => __('Producto no encontrado', 'snap-sidebar-cart')));
        }
        
        // Verificar stock antes de proceder
        $stock_quantity = $product->get_stock_quantity();
        error_log('Stock disponible del producto: ' . ($stock_quantity !== null ? $stock_quantity : 'Ilimitado'));
        
        // Comprobar la cantidad actual en el carrito de este producto
        $cart = WC()->cart;
        $existing_item_key = null;
        $needs_quantity_update = false;
        $current_qty_in_cart = 0;
        
        // Buscar si ya existe una entrada idéntica en el carrito
        foreach ($cart->get_cart() as $cart_item_key => $cart_item) {
            if ($cart_item['product_id'] == $product_id && $cart_item['variation_id'] == $variation_id) {
                // Para productos con variaciones, verificar si los atributos coinciden
                $attributes_match = true;
                if (!empty($variation)) {
                    foreach ($variation as $attr_name => $attr_value) {
                        if (!isset($cart_item['variation'][$attr_name]) || $cart_item['variation'][$attr_name] !== $attr_value) {
                            $attributes_match = false;
                            break;
                        }
                    }
                }
                
                if ($attributes_match) {
                    $existing_item_key = $cart_item_key;
                    $needs_quantity_update = true;
                    $current_qty_in_cart = $cart_item['quantity'];
                    error_log('Producto encontrado en carrito: Clave=' . $existing_item_key . ', Cantidad actual=' . $current_qty_in_cart);
                    break;
                }
            }
        }
        
        // Si el producto ya existe, actualizamos su cantidad manualmente
        if ($needs_quantity_update && $existing_item_key) {
            $new_qty = $current_qty_in_cart + $quantity;
            
            error_log('Actualizando cantidad del producto existente de ' . $current_qty_in_cart . ' a ' . $new_qty);
            
            // Verificar si esta es la última unidad disponible
            $is_last_available = false;
            if ($stock_quantity !== null && $new_qty >= $stock_quantity) {
                $is_last_available = true;
                error_log('¡ATENCIÓN! Esta es la última unidad disponible del producto.');
            }
            
            // Actualizamos la cantidad
            $cart->set_quantity($existing_item_key, $new_qty, true);
            
            // Actualizar timestamp para mantener el orden correcto 
            // (usamos valor absoluto para asegurar que los timestamps sean únicos)
            $cart_items = $cart->get_cart();
            if (isset($cart_items[$existing_item_key])) {
                $timestamp = time() + abs(crc32($existing_item_key)); // Usar hash de clave para asegurar valor único
                $cart_items[$existing_item_key]['time_added'] = $timestamp;
                $cart->set_cart_contents($cart_items);
                error_log('Timestamp actualizado: ' . $timestamp);
            }
            
            $cart_item_key = $existing_item_key;
        } else {
            // Es un producto nuevo, lo añadimos normalmente
            error_log('Añadiendo nuevo producto al carrito');
            $cart_item_key = $cart->add_to_cart($product_id, $quantity, $variation_id, $variation);
            
            // Verificar si esta es la última unidad disponible
            if ($stock_quantity !== null && $quantity >= $stock_quantity) {
                error_log('¡ATENCIÓN! Esta es la última unidad disponible del producto.');
                $is_last_available = true;
            }
        }
        
        // Verificar el resultado y registrar información
        if ($cart_item_key) {
            error_log('Operación exitosa: clave del producto ' . $cart_item_key);
        } else {
            error_log('No se pudo obtener una clave para el producto');
        }
        
        error_log('==== FIN add_to_cart() AJAX ====');
        
        // Forzar el recálculo de totales
        $cart->calculate_totals();
        
        // Devolver el contenido actualizado del carrito
        $this->get_cart_contents($cart_item_key);
        
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
            // Enviar la respuesta exitosa con el contenido actualizado del carrito
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
            case 'custom':
                $products = $this->get_custom_products($product);
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
     * Obtiene productos personalizados según el código definido por el usuario.
     *
     * @since    1.0.0
     * @param    WC_Product    $product    El producto base.
     * @return   array                     Lista de productos personalizados.
     */
    private function get_custom_products($product) {
        $related_limit = isset($this->options['related_products']['count']) ? intval($this->options['related_products']['count']) : 4;
        $custom_query = isset($this->options['related_products']['custom_query']) ? $this->options['related_products']['custom_query'] : '';
        
        // Si no hay consulta personalizada, devolvemos productos aleatorios como fallback
        if (empty($custom_query)) {
            // Filtrar productos que ya están en el carrito
            $cart_product_ids = array();
            foreach (WC()->cart->get_cart() as $cart_item) {
                $cart_product_ids[] = $cart_item['product_id'];
            }
            
            $args = array(
                'post_type'           => 'product',
                'post_status'         => 'publish',
                'posts_per_page'      => $related_limit,
                'orderby'             => 'rand',
                'post__not_in'        => $cart_product_ids,
            );
            
            $products = get_posts($args);
            return array_filter(array_map('wc_get_product', wp_list_pluck($products, 'ID')));
        }
        
        // Variables disponibles para el código personalizado
        $current_product = $product;
        $product_id = $product->get_id();
        $category_ids = wc_get_product_term_ids($product_id, 'product_cat');
        $tag_ids = wc_get_product_term_ids($product_id, 'product_tag');
        $limit = $related_limit;
        
        // Filtrar productos que ya están en el carrito para uso en código personalizado
        $cart_product_ids = array();
        foreach (WC()->cart->get_cart() as $cart_item) {
            $cart_product_ids[] = $cart_item['product_id'];
        }
        
        // Ejecutar el código personalizado con seguridad
        try {
            // Las variables están disponibles para el código personalizado
            $result = eval($custom_query);
            
            // Si el código devuelve una array de IDs de productos
            if (is_array($result) && !empty($result)) {
                return array_slice(array_filter(array_map('wc_get_product', $result)), 0, $related_limit);
            } 
            // Si el código devuelve una consulta WP_Query
            elseif ($result instanceof WP_Query) {
                $products = $result->posts;
                return array_slice(array_filter(array_map('wc_get_product', wp_list_pluck($products, 'ID'))), 0, $related_limit);
            }
            // Si el código devuelve directamente objetos de producto
            elseif (is_array($result) && !empty($result) && $result[0] instanceof WC_Product) {
                return array_slice($result, 0, $related_limit);
            }
        } catch (Exception $e) {
            // En caso de error, registrarlo y devolver productos aleatorios
            error_log('Error en la consulta personalizada del carrito lateral: ' . $e->getMessage());
        }
        
        // Fallback: productos aleatorios
        $args = array(
            'post_type'           => 'product',
            'post_status'         => 'publish',
            'posts_per_page'      => $related_limit,
            'orderby'             => 'rand',
            'post__not_in'        => $cart_product_ids,
        );
        
        $products = get_posts($args);
        return array_filter(array_map('wc_get_product', wp_list_pluck($products, 'ID')));
    }

    /**
     * Obtiene todo el contenido del carrito como respuesta AJAX.
     * Este método se usa para actualizar el carrito sin tener que enviar una acción específica.
     *
     * @since    1.0.0
     */
    public function get_cart_content() {
        // No necesitamos nonce aquí porque solo estamos obteniendo datos públicos
        $this->get_cart_contents();
        wp_die();
    }

    /**
     * Obtiene el contenido del carrito y lo envía como respuesta JSON.
     *
     * @since    1.0.9
     * @param    string    $new_item_key    Clave del nuevo item añadido (opcional).
     */
    private function get_cart_contents($new_item_key = '') {
        // Asegurarse de que los totales estén calculados
        WC()->cart->calculate_totals();
        
        // Obtener elementos del carrito y contadores
        $cart_items = WC()->cart->get_cart();
        $cart_count = WC()->cart->get_cart_contents_count();
        $subtotal = WC()->cart->get_subtotal() + WC()->cart->get_subtotal_tax();
        $shipping_total = WC()->cart->get_shipping_total() + WC()->cart->get_shipping_tax();
        
        // Obtener preferencia de posición para nuevos productos
        $new_product_position = isset($this->options['new_product_position']) 
            ? $this->options['new_product_position'] 
            : 'top';
            
        error_log('get_cart_contents - Posición configurada: ' . $new_product_position . ', Total productos: ' . count($cart_items));
        
        // Verificar si hay productos duplicados (NO DEBERÍA HABER)
        $product_counts = array();
        foreach ($cart_items as $key => $item) {
            $product_id = $item['product_id'];
            $variation_id = $item['variation_id'];
            
            // Crear un identificador único basado en producto y variación
            // Para las variaciones, también incluir los atributos específicos
            $variation_string = '';
            if (!empty($item['variation']) && is_array($item['variation'])) {
                // Ordenar los atributos para consistencia
                ksort($item['variation']);
                foreach ($item['variation'] as $attr => $value) {
                    $variation_string .= $attr . '=' . $value . ';';
                }
            }
            
            $identifier = $product_id . '-' . $variation_id . '-' . $variation_string;
            
            if (!isset($product_counts[$identifier])) {
                $product_counts[$identifier] = ['count' => 0, 'keys' => [], 'name' => isset($item['data']) ? $item['data']->get_name() : 'Producto'];
            }
            
            $product_counts[$identifier]['count']++;
            $product_counts[$identifier]['keys'][] = $key;
            $product_counts[$identifier]['qty'][$key] = $item['quantity'];
        }
        
        // Registrar si se encontraron duplicados exactos (mismo producto y variación)
        foreach ($product_counts as $identifier => $data) {
            if ($data['count'] > 1) {
                error_log('ALERTA: Producto duplicado encontrado: ' . $identifier . ' aparece ' . $data['count'] . ' veces');
                
                // Mostrar keys de los duplicados
                error_log('Claves de los duplicados: ' . implode(', ', $data['keys']));
                
                // Para este caso de duplicados exactos, debemos conservar una sola entrada
                // Pero asegurarnos de que la cantidad sea correcta
                // Identificamos qué entrada mantener (usaremos la primera por convención)
                $main_key = $data['keys'][0];
                
                // Antes de modificar, registramos las cantidades para depuración
                $qty_log = "Cantidades originales: ";
                foreach ($data['keys'] as $k) {
                    $qty_log .= "{$k}:{$cart_items[$k]['quantity']}, ";
                }
                error_log($qty_log);
                
                // Si hay duplicados, debemos conservar uno y eliminar los otros
                // IMPORTANTE: No vamos a sumar las cantidades, ya que WooCommerce ya incrementó la cantidad
                // cuando el usuario agregó el producto (ver add_timestamp_to_cart_item)
                
                for ($i = 1; $i < count($data['keys']); $i++) {
                    $dup_key = $data['keys'][$i];
                    
                    // Eliminar el duplicado sin sumar su cantidad
                    error_log('Eliminando duplicado con clave: ' . $dup_key . ' con cantidad: ' . $cart_items[$dup_key]['quantity']);
                    WC()->cart->remove_cart_item($dup_key);
                }
                
                // Recargar los elementos del carrito después de estas modificaciones
                $cart_items = WC()->cart->get_cart();
            }
        }
        
        // Copia de los items del carrito para ordenar
        $sorted_cart_items = $cart_items;
        
        // Registrar keys y timestamps para debug
        foreach ($sorted_cart_items as $key => $item) {
            $timestamp = isset($item['time_added']) ? $item['time_added'] : 
                        (isset($item['custom_data']['time_added']) ? $item['custom_data']['time_added'] : 0);
            $product_name = isset($item['data']) ? $item['data']->get_name() : 'Producto sin nombre';
            $product_id = $item['product_id'];
            $variation_id = $item['variation_id'];
            error_log("Producto en carrito: {$product_name} (ID:{$product_id}, Var:{$variation_id}), Key: {$key}, Timestamp: {$timestamp}");
        }
        
        // Solo ordenar si hay más de un producto
        if (count($sorted_cart_items) > 1) {
            // Para evitar problemas de ordenación inconsistente, asignaremos tiempos fijos
            // en lugar de aleatorios, basados en el ID del producto
            $product_position_map = array();
            $position_counter = 1;
            
            // Primero creamos un mapeo de IDs de productos a posiciones
            foreach ($sorted_cart_items as $key => $item) {
                $product_id = $item['product_id'];
                if (!isset($product_position_map[$product_id])) {
                    $product_position_map[$product_id] = $position_counter++;
                }
            }
            
            // Ahora asignamos timestamps basados en este mapeo consistente
            foreach ($sorted_cart_items as $key => $item) {
                $has_timestamp = false;
                $product_id = $item['product_id'];
                
                // Verificar primero en la raíz del item
                if (isset($item['time_added'])) {
                    $has_timestamp = true;
                }
                // Verificar en custom_data si existe
                else if (isset($item['custom_data']) && isset($item['custom_data']['time_added'])) {
                    $sorted_cart_items[$key]['time_added'] = $item['custom_data']['time_added'];
                    $has_timestamp = true;
                }
                
                // Si aún no tiene timestamp, o si este producto está duplicado, asignar uno basado en la posición fija
                if (!$has_timestamp || $key === $new_item_key) {
                    // Si es el item recién añadido, ponerle el timestamp actual más un valor alto
                    if ($key === $new_item_key) {
                        // Usar timestamp actual + 10000 para asegurar que esté en la parte superior
                        $sorted_cart_items[$key]['time_added'] = time() + 10000;
                        error_log("Asignando timestamp ACTUAL + PRIORIDAD al nuevo producto: {$key}");
                    } else {
                        // Para productos existentes, asignar un timestamp basado en la posición fija del producto
                        // Esto asegura que el orden sea consistente entre recargas
                        $base_timestamp = time() - 20000; // Base antigua
                        $position_value = isset($product_position_map[$product_id]) ? $product_position_map[$product_id] * 100 : 0;
                        $sorted_cart_items[$key]['time_added'] = $base_timestamp + $position_value;
                        error_log("Asignando timestamp CONSISTENTE para: {$key} basado en ID: {$product_id}");
                    }
                }
            }
            
            // Ordenar según la configuración
            if ($new_product_position === 'top') {
                // Ordenar descendentemente (más nuevos primero)
                uasort($sorted_cart_items, function($a, $b) {
                    $time_a = isset($a['time_added']) ? $a['time_added'] : 0;
                    $time_b = isset($b['time_added']) ? $b['time_added'] : 0;
                    
                    // Si los timestamps son iguales, usar el ID del producto para mantener consistencia
                    if ($time_a == $time_b) {
                        $id_a = $a['product_id'];
                        $id_b = $b['product_id'];
                        return $id_a - $id_b; // Orden ascendente por ID como tiebreaker
                    }
                    
                    return $time_b - $time_a; // Orden descendente por timestamp
                });
                error_log('Ordenando carrito: DESCENDENTE (más nuevos primero)');
            } else {
                // Ordenar ascendentemente (más antiguos primero)
                uasort($sorted_cart_items, function($a, $b) {
                    $time_a = isset($a['time_added']) ? $a['time_added'] : 0;
                    $time_b = isset($b['time_added']) ? $b['time_added'] : 0;
                    
                    // Si los timestamps son iguales, usar el ID del producto para mantener consistencia
                    if ($time_a == $time_b) {
                        $id_a = $a['product_id'];
                        $id_b = $b['product_id'];
                        return $id_a - $id_b; // Orden ascendente por ID como tiebreaker
                    }
                    
                    return $time_a - $time_b; // Orden ascendente por timestamp
                });
                error_log('Ordenando carrito: ASCENDENTE (más antiguos primero)');
            }
            
            // Registrar el nuevo orden para debug
            error_log("Orden de productos después de ordenar:");
            foreach ($sorted_cart_items as $key => $item) {
                $product_name = isset($item['data']) ? $item['data']->get_name() : 'Producto sin nombre';
                $timestamp = isset($item['time_added']) ? $item['time_added'] : 0;
                $product_id = $item['product_id'];
                error_log("  - {$product_name} (ID:{$product_id}), Key: {$key}, Timestamp: {$timestamp}, Cantidad: {$item['quantity']}");
            }
            
            // Registrar el nuevo orden para debug
            error_log("Orden de productos después de ordenar:");
            foreach ($sorted_cart_items as $key => $item) {
                $product_name = isset($item['data']) ? $item['data']->get_name() : 'Producto sin nombre';
                $timestamp = isset($item['time_added']) ? $item['time_added'] : 0;
                error_log("  - {$product_name}, Key: {$key}, Timestamp: {$timestamp}, Cantidad: {$item['quantity']}");
            }
        }
        
        ob_start();
        
        if (empty($sorted_cart_items)) {
            echo '<div class="snap-sidebar-cart__empty">';
            echo '<p>' . __('Tu carrito está vacío.', 'snap-sidebar-cart') . '</p>';
            echo '<a href="' . esc_url(get_permalink(wc_get_page_id('shop'))) . '" class="snap-sidebar-cart__button snap-sidebar-cart__button--cart">' . __('Continuar comprando', 'snap-sidebar-cart') . '</a>';
            echo '</div>';
        } else {
            echo '<ul class="snap-sidebar-cart__products-list">';
            
            // Mostrar los productos ordenados
            foreach ($sorted_cart_items as $cart_item_key => $cart_item) {
                $product = $cart_item['data'];
                $is_new_item = ($cart_item_key === $new_item_key); // Marcar el nuevo producto
                
                if ($is_new_item) {
                    error_log('Mostrando nuevo producto: ' . $product->get_name() . ' (timestamp: ' . 
                        (isset($cart_item['time_added']) ? $cart_item['time_added'] : 'no timestamp') . ')');
                }
                
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
