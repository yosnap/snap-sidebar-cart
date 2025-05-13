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
            
            // Para productos existentes, NO actualizamos el timestamp
            // Esto conserva la posición original del producto en el carrito
            // cuando se incrementa su cantidad
            error_log('Conservando posición del producto existente (no se actualiza timestamp)');
            
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
        
        // Para la respuesta, indicar que solo cambió la cantidad
        $data_response = array(
            'quantity_changed' => true,
            'updated_key' => $cart_item_key
        );
        
        // Si la cantidad es 0, eliminar el producto
        if ($quantity === 0) {
            $removed = WC()->cart->remove_cart_item($cart_item_key);
            
            if ($removed) {
                $this->get_cart_contents('', $data_response);
            } else {
                wp_send_json_error(array('message' => __('Error al eliminar del carrito', 'snap-sidebar-cart')));
            }
        } else {
            // Obtener cantidad actual antes de actualizar
            $cart_items = WC()->cart->get_cart();
            $current_quantity = $cart_items[$cart_item_key]['quantity'];
            
            // Actualizar cantidad
            $updated = WC()->cart->set_quantity($cart_item_key, $quantity);
            
            if ($updated) {
                $this->get_cart_contents('', $data_response);
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
        error_log('=== INICIO get_related_products() ===');
        
        // Verificar nonce
        $nonce_valid = check_ajax_referer('snap-sidebar-cart-nonce', 'nonce', false);
        if (!$nonce_valid) {
            error_log('Error: Nonce inválido');
            wp_send_json_error(array('message' => __('Error de seguridad: Nonce inválido', 'snap-sidebar-cart')));
            return;
        }
        error_log('Nonce verificado correctamente');
        
        // Verificar ID de producto
        if (!isset($_POST['product_id'])) {
            error_log('Error: No se proporcionó un ID de producto');
            wp_send_json_error(array('message' => __('No se proporcionó un ID de producto', 'snap-sidebar-cart')));
            return;
        }
        
        $product_id = absint($_POST['product_id']);
        error_log('Product ID recibido: ' . $product_id);
        
        // Obtener el número de productos a mostrar desde la petición o usar el valor por defecto
        $count = isset($_POST['count']) ? absint($_POST['count']) : (isset($this->options['related_products']['count']) ? absint($this->options['related_products']['count']) : 4);
        error_log('Número de productos a mostrar: ' . $count);
        
        // Obtener el producto
        $product = wc_get_product($product_id);
        
        if (!$product) {
            error_log('Error: Producto no encontrado para ID: ' . $product_id);
            wp_send_json_error(array('message' => __('Producto no encontrado', 'snap-sidebar-cart')));
            return;
        }
        
        error_log('Producto encontrado: ' . $product->get_name() . ' (ID: ' . $product_id . ')');
        
        // Obtener el tipo de productos relacionados a mostrar
        $type = isset($_POST['type']) ? sanitize_text_field($_POST['type']) : 'related';
        error_log('Tipo de productos relacionados solicitado: ' . $type);
        
        // Verificar si el tipo está en las pestañas activas configuradas
        $active_tabs = isset($this->options['related_products']['active_tabs']) ? 
            explode(',', $this->options['related_products']['active_tabs']) : 
            array('upsells', 'crosssells', 'related', 'bestsellers', 'featured', 'custom');
            
        // Añadir pestañas personalizadas adicionales si existen
        if (isset($this->options['related_products']['custom_queries']) && is_array($this->options['related_products']['custom_queries'])) {
            foreach ($this->options['related_products']['custom_queries'] as $index => $query) {
                if (!empty($query['name'])) {
                    // Usar 'custom_X' como identificador para cada query personalizada adicional
                    $custom_tab_id = 'custom_' . $index;
                    if (!in_array($custom_tab_id, $active_tabs)) {
                        $active_tabs[] = $custom_tab_id;
                    }
                }
            }
        }
        
        error_log('Pestañas activas configuradas: ' . implode(', ', $active_tabs));
        
        if (!in_array($type, $active_tabs)) {
            error_log('Advertencia: El tipo solicitado "' . $type . '" no está en las pestañas activas. Se usará "related" como fallback.');
            $type = 'related';
        }
        
        // Obtener productos según el tipo
        error_log('Obteniendo productos para el tipo: ' . $type . ', cantidad: ' . $count);
        
        switch ($type) {
            case 'upsells':
                error_log('Llamando a get_upsell_products()');
                $products = $this->get_upsell_products($product, $count);
                break;
            case 'crosssells':
                error_log('Llamando a get_crosssell_products()');
                $products = $this->get_crosssell_products($product, $count);
                break;
            case 'related':
                error_log('Llamando a get_same_category_products()');
                $products = $this->get_same_category_products($product, $count);
                break;
            case 'bestsellers':
                error_log('Llamando a get_bestseller_products()');
                $products = $this->get_bestseller_products($count);
                break;
            case 'featured':
                error_log('Llamando a get_featured_products()');
                $products = $this->get_featured_products($count);
                break;
            case 'custom':
                error_log('Llamando a get_custom_products() - query personalizada principal');
                $products = $this->get_custom_products($product, $count);
                break;
            default:
                // Verificar si es una query personalizada adicional (custom_X)
                if (strpos($type, 'custom_') === 0) {
                    $custom_index = intval(substr($type, 7)); // Extraer el índice después de 'custom_'
                    error_log('Llamando a get_custom_products() con índice personalizado ' . $custom_index);
                    $products = $this->get_custom_products($product, $count, $custom_index);
                } else {
                    error_log('Tipo no reconocido, usando get_same_category_products() como fallback');
                    $products = $this->get_same_category_products($product, $count);
                }
                break;
        }
        
        // Verificar resultado
        if (is_array($products)) {
            error_log('Productos encontrados: ' . count($products));
        } else {
            error_log('Error: Los productos devueltos no son un array');
            $products = array();
        }
        
        $html = '';
        
        if (!empty($products)) {
            error_log('Generando HTML para ' . count($products) . ' productos');
            
            ob_start();
            $valid_products = 0;
            
            foreach ($products as $related_product) {
                if (!$related_product || !$related_product->is_purchasable() || !$related_product->is_in_stock()) {
                    if (!$related_product) {
                        error_log('Producto relacionado no válido (objeto nulo)');
                    } elseif (!$related_product->is_purchasable()) {
                        error_log('Producto ID ' . $related_product->get_id() . ' no es comprable');
                    } elseif (!$related_product->is_in_stock()) {
                        error_log('Producto ID ' . $related_product->get_id() . ' no tiene stock');
                    }
                    continue;
                }
                
                $valid_products++;
                $post_object = get_post($related_product->get_id());
                setup_postdata($GLOBALS['post'] =& $post_object);
                
                error_log('Incluyendo plantilla para producto ID: ' . $related_product->get_id() . ' - ' . $related_product->get_name());
                
                // Capturar errores al incluir la plantilla
                try {
                    // Incluir plantilla para cada producto relacionado
                    include SNAP_SIDEBAR_CART_PATH . 'public/partials/snap-sidebar-cart-related-product.php';
                } catch (Exception $e) {
                    error_log('Error al incluir plantilla para producto: ' . $e->getMessage());
                }
            }
            
            wp_reset_postdata();
            
            $html = ob_get_clean();
            $html_length = strlen($html);
            
            error_log('HTML generado correctamente: ' . $valid_products . ' productos válidos, longitud del HTML: ' . $html_length . ' bytes');
            
            if ($html_length < 10 && $valid_products > 0) {
                error_log('Advertencia: El HTML generado es muy corto a pesar de tener productos válidos');
            }
        } else {
            error_log('No se encontraron productos para mostrar');
        }
        
        error_log('Enviando respuesta JSON con HTML (longitud: ' . strlen($html) . ')');
        wp_send_json_success(array(
            'html' => $html,
            'count' => count($products),
            'type' => $type
        ));
        
        error_log('=== FIN get_related_products() ===');
        wp_die();
    }

    /**
     * Obtiene productos relacionados según las relaciones definidas del producto.
     *
     * @since    1.0.0
     * @param    WC_Product    $product    El producto base.
     * @return   array                     Lista de productos relacionados.
     */
    /**
     * Obtiene los productos up-sell del producto.
     *
     * @since    1.1.0
     * @param    WC_Product    $product    El producto base.
     * @param    int           $count      Número de productos a mostrar.
     * @return   array                     Lista de productos up-sell.
     */
    private function get_upsell_products($product, $count = null) {
        error_log('=== INICIO get_upsell_products() ===');
        error_log('Procesando producto: ' . $product->get_name() . ' (ID: ' . $product->get_id() . ')');
        
        $related_limit = $count !== null ? intval($count) : (isset($this->options['related_products']['count']) ? intval($this->options['related_products']['count']) : 4);
        error_log('Límite de productos relacionados: ' . $related_limit);
        
        // Obtener los IDs de productos up-sell definidos por el usuario
        $upsell_ids = $product->get_upsell_ids();
        error_log('Up-sells directamente configurados: ' . count($upsell_ids));
        
        // Filtrar productos que ya están en el carrito
        $cart_product_ids = array();
        foreach (WC()->cart->get_cart() as $cart_item) {
            $cart_product_ids[] = $cart_item['product_id'];
        }
        
        // Incluir el producto actual entre los filtrados
        $cart_product_ids[] = $product->get_id();
        $upsell_ids = array_diff($upsell_ids, $cart_product_ids);
        error_log('Up-sells después de filtrar productos en carrito: ' . count($upsell_ids));
        
        // Si no hay suficientes up-sells, obtener productos recomendados según determinados criterios
        if (count($upsell_ids) < $related_limit) {
            error_log('No hay suficientes up-sells, buscando productos sustitutos');
            
            // Buscar productos con precio superior (lógica de up-sell)
            $product_price = $product->get_price();
            
            if ($product_price > 0) {
                // Para up-sells, buscamos productos con precio un poco mayor (10-30% más)
                $min_price = $product_price * 1.1;  // 10% más caro
                $max_price = $product_price * 1.3;  // 30% más caro
                
                // Obtener categorías del producto
                $product_categories = wc_get_product_term_ids($product->get_id(), 'product_cat');
                
                // Si hay categorías, buscar productos de la misma categoría con precio superior
                if (!empty($product_categories)) {
                    error_log('Buscando productos de la misma categoría con precio superior');
                    
                    $args = array(
                        'post_type'      => 'product',
                        'post_status'    => 'publish',
                        'posts_per_page' => $related_limit - count($upsell_ids),
                        'post__not_in'   => array_merge($cart_product_ids, $upsell_ids),
                        'tax_query'      => array(
                            array(
                                'taxonomy' => 'product_cat',
                                'field'    => 'term_id',
                                'terms'    => $product_categories,
                                'operator' => 'IN',
                            ),
                        ),
                        'meta_query'     => array(
                            array(
                                'key'     => '_price',
                                'value'   => array($min_price, $max_price),
                                'type'    => 'NUMERIC',
                                'compare' => 'BETWEEN',
                            ),
                        ),
                        'orderby'        => 'meta_value_num',
                        'meta_key'       => '_price',
                        'order'          => 'ASC',
                    );
                    
                    $higher_priced_products = get_posts($args);
                    
                    if (!empty($higher_priced_products)) {
                        error_log('Productos encontrados con precio superior: ' . count($higher_priced_products));
                        foreach ($higher_priced_products as $higher_product) {
                            $upsell_ids[] = $higher_product->ID;
                        }
                    } else {
                        error_log('No se encontraron productos con precio superior en las mismas categorías');
                    }
                }
            }
        }
        
        // Si aún no hay suficientes, usar productos destacados
        if (count($upsell_ids) < $related_limit) {
            error_log('Buscando productos destacados para completar');
            
            $args = array(
                'post_type'      => 'product',
                'post_status'    => 'publish',
                'posts_per_page' => $related_limit - count($upsell_ids),
                'post__not_in'   => array_merge($cart_product_ids, $upsell_ids),
                'tax_query'      => array(
                    array(
                        'taxonomy' => 'product_visibility',
                        'field'    => 'name',
                        'terms'    => 'featured',
                        'operator' => 'IN',
                    ),
                ),
                'orderby'        => 'rand',
            );
            
            $featured_products = get_posts($args);
            
            if (!empty($featured_products)) {
                error_log('Productos destacados encontrados: ' . count($featured_products));
                foreach ($featured_products as $featured_product) {
                    $upsell_ids[] = $featured_product->ID;
                }
            }
        }
        
        // Limitar al número máximo y convertir a objetos de producto
        $upsell_ids = array_slice($upsell_ids, 0, $related_limit);
        error_log('Total de IDs de up-sells: ' . count($upsell_ids));
        
        $result = array_filter(array_map('wc_get_product', $upsell_ids));
        error_log('Total de objetos de producto válidos: ' . count($result));
        error_log('=== FIN get_upsell_products() ===');
        
        return $result;
    }
    
    /**
     * Obtiene los productos cross-sell del producto.
     *
     * @since    1.1.0
     * @param    WC_Product    $product    El producto base.
     * @param    int           $count      Número de productos a mostrar.
     * @return   array                     Lista de productos cross-sell.
     */
    private function get_crosssell_products($product, $count = null) {
        error_log('=== INICIO get_crosssell_products() ===');
        error_log('Procesando producto: ' . $product->get_name() . ' (ID: ' . $product->get_id() . ')');
        
        $related_limit = $count !== null ? intval($count) : (isset($this->options['related_products']['count']) ? intval($this->options['related_products']['count']) : 4);
        error_log('Límite de productos relacionados: ' . $related_limit);
        
        // Obtener los IDs de productos cross-sell definidos por el usuario
        $crosssell_ids = $product->get_cross_sell_ids();
        error_log('Cross-sells directamente configurados: ' . count($crosssell_ids));
        
        // Filtrar productos que ya están en el carrito
        $cart_product_ids = array();
        foreach (WC()->cart->get_cart() as $cart_item) {
            $cart_product_ids[] = $cart_item['product_id'];
        }
        
        // Incluir el producto actual entre los filtrados
        $cart_product_ids[] = $product->get_id();
        $crosssell_ids = array_diff($crosssell_ids, $cart_product_ids);
        error_log('Cross-sells después de filtrar productos en carrito: ' . count($crosssell_ids));
        
        // Si no hay suficientes cross-sells, obtener productos que frecuentemente se compran juntos
        if (count($crosssell_ids) < $related_limit) {
            error_log('No hay suficientes cross-sells, buscando productos complementarios');
            
            // Obtener categorías del producto
            $product_categories = wc_get_product_term_ids($product->get_id(), 'product_cat');
            
            if (!empty($product_categories)) {
                error_log('Buscando productos complementarios de categorías similares');
                
                // Para cross-sells buscamos productos complementarios con precio similar o inferior
                $product_price = $product->get_price();
                $max_price = $product_price * 1.2;  // hasta 20% más caro
                
                $args = array(
                    'post_type'      => 'product',
                    'post_status'    => 'publish',
                    'posts_per_page' => $related_limit - count($crosssell_ids),
                    'post__not_in'   => array_merge($cart_product_ids, $crosssell_ids),
                    'tax_query'      => array(
                        array(
                            'taxonomy' => 'product_cat',
                            'field'    => 'term_id',
                            'terms'    => $product_categories,
                            'operator' => 'IN',
                        ),
                    ),
                    'meta_query'     => $product_price > 0 ? array(
                        array(
                            'key'     => '_price',
                            'value'   => $max_price,
                            'type'    => 'NUMERIC',
                            'compare' => '<=',
                        ),
                    ) : array(),
                    'orderby'        => 'rand',
                );
                
                $complementary_products = get_posts($args);
                
                if (!empty($complementary_products)) {
                    error_log('Productos complementarios encontrados: ' . count($complementary_products));
                    foreach ($complementary_products as $complementary_product) {
                        $crosssell_ids[] = $complementary_product->ID;
                    }
                } else {
                    error_log('No se encontraron productos complementarios en las mismas categorías');
                }
            }
        }
        
        // Si aún no hay suficientes, añadir productos más vendidos
        if (count($crosssell_ids) < $related_limit) {
            error_log('Buscando productos más vendidos para completar');
            
            $args = array(
                'post_type'      => 'product',
                'post_status'    => 'publish',
                'posts_per_page' => $related_limit - count($crosssell_ids),
                'post__not_in'   => array_merge($cart_product_ids, $crosssell_ids),
                'meta_key'       => 'total_sales',
                'orderby'        => 'meta_value_num',
                'order'          => 'DESC',
            );
            
            $bestseller_products = get_posts($args);
            
            if (!empty($bestseller_products)) {
                error_log('Productos más vendidos encontrados: ' . count($bestseller_products));
                foreach ($bestseller_products as $bestseller_product) {
                    $crosssell_ids[] = $bestseller_product->ID;
                }
            }
        }
        
        // Limitar al número máximo y convertir a objetos de producto
        $crosssell_ids = array_slice($crosssell_ids, 0, $related_limit);
        error_log('Total de IDs de cross-sells: ' . count($crosssell_ids));
        
        $result = array_filter(array_map('wc_get_product', $crosssell_ids));
        error_log('Total de objetos de producto válidos: ' . count($result));
        error_log('=== FIN get_crosssell_products() ===');
        
        return $result;
    }

    /**
     * Obtiene productos de la misma categoría.
     *
     * @since    1.0.0
     * @param    WC_Product    $product    El producto base.
     * @param    int           $count      Número de productos a mostrar.
     * @return   array                     Lista de productos de la misma categoría.
     */
    private function get_same_category_products($product, $count = null) {
        error_log('=== INICIO get_same_category_products() ===');
        error_log('Procesando producto: ' . $product->get_name() . ' (ID: ' . $product->get_id() . ')');
        
        // Obtener límites y configuración desde las opciones
        $related_limit = isset($this->options['related_products']['count']) ? intval($this->options['related_products']['count']) : 4;
        $related_orderby = isset($this->options['related_products']['orderby']) ? esc_attr($this->options['related_products']['orderby']) : 'rand';
        
        error_log('Configuración: Límite=' . $related_limit . ', Ordenar por=' . $related_orderby);
        
        // Obtener categorías del producto
        $product_categories = wc_get_product_term_ids($product->get_id(), 'product_cat');
        
        if (empty($product_categories)) {
            error_log('ERROR: No se encontraron categorías para el producto ID: ' . $product->get_id());
            
            // Intentar obtener las categorías directamente con otra función
            $terms = get_the_terms($product->get_id(), 'product_cat');
            
            if (!empty($terms) && !is_wp_error($terms)) {
                error_log('Categorías obtenidas con get_the_terms(): ' . count($terms));
                foreach ($terms as $term) {
                    $product_categories[] = $term->term_id;
                    error_log('Categoría: ' . $term->name . ' (ID: ' . $term->term_id . ')');
                }
            } else {
                error_log('No se pudieron obtener categorías con métodos alternativos');
                return array();
            }
        }
        
        error_log('Categorías del producto: ' . implode(', ', $product_categories));
        
        // Obtener nombres de categorías para log
        $category_names = array();
        foreach ($product_categories as $cat_id) {
            $term = get_term($cat_id, 'product_cat');
            if ($term && !is_wp_error($term)) {
                $category_names[$cat_id] = $term->name;
            }
        }
        error_log('Nombres de categorías: ' . json_encode($category_names));
        
        // Filtrar productos que ya están en el carrito
        $cart_product_ids = array();
        foreach (WC()->cart->get_cart() as $cart_item) {
            $cart_product_ids[] = $cart_item['product_id'];
        }
        $cart_product_ids[] = $product->get_id(); // Excluir el producto actual
        
        error_log('Productos a excluir: ' . implode(', ', $cart_product_ids));
        
        // Usamos la primera categoría
        $first_category = reset($product_categories);
        $first_category_name = isset($category_names[$first_category]) ? $category_names[$first_category] : 'Desconocida';
        
        error_log('Usando primera categoría: ' . $first_category . ' (' . $first_category_name . ')');
        
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
                    'terms'       => $first_category,
                ),
            ),
        );
        
        error_log('Ejecutando consulta para categoría ID: ' . $first_category);
        error_log('Parámetros de consulta: ' . json_encode($args));
        
        $products = get_posts($args);
        
        if (empty($products)) {
            error_log('No se encontraron productos en la primera categoría');
            
            // Si no hay productos en la primera categoría, intentar con la siguiente categoría si existe
            if (count($product_categories) > 1) {
                next($product_categories); // Avanzar el puntero interno
                $next_category = current($product_categories);
                $next_category_name = isset($category_names[$next_category]) ? $category_names[$next_category] : 'Desconocida';
                
                error_log('Intentando con segunda categoría: ' . $next_category . ' (' . $next_category_name . ')');
                
                $args['tax_query'][0]['terms'] = $next_category;
                error_log('Nuevos parámetros de consulta: ' . json_encode($args));
                
                $products = get_posts($args);
                
                if (empty($products)) {
                    error_log('Tampoco se encontraron productos en la segunda categoría');
                } else {
                    error_log('Se encontraron ' . count($products) . ' productos en la segunda categoría');
                    // Listar los productos encontrados
                    foreach ($products as $p) {
                        error_log('Producto encontrado: ' . $p->post_title . ' (ID: ' . $p->ID . ')');
                    }
                }
            }
            
            // Si aún no hay productos, intentar una búsqueda más amplia sin filtrar por categoría
            if (empty($products)) {
                error_log('Intentando búsqueda más amplia sin filtrar por categoría');
                unset($args['tax_query']);
                error_log('Parámetros de búsqueda amplia: ' . json_encode($args));
                
                $products = get_posts($args);
                
                if (empty($products)) {
                    error_log('No se encontraron productos en la búsqueda amplia');
                } else {
                    error_log('Se encontraron ' . count($products) . ' productos en la búsqueda amplia');
                    // Listar los productos encontrados
                    foreach ($products as $p) {
                        error_log('Producto encontrado: ' . $p->post_title . ' (ID: ' . $p->ID . ')');
                    }
                }
            }
        } else {
            error_log('Se encontraron ' . count($products) . ' productos en la primera categoría');
            // Listar los productos encontrados
            foreach ($products as $p) {
                error_log('Producto encontrado: ' . $p->post_title . ' (ID: ' . $p->ID . ')');
            }
        }
        
        // Convertir resultados en objetos de producto
        $result = array();
        $product_ids = wp_list_pluck($products, 'ID');
        
        error_log('IDs de productos para convertir: ' . implode(', ', $product_ids));
        
        foreach ($product_ids as $pid) {
            $prod = wc_get_product($pid);
            if ($prod) {
                $result[] = $prod;
            } else {
                error_log('Error al obtener producto WC para ID: ' . $pid);
            }
        }
        
        error_log('Total de productos válidos convertidos: ' . count($result));
        error_log('=== FIN get_same_category_products() ===');
        
        return $result;
    }

    /**
     * Obtiene los productos más vendidos.
     *
     * @since    1.0.0
     * @param    int     $count    Número de productos a mostrar.
     * @return   array             Lista de productos más vendidos.
     */
    private function get_bestseller_products($count = null) {
        error_log('=== INICIO get_bestseller_products() ===');
        
        $related_limit = $count !== null ? intval($count) : (isset($this->options['related_products']['count']) ? intval($this->options['related_products']['count']) : 4);
        error_log('Límite de productos relacionados: ' . $related_limit);
        
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
    /**
     * Obtiene los productos destacados (featured).
     *
     * @since    1.1.0
     * @param    int     $count    Número de productos a mostrar.
     * @return   array             Lista de productos destacados.
     */
    private function get_featured_products($count = null) {
        error_log('=== INICIO get_featured_products() ===');
        
        $related_limit = $count !== null ? intval($count) : (isset($this->options['related_products']['count']) ? intval($this->options['related_products']['count']) : 4);
        error_log('Límite de productos relacionados: ' . $related_limit);
        
        // Filtrar productos que ya están en el carrito
        $cart_product_ids = array();
        foreach (WC()->cart->get_cart() as $cart_item) {
            $cart_product_ids[] = $cart_item['product_id'];
        }
        
        // Consultar productos destacados
        $args = array(
            'post_type'      => 'product',
            'post_status'    => 'publish',
            'posts_per_page' => $related_limit + count($cart_product_ids), // Obtenemos más para compensar los filtrados
            'post__not_in'   => $cart_product_ids,
            'tax_query'      => array(
                array(
                    'taxonomy' => 'product_visibility',
                    'field'    => 'name',
                    'terms'    => 'featured',
                    'operator' => 'IN',
                ),
            ),
            'orderby'        => 'date',
            'order'          => 'DESC',
        );
        
        error_log('Ejecutando consulta de productos destacados');
        error_log('Parámetros de consulta: ' . json_encode($args));
        
        $featured_posts = get_posts($args);
        
        if (!empty($featured_posts)) {
            error_log('Productos destacados encontrados: ' . count($featured_posts));
            
            // Convertir a IDs
            $featured_ids = array();
            foreach ($featured_posts as $featured_post) {
                $featured_ids[] = $featured_post->ID;
                error_log('Producto destacado: ' . $featured_post->post_title . ' (ID: ' . $featured_post->ID . ')');
            }
            
            // Limitar al número máximo
            $featured_ids = array_slice($featured_ids, 0, $related_limit);
            
            // Convertir a objetos de producto
            $featured_products = array_filter(array_map('wc_get_product', $featured_ids));
            error_log('Total de objetos de producto válidos: ' . count($featured_products));
            
            error_log('=== FIN get_featured_products() ===');
            return $featured_products;
        } else {
            error_log('No se encontraron productos destacados, buscando productos aleatorios');
            
            // Si no hay productos destacados, obtener productos aleatorios
            $args = array(
                'post_type'      => 'product',
                'post_status'    => 'publish',
                'posts_per_page' => $related_limit,
                'post__not_in'   => $cart_product_ids,
                'orderby'        => 'rand',
            );
            
            $random_posts = get_posts($args);
            
            if (!empty($random_posts)) {
                error_log('Productos aleatorios encontrados: ' . count($random_posts));
                
                // Convertir a IDs
                $random_ids = array();
                foreach ($random_posts as $random_post) {
                    $random_ids[] = $random_post->ID;
                    error_log('Producto aleatorio: ' . $random_post->post_title . ' (ID: ' . $random_post->ID . ')');
                }
                
                // Convertir a objetos de producto
                $random_products = array_filter(array_map('wc_get_product', $random_ids));
                error_log('Total de objetos de producto aleatorios válidos: ' . count($random_products));
                
                error_log('=== FIN get_featured_products() (con productos aleatorios) ===');
                return $random_products;
            }
            
            error_log('No se encontraron productos');
            error_log('=== FIN get_featured_products() (sin productos) ===');
            return array();
        }
    }

    /**
     * Obtiene productos personalizados según el código definido por el usuario.
     *
     * @since    1.0.0
     * @param    WC_Product    $product    El producto base.
     * @param    int           $count      Número de productos a mostrar.
     * @return   array                     Lista de productos personalizados.
     */
    private function get_custom_products($product, $count = null, $custom_query_index = null) {
        error_log('=== INICIO get_custom_products() ===');
        error_log('Procesando producto: ' . $product->get_name() . ' (ID: ' . $product->get_id() . ')');
        
        $related_limit = $count !== null ? intval($count) : (isset($this->options['related_products']['count']) ? intval($this->options['related_products']['count']) : 4);
        error_log('Límite de productos relacionados: ' . $related_limit);
        
        // Obtener la query personalizada según el índice proporcionado
        $custom_query_code = '';
        
        // Determinar qué query personalizada usar
        if ($custom_query_index !== null) {
            // Si se proporciona un índice específico, intentar usar esa query personalizada adicional
            if (isset($this->options['related_products']['custom_queries']) && 
                is_array($this->options['related_products']['custom_queries']) && 
                isset($this->options['related_products']['custom_queries'][$custom_query_index]['code']) &&
                !empty($this->options['related_products']['custom_queries'][$custom_query_index]['code'])) {
                
                $custom_query_code = $this->options['related_products']['custom_queries'][$custom_query_index]['code'];
                error_log('Usando query personalizada adicional #' . $custom_query_index . ' para productos relacionados');
            }
        } else {
            // Si no se proporciona índice, usar la query personalizada principal
            if (isset($this->options['related_products']['custom_query']) && !empty($this->options['related_products']['custom_query'])) {
                $custom_query_code = $this->options['related_products']['custom_query'];
                error_log('Usando query personalizada principal para productos relacionados');
            }
        }
        
        // Si no hay consulta personalizada, devolvemos productos aleatorios como fallback
        if (empty($custom_query_code)) {
            error_log('No se encontró ninguna query personalizada, usando fallback de productos aleatorios');
            
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
            $result = eval($custom_query_code);
            
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
     * Obtiene el contenido actualizado del carrito para sincronización.
     * Este método es llamado desde la página del carrito cuando se realizan cambios.
     *
     * @since    1.2.7
     */
    public function get_sidebar_cart() {
        // Verificar nonce
        check_ajax_referer('snap-sidebar-cart-nonce', 'nonce');
        
        error_log('Solicitud de sincronización del sidebar del carrito recibida');
        
        // Obtener el contenido actualizado del carrito
        $cart_items = WC()->cart->get_cart();
        $cart_count = WC()->cart->get_cart_contents_count();
        $cart_subtotal = WC()->cart->get_cart_subtotal();
        
        // Iniciar el buffer de salida para capturar el HTML del carrito
        ob_start();
        
        // Incluir el template del carrito
        include_once SNAP_SIDEBAR_CART_PATH . 'public/partials/snap-sidebar-cart-products.php';
        
        // Obtener el contenido del buffer
        $cart_content = ob_get_clean();
        
        // Preparar la respuesta
        $response = array(
            'cart_content' => $cart_content,
            'cart_count' => $cart_count,
            'cart_subtotal' => $cart_subtotal,
            'is_cart_empty' => (WC()->cart->is_empty() ? 1 : 0)
        );
        
        error_log('Sincronización del sidebar del carrito completada');
        
        // Enviar respuesta
        wp_send_json_success($response);
    }

    /**
     * Obtiene el contenido del carrito y lo envía como respuesta JSON.
     *
     * @since    1.0.9
     * @param    string    $new_item_key    Clave del nuevo item añadido (opcional).
     */
    private function get_cart_contents($new_item_key = '', $extra_data = array()) {
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
        
        // Combinar datos adicionales con la respuesta
        $data = array(
            'cart_html' => $cart_html,
            'cart_count' => $cart_count,
            'subtotal' => wc_price($subtotal),
            'shipping_total' => wc_price($shipping_total),
            'total' => wc_price($subtotal + $shipping_total)
        );
        
        // Agregar datos extra si existen
        if (!empty($extra_data) && is_array($extra_data)) {
            $data = array_merge($data, $extra_data);
        }
        
        wp_send_json_success($data);
    }
}
