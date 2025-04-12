<?php
/**
 * La funcionalidad específica del área de administración del plugin.
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
        // Solo enqueue en la página de configuración del plugin
        if ('settings_page_snap-sidebar-cart-settings' !== $hook) {
            return;
        }
        
        wp_enqueue_style('wp-color-picker');
        wp_enqueue_style('snap-sidebar-cart-admin', SNAP_SIDEBAR_CART_URL . 'admin/css/snap-sidebar-cart-admin.css', array('wp-color-picker'), SNAP_SIDEBAR_CART_VERSION, 'all');
    }

    /**
     * Registra los scripts para el área de administración.
     *
     * @since    1.0.0
     */
    public function enqueue_scripts($hook) {
        // Solo enqueue en la página de configuración del plugin
        if ('settings_page_snap-sidebar-cart-settings' !== $hook) {
            return;
        }
        
        wp_enqueue_script('wp-color-picker');
        wp_enqueue_script('snap-sidebar-cart-admin', SNAP_SIDEBAR_CART_URL . 'admin/js/snap-sidebar-cart-admin.js', array('jquery', 'wp-color-picker'), SNAP_SIDEBAR_CART_VERSION, true);
    }

    /**
     * Agrega la página de opciones al menú de administración.
     *
     * @since    1.0.0
     */
    public function add_plugin_admin_menu() {
        add_options_page(
            __('Configuración del Carrito Lateral', 'snap-sidebar-cart'),
            __('Carrito Lateral', 'snap-sidebar-cart'),
            'manage_options',
            'snap-sidebar-cart-settings',
            array($this, 'display_plugin_setup_page')
        );
    }

    /**
     * Agrega enlaces de acción a la lista de plugins.
     *
     * @since    1.0.0
     * @param    array    $links    Los enlaces existentes.
     * @return   array    Los enlaces modificados.
     */
    public function add_action_links($links) {
        $settings_link = '<a href="' . admin_url('options-general.php?page=snap-sidebar-cart-settings') . '">' . __('Configuración', 'snap-sidebar-cart') . '</a>';
        array_unshift($links, $settings_link);
        return $links;
    }

    /**
     * Renderiza la página de configuración del plugin.
     *
     * @since    1.0.0
     */
    public function display_plugin_setup_page() {
        include_once SNAP_SIDEBAR_CART_PATH . 'admin/partials/snap-sidebar-cart-admin-display.php';
    }

    /**
     * Registra las opciones del plugin.
     *
     * @since    1.0.0
     */
    public function register_settings() {
        register_setting(
            'snap_sidebar_cart_option_group',
            'snap_sidebar_cart_options',
            array($this, 'validate_options')
        );
        
        // Sección general
        add_settings_section(
            'snap_sidebar_cart_general_section',
            __('Configuración General', 'snap-sidebar-cart'),
            array($this, 'general_section_info'),
            'snap-sidebar-cart-settings'
        );
        
        // Título del carrito
        add_settings_field(
            'title',
            __('Título del carrito', 'snap-sidebar-cart'),
            array($this, 'title_callback'),
            'snap-sidebar-cart-settings',
            'snap_sidebar_cart_general_section'
        );
        
        // Selector del contenedor
        add_settings_field(
            'container_selector',
            __('ID del contenedor', 'snap-sidebar-cart'),
            array($this, 'container_selector_callback'),
            'snap-sidebar-cart-settings',
            'snap_sidebar_cart_general_section'
        );
        
        // Selectores de activación
        add_settings_field(
            'activation_selectors',
            __('Selectores de activación', 'snap-sidebar-cart'),
            array($this, 'activation_selectors_callback'),
            'snap-sidebar-cart-settings',
            'snap_sidebar_cart_general_section'
        );
        
        // Mostrar información de envío
        add_settings_field(
            'show_shipping',
            __('Mostrar información de envío', 'snap-sidebar-cart'),
            array($this, 'show_shipping_callback'),
            'snap-sidebar-cart-settings',
            'snap_sidebar_cart_general_section'
        );
        
        // Apertura automática al añadir productos
        add_settings_field(
            'auto_open',
            __('Abrir automáticamente al añadir productos', 'snap-sidebar-cart'),
            array($this, 'auto_open_callback'),
            'snap-sidebar-cart-settings',
            'snap_sidebar_cart_general_section'
        );
        
        // Sección de estilos
        add_settings_section(
            'snap_sidebar_cart_styles_section',
            __('Personalización de Estilos', 'snap-sidebar-cart'),
            array($this, 'styles_section_info'),
            'snap-sidebar-cart-settings'
        );
        
        // Ancho del sidebar
        add_settings_field(
            'sidebar_width',
            __('Ancho del carrito lateral', 'snap-sidebar-cart'),
            array($this, 'sidebar_width_callback'),
            'snap-sidebar-cart-settings',
            'snap_sidebar_cart_styles_section'
        );
        
        // Color de fondo del sidebar
        add_settings_field(
            'sidebar_background',
            __('Color de fondo del carrito', 'snap-sidebar-cart'),
            array($this, 'sidebar_background_callback'),
            'snap-sidebar-cart-settings',
            'snap_sidebar_cart_styles_section'
        );
        
        // Color de fondo del encabezado
        add_settings_field(
            'header_background',
            __('Color de fondo del encabezado', 'snap-sidebar-cart'),
            array($this, 'header_background_callback'),
            'snap-sidebar-cart-settings',
            'snap_sidebar_cart_styles_section'
        );
        
        // Color del texto del encabezado
        add_settings_field(
            'header_text_color',
            __('Color del texto del encabezado', 'snap-sidebar-cart'),
            array($this, 'header_text_color_callback'),
            'snap-sidebar-cart-settings',
            'snap_sidebar_cart_styles_section'
        );
        
        // Color del texto de productos
        add_settings_field(
            'product_text_color',
            __('Color del texto de productos', 'snap-sidebar-cart'),
            array($this, 'product_text_color_callback'),
            'snap-sidebar-cart-settings',
            'snap_sidebar_cart_styles_section'
        );
        
        // Color de fondo de botones
        add_settings_field(
            'button_background',
            __('Color de fondo de botones', 'snap-sidebar-cart'),
            array($this, 'button_background_callback'),
            'snap-sidebar-cart-settings',
            'snap_sidebar_cart_styles_section'
        );
        
        // Color del texto de botones
        add_settings_field(
            'button_text_color',
            __('Color del texto de botones', 'snap-sidebar-cart'),
            array($this, 'button_text_color_callback'),
            'snap-sidebar-cart-settings',
            'snap_sidebar_cart_styles_section'
        );
        
        // Sección de productos relacionados
        add_settings_section(
            'snap_sidebar_cart_related_section',
            __('Productos Relacionados', 'snap-sidebar-cart'),
            array($this, 'related_section_info'),
            'snap-sidebar-cart-settings'
        );
        
        // Mostrar productos relacionados
        add_settings_field(
            'show_related',
            __('Mostrar productos relacionados', 'snap-sidebar-cart'),
            array($this, 'show_related_callback'),
            'snap-sidebar-cart-settings',
            'snap_sidebar_cart_related_section'
        );
        
        // Número de productos relacionados
        add_settings_field(
            'related_count',
            __('Número de productos relacionados', 'snap-sidebar-cart'),
            array($this, 'related_count_callback'),
            'snap-sidebar-cart-settings',
            'snap_sidebar_cart_related_section'
        );
        
        // Columnas de productos relacionados
        add_settings_field(
            'related_columns',
            __('Columnas de productos relacionados', 'snap-sidebar-cart'),
            array($this, 'related_columns_callback'),
            'snap-sidebar-cart-settings',
            'snap_sidebar_cart_related_section'
        );
        
        // Orden de productos relacionados
        add_settings_field(
            'related_orderby',
            __('Ordenar productos relacionados por', 'snap-sidebar-cart'),
            array($this, 'related_orderby_callback'),
            'snap-sidebar-cart-settings',
            'snap_sidebar_cart_related_section'
        );
    }

    /**
     * Información de la sección general.
     *
     * @since    1.0.0
     */
    public function general_section_info() {
        echo '<p>' . __('Configura las opciones generales del carrito lateral.', 'snap-sidebar-cart') . '</p>';
    }

    /**
     * Información de la sección de estilos.
     *
     * @since    1.0.0
     */
    public function styles_section_info() {
        echo '<p>' . __('Personaliza el aspecto visual del carrito lateral.', 'snap-sidebar-cart') . '</p>';
    }

    /**
     * Información de la sección de productos relacionados.
     *
     * @since    1.0.0
     */
    public function related_section_info() {
        echo '<p>' . __('Configura las opciones para los productos relacionados.', 'snap-sidebar-cart') . '</p>';
    }

    /**
     * Callback para el campo de título.
     *
     * @since    1.0.0
     */
    public function title_callback() {
        $value = isset($this->options['title']) ? esc_attr($this->options['title']) : '';
        echo '<input type="text" name="snap_sidebar_cart_options[title]" value="' . $value . '" class="regular-text">';
        echo '<p class="description">' . __('Título que se mostrará en la parte superior del carrito. El contador de items se añadirá automáticamente.', 'snap-sidebar-cart') . '</p>';
    }

    /**
     * Callback para el campo de selector del contenedor.
     *
     * @since    1.0.0
     */
    public function container_selector_callback() {
        $value = isset($this->options['container_selector']) ? esc_attr($this->options['container_selector']) : '';
        echo '<input type="text" name="snap_sidebar_cart_options[container_selector]" value="' . $value . '" class="regular-text">';
        echo '<p class="description">' . __('ID del contenedor HTML del carrito lateral. No incluir el símbolo #.', 'snap-sidebar-cart') . '</p>';
    }

    /**
     * Callback para el campo de selectores de activación.
     *
     * @since    1.0.0
     */
    public function activation_selectors_callback() {
        $value = isset($this->options['activation_selectors']) ? esc_attr($this->options['activation_selectors']) : '';
        echo '<input type="text" name="snap_sidebar_cart_options[activation_selectors]" value="' . $value . '" class="large-text">';
        echo '<p class="description">' . __('Selectores CSS separados por comas que, al hacer clic, abrirán el carrito lateral.', 'snap-sidebar-cart') . '</p>';
    }

    /**
     * Callback para el campo de mostrar información de envío.
     *
     * @since    1.0.0
     */
    public function show_shipping_callback() {
        $checked = isset($this->options['show_shipping']) && $this->options['show_shipping'] ? 'checked="checked"' : '';
        echo '<input type="checkbox" name="snap_sidebar_cart_options[show_shipping]" value="1" ' . $checked . '>';
        echo '<p class="description">' . __('Mostrar información de coste de envío en el pie del carrito.', 'snap-sidebar-cart') . '</p>';
    }

    /**
     * Callback para el campo de apertura automática.
     *
     * @since    1.0.0
     */
    public function auto_open_callback() {
        $checked = isset($this->options['auto_open']) && $this->options['auto_open'] ? 'checked="checked"' : '';
        echo '<input type="checkbox" name="snap_sidebar_cart_options[auto_open]" value="1" ' . $checked . '>';
        echo '<p class="description">' . __('Abrir automáticamente el carrito lateral cuando se añade un producto.', 'snap-sidebar-cart') . '</p>';
    }

    /**
     * Callback para el ancho del sidebar.
     *
     * @since    1.0.0
     */
    public function sidebar_width_callback() {
        $value = isset($this->options['styles']['sidebar_width']) ? esc_attr($this->options['styles']['sidebar_width']) : '';
        echo '<input type="text" name="snap_sidebar_cart_options[styles][sidebar_width]" value="' . $value . '" class="small-text">';
        echo '<p class="description">' . __('Ancho del carrito lateral en px, em, rem o %. Ejemplo: 400px', 'snap-sidebar-cart') . '</p>';
    }

    /**
     * Callback para el color de fondo del sidebar.
     *
     * @since    1.0.0
     */
    public function sidebar_background_callback() {
        $value = isset($this->options['styles']['sidebar_background']) ? esc_attr($this->options['styles']['sidebar_background']) : '';
        echo '<input type="text" name="snap_sidebar_cart_options[styles][sidebar_background]" value="' . $value . '" class="snap-sidebar-cart-color-picker">';
    }

    /**
     * Callback para el color de fondo del encabezado.
     *
     * @since    1.0.0
     */
    public function header_background_callback() {
        $value = isset($this->options['styles']['header_background']) ? esc_attr($this->options['styles']['header_background']) : '';
        echo '<input type="text" name="snap_sidebar_cart_options[styles][header_background]" value="' . $value . '" class="snap-sidebar-cart-color-picker">';
    }

    /**
     * Callback para el color del texto del encabezado.
     *
     * @since    1.0.0
     */
    public function header_text_color_callback() {
        $value = isset($this->options['styles']['header_text_color']) ? esc_attr($this->options['styles']['header_text_color']) : '';
        echo '<input type="text" name="snap_sidebar_cart_options[styles][header_text_color]" value="' . $value . '" class="snap-sidebar-cart-color-picker">';
    }

    /**
     * Callback para el color del texto de productos.
     *
     * @since    1.0.0
     */
    public function product_text_color_callback() {
        $value = isset($this->options['styles']['product_text_color']) ? esc_attr($this->options['styles']['product_text_color']) : '';
        echo '<input type="text" name="snap_sidebar_cart_options[styles][product_text_color]" value="' . $value . '" class="snap-sidebar-cart-color-picker">';
    }

    /**
     * Callback para el color de fondo de botones.
     *
     * @since    1.0.0
     */
    public function button_background_callback() {
        $value = isset($this->options['styles']['button_background']) ? esc_attr($this->options['styles']['button_background']) : '';
        echo '<input type="text" name="snap_sidebar_cart_options[styles][button_background]" value="' . $value . '" class="snap-sidebar-cart-color-picker">';
    }

    /**
     * Callback para el color del texto de botones.
     *
     * @since    1.0.0
     */
    public function button_text_color_callback() {
        $value = isset($this->options['styles']['button_text_color']) ? esc_attr($this->options['styles']['button_text_color']) : '';
        echo '<input type="text" name="snap_sidebar_cart_options[styles][button_text_color]" value="' . $value . '" class="snap-sidebar-cart-color-picker">';
    }

    /**
     * Callback para mostrar productos relacionados.
     *
     * @since    1.0.0
     */
    public function show_related_callback() {
        $checked = isset($this->options['related_products']['show']) && $this->options['related_products']['show'] ? 'checked="checked"' : '';
        echo '<input type="checkbox" name="snap_sidebar_cart_options[related_products][show]" value="1" ' . $checked . '>';
        echo '<p class="description">' . __('Mostrar productos relacionados en el carrito lateral.', 'snap-sidebar-cart') . '</p>';
    }

    /**
     * Callback para el número de productos relacionados.
     *
     * @since    1.0.0
     */
    public function related_count_callback() {
        $value = isset($this->options['related_products']['count']) ? intval($this->options['related_products']['count']) : 4;
        echo '<input type="number" name="snap_sidebar_cart_options[related_products][count]" value="' . $value . '" class="small-text" min="1" max="12">';
        echo '<p class="description">' . __('Número máximo de productos relacionados a mostrar.', 'snap-sidebar-cart') . '</p>';
    }

    /**
     * Callback para las columnas de productos relacionados.
     *
     * @since    1.0.0
     */
    public function related_columns_callback() {
        $value = isset($this->options['related_products']['columns']) ? intval($this->options['related_products']['columns']) : 2;
        echo '<input type="number" name="snap_sidebar_cart_options[related_products][columns]" value="' . $value . '" class="small-text" min="1" max="4">';
        echo '<p class="description">' . __('Número de columnas para mostrar los productos relacionados.', 'snap-sidebar-cart') . '</p>';
    }

    /**
     * Callback para el orden de productos relacionados.
     *
     * @since    1.0.0
     */
    public function related_orderby_callback() {
        $value = isset($this->options['related_products']['orderby']) ? esc_attr($this->options['related_products']['orderby']) : 'rand';
        ?>
        <select name="snap_sidebar_cart_options[related_products][orderby]">
            <option value="rand" <?php selected($value, 'rand'); ?>><?php _e('Aleatorio', 'snap-sidebar-cart'); ?></option>
            <option value="date" <?php selected($value, 'date'); ?>><?php _e('Fecha', 'snap-sidebar-cart'); ?></option>
            <option value="price" <?php selected($value, 'price'); ?>><?php _e('Precio', 'snap-sidebar-cart'); ?></option>
            <option value="popularity" <?php selected($value, 'popularity'); ?>><?php _e('Popularidad', 'snap-sidebar-cart'); ?></option>
            <option value="rating" <?php selected($value, 'rating'); ?>><?php _e('Valoración', 'snap-sidebar-cart'); ?></option>
        </select>
        <?php
    }

    /**
     * Valida las opciones del plugin.
     *
     * @since    1.0.0
     * @param    array    $input    Las opciones sin validar.
     * @return   array    Las opciones validadas.
     */
    public function validate_options($input) {
        $output = array();
        
        // Validación de campos de texto
        if (isset($input['title'])) {
            $output['title'] = sanitize_text_field($input['title']);
        }
        
        if (isset($input['container_selector'])) {
            $output['container_selector'] = sanitize_text_field($input['container_selector']);
        }
        
        if (isset($input['activation_selectors'])) {
            $output['activation_selectors'] = sanitize_text_field($input['activation_selectors']);
        }
        
        // Validación de checkboxes
        $output['show_shipping'] = isset($input['show_shipping']) ? 1 : 0;
        $output['auto_open'] = isset($input['auto_open']) ? 1 : 0;
        
        // Validación de estilos
        if (isset($input['styles']) && is_array($input['styles'])) {
            foreach ($input['styles'] as $key => $value) {
                if (in_array($key, array('sidebar_width'))) {
                    $output['styles'][$key] = sanitize_text_field($value);
                } elseif (in_array($key, array('sidebar_background', 'header_background', 'header_text_color', 'product_text_color', 'button_background', 'button_text_color'))) {
                    $output['styles'][$key] = sanitize_hex_color($value);
                }
            }
        }
        
        // Validación de productos relacionados
        $output['related_products']['show'] = isset($input['related_products']['show']) ? 1 : 0;
        
        if (isset($input['related_products']['count'])) {
            $output['related_products']['count'] = intval($input['related_products']['count']);
            if ($output['related_products']['count'] < 1) {
                $output['related_products']['count'] = 1;
            } elseif ($output['related_products']['count'] > 12) {
                $output['related_products']['count'] = 12;
            }
        }
        
        if (isset($input['related_products']['columns'])) {
            $output['related_products']['columns'] = intval($input['related_products']['columns']);
            if ($output['related_products']['columns'] < 1) {
                $output['related_products']['columns'] = 1;
            } elseif ($output['related_products']['columns'] > 4) {
                $output['related_products']['columns'] = 4;
            }
        }
        
        if (isset($input['related_products']['orderby'])) {
            $valid_orderby = array('rand', 'date', 'price', 'popularity', 'rating');
            $output['related_products']['orderby'] = in_array($input['related_products']['orderby'], $valid_orderby) ? $input['related_products']['orderby'] : 'rand';
        }
        
        return $output;
    }
}
