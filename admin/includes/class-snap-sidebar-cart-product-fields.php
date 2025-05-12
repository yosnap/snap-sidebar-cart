<?php
/**
 * Clase para añadir campos personalizados a productos de WooCommerce
 *
 * @since      1.2.2
 */
class Snap_Sidebar_Cart_Product_Fields {

    /**
     * Inicializa la clase y establece sus propiedades.
     *
     * @since    1.2.2
     */
    public function __construct() {
        $this->init();
    }

    /**
     * Inicializa los hooks.
     *
     * @since    1.2.2
     */
    public function init() {
        // Añadir campo en la pestaña de Shipping de producto
        add_action('woocommerce_product_options_shipping', array($this, 'add_delivery_time_field'));
        
        // Guardar el valor del campo
        add_action('woocommerce_process_product_meta', array($this, 'save_delivery_time_field'));
    }

    /**
     * Añade el campo de tiempo de entrega en la pestaña de Shipping de producto.
     *
     * @since    1.2.2
     */
    public function add_delivery_time_field() {
        global $post;
        
        echo '<div class="options_group">';
        
        // Campo para tiempo de entrega en días
        woocommerce_wp_text_input(array(
            'id'          => '_delivery_time_days',
            'label'       => __('Tiempo de entrega (días)', 'snap-sidebar-cart'),
            'desc_tip'    => true,
            'description' => __('Número de días para la entrega de este producto. Se muestra en el carrito lateral.', 'snap-sidebar-cart'),
            'type'        => 'number',
            'custom_attributes' => array(
                'step' => '1',
                'min' => '1'
            )
        ));
        
        echo '</div>';
    }

    /**
     * Guarda el valor del campo de tiempo de entrega.
     *
     * @since    1.2.2
     * @param    int       $post_id    ID del producto
     */
    public function save_delivery_time_field($post_id) {
        // Guardar campo de tiempo de entrega
        $delivery_time = isset($_POST['_delivery_time_days']) ? sanitize_text_field($_POST['_delivery_time_days']) : '';
        update_post_meta($post_id, '_delivery_time_days', $delivery_time);
    }
}

// Inicializar la clase
new Snap_Sidebar_Cart_Product_Fields();
