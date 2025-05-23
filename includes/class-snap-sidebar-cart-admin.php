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
            wp_enqueue_code_editor(array('type' => 'text/html'));
        }
        
        wp_enqueue_media();
        
        wp_enqueue_script('snap-sidebar-cart-admin', SNAP_SIDEBAR_CART_URL . 'admin/js/snap-sidebar-cart-admin.js', array('jquery', 'wp-color-picker'), SNAP_SIDEBAR_CART_VERSION, false);
        
        // Pasar variables al script
        wp_localize_script('snap-sidebar-cart-admin', 'snap_sidebar_cart_admin', array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('snap_sidebar_cart_admin_nonce'),
        ));
    }

    /**
     * Registra la página de opciones del plugin en el menú de administración.
     *
     * @since    1.0.0
     */
    public function add_plugin_admin_menu() {
        add_options_page(
            __('Configuración de Snap Sidebar Cart', 'snap-sidebar-cart'),
            __('Snap Sidebar Cart', 'snap-sidebar-cart'),
            'manage_options',
            'snap-sidebar-cart-settings',
            array($this, 'display_plugin_admin_page')
        );
    }

    /**
     * Registra las secciones y campos de configuración.
     *
     * @since    1.0.0
     */
    public function register_settings() {
        register_setting(
            'snap_sidebar_cart_options',
            'snap_sidebar_cart_options',
            array($this, 'validate_options')
        );
        
        // Sección General
        add_settings_section(
            'snap_sidebar_cart_general_section',
            __('Configuración General', 'snap-sidebar-cart'),
            array($this, 'general_section_callback'),
            'snap-sidebar-cart-settings-general'
        );
        
        // Campos de la sección general
        add_settings_field(
            'snap_cart_title',
            __('Título del carrito', 'snap-sidebar-cart'),
            array($this, 'title_callback'),
            'snap-sidebar-cart-settings-general',
            'snap_sidebar_cart_general_section'
        );
        
        add_settings_field(
            'snap_cart_container_selector',
            __('Selector del contenedor', 'snap-sidebar-cart'),
            array($this, 'container_selector_callback'),
            'snap-sidebar-cart-settings-general',
            'snap_sidebar_cart_general_section'
        );
        
        add_settings_field(
            'snap_cart_activation_selectors',
            __('Selectores de activación', 'snap-sidebar-cart'),
            array($this, 'activation_selectors_callback'),
            'snap-sidebar-cart-settings-general',
            'snap_sidebar_cart_general_section'
        );
        
        add_settings_field(
            'snap_cart_show_shipping',
            __('Mostrar información de envío', 'snap-sidebar-cart'),
            array($this, 'show_shipping_callback'),
            'snap-sidebar-cart-settings-general',
            'snap_sidebar_cart_general_section'
        );
        
        add_settings_field(
            'snap_cart_show_delete_icon_top',
            __('Mostrar icono de eliminación rápida', 'snap-sidebar-cart'),
            array($this, 'show_delete_icon_top_callback'),
            'snap-sidebar-cart-settings-general',
            'snap_sidebar_cart_general_section'
        );
        
        add_settings_field(
            'snap_cart_auto_open',
            __('Abrir automáticamente', 'snap-sidebar-cart'),
            array($this, 'auto_open_callback'),
            'snap-sidebar-cart-settings-general',
            'snap_sidebar_cart_general_section'
        );
        
        add_settings_field(
            'snap_cart_banner_enable',
            __('Mostrar banner informativo', 'snap-sidebar-cart'),
            array($this, 'banner_enable_callback'),
            'snap-sidebar-cart-settings-general',
            'snap_sidebar_cart_general_section'
        );
        
        add_settings_field(
            'snap_cart_banner_content',
            __('Contenido del banner', 'snap-sidebar-cart'),
            array($this, 'banner_content_callback'),
            'snap-sidebar-cart-settings-general',
            'snap_sidebar_cart_general_section'
        );
        
        add_settings_field(
            'snap_cart_delivery_time_text',
            __('Texto de tiempo de entrega', 'snap-sidebar-cart'),
            array($this, 'delivery_time_text_callback'),
            'snap-sidebar-cart-settings-general',
            'snap_sidebar_cart_general_section'
        );
        
        add_settings_field(
            'snap_cart_show_delivery_time',
            __('Mostrar tiempo de entrega', 'snap-sidebar-cart'),
            array($this, 'show_delivery_time_callback'),
            'snap-sidebar-cart-settings-general',
            'snap_sidebar_cart_general_section'
        );
        
        // Sección de Estilos
        add_settings_section(
            'snap_sidebar_cart_styles_section',
            __('Estilos del Carrito', 'snap-sidebar-cart'),
            array($this, 'styles_section_callback'),
            'snap-sidebar-cart-settings-styles'
        );
        
        // Campos de la sección de estilos
        add_settings_field(
            'snap_cart_sidebar_width',
            __('Ancho del carrito', 'snap-sidebar-cart'),
            array($this, 'sidebar_width_callback'),
            'snap-sidebar-cart-settings-styles',
            'snap_sidebar_cart_styles_section'
        );
        
        add_settings_field(
            'snap_cart_products_background',
            __('Fondo de la sección de productos', 'snap-sidebar-cart'),
            array($this, 'products_background_callback'),
            'snap-sidebar-cart-settings-styles',
            'snap_sidebar_cart_styles_section'
        );
        
        add_settings_field(
            'snap_cart_related_section_background',
            __('Fondo de la sección de productos relacionados', 'snap-sidebar-cart'),
            array($this, 'related_section_background_callback'),
            'snap-sidebar-cart-settings-styles',
            'snap_sidebar_cart_styles_section'
        );
        
        add_settings_field(
            'snap_cart_footer_background',
            __('Fondo del pie', 'snap-sidebar-cart'),
            array($this, 'footer_background_callback'),
            'snap-sidebar-cart-settings-styles',
            'snap_sidebar_cart_styles_section'
        );
        
        add_settings_field(
            'snap_cart_header_background',
            __('Fondo de la cabecera', 'snap-sidebar-cart'),
            array($this, 'header_background_callback'),
            'snap-sidebar-cart-settings-styles',
            'snap_sidebar_cart_styles_section'
        );
        
        add_settings_field(
            'snap_cart_header_text_color',
            __('Color de texto de la cabecera', 'snap-sidebar-cart'),
            array($this, 'header_text_color_callback'),
            'snap-sidebar-cart-settings-styles',
            'snap_sidebar_cart_styles_section'
        );
        
        add_settings_field(
            'snap_cart_product_text_color',
            __('Color de texto de productos', 'snap-sidebar-cart'),
            array($this, 'product_text_color_callback'),
            'snap-sidebar-cart-settings-styles',
            'snap_sidebar_cart_styles_section'
        );
        
        add_settings_field(
            'snap_cart_button_background',
            __('Fondo de botones', 'snap-sidebar-cart'),
            array($this, 'button_background_callback'),
            'snap-sidebar-cart-settings-styles',
            'snap_sidebar_cart_styles_section'
        );
        
        add_settings_field(
            'snap_cart_button_text_color',
            __('Color de texto de botones', 'snap-sidebar-cart'),
            array($this, 'button_text_color_callback'),
            'snap-sidebar-cart-settings-styles',
            'snap_sidebar_cart_styles_section'
        );
        
        // Sección de Preloader
        add_settings_section(
            'snap_sidebar_cart_preloader_section',
            __('Configuración del Preloader', 'snap-sidebar-cart'),
            array($this, 'preloader_section_callback'),
            'snap-sidebar-cart-settings-preloader'
        );
        
        // Campos de la sección de preloader
        add_settings_field(
            'snap_cart_preloader_type',
            __('Tipo de preloader', 'snap-sidebar-cart'),
            array($this, 'preloader_type_callback'),
            'snap-sidebar-cart-settings-preloader',
            'snap_sidebar_cart_preloader_section'
        );
        
        add_settings_field(
            'snap_cart_preloader_size',
            __('Tamaño del preloader', 'snap-sidebar-cart'),
            array($this, 'preloader_size_callback'),
            'snap-sidebar-cart-settings-preloader',
            'snap_sidebar_cart_preloader_section'
        );
        
        add_settings_field(
            'snap_cart_preloader_color',
            __('Color principal', 'snap-sidebar-cart'),
            array($this, 'preloader_color_callback'),
            'snap-sidebar-cart-settings-preloader',
            'snap_sidebar_cart_preloader_section'
        );
        
        add_settings_field(
            'snap_cart_preloader_color2',
            __('Color secundario', 'snap-sidebar-cart'),
            array($this, 'preloader_color2_callback'),
            'snap-sidebar-cart-settings-preloader',
            'snap_sidebar_cart_preloader_section'
        );
        
        add_settings_field(
            'snap_cart_preloader_position',
            __('Posición del preloader', 'snap-sidebar-cart'),
            array($this, 'preloader_position_callback'),
            'snap-sidebar-cart-settings-preloader',
            'snap_sidebar_cart_preloader_section'
        );
        
        // Sección de Animaciones
        add_settings_section(
            'snap_sidebar_cart_animations_section',
            __('Configuración de Animaciones', 'snap-sidebar-cart'),
            array($this, 'animations_section_callback'),
            'snap-sidebar-cart-settings-animations'
        );
        
        // Campos de la sección de animaciones
        add_settings_field(
            'snap_cart_animations_duration',
            __('Duración de la animación (ms)', 'snap-sidebar-cart'),
            array($this, 'animations_duration_callback'),
            'snap-sidebar-cart-settings-animations',
            'snap_sidebar_cart_animations_section'
        );
        
        add_settings_field(
            'snap_cart_animations_quantity_update_delay',
            __('Delay para actualización de cantidad (ms)', 'snap-sidebar-cart'),
            array($this, 'animations_quantity_update_delay_callback'),
            'snap-sidebar-cart-settings-animations',
            'snap_sidebar_cart_animations_section'
        );
        
        add_settings_field(
            'snap_cart_animations_new_product_position',
            __('Posición de nuevos productos', 'snap-sidebar-cart'),
            array($this, 'animations_new_product_position_callback'),
            'snap-sidebar-cart-settings-animations',
            'snap_sidebar_cart_animations_section'
        );
        
        // Sección de Productos Relacionados
        add_settings_section(
            'snap_sidebar_cart_related_products_section',
            __('Configuración de Productos Relacionados', 'snap-sidebar-cart'),
            array($this, 'related_products_section_callback'),
            'snap-sidebar-cart-settings-related'
        );
        
        // Campos de la sección de productos relacionados
        add_settings_field(
            'snap_cart_related_products_show',
            __('Mostrar productos relacionados', 'snap-sidebar-cart'),
            array($this, 'related_products_show_callback'),
            'snap-sidebar-cart-settings-related',
            'snap_sidebar_cart_related_products_section'
        );
        
        add_settings_field(
            'snap_cart_related_products_count',
            __('Número de productos', 'snap-sidebar-cart'),
            array($this, 'related_products_count_callback'),
            'snap-sidebar-cart-settings-related',
            'snap_sidebar_cart_related_products_section'
        );
        
        add_settings_field(
            'snap_cart_related_products_columns',
            __('Columnas', 'snap-sidebar-cart'),
            array($this, 'related_products_columns_callback'),
            'snap-sidebar-cart-settings-related',
            'snap_sidebar_cart_related_products_section'
        );
        
        add_settings_field(
            'snap_cart_related_products_orderby',
            __('Ordenar por', 'snap-sidebar-cart'),
            array($this, 'related_products_orderby_callback'),
            'snap-sidebar-cart-settings-related',
            'snap_sidebar_cart_related_products_section'
        );
        
        add_settings_field(
            'snap_cart_related_products_slides_to_scroll',
            __('Slides a desplazar', 'snap-sidebar-cart'),
            array($this, 'related_products_slides_to_scroll_callback'),
            'snap-sidebar-cart-settings-related',
            'snap_sidebar_cart_related_products_section'
        );
        
        // Campos para el badge "Last chance"
        add_settings_field(
            'snap_cart_related_products_show_last_chance',
            __('Mostrar badge "Última oportunidad"', 'snap-sidebar-cart'),
            array($this, 'related_products_show_last_chance_callback'),
            'snap-sidebar-cart-settings-related',
            'snap_sidebar_cart_related_products_section'
        );
        
        add_settings_field(
            'snap_cart_related_products_last_chance_stock_limit',
            __('Límite de stock para "Última oportunidad"', 'snap-sidebar-cart'),
            array($this, 'related_products_last_chance_stock_limit_callback'),
            'snap-sidebar-cart-settings-related',
            'snap_sidebar_cart_related_products_section'
        );
        
        add_settings_field(
            'snap_cart_related_products_last_chance_title',
            __('Título del badge', 'snap-sidebar-cart'),
            array($this, 'related_products_last_chance_title_callback'),
            'snap-sidebar-cart-settings-related',
            'snap_sidebar_cart_related_products_section'
        );
        
        add_settings_field(
            'snap_cart_related_products_last_chance_bg_color',
            __('Color de fondo del badge', 'snap-sidebar-cart'),
            array($this, 'related_products_last_chance_bg_color_callback'),
            'snap-sidebar-cart-settings-related',
            'snap_sidebar_cart_related_products_section'
        );
        
        add_settings_field(
            'snap_cart_related_products_last_chance_text_color',
            __('Color de texto del badge', 'snap-sidebar-cart'),
            array($this, 'related_products_last_chance_text_color_callback'),
            'snap-sidebar-cart-settings-related',
            'snap_sidebar_cart_related_products_section'
        );
        
        // Campos para pestañas personalizadas
        add_settings_field(
            'snap_cart_related_products_active_tabs',
            __('Pestañas activas', 'snap-sidebar-cart'),
            array($this, 'related_products_active_tabs_callback'),
            'snap-sidebar-cart-settings-related',
            'snap_sidebar_cart_related_products_section'
        );
        
        add_settings_field(
            'snap_cart_related_products_custom_tab_label',
            __('Etiqueta de pestaña personalizada', 'snap-sidebar-cart'),
            array($this, 'related_products_custom_tab_label_callback'),
            'snap-sidebar-cart-settings-related',
            'snap_sidebar_cart_related_products_section'
        );
        
        add_settings_field(
            'snap_cart_related_products_custom_query',
            __('Query personalizada', 'snap-sidebar-cart'),
            array($this, 'related_products_custom_query_callback'),
            'snap-sidebar-cart-settings-related',
            'snap_sidebar_cart_related_products_section'
        );
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
        $output['show_delete_icon_top'] = isset($input['show_delete_icon_top']) ? 1 : 0;
        $output['auto_open'] = isset($input['auto_open']) ? 1 : 0;
        $output['banner_enable'] = isset($input['banner_enable']) ? 1 : 0;
        
        // Validación de las opciones del icono de eliminación
        if (isset($input['delete_icon_type'])) {
            $output['delete_icon_type'] = sanitize_text_field($input['delete_icon_type']);
        }
        
        if (isset($input['delete_icon_size'])) {
            $output['delete_icon_size'] = sanitize_text_field($input['delete_icon_size']);
        }
        
        if (isset($input['delete_icon_color'])) {
            $output['delete_icon_color'] = sanitize_hex_color($input['delete_icon_color']);
        }
        
        if (isset($input['delete_icon_hover_color'])) {
            $output['delete_icon_hover_color'] = sanitize_hex_color($input['delete_icon_hover_color']);
        }
        
        // Validación del contenido del banner
        if (isset($input['banner_content'])) {
            $output['banner_content'] = wp_kses_post($input['banner_content']);
        }
        
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
        
        // Validación del preloader
        if (isset($input['preloader']) && is_array($input['preloader'])) {
            // Tipo de preloader
            $valid_types = array('circle', 'square', 'dots', 'spinner');
            if (isset($input['preloader']['type']) && in_array($input['preloader']['type'], $valid_types)) {
                $output['preloader']['type'] = $input['preloader']['type'];
            }
            
            // Tamaño del preloader
            if (isset($input['preloader']['size'])) {
                $output['preloader']['size'] = sanitize_text_field($input['preloader']['size']);
            }
            
            // Colores del preloader
            if (isset($input['preloader']['color'])) {
                $output['preloader']['color'] = sanitize_hex_color($input['preloader']['color']);
            }
            
            if (isset($input['preloader']['color2'])) {
                $output['preloader']['color2'] = sanitize_hex_color($input['preloader']['color2']);
            }
            
            // Posición del preloader
            $valid_positions = array('center', 'top-left', 'top-right', 'bottom-left', 'bottom-right');
            if (isset($input['preloader']['position']) && in_array($input['preloader']['position'], $valid_positions)) {
                $output['preloader']['position'] = $input['preloader']['position'];
            }
        }
        
        // Validación de animaciones
        if (isset($input['animations']) && is_array($input['animations'])) {
            // Duración de la animación
            if (isset($input['animations']['duration'])) {
                $output['animations']['duration'] = intval($input['animations']['duration']);
                if ($output['animations']['duration'] < 100) {
                    $output['animations']['duration'] = 100;
                } elseif ($output['animations']['duration'] > 2000) {
                    $output['animations']['duration'] = 2000;
                }
            }
            
            // Delay de actualización
            if (isset($input['animations']['quantity_update_delay'])) {
                $output['animations']['quantity_update_delay'] = intval($input['animations']['quantity_update_delay']);
                if ($output['animations']['quantity_update_delay'] < 0) {
                    $output['animations']['quantity_update_delay'] = 0;
                } elseif ($output['animations']['quantity_update_delay'] > 1000) {
                    $output['animations']['quantity_update_delay'] = 1000;
                }
            }
            
            // Posición de nuevos productos
            $valid_positions = array('top', 'bottom');
            if (isset($input['animations']['new_product_position']) && in_array($input['animations']['new_product_position'], $valid_positions)) {
                $output['animations']['new_product_position'] = $input['animations']['new_product_position'];
            }
        }
        
        // Validación de productos relacionados
        if (isset($input['related_products'])) {
            // Mostrar productos relacionados
            $output['related_products']['show'] = isset($input['related_products']['show']) ? 1 : 0;
            
            // Número de productos
            if (isset($input['related_products']['count'])) {
                $output['related_products']['count'] = intval($input['related_products']['count']);
                if ($output['related_products']['count'] < 1) {
                    $output['related_products']['count'] = 1;
                } elseif ($output['related_products']['count'] > 12) {
                    $output['related_products']['count'] = 12;
                }
            }
            
            // Columnas
            if (isset($input['related_products']['columns'])) {
                $output['related_products']['columns'] = intval($input['related_products']['columns']);
                if ($output['related_products']['columns'] < 1) {
                    $output['related_products']['columns'] = 1;
                } elseif ($output['related_products']['columns'] > 4) {
                    $output['related_products']['columns'] = 4;
                }
            }
            
            // Ordenación
            if (isset($input['related_products']['orderby'])) {
                $valid_orderby = array('rand', 'date', 'price', 'popularity', 'rating');
                $output['related_products']['orderby'] = in_array($input['related_products']['orderby'], $valid_orderby) ? $input['related_products']['orderby'] : 'rand';
            }
            
            // Slides a desplazar
            if (isset($input['related_products']['slides_to_scroll'])) {
                $output['related_products']['slides_to_scroll'] = intval($input['related_products']['slides_to_scroll']);
                if ($output['related_products']['slides_to_scroll'] < 1) {
                    $output['related_products']['slides_to_scroll'] = 1;
                } elseif ($output['related_products']['slides_to_scroll'] > 5) {
                    $output['related_products']['slides_to_scroll'] = 5;
                }
            }
            
            // Badge "Last chance"
            $output['related_products']['show_last_chance'] = isset($input['related_products']['show_last_chance']) ? 1 : 0;
            
            // Límite de stock
            if (isset($input['related_products']['last_chance_stock_limit'])) {
                $output['related_products']['last_chance_stock_limit'] = intval($input['related_products']['last_chance_stock_limit']);
                if ($output['related_products']['last_chance_stock_limit'] < 1) {
                    $output['related_products']['last_chance_stock_limit'] = 1;
                } elseif ($output['related_products']['last_chance_stock_limit'] > 20) {
                    $output['related_products']['last_chance_stock_limit'] = 20;
                }
            }
            
            // Título del badge
            if (isset($input['related_products']['last_chance_title'])) {
                $output['related_products']['last_chance_title'] = sanitize_text_field($input['related_products']['last_chance_title']);
            }
            
            // Color de fondo del badge
            if (isset($input['related_products']['last_chance_bg_color'])) {
                $output['related_products']['last_chance_bg_color'] = sanitize_hex_color($input['related_products']['last_chance_bg_color']);
            }
            
            // Color de texto del badge
            if (isset($input['related_products']['last_chance_text_color'])) {
                $output['related_products']['last_chance_text_color'] = sanitize_hex_color($input['related_products']['last_chance_text_color']);
            }
            
            // Pestañas activas
            if (isset($input['related_products']['active_tabs_arr']) && is_array($input['related_products']['active_tabs_arr'])) {
                $active_tabs = array_map('sanitize_text_field', $input['related_products']['active_tabs_arr']);
                $output['related_products']['active_tabs'] = implode(',', $active_tabs);
            } elseif (isset($input['related_products']['active_tabs'])) {
                $output['related_products']['active_tabs'] = sanitize_text_field($input['related_products']['active_tabs']);
            }
            
            // Etiqueta personalizada
            if (isset($input['related_products']['custom_tab_label'])) {
                $output['related_products']['custom_tab_label'] = sanitize_text_field($input['related_products']['custom_tab_label']);
            }
            
            // Query personalizada
            // Manejar queries personalizadas múltiples
            if (isset($input['related_products']['custom_queries']) && is_array($input['related_products']['custom_queries'])) {
                $output['related_products']['custom_queries'] = array();
                
                foreach ($input['related_products']['custom_queries'] as $index => $query) {
                    if (isset($query['name']) && isset($query['code'])) {
                        $output['related_products']['custom_queries'][$index] = array(
                            'name' => sanitize_text_field($query['name']),
                            'code' => sanitize_textarea_field($query['code'])
                        );
                    }
                }
            }
            
            // Mantener compatibilidad con la versión anterior (query única)
            if (isset($input['related_products']['custom_query'])) {
                $output['related_products']['custom_query'] = sanitize_textarea_field($input['related_products']['custom_query']);
            }
        }
        
        // Fusionar con las opciones existentes para preservar valores no presentes en el input
        $existing_options = get_option('snap_sidebar_cart_options', array());
        $output = array_merge($existing_options, $output);
        
        return $output;
    }
    
    /**
     * Muestra la página de configuración del plugin.
     *
     * @since    1.0.0
     */
    public function display_plugin_admin_page() {
        include_once SNAP_SIDEBAR_CART_PATH . 'admin/partials/snap-sidebar-cart-admin-display.php';
    }
    
    /**
     * Callback para la sección general.
     *
     * @since    1.0.0
     */
    public function general_section_callback() {
        echo '<p>' . __('Configura las opciones generales del carrito lateral.', 'snap-sidebar-cart') . '</p>';
    }
    
    /**
     * Callback para el campo de título.
     *
     * @since    1.0.0
     */
    public function title_callback() {
        $value = isset($this->options['title']) ? $this->options['title'] : '';
        echo '<input type="text" name="snap_sidebar_cart_options[title]" value="' . $value . '" class="regular-text">';
    }
    
    /**
     * Callback para el campo de selector del contenedor.
     *
     * @since    1.0.0
     */
    public function container_selector_callback() {
        $value = isset($this->options['container_selector']) ? $this->options['container_selector'] : 'snap-sidebar-cart';
        echo '<input type="text" name="snap_sidebar_cart_options[container_selector]" value="' . $value . '" class="regular-text">';
    }
    
    /**
     * Callback para el campo de selectores de activación.
     *
     * @since    1.0.0
     */
    public function activation_selectors_callback() {
        $value = isset($this->options['activation_selectors']) ? $this->options['activation_selectors'] : '.cart-contents, .cart-link, .site-header-cart .cart-contents, a.cart-contents, .cart-icon';
        echo '<input type="text" name="snap_sidebar_cart_options[activation_selectors]" value="' . $value . '" class="large-text">';
    }
    
    /**
     * Callback para el campo de mostrar información de envío.
     *
     * @since    1.0.0
     */
    public function show_shipping_callback() {
        $checked = isset($this->options['show_shipping']) && $this->options['show_shipping'] ? 'checked' : '';
        echo '<input type="checkbox" name="snap_sidebar_cart_options[show_shipping]" value="1" ' . $checked . '>';
    }
    
    /**
     * Callback para el campo de mostrar icono de eliminación rápida.
     *
     * @since    1.0.0
     */
    public function show_delete_icon_top_callback() {
        $checked = isset($this->options['show_delete_icon_top']) && $this->options['show_delete_icon_top'] ? 'checked' : '';
        echo '<input type="checkbox" name="snap_sidebar_cart_options[show_delete_icon_top]" value="1" ' . $checked . '>';
    }
    
    /**
     * Callback para el campo de abrir automáticamente.
     *
     * @since    1.0.0
     */
    public function auto_open_callback() {
        $checked = isset($this->options['auto_open']) && $this->options['auto_open'] ? 'checked' : '';
        echo '<input type="checkbox" name="snap_sidebar_cart_options[auto_open]" value="1" ' . $checked . '>';
    }
    
    /**
     * Callback para el campo de mostrar banner informativo.
     *
     * @since    1.0.0
     */
    public function banner_enable_callback() {
        $checked = isset($this->options['banner_enable']) && $this->options['banner_enable'] ? 'checked' : '';
        echo '<input type="checkbox" name="snap_sidebar_cart_options[banner_enable]" value="1" ' . $checked . '>';
    }
    
    /**
     * Callback para el campo de contenido del banner.
     *
     * @since    1.0.0
     */
    public function banner_content_callback() {
        $content = isset($this->options['banner_content']) ? $this->options['banner_content'] : '';
        wp_editor($content, 'snap_cart_banner_content', array(
            'textarea_name' => 'snap_sidebar_cart_options[banner_content]',
            'textarea_rows' => 5,
            'media_buttons' => false,
            'teeny' => true,
        ));
    }
    
    /**
     * Callback para el campo de texto de tiempo de entrega.
     *
     * @since    1.0.0
     */
    public function delivery_time_text_callback() {
        $value = isset($this->options['delivery_time_text']) ? $this->options['delivery_time_text'] : __('Entrega en 1-3 días hábiles', 'snap-sidebar-cart');
        echo '<input type="text" name="snap_sidebar_cart_options[delivery_time_text]" value="' . $value . '" class="regular-text">';
    }
    
    /**
     * Callback para el campo de mostrar tiempo de entrega.
     *
     * @since    1.0.0
     */
    public function show_delivery_time_callback() {
        $checked = isset($this->options['show_delivery_time']) && $this->options['show_delivery_time'] ? 'checked' : '';
        echo '<input type="checkbox" name="snap_sidebar_cart_options[show_delivery_time]" value="1" ' . $checked . '>';
    }
    
    /**
     * Callback para la sección de estilos.
     *
     * @since    1.0.0
     */
    public function styles_section_callback() {
        echo '<p>' . __('Personaliza los estilos visuales del carrito lateral.', 'snap-sidebar-cart') . '</p>';
    }
    
    /**
     * Callback para el campo de ancho del carrito.
     *
     * @since    1.0.0
     */
    public function sidebar_width_callback() {
        $value = isset($this->options['styles']['sidebar_width']) ? $this->options['styles']['sidebar_width'] : '540px';
        echo '<input type="text" name="snap_sidebar_cart_options[styles][sidebar_width]" value="' . $value . '" class="small-text">';
    }
    
    /**
     * Callback para el campo de fondo de la sección de productos.
     *
     * @since    1.0.0
     */
    public function products_background_callback() {
        $value = isset($this->options['styles']['products_background']) ? $this->options['styles']['products_background'] : '#ffffff';
        echo '<input type="text" name="snap_sidebar_cart_options[styles][products_background]" value="' . $value . '" class="snap-sidebar-cart-color-picker">';
    }
    
    /**
     * Callback para el campo de fondo de la sección de productos relacionados.
     *
     * @since    1.0.0
     */
    public function related_section_background_callback() {
        $value = isset($this->options['styles']['related_section_background']) ? $this->options['styles']['related_section_background'] : '#f9f9f9';
        echo '<input type="text" name="snap_sidebar_cart_options[styles][related_section_background]" value="' . $value . '" class="snap-sidebar-cart-color-picker">';
    }
    
    /**
     * Callback para el campo de fondo del pie.
     *
     * @since    1.0.0
     */
    public function footer_background_callback() {
        $value = isset($this->options['styles']['footer_background']) ? $this->options['styles']['footer_background'] : '#f8f8f8';
        echo '<input type="text" name="snap_sidebar_cart_options[styles][footer_background]" value="' . $value . '" class="snap-sidebar-cart-color-picker">';
    }
    
    /**
     * Callback para el campo de fondo de la cabecera.
     *
     * @since    1.0.0
     */
    public function header_background_callback() {
        $value = isset($this->options['styles']['header_background']) ? $this->options['styles']['header_background'] : '#f8f8f8';
        echo '<input type="text" name="snap_sidebar_cart_options[styles][header_background]" value="' . $value . '" class="snap-sidebar-cart-color-picker">';
    }
    
    /**
     * Callback para el campo de color de texto de la cabecera.
     *
     * @since    1.0.0
     */
    public function header_text_color_callback() {
        $value = isset($this->options['styles']['header_text_color']) ? $this->options['styles']['header_text_color'] : '#333333';
        echo '<input type="text" name="snap_sidebar_cart_options[styles][header_text_color]" value="' . $value . '" class="snap-sidebar-cart-color-picker">';
    }
    
    /**
     * Callback para el campo de color de texto de productos.
     *
     * @since    1.0.0
     */
    public function product_text_color_callback() {
        $value = isset($this->options['styles']['product_text_color']) ? $this->options['styles']['product_text_color'] : '#333333';
        echo '<input type="text" name="snap_sidebar_cart_options[styles][product_text_color]" value="' . $value . '" class="snap-sidebar-cart-color-picker">';
    }
    
    /**
     * Callback para el campo de fondo de botones.
     *
     * @since    1.0.0
     */
    public function button_background_callback() {
        $value = isset($this->options['styles']['button_background']) ? $this->options['styles']['button_background'] : '#2c6aa0';
        echo '<input type="text" name="snap_sidebar_cart_options[styles][button_background]" value="' . $value . '" class="snap-sidebar-cart-color-picker">';
    }
    
    /**
     * Callback para el campo de color de texto de botones.
     *
     * @since    1.0.0
     */
    public function button_text_color_callback() {
        $value = isset($this->options['styles']['button_text_color']) ? $this->options['styles']['button_text_color'] : '#ffffff';
        echo '<input type="text" name="snap_sidebar_cart_options[styles][button_text_color]" value="' . $value . '" class="snap-sidebar-cart-color-picker">';
    }
    
    /**
     * Callback para la sección de preloader.
     *
     * @since    1.0.0
     */
    public function preloader_section_callback() {
        echo '<p>' . __('Configura las opciones del preloader que se muestra durante las operaciones AJAX.', 'snap-sidebar-cart') . '</p>';
    }
    
    /**
     * Callback para el campo de tipo de preloader.
     *
     * @since    1.0.0
     */
    public function preloader_type_callback() {
        $value = isset($this->options['preloader']['type']) ? $this->options['preloader']['type'] : 'circle';
        ?>
        <select name="snap_sidebar_cart_options[preloader][type]">
            <option value="circle" <?php selected($value, 'circle'); ?>><?php _e('Círculo', 'snap-sidebar-cart'); ?></option>
            <option value="square" <?php selected($value, 'square'); ?>><?php _e('Cuadrado', 'snap-sidebar-cart'); ?></option>
            <option value="dots" <?php selected($value, 'dots'); ?>><?php _e('Puntos', 'snap-sidebar-cart'); ?></option>
            <option value="spinner" <?php selected($value, 'spinner'); ?>><?php _e('Spinner', 'snap-sidebar-cart'); ?></option>
        </select>
        <?php
    }
    
    /**
     * Callback para el campo de tamaño del preloader.
     *
     * @since    1.0.0
     */
    public function preloader_size_callback() {
        $value = isset($this->options['preloader']['size']) ? $this->options['preloader']['size'] : '40px';
        echo '<input type="text" name="snap_sidebar_cart_options[preloader][size]" value="' . $value . '" class="small-text">';
    }
    
    /**
     * Callback para el campo de color principal del preloader.
     *
     * @since    1.0.0
     */
    public function preloader_color_callback() {
        $value = isset($this->options['preloader']['color']) ? $this->options['preloader']['color'] : '#3498db';
        echo '<input type="text" name="snap_sidebar_cart_options[preloader][color]" value="' . $value . '" class="snap-sidebar-cart-color-picker">';
    }
    
    /**
     * Callback para el campo de color secundario del preloader.
     *
     * @since    1.0.0
     */
    public function preloader_color2_callback() {
        $value = isset($this->options['preloader']['color2']) ? $this->options['preloader']['color2'] : '#e74c3c';
        echo '<input type="text" name="snap_sidebar_cart_options[preloader][color2]" value="' . $value . '" class="snap-sidebar-cart-color-picker">';
    }
    
    /**
     * Callback para el campo de posición del preloader.
     *
     * @since    1.0.0
     */
    public function preloader_position_callback() {
        $value = isset($this->options['preloader']['position']) ? $this->options['preloader']['position'] : 'center';
        ?>
        <select name="snap_sidebar_cart_options[preloader][position]">
            <option value="center" <?php selected($value, 'center'); ?>><?php _e('Centro', 'snap-sidebar-cart'); ?></option>
            <option value="top-left" <?php selected($value, 'top-left'); ?>><?php _e('Superior izquierda', 'snap-sidebar-cart'); ?></option>
            <option value="top-right" <?php selected($value, 'top-right'); ?>><?php _e('Superior derecha', 'snap-sidebar-cart'); ?></option>
            <option value="bottom-left" <?php selected($value, 'bottom-left'); ?>><?php _e('Inferior izquierda', 'snap-sidebar-cart'); ?></option>
            <option value="bottom-right" <?php selected($value, 'bottom-right'); ?>><?php _e('Inferior derecha', 'snap-sidebar-cart'); ?></option>
        </select>
        <?php
    }
    
    /**
     * Callback para la sección de animaciones.
     *
     * @since    1.0.0
     */
    public function animations_section_callback() {
        echo '<p>' . __('Configura las opciones de animación del carrito lateral.', 'snap-sidebar-cart') . '</p>';
    }
    
    /**
     * Callback para el campo de duración de la animación.
     *
     * @since    1.0.0
     */
    public function animations_duration_callback() {
        $value = isset($this->options['animations']['duration']) ? $this->options['animations']['duration'] : 300;
        echo '<input type="number" name="snap_sidebar_cart_options[animations][duration]" value="' . $value . '" class="small-text" min="100" max="2000" step="50">';
    }
    
    /**
     * Callback para el campo de delay para actualización de cantidad.
     *
     * @since    1.0.0
     */
    public function animations_quantity_update_delay_callback() {
        $value = isset($this->options['animations']['quantity_update_delay']) ? $this->options['animations']['quantity_update_delay'] : 200;
        echo '<input type="number" name="snap_sidebar_cart_options[animations][quantity_update_delay]" value="' . $value . '" class="small-text" min="0" max="1000" step="50">';
    }
    
    /**
     * Callback para el campo de posición de nuevos productos.
     *
     * @since    1.0.0
     */
    public function animations_new_product_position_callback() {
        $value = isset($this->options['animations']['new_product_position']) ? $this->options['animations']['new_product_position'] : 'top';
        ?>
        <select name="snap_sidebar_cart_options[animations][new_product_position]">
            <option value="top" <?php selected($value, 'top'); ?>><?php _e('Arriba', 'snap-sidebar-cart'); ?></option>
            <option value="bottom" <?php selected($value, 'bottom'); ?>><?php _e('Abajo', 'snap-sidebar-cart'); ?></option>
        </select>
        <?php
    }
    
    /**
     * Callback para la sección de productos relacionados.
     *
     * @since    1.0.0
     */
    public function related_products_section_callback() {
        echo '<p>' . __('Configura las opciones de productos relacionados que se muestran en el carrito lateral.', 'snap-sidebar-cart') . '</p>';
    }
    
    /**
     * Callback para el campo de mostrar productos relacionados.
     *
     * @since    1.0.0
     */
    public function related_products_show_callback() {
        $checked = isset($this->options['related_products']['show']) && $this->options['related_products']['show'] ? 'checked' : '';
        echo '<input type="checkbox" name="snap_sidebar_cart_options[related_products][show]" value="1" ' . $checked . '>';
    }
    
    /**
     * Callback para el campo de número de productos.
     *
     * @since    1.0.0
     */
    public function related_products_count_callback() {
        $value = isset($this->options['related_products']['count']) ? $this->options['related_products']['count'] : 4;
        echo '<input type="number" name="snap_sidebar_cart_options[related_products][count]" value="' . $value . '" class="small-text" min="1" max="12">';
    }
    
    /**
     * Callback para el campo de columnas.
     *
     * @since    1.0.0
     */
    public function related_products_columns_callback() {
        $value = isset($this->options['related_products']['columns']) ? $this->options['related_products']['columns'] : 2;
        ?>
        <select name="snap_sidebar_cart_options[related_products][columns]">
            <option value="1" <?php selected($value, 1); ?>>1</option>
            <option value="2" <?php selected($value, 2); ?>>2</option>
            <option value="3" <?php selected($value, 3); ?>>3</option>
            <option value="4" <?php selected($value, 4); ?>>4</option>
        </select>
        <?php
    }
    
    /**
     * Callback para el campo de ordenar por.
     *
     * @since    1.0.0
     */
    public function related_products_orderby_callback() {
        $value = isset($this->options['related_products']['orderby']) ? $this->options['related_products']['orderby'] : 'rand';
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
     * Callback para el campo de slides a desplazar.
     *
     * @since    1.0.0
     */
    public function related_products_slides_to_scroll_callback() {
        $value = isset($this->options['related_products']['slides_to_scroll']) ? $this->options['related_products']['slides_to_scroll'] : 2;
        echo '<input type="number" name="snap_sidebar_cart_options[related_products][slides_to_scroll]" value="' . $value . '" min="1" max="5" class="small-text">';
    }
    
    /**
     * Callback para el campo de mostrar badge "Última oportunidad".
     *
     * @since    1.0.0
     */
    public function related_products_show_last_chance_callback() {
        $checked = isset($this->options['related_products']['show_last_chance']) && $this->options['related_products']['show_last_chance'] ? 'checked' : '';
        echo '<input type="checkbox" name="snap_sidebar_cart_options[related_products][show_last_chance]" value="1" ' . $checked . '>';
    }
    
    /**
     * Callback para el campo de límite de stock para "Última oportunidad".
     *
     * @since    1.0.0
     */
    public function related_products_last_chance_stock_limit_callback() {
        $value = isset($this->options['related_products']['last_chance_stock_limit']) ? $this->options['related_products']['last_chance_stock_limit'] : 5;
        echo '<input type="number" name="snap_sidebar_cart_options[related_products][last_chance_stock_limit]" value="' . $value . '" class="small-text" min="1" max="20">';
    }
    
    /**
     * Callback para el campo de título del badge.
     *
     * @since    1.0.0
     */
    public function related_products_last_chance_title_callback() {
        $value = isset($this->options['related_products']['last_chance_title']) ? $this->options['related_products']['last_chance_title'] : __('ÚLTIMA OPORTUNIDAD', 'snap-sidebar-cart');
        echo '<input type="text" name="snap_sidebar_cart_options[related_products][last_chance_title]" value="' . $value . '" class="regular-text">';
    }
    
    /**
     * Callback para el campo de color de fondo del badge.
     *
     * @since    1.0.0
     */
    public function related_products_last_chance_bg_color_callback() {
        $value = isset($this->options['related_products']['last_chance_bg_color']) ? $this->options['related_products']['last_chance_bg_color'] : '#e74c3c';
        echo '<input type="text" name="snap_sidebar_cart_options[related_products][last_chance_bg_color]" value="' . $value . '" class="snap-sidebar-cart-color-picker">';
    }
    
    /**
     * Callback para el campo de color de texto del badge.
     *
     * @since    1.0.0
     */
    public function related_products_last_chance_text_color_callback() {
        $value = isset($this->options['related_products']['last_chance_text_color']) ? $this->options['related_products']['last_chance_text_color'] : '#ffffff';
        echo '<input type="text" name="snap_sidebar_cart_options[related_products][last_chance_text_color]" value="' . $value . '" class="snap-sidebar-cart-color-picker">';
    }
    
    /**
     * Callback para el campo de pestañas activas.
     *
     * @since    1.0.0
     */
    public function related_products_active_tabs_callback() {
        $active_tabs = isset($this->options['related_products']['active_tabs']) ? $this->options['related_products']['active_tabs'] : 'related,crosssells,upsells,bestsellers,featured,custom';
        $active_tabs_arr = explode(',', $active_tabs);
        
        $tabs = array(
            'related' => __('Misma categoría', 'snap-sidebar-cart'),
            'crosssells' => __('Ventas cruzadas', 'snap-sidebar-cart'),
            'upsells' => __('Ventas adicionales', 'snap-sidebar-cart'),
            'bestsellers' => __('Más vendidos', 'snap-sidebar-cart'),
            'featured' => __('Destacados', 'snap-sidebar-cart'),
            'custom' => __('Personalizada', 'snap-sidebar-cart'),
        );
        
        foreach ($tabs as $tab_key => $tab_label) {
            $checked = in_array($tab_key, $active_tabs_arr) ? 'checked' : '';
            echo '<label style="margin-right: 15px;"><input type="checkbox" name="snap_sidebar_cart_options[related_products][active_tabs_arr][]" value="' . $tab_key . '" ' . $checked . '> ' . $tab_label . '</label>';
        }
        
        // Campo oculto para almacenar las pestañas activas como string separado por comas
        echo '<input type="hidden" name="snap_sidebar_cart_options[related_products][active_tabs]" id="active_tabs_hidden" value="' . esc_attr($active_tabs) . '">';
    }
    
    /**
     * Callback para el campo de etiqueta de pestaña personalizada.
     *
     * @since    1.0.0
     */
    public function related_products_custom_tab_label_callback() {
        $value = isset($this->options['related_products']['custom_tab_label']) ? $this->options['related_products']['custom_tab_label'] : __('Personalizada', 'snap-sidebar-cart');
        echo '<input type="text" name="snap_sidebar_cart_options[related_products][custom_tab_label]" value="' . $value . '" class="regular-text">';
    }
    
    /**
     * Callback para el campo de query personalizada.
     *
     * @since    1.0.0
     */
    public function related_products_custom_query_callback() {
        // Sección para queries personalizadas adicionales
        echo '<h4>' . __('Pestañas personalizadas adicionales', 'snap-sidebar-cart') . '</h4>';
        echo '<p class="description">' . __('Puedes añadir pestañas personalizadas adicionales, cada una con su propia query PHP.', 'snap-sidebar-cart') . '</p>';
        
        // Campo de código para la query personalizada principal (mantener para compatibilidad)
        $value = isset($this->options['related_products']['custom_query']) ? $this->options['related_products']['custom_query'] : '';
        echo '<div class="custom-query-main">';
        echo '<h5>' . __('Query personalizada principal', 'snap-sidebar-cart') . '</h5>';
        echo '<textarea name="snap_sidebar_cart_options[related_products][custom_query]" rows="5" cols="50" class="large-text code">' . esc_textarea($value) . '</textarea>';
        echo '<p class="description">' . __('Código PHP para obtener IDs de productos. Debe devolver un array de IDs de productos.', 'snap-sidebar-cart') . '</p>';
        echo '</div>';
        
        // Mantener el campo original para compatibilidad (oculto)
        $custom_tab_label = isset($this->options['related_products']['custom_tab_label']) ? $this->options['related_products']['custom_tab_label'] : '';
        echo '<input type="hidden" name="snap_sidebar_cart_options[related_products][custom_tab_label]" value="' . esc_attr($custom_tab_label) . '">';
        
        // Obtener las queries personalizadas adicionales existentes
        $custom_queries = isset($this->options['related_products']['custom_queries']) && is_array($this->options['related_products']['custom_queries']) 
            ? $this->options['related_products']['custom_queries'] 
            : array();
        
        echo '<div id="custom-queries-container">';
        
        // Mostrar las queries existentes
        foreach ($custom_queries as $index => $query) {
            $name = isset($query['name']) ? $query['name'] : '';
            $code = isset($query['code']) ? $query['code'] : '';
            
            echo '<div class="custom-query-item" data-index="' . $index . '">';
            echo '<div class="custom-query-header">';
            echo '<label>' . __('Etiqueta de pestaña', 'snap-sidebar-cart') . '</label>';
            echo '<input type="text" name="snap_sidebar_cart_options[related_products][custom_queries][' . $index . '][name]" value="' . esc_attr($name) . '" class="regular-text custom-query-name" placeholder="' . esc_attr__('Precios similares', 'snap-sidebar-cart') . '">';
            
            // Botón para eliminar
            echo '<button type="button" class="button button-secondary remove-custom-query">' . __('Eliminar', 'snap-sidebar-cart') . '</button>';
            
            echo '</div>';
            
            echo '<label>' . __('Código PHP', 'snap-sidebar-cart') . '</label>';
            echo '<textarea name="snap_sidebar_cart_options[related_products][custom_queries][' . $index . '][code]" rows="5" cols="50" class="large-text code custom-query-code">' . esc_textarea($code) . '</textarea>';
            echo '<p class="description">' . __('Código PHP para obtener IDs de productos. Debe devolver un array de IDs de productos.', 'snap-sidebar-cart') . '</p>';
            echo '</div>';
        }
        
        echo '</div>';
        
        // Botón para añadir nueva query
        echo '<p><button type="button" id="add-custom-query" class="button button-secondary">' . __('Añadir otra pestaña personalizada', 'snap-sidebar-cart') . '</button></p>';
        
        // Template para nuevas queries (oculto)
        echo '<script type="text/template" id="custom-query-template">
            <div class="custom-query-item" data-index="{{index}}">
                <div class="custom-query-header">
                    <label>' . __('Etiqueta de pestaña', 'snap-sidebar-cart') . '</label>
                    <input type="text" name="snap_sidebar_cart_options[related_products][custom_queries][{{index}}][name]" value="" class="regular-text custom-query-name" placeholder="' . esc_attr__('Precios similares', 'snap-sidebar-cart') . '">
                    <button type="button" class="button button-secondary remove-custom-query">' . __('Eliminar', 'snap-sidebar-cart') . '</button>
                </div>
                <label>' . __('Código PHP', 'snap-sidebar-cart') . '</label>
                <textarea name="snap_sidebar_cart_options[related_products][custom_queries][{{index}}][code]" rows="5" cols="50" class="large-text code custom-query-code"></textarea>
                <p class="description">' . __('Código PHP para obtener IDs de productos. Debe devolver un array de IDs de productos.', 'snap-sidebar-cart') . '</p>
            </div>
        </script>';
        
        // Ejemplo de código
        echo '<details>';
        echo '<summary>' . __('Ver ejemplo', 'snap-sidebar-cart') . '</summary>';
        echo '<pre>$price = $current_product->get_price();
$min_price = $price * 0.8;  // 20% menos
$max_price = $price * 1.2;  // 20% más

$args = array(
    "post_type" => "product",
    "posts_per_page" => 4,
    "orderby" => "rand",
    "post__not_in" => array($product_id),
    "meta_query" => array(
        array(
            "key" => "_price",
            "value" => array($min_price, $max_price),
            "type" => "NUMERIC",
            "compare" => "BETWEEN"
        )
    )
);

$products = get_posts($args);
return wp_list_pluck($products, \'ID\');</pre>';
        echo '</details>';
    }

    /**
     * Añade enlaces de acción personalizados en la lista de plugins
     *
     * @since    1.0.0
     * @param    array   $links   Enlaces actuales
     * @return   array            Enlaces modificados
     */
    public function add_action_links($links) {
        // Puedes personalizar el enlace de ajustes aquí
        $settings_link = '<a href="options-general.php?page=snap-sidebar-cart-settings">' . __('Ajustes', 'snap-sidebar-cart') . '</a>';
        array_unshift($links, $settings_link);
        return $links;
    }
}