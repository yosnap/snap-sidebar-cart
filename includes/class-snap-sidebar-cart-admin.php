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
        
        // Cargar campos personalizados para productos
        require_once SNAP_SIDEBAR_CART_PATH . 'admin/includes/class-snap-sidebar-cart-product-fields.php';
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
        
        // Si estamos en la pestaña de productos relacionados y es WP 4.9+, cargar el editor de código
        $current_tab = isset($_GET['tab']) ? sanitize_text_field($_GET['tab']) : 'general';
        if ($current_tab === 'related' && function_exists('wp_enqueue_code_editor')) {
            // Cargar el editor de código para PHP
            wp_enqueue_code_editor(array('type' => 'text/x-php'));
            wp_enqueue_script('code-editor');
        }
        
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
        
        // Añadir página de diagnóstico
        add_submenu_page(
            'options-general.php',
            __('Diagnóstico de Snap Sidebar Cart', 'snap-sidebar-cart'),
            __('Diagnóstico de Carrito', 'snap-sidebar-cart'),
            'manage_options',
            'snap-sidebar-cart-diagnostics',
            array($this, 'display_plugin_diagnostics_page')
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
     * Renderiza la página de diagnóstico del plugin.
     *
     * @since    1.2.3
     */
    public function display_plugin_diagnostics_page() {
        include_once SNAP_SIDEBAR_CART_PATH . 'admin/diagnostics.php';
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
        
        // PESTAÑA 1: CONFIGURACIÓN GENERAL
        // Sección general
        add_settings_section(
            'snap_sidebar_cart_general_section',
            __('Ajustes Básicos', 'snap-sidebar-cart'),
            array($this, 'general_section_info'),
            'snap-sidebar-cart-settings-general'
        );
        
        // Título del carrito
        add_settings_field(
            'title',
            __('Título del carrito', 'snap-sidebar-cart'),
            array($this, 'title_callback'),
            'snap-sidebar-cart-settings-general',
            'snap_sidebar_cart_general_section'
        );
        
        // Selector del contenedor
        add_settings_field(
            'container_selector',
            __('ID del contenedor', 'snap-sidebar-cart'),
            array($this, 'container_selector_callback'),
            'snap-sidebar-cart-settings-general',
            'snap_sidebar_cart_general_section'
        );
        
        // Selectores de activación
        add_settings_field(
            'activation_selectors',
            __('Selectores de activación', 'snap-sidebar-cart'),
            array($this, 'activation_selectors_callback'),
            'snap-sidebar-cart-settings-general',
            'snap_sidebar_cart_general_section'
        );
        
        // Texto de tiempo de entrega
        add_settings_field(
            'delivery_time_text',
            __('Texto de tiempo de entrega', 'snap-sidebar-cart'),
            array($this, 'delivery_time_text_callback'),
            'snap-sidebar-cart-settings-general',
            'snap_sidebar_cart_general_section'
        );
        
        // Mostrar tiempo de entrega
        add_settings_field(
            'show_delivery_time',
            __('Mostrar tiempo de entrega', 'snap-sidebar-cart'),
            array($this, 'show_delivery_time_callback'),
            'snap-sidebar-cart-settings-general',
            'snap_sidebar_cart_general_section'
        );
        
        // Mostrar información de envío
        add_settings_field(
            'show_shipping',
            __('Mostrar información de envío', 'snap-sidebar-cart'),
            array($this, 'show_shipping_callback'),
            'snap-sidebar-cart-settings-general',
            'snap_sidebar_cart_general_section'
        );
        
        // Apertura automática al añadir productos
        add_settings_field(
            'auto_open',
            __('Abrir automáticamente al añadir productos', 'snap-sidebar-cart'),
            array($this, 'auto_open_callback'),
            'snap-sidebar-cart-settings-general',
            'snap_sidebar_cart_general_section'
        );
        
        // PESTAÑA 2: PERSONALIZACIÓN DE ESTILOS
        // Sección de estilos
        add_settings_section(
            'snap_sidebar_cart_styles_section',
            __('Apariencia Visual', 'snap-sidebar-cart'),
            array($this, 'styles_section_info'),
            'snap-sidebar-cart-settings-styles'
        );
        
        // Ancho del sidebar
        add_settings_field(
            'sidebar_width',
            __('Ancho del carrito lateral', 'snap-sidebar-cart'),
            array($this, 'sidebar_width_callback'),
            'snap-sidebar-cart-settings-styles',
            'snap_sidebar_cart_styles_section'
        );
        
        // Color de fondo del listado de productos
        add_settings_field(
            'products_background',
            __('Color de fondo del listado de productos', 'snap-sidebar-cart'),
            array($this, 'products_background_callback'),
            'snap-sidebar-cart-settings-styles',
            'snap_sidebar_cart_styles_section'
        );
        
        // Color de fondo de la sección de productos relacionados
        add_settings_field(
            'related_section_background',
            __('Color de fondo de productos relacionados', 'snap-sidebar-cart'),
            array($this, 'related_section_background_callback'),
            'snap-sidebar-cart-settings-styles',
            'snap_sidebar_cart_styles_section'
        );
        
        // Color de fondo del footer
        add_settings_field(
            'footer_background',
            __('Color de fondo del footer', 'snap-sidebar-cart'),
            array($this, 'footer_background_callback'),
            'snap-sidebar-cart-settings-styles',
            'snap_sidebar_cart_styles_section'
        );
        
        // Color de fondo del encabezado
        add_settings_field(
            'header_background',
            __('Color de fondo del encabezado', 'snap-sidebar-cart'),
            array($this, 'header_background_callback'),
            'snap-sidebar-cart-settings-styles',
            'snap_sidebar_cart_styles_section'
        );
        
        // Color del texto del encabezado
        add_settings_field(
            'header_text_color',
            __('Color del texto del encabezado', 'snap-sidebar-cart'),
            array($this, 'header_text_color_callback'),
            'snap-sidebar-cart-settings-styles',
            'snap_sidebar_cart_styles_section'
        );
        
        // Color del texto de productos
        add_settings_field(
            'product_text_color',
            __('Color del texto de productos', 'snap-sidebar-cart'),
            array($this, 'product_text_color_callback'),
            'snap-sidebar-cart-settings-styles',
            'snap_sidebar_cart_styles_section'
        );
        
        // Color de fondo de botones
        add_settings_field(
            'button_background',
            __('Color de fondo de botones', 'snap-sidebar-cart'),
            array($this, 'button_background_callback'),
            'snap-sidebar-cart-settings-styles',
            'snap_sidebar_cart_styles_section'
        );
        
        // Color del texto de botones
        add_settings_field(
            'button_text_color',
            __('Color del texto de botones', 'snap-sidebar-cart'),
            array($this, 'button_text_color_callback'),
            'snap-sidebar-cart-settings-styles',
            'snap_sidebar_cart_styles_section'
        );
        
        // PESTAÑA 3: CONFIGURACIÓN DEL PRELOADER
        // Sección de configuración del preloader
        add_settings_section(
            'snap_sidebar_cart_preloader_section',
            __('Configuración del Preloader', 'snap-sidebar-cart'),
            array($this, 'preloader_section_info'),
            'snap-sidebar-cart-settings-preloader'
        );
        
        // PESTAÑA DE ANIMACIONES
        // Sección de configuración de animaciones
        add_settings_section(
            'snap_sidebar_cart_animations_section',
            __('Configuración de Animaciones', 'snap-sidebar-cart'),
            array($this, 'animations_section_info'),
            'snap-sidebar-cart-settings-animations'
        );
        
        // Duración de la animación
        add_settings_field(
            'animation_duration',
            __('Duración de la animación', 'snap-sidebar-cart'),
            array($this, 'animation_duration_callback'),
            'snap-sidebar-cart-settings-animations',
            'snap_sidebar_cart_animations_section'
        );
        
        // Delay para la animación de actualización de cantidad
        add_settings_field(
            'quantity_update_delay',
            __('Delay de actualización de cantidad', 'snap-sidebar-cart'),
            array($this, 'quantity_update_delay_callback'),
            'snap-sidebar-cart-settings-animations',
            'snap_sidebar_cart_animations_section'
        );
        
        // Posición para nuevos productos
        add_settings_field(
            'new_product_position',
            __('Posición de nuevos productos', 'snap-sidebar-cart'),
            array($this, 'new_product_position_callback'),
            'snap-sidebar-cart-settings-animations',
            'snap_sidebar_cart_animations_section'
        );
        
        // Tipo de preloader
        add_settings_field(
            'preloader_type',
            __('Tipo de preloader', 'snap-sidebar-cart'),
            array($this, 'preloader_type_callback'),
            'snap-sidebar-cart-settings-preloader',
            'snap_sidebar_cart_preloader_section'
        );
        
        // Tamaño del preloader
        add_settings_field(
            'preloader_size',
            __('Tamaño del preloader', 'snap-sidebar-cart'),
            array($this, 'preloader_size_callback'),
            'snap-sidebar-cart-settings-preloader',
            'snap_sidebar_cart_preloader_section'
        );
        
        // Color principal del preloader
        add_settings_field(
            'preloader_color',
            __('Color principal', 'snap-sidebar-cart'),
            array($this, 'preloader_color_callback'),
            'snap-sidebar-cart-settings-preloader',
            'snap_sidebar_cart_preloader_section'
        );
        
        // Color secundario del preloader
        add_settings_field(
            'preloader_color2',
            __('Color secundario', 'snap-sidebar-cart'),
            array($this, 'preloader_color2_callback'),
            'snap-sidebar-cart-settings-preloader',
            'snap_sidebar_cart_preloader_section'
        );
        
        // Posición del preloader
        add_settings_field(
            'preloader_position',
            __('Posición del preloader', 'snap-sidebar-cart'),
            array($this, 'preloader_position_callback'),
            'snap-sidebar-cart-settings-preloader',
            'snap_sidebar_cart_preloader_section'
        );
        
        // PESTAÑA 4: PRODUCTOS RELACIONADOS
        // Sección de productos relacionados
        add_settings_section(
            'snap_sidebar_cart_related_section',
            __('Configuración de Productos Relacionados', 'snap-sidebar-cart'),
            array($this, 'related_section_info'),
            'snap-sidebar-cart-settings-related'
        );
        
        // Mostrar productos relacionados
        add_settings_field(
            'show_related',
            __('Mostrar productos relacionados', 'snap-sidebar-cart'),
            array($this, 'show_related_callback'),
            'snap-sidebar-cart-settings-related',
            'snap_sidebar_cart_related_section'
        );
        
        // Número de productos relacionados
        add_settings_field(
            'related_count',
            __('Número de productos relacionados', 'snap-sidebar-cart'),
            array($this, 'related_count_callback'),
            'snap-sidebar-cart-settings-related',
            'snap_sidebar_cart_related_section'
        );
        
        // Columnas de productos relacionados
        add_settings_field(
            'related_columns',
            __('Columnas de productos relacionados', 'snap-sidebar-cart'),
            array($this, 'related_columns_callback'),
            'snap-sidebar-cart-settings-related',
            'snap_sidebar_cart_related_section'
        );
        
        // Orden de productos relacionados
        add_settings_field(
            'related_orderby',
            __('Ordenar productos relacionados por', 'snap-sidebar-cart'),
            array($this, 'related_orderby_callback'),
            'snap-sidebar-cart-settings-related',
            'snap_sidebar_cart_related_section'
        );
        
        // Número de slides a desplazar
        add_settings_field(
            'slides_to_scroll',
            __('Número de slides a desplazar', 'snap-sidebar-cart'),
            array($this, 'slides_to_scroll_callback'),
            'snap-sidebar-cart-settings-related',
            'snap_sidebar_cart_related_section'
        );
        
        // Mostrar badge de última oportunidad
        add_settings_field(
            'show_last_chance',
            __('Mostrar badge de última oportunidad', 'snap-sidebar-cart'),
            array($this, 'show_last_chance_callback'),
            'snap-sidebar-cart-settings-related',
            'snap_sidebar_cart_related_section'
        );
        
        // Límite de stock para última oportunidad
        add_settings_field(
            'last_chance_stock_limit',
            __('Límite de stock para última oportunidad', 'snap-sidebar-cart'),
            array($this, 'last_chance_stock_limit_callback'),
            'snap-sidebar-cart-settings-related',
            'snap_sidebar_cart_related_section'
        );
        
        // Título del badge de última oportunidad
        add_settings_field(
            'last_chance_title',
            __('Título del badge de última oportunidad', 'snap-sidebar-cart'),
            array($this, 'last_chance_title_callback'),
            'snap-sidebar-cart-settings-related',
            'snap_sidebar_cart_related_section'
        );
        
        // Color de fondo del badge de última oportunidad
        add_settings_field(
            'last_chance_bg_color',
            __('Color de fondo del badge', 'snap-sidebar-cart'),
            array($this, 'last_chance_bg_color_callback'),
            'snap-sidebar-cart-settings-related',
            'snap_sidebar_cart_related_section'
        );
        
        // Color de texto del badge de última oportunidad
        add_settings_field(
            'last_chance_text_color',
            __('Color de texto del badge', 'snap-sidebar-cart'),
            array($this, 'last_chance_text_color_callback'),
            'snap-sidebar-cart-settings-related',
            'snap_sidebar_cart_related_section'
        );

        // Pestañas activas de productos relacionados
        add_settings_field(
            'related_active_tabs',
            __('Pestañas de productos relacionados', 'snap-sidebar-cart'),
            array($this, 'related_active_tabs_callback'),
            'snap-sidebar-cart-settings-related',
            'snap_sidebar_cart_related_section'
        );
        
        // Etiqueta personalizada
        add_settings_field(
            'related_custom_tab_label',
            __('Etiqueta de la pestaña personalizada', 'snap-sidebar-cart'),
            array($this, 'related_custom_tab_label_callback'),
            'snap-sidebar-cart-settings-related',
            'snap_sidebar_cart_related_section'
        );
        
        // Código personalizado para queries
        add_settings_field(
            'related_custom_query',
            __('Código personalizado para queries', 'snap-sidebar-cart'),
            array($this, 'related_custom_query_callback'),
            'snap-sidebar-cart-settings-related',
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
     * Información de la sección del preloader.
     *
     * @since    1.0.0
     */
    public function preloader_section_info() {
        echo '<p>' . __('Configura la apariencia del preloader que aparece al actualizar productos.', 'snap-sidebar-cart') . '</p>';
    }
    
    /**
     * Información de la sección de animaciones.
     *
     * @since    1.0.6
     */
    public function animations_section_info() {
        echo '<p>' . __('Configura las animaciones del carrito lateral y la inserción de productos.', 'snap-sidebar-cart') . '</p>';
    }
    
    /**
     * Callback para el tipo de preloader.
     *
     * @since    1.0.0
     */
    public function preloader_type_callback() {
        $value = isset($this->options['preloader']['type']) ? esc_attr($this->options['preloader']['type']) : 'circle';
        ?>
        <select name="snap_sidebar_cart_options[preloader][type]">
            <option value="circle" <?php selected($value, 'circle'); ?>><?php _e('Círculo', 'snap-sidebar-cart'); ?></option>
            <option value="square" <?php selected($value, 'square'); ?>><?php _e('Cuadrado', 'snap-sidebar-cart'); ?></option>
            <option value="dots" <?php selected($value, 'dots'); ?>><?php _e('Línea con puntos', 'snap-sidebar-cart'); ?></option>
            <option value="spinner" <?php selected($value, 'spinner'); ?>><?php _e('Espiral', 'snap-sidebar-cart'); ?></option>
        </select>
        <p class="description"><?php _e('Selecciona el estilo visual del preloader.', 'snap-sidebar-cart'); ?></p>
        <?php
    }
    
    /**
     * Callback para el tamaño del preloader.
     *
     * @since    1.0.0
     */
    public function preloader_size_callback() {
        $value = isset($this->options['preloader']['size']) ? esc_attr($this->options['preloader']['size']) : '40px';
        echo '<input type="text" name="snap_sidebar_cart_options[preloader][size]" value="' . $value . '" class="small-text">';
        echo '<p class="description">' . __('Tamaño del preloader en px, em o rem. Ejemplo: 40px', 'snap-sidebar-cart') . '</p>';
    }
    
    /**
     * Callback para el color principal del preloader.
     *
     * @since    1.0.0
     */
    public function preloader_color_callback() {
        $value = isset($this->options['preloader']['color']) ? esc_attr($this->options['preloader']['color']) : '#3498db';
        echo '<input type="text" name="snap_sidebar_cart_options[preloader][color]" value="' . $value . '" class="snap-sidebar-cart-color-picker">';
        echo '<p class="description">' . __('Color principal para el preloader.', 'snap-sidebar-cart') . '</p>';
    }
    
    /**
     * Callback para el color secundario del preloader.
     *
     * @since    1.0.0
     */
    public function preloader_color2_callback() {
        $value = isset($this->options['preloader']['color2']) ? esc_attr($this->options['preloader']['color2']) : '#e74c3c';
        echo '<input type="text" name="snap_sidebar_cart_options[preloader][color2]" value="' . $value . '" class="snap-sidebar-cart-color-picker">';
        echo '<p class="description">' . __('Color secundario para algunos tipos de preloader.', 'snap-sidebar-cart') . '</p>';
    }
    
    /**
     * Callback para la posición del preloader.
     *
     * @since    1.0.0
     */
    public function preloader_position_callback() {
        $value = isset($this->options['preloader']['position']) ? esc_attr($this->options['preloader']['position']) : 'center';
        ?>
        <select name="snap_sidebar_cart_options[preloader][position]">
            <option value="center" <?php selected($value, 'center'); ?>><?php _e('Centro', 'snap-sidebar-cart'); ?></option>
            <option value="top-left" <?php selected($value, 'top-left'); ?>><?php _e('Superior izquierda', 'snap-sidebar-cart'); ?></option>
            <option value="top-right" <?php selected($value, 'top-right'); ?>><?php _e('Superior derecha', 'snap-sidebar-cart'); ?></option>
            <option value="bottom-left" <?php selected($value, 'bottom-left'); ?>><?php _e('Inferior izquierda', 'snap-sidebar-cart'); ?></option>
            <option value="bottom-right" <?php selected($value, 'bottom-right'); ?>><?php _e('Inferior derecha', 'snap-sidebar-cart'); ?></option>
        </select>
        <p class="description"><?php _e('Posición del preloader en el contenedor del producto.', 'snap-sidebar-cart'); ?></p>
        <?php
    }
    
    /**
     * Callback para la duración de la animación.
     *
     * @since    1.0.6
     */
    public function animation_duration_callback() {
        $value = isset($this->options['animations']['duration']) ? intval($this->options['animations']['duration']) : 300;
        echo '<input type="number" name="snap_sidebar_cart_options[animations][duration]" value="' . $value . '" class="small-text" min="100" max="2000" step="50">';
        echo '<p class="description">' . __('Duración de la animación en milisegundos. Valores recomendados entre 200ms y 1000ms.', 'snap-sidebar-cart') . '</p>';
    }
    
    /**
     * Callback para el delay de actualización de cantidad.
     *
     * @since    1.0.6
     */
    public function quantity_update_delay_callback() {
        $value = isset($this->options['animations']['quantity_update_delay']) ? intval($this->options['animations']['quantity_update_delay']) : 200;
        echo '<input type="number" name="snap_sidebar_cart_options[animations][quantity_update_delay]" value="' . $value . '" class="small-text" min="0" max="1000" step="50">';
        echo '<p class="description">' . __('Tiempo de espera antes de mostrar la animación de actualización de cantidad (en milisegundos).', 'snap-sidebar-cart') . '</p>';
    }
    
    /**
     * Callback para la posición de nuevos productos.
     *
     * @since    1.0.6
     */
    public function new_product_position_callback() {
        $value = isset($this->options['animations']['new_product_position']) ? esc_attr($this->options['animations']['new_product_position']) : 'top';
        ?>
        <select name="snap_sidebar_cart_options[animations][new_product_position]">
            <option value="top" <?php selected($value, 'top'); ?>><?php _e('Al inicio de la lista', 'snap-sidebar-cart'); ?></option>
            <option value="bottom" <?php selected($value, 'bottom'); ?>><?php _e('Al final de la lista', 'snap-sidebar-cart'); ?></option>
        </select>
        <p class="description"><?php _e('Posición donde se agregarán los nuevos productos en el carrito.', 'snap-sidebar-cart'); ?></p>
        <?php
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
     * Callback para el campo de texto de tiempo de entrega.
     *
     * @since    1.2.2
     */
    public function delivery_time_text_callback() {
        $value = isset($this->options['delivery_time_text']) ? esc_attr($this->options['delivery_time_text']) : __('Entrega en 1-3 días hábiles', 'snap-sidebar-cart');
        echo '<input type="text" name="snap_sidebar_cart_options[delivery_time_text]" value="' . $value . '" class="regular-text">';
        echo '<p class="description">' . __('Texto que se mostrará debajo de cada producto indicando el tiempo de entrega. Puedes usar %dias% como variable para mostrarlo dinámicamente.', 'snap-sidebar-cart') . '</p>';
    }
    
    /**
     * Callback para el campo de mostrar tiempo de entrega.
     *
     * @since    1.2.2
     */
    public function show_delivery_time_callback() {
        $checked = isset($this->options['show_delivery_time']) && $this->options['show_delivery_time'] ? 'checked="checked"' : '';
        echo '<input type="checkbox" name="snap_sidebar_cart_options[show_delivery_time]" value="1" ' . $checked . '>';
        echo '<p class="description">' . __('Mostrar el texto de tiempo de entrega debajo de cada producto. Desmarca esta opción para ocultar esta información.', 'snap-sidebar-cart') . '</p>';
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
     * Callback para el color de fondo del listado de productos.
     *
     * @since    1.2.0
     */
    public function products_background_callback() {
        $value = isset($this->options['styles']['products_background']) ? esc_attr($this->options['styles']['products_background']) : '#ffffff';
        echo '<input type="text" name="snap_sidebar_cart_options[styles][products_background]" value="' . $value . '" class="snap-sidebar-cart-color-picker">';
        echo '<p class="description">' . __('Color de fondo para el listado de productos.', 'snap-sidebar-cart') . '</p>';
    }
    
    /**
     * Callback para el color de fondo de la sección de productos relacionados.
     *
     * @since    1.2.0
     */
    public function related_section_background_callback() {
        $value = isset($this->options['styles']['related_section_background']) ? esc_attr($this->options['styles']['related_section_background']) : '#f9f9f9';
        echo '<input type="text" name="snap_sidebar_cart_options[styles][related_section_background]" value="' . $value . '" class="snap-sidebar-cart-color-picker">';
        echo '<p class="description">' . __('Color de fondo para la sección de productos relacionados.', 'snap-sidebar-cart') . '</p>';
    }
    
    /**
     * Callback para el color de fondo del footer.
     *
     * @since    1.2.0
     */
    public function footer_background_callback() {
        $value = isset($this->options['styles']['footer_background']) ? esc_attr($this->options['styles']['footer_background']) : '#f8f8f8';
        echo '<input type="text" name="snap_sidebar_cart_options[styles][footer_background]" value="' . $value . '" class="snap-sidebar-cart-color-picker">';
        echo '<p class="description">' . __('Color de fondo para el footer del carrito.', 'snap-sidebar-cart') . '</p>';
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
     * Callback para el número de slides a desplazar.
     *
     * @since    1.1.5
     */
    public function slides_to_scroll_callback() {
        $value = isset($this->options['related_products']['slides_to_scroll']) ? intval($this->options['related_products']['slides_to_scroll']) : 2;
        ?>
        <input type="number" name="snap_sidebar_cart_options[related_products][slides_to_scroll]" value="<?php echo $value; ?>" min="1" max="5" class="small-text">
        <p class="description"><?php _e('Número de productos a desplazar cuando se hace clic en los botones de navegación.', 'snap-sidebar-cart'); ?></p>
        <?php
    }
    
    /**
     * Callback para mostrar badge de última oportunidad.
     *
     * @since    1.1.5
     */
    public function show_last_chance_callback() {
        $checked = isset($this->options['related_products']['show_last_chance']) && $this->options['related_products']['show_last_chance'] ? 'checked="checked"' : '';
        ?>
        <input type="checkbox" name="snap_sidebar_cart_options[related_products][show_last_chance]" value="1" <?php echo $checked; ?>>
        <p class="description"><?php _e('Mostrar badge de última oportunidad en productos con stock limitado.', 'snap-sidebar-cart'); ?></p>
        <?php
    }
    
    /**
     * Callback para el límite de stock para última oportunidad.
     *
     * @since    1.1.5
     */
    public function last_chance_stock_limit_callback() {
        $value = isset($this->options['related_products']['last_chance_stock_limit']) ? intval($this->options['related_products']['last_chance_stock_limit']) : 5;
        ?>
        <input type="number" name="snap_sidebar_cart_options[related_products][last_chance_stock_limit]" value="<?php echo $value; ?>" min="1" max="20" class="small-text">
        <p class="description"><?php _e('Mostrar badge de última oportunidad cuando el stock sea igual o menor a este valor.', 'snap-sidebar-cart'); ?></p>
        <?php
    }
    
    /**
     * Callback para el título del badge de última oportunidad.
     *
     * @since    1.2.0
     */
    public function last_chance_title_callback() {
        $value = isset($this->options['related_products']['last_chance_title']) ? esc_attr($this->options['related_products']['last_chance_title']) : __('ÚLTIMA OPORTUNIDAD', 'snap-sidebar-cart');
        ?>
        <input type="text" name="snap_sidebar_cart_options[related_products][last_chance_title]" value="<?php echo $value; ?>" class="regular-text">
        <p class="description"><?php _e('Texto que se mostrará en el badge de última oportunidad.', 'snap-sidebar-cart'); ?></p>
        <?php
    }
    
    /**
     * Callback para el color de fondo del badge de última oportunidad.
     *
     * @since    1.2.0
     */
    public function last_chance_bg_color_callback() {
        $value = isset($this->options['related_products']['last_chance_bg_color']) ? esc_attr($this->options['related_products']['last_chance_bg_color']) : '#e74c3c';
        ?>
        <input type="text" name="snap_sidebar_cart_options[related_products][last_chance_bg_color]" value="<?php echo $value; ?>" class="snap-sidebar-cart-color-picker">
        <p class="description"><?php _e('Color de fondo del badge de última oportunidad.', 'snap-sidebar-cart'); ?></p>
        <?php
    }
    
    /**
     * Callback para el color de texto del badge de última oportunidad.
     *
     * @since    1.2.0
     */
    public function last_chance_text_color_callback() {
        $value = isset($this->options['related_products']['last_chance_text_color']) ? esc_attr($this->options['related_products']['last_chance_text_color']) : '#ffffff';
        ?>
        <input type="text" name="snap_sidebar_cart_options[related_products][last_chance_text_color]" value="<?php echo $value; ?>" class="snap-sidebar-cart-color-picker">
        <p class="description"><?php _e('Color del texto del badge de última oportunidad.', 'snap-sidebar-cart'); ?></p>
        <?php
    }

    /**
     * Callback para las pestañas activas de productos relacionados.
     *
     * @since    1.0.0
     */
    public function related_active_tabs_callback() {
        $active_tabs = isset($this->options['related_products']['active_tabs']) ? 
                      explode(',', $this->options['related_products']['active_tabs']) : 
                      array('upsells', 'crosssells', 'related');
        
        $tab_options = array(
            'upsells' => __('Complementos (Up-sells)', 'snap-sidebar-cart'),
            'crosssells' => __('Productos cruzados (Cross-sells)', 'snap-sidebar-cart'),
            'related' => __('Misma categoría', 'snap-sidebar-cart'),
            'bestsellers' => __('Más vendidos', 'snap-sidebar-cart'),
            'featured' => __('Destacados', 'snap-sidebar-cart'),
            'custom' => __('Consulta personalizada', 'snap-sidebar-cart')
        );
        
        echo '<div class="related-tabs-options">';
        foreach ($tab_options as $tab_key => $tab_label) {
            $checked = in_array($tab_key, $active_tabs) ? 'checked="checked"' : '';
            echo '<label style="display: block; margin-bottom: 8px;">';
            echo '<input type="checkbox" name="snap_sidebar_cart_options[related_products][active_tabs_arr][]" value="' . esc_attr($tab_key) . '" ' . $checked . '> ';
            echo esc_html($tab_label);
            echo '</label>';
        }
        echo '</div>';
        
        // Campo oculto para mantener compatibilidad con el formato de cadena separada por comas
        echo '<input type="hidden" name="snap_sidebar_cart_options[related_products][active_tabs]" id="related-active-tabs-hidden" value="' . esc_attr(isset($this->options['related_products']['active_tabs']) ? $this->options['related_products']['active_tabs'] : '') . '">';
        
        echo '<p class="description">' . __('Selecciona qué tipos de productos relacionados quieres mostrar en el carrito.', 'snap-sidebar-cart') . '</p>';
        
        // Script para actualizar el campo oculto cuando cambian los checkboxes
        ?>
        <script>
        jQuery(document).ready(function($) {
            // Actualizar el campo oculto cuando cambian los checkboxes
            $('.related-tabs-options input[type="checkbox"]').on('change', function() {
                var selectedTabs = [];
                $('.related-tabs-options input[type="checkbox"]:checked').each(function() {
                    selectedTabs.push($(this).val());
                });
                $('#related-active-tabs-hidden').val(selectedTabs.join(','));
            });
        });
        </script>
        <?php
    }

    /**
     * Callback para la etiqueta personalizada de la pestaña.
     *
     * @since    1.0.0
     */
    public function related_custom_tab_label_callback() {
        $value = isset($this->options['related_products']['custom_tab_label']) ? esc_attr($this->options['related_products']['custom_tab_label']) : '';
        echo '<input type="text" name="snap_sidebar_cart_options[related_products][custom_tab_label]" value="' . $value . '" class="regular-text">';
        echo '<p class="description">' . __('Etiqueta personalizada para la pestaña de productos relacionados.', 'snap-sidebar-cart') . '</p>';
    }

    /**
     * Callback para el código personalizado de queries.
     *
     * @since    1.0.0
     */
    public function related_custom_query_callback() {
        $value = isset($this->options['related_products']['custom_query']) ? esc_textarea($this->options['related_products']['custom_query']) : '';
        echo '<textarea name="snap_sidebar_cart_options[related_products][custom_query]" id="custom-php-code" class="large-text code" rows="10" style="font-family: monospace;">' . $value . '</textarea>';
        
        // Enqueue the code editor if WP >= 4.9
        if (function_exists('wp_enqueue_code_editor')) {
            $settings = wp_enqueue_code_editor(array('type' => 'text/x-php'));
            
            if ($settings !== false) {
                wp_add_inline_script(
                    'code-editor',
                    sprintf(
                        'jQuery(function($) { wp.codeEditor.initialize("custom-php-code", %s); });',
                        wp_json_encode($settings)
                    )
                );
            }
        }
        
        echo '<p class="description">' . __('Código PHP personalizado para las queries de productos relacionados. Las variables disponibles son: $product_id, $current_product, $category_ids, $tag_ids, $limit, $cart_product_ids.', 'snap-sidebar-cart') . '</p>';
        
        // Agregar ejemplo de código
        echo '<details style="margin-top: 10px; padding: 5px; border: 1px solid #ddd;">';
        echo '<summary style="cursor: pointer; font-weight: bold;">' . __('Ver ejemplo de código', 'snap-sidebar-cart') . '</summary>';
        echo '<pre style="background-color: #f8f8f8; padding: 10px; overflow: auto; margin-top: 10px; font-size: 12px;">// Ejemplo: Obtener productos con un precio similar
$price = $current_product->get_price();
$args = array(
    \'post_type\'      => \'product\',
    \'posts_per_page\' => $limit,
    \'post__not_in\'   => array_merge(array($product_id), $cart_product_ids),
    \'meta_query\'     => array(
        array(
            \'key\'     => \'_price\',
            \'value\'   => array($price * 0.8, $price * 1.2),
            \'compare\' => \'BETWEEN\',
            \'type\'    => \'NUMERIC\'
        )
    )
);

$products = get_posts($args);
return wp_list_pluck($products, \'ID\');</pre>';
        echo '</details>';
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
        
        // Validación del texto de tiempo de entrega
        if (isset($input['delivery_time_text'])) {
            $output['delivery_time_text'] = sanitize_text_field($input['delivery_time_text']);
        }
        
        // Validación de checkboxes
        $output['show_delivery_time'] = isset($input['show_delivery_time']) ? 1 : 0;
        $output['show_shipping'] = isset($input['show_shipping']) ? 1 : 0;
        $output['auto_open'] = isset($input['auto_open']) ? 1 : 0;
        
        // Validación de estilos
        if (isset($input['styles']) && is_array($input['styles'])) {
            foreach ($input['styles'] as $key => $value) {
                if (in_array($key, array('sidebar_width'))) {
                    $output['styles'][$key] = sanitize_text_field($value);
                } elseif (in_array($key, array('header_background', 'header_text_color', 'product_text_color', 'button_background', 'button_text_color', 'products_background', 'related_section_background', 'footer_background'))) {
                    $output['styles'][$key] = sanitize_hex_color($value);
                }
            }
        }
        
        // Validación de las opciones del preloader
        if (isset($input['preloader']) && is_array($input['preloader'])) {
            // Tipo de preloader
            $valid_types = array('circle', 'square', 'dots', 'spinner');
            $output['preloader']['type'] = isset($input['preloader']['type']) && in_array($input['preloader']['type'], $valid_types) 
                ? $input['preloader']['type'] 
                : 'circle';
            
            // Tamaño del preloader
            $output['preloader']['size'] = isset($input['preloader']['size']) 
                ? sanitize_text_field($input['preloader']['size']) 
                : '40px';
            
            // Colores del preloader
            $output['preloader']['color'] = isset($input['preloader']['color']) 
                ? sanitize_hex_color($input['preloader']['color']) 
                : '#3498db';
            
            $output['preloader']['color2'] = isset($input['preloader']['color2']) 
                ? sanitize_hex_color($input['preloader']['color2']) 
                : '#e74c3c';
            
            // Posición del preloader
            $valid_positions = array('center', 'top-left', 'top-right', 'bottom-left', 'bottom-right');
            $output['preloader']['position'] = isset($input['preloader']['position']) && in_array($input['preloader']['position'], $valid_positions) 
                ? $input['preloader']['position'] 
                : 'center';
        }
        
        // Validación de las opciones de animaciones
        if (isset($input['animations']) && is_array($input['animations'])) {
            // Duración de la animación
            $output['animations']['duration'] = isset($input['animations']['duration']) 
                ? intval($input['animations']['duration']) 
                : 300;
            
            // Verificar límites
            if ($output['animations']['duration'] < 100) {
                $output['animations']['duration'] = 100;
            } elseif ($output['animations']['duration'] > 2000) {
                $output['animations']['duration'] = 2000;
            }
            
            // Delay de actualización de cantidad
            $output['animations']['quantity_update_delay'] = isset($input['animations']['quantity_update_delay']) 
                ? intval($input['animations']['quantity_update_delay']) 
                : 200;
            
            // Verificar límites
            if ($output['animations']['quantity_update_delay'] < 0) {
                $output['animations']['quantity_update_delay'] = 0;
            } elseif ($output['animations']['quantity_update_delay'] > 1000) {
                $output['animations']['quantity_update_delay'] = 1000;
            }
            
            // Posición de nuevos productos
            $valid_positions = array('top', 'bottom');
            $output['animations']['new_product_position'] = isset($input['animations']['new_product_position']) && in_array($input['animations']['new_product_position'], $valid_positions) 
                ? $input['animations']['new_product_position'] 
                : 'top';
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
        
        // Validar el número de slides a desplazar
        if (isset($input['related_products']['slides_to_scroll'])) {
            $output['related_products']['slides_to_scroll'] = intval($input['related_products']['slides_to_scroll']);
            if ($output['related_products']['slides_to_scroll'] < 1) {
                $output['related_products']['slides_to_scroll'] = 1;
            } elseif ($output['related_products']['slides_to_scroll'] > 5) {
                $output['related_products']['slides_to_scroll'] = 5;
            }
        }
        
        // Validar badge "Last chance"
        $output['related_products']['show_last_chance'] = isset($input['related_products']['show_last_chance']) ? 1 : 0;
        
        // Validar el límite de stock para "Last chance"
        if (isset($input['related_products']['last_chance_stock_limit'])) {
            $output['related_products']['last_chance_stock_limit'] = intval($input['related_products']['last_chance_stock_limit']);
            if ($output['related_products']['last_chance_stock_limit'] < 1) {
                $output['related_products']['last_chance_stock_limit'] = 1;
            } elseif ($output['related_products']['last_chance_stock_limit'] > 20) {
                $output['related_products']['last_chance_stock_limit'] = 20;
            }
        }
        
        // Validar título del badge
        if (isset($input['related_products']['last_chance_title'])) {
            $output['related_products']['last_chance_title'] = sanitize_text_field($input['related_products']['last_chance_title']);
        }
        
        // Validar el color de fondo del badge
        if (isset($input['related_products']['last_chance_bg_color'])) {
            $output['related_products']['last_chance_bg_color'] = sanitize_hex_color($input['related_products']['last_chance_bg_color']);
        }
        
        // Validar el color de texto del badge
        if (isset($input['related_products']['last_chance_text_color'])) {
            $output['related_products']['last_chance_text_color'] = sanitize_hex_color($input['related_products']['last_chance_text_color']);
        }

        // Procesamos los checkboxes para pestañas activas
        if (isset($input['related_products']['active_tabs_arr']) && is_array($input['related_products']['active_tabs_arr'])) {
            $active_tabs = array_map('sanitize_text_field', $input['related_products']['active_tabs_arr']);
            $output['related_products']['active_tabs'] = implode(',', $active_tabs);
        } elseif (isset($input['related_products']['active_tabs'])) {
            // Compatibilidad con el formato anterior
            $output['related_products']['active_tabs'] = sanitize_text_field($input['related_products']['active_tabs']);
        }

        if (isset($input['related_products']['custom_tab_label'])) {
            $output['related_products']['custom_tab_label'] = sanitize_text_field($input['related_products']['custom_tab_label']);
        }

        if (isset($input['related_products']['custom_query'])) {
            $output['related_products']['custom_query'] = sanitize_textarea_field($input['related_products']['custom_query']);
        }
        
        return $output;
    }
}
