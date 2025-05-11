<?php
/**
 * La funcionalidad específica del área pública del plugin.
 *
 * @since      1.0.0
 */
class Snap_Sidebar_Cart_Public {

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
     * Registra los estilos para el área pública.
     *
     * @since    1.0.0
     */
    public function enqueue_styles() {
        // Cargar estilos en todas las páginas donde podría aparecer el carrito
        // Eliminamos las restricciones para asegurar que los estilos se carguen siempre
        
        // Forzar recarga eliminando la caché
        $version = SNAP_SIDEBAR_CART_VERSION . '.' . time();
        
        // Desregistrar estilos antiguos para evitar conflictos
        $styles_to_deregister = array(
            'snap-sidebar-cart-public',
            'snap-sidebar-cart-slider-fix',
            'snap-sidebar-cart-scroll-snap'
        );
        
        foreach ($styles_to_deregister as $style) {
            if (wp_style_is($style, 'registered')) {
                wp_deregister_style($style);
            }
        }
        
        // Cargar el CSS generado por Webpack
        wp_enqueue_style('snap-sidebar-cart-webpack', SNAP_SIDEBAR_CART_URL . 'assets/css/snap-sidebar-cart.css', array(), $version, 'all');
        
        // Mantener CSS de corrección para productos relacionados como dependencia
        wp_enqueue_style('snap-sidebar-cart-related-fix', SNAP_SIDEBAR_CART_URL . 'assets/css/related-products-fix.css', array('snap-sidebar-cart-webpack'), $version, 'all');
        
        // Estilos personalizados desde las opciones
        $custom_css = $this->generate_custom_css();
        $preloader_css = $this->generate_preloader_css();
        
        // Obtener la configuración de columnas del usuario
        $columns = isset($this->options['related_products']['columns']) ? 
            intval($this->options['related_products']['columns']) : 2;
        
        // CSS para aplicar la configuración de columnas del usuario
        $columns_fix_css = "
            .snap-sidebar-cart__related-slider .product,
            .snap-sidebar-cart__related-slider .snap-sidebar-cart__related-product {
                width: calc(" . (100 / $columns) . "% - 10px) !important;
                flex: 0 0 calc(" . (100 / $columns) . "% - 10px) !important;
                min-width: calc(" . (100 / $columns) . "% - 10px) !important;
                max-width: calc(" . (100 / $columns) . "% - 10px) !important;
                margin-right: 10px !important;
                scroll-snap-align: start !important;
            }
            
            .snap-sidebar-cart__related-container {
                position: relative;
                width: 100%;
                overflow: hidden;
            }
            
            .snap-sidebar-cart__related-slider {
                display: flex !important;
                overflow-x: auto !important;
                scroll-snap-type: x mandatory !important;
                -webkit-overflow-scrolling: touch !important;
                scrollbar-width: none !important;
                -ms-overflow-style: none !important;
                padding: 5px 0 !important;
            }
            
            .snap-sidebar-cart__related-slider::-webkit-scrollbar {
                display: none !important;
            }
            
            /* Clases específicas para diferentes configuraciones de columnas */
            .snap-sidebar-cart__columns-1 .product,
            .snap-sidebar-cart__columns-1 .snap-sidebar-cart__related-product {
                width: calc(100% - 10px) !important;
                flex: 0 0 calc(100% - 10px) !important;
            }
            
            .snap-sidebar-cart__columns-2 .product,
            .snap-sidebar-cart__columns-2 .snap-sidebar-cart__related-product {
                width: calc(50% - 10px) !important;
                flex: 0 0 calc(50% - 10px) !important;
            }
            
            .snap-sidebar-cart__columns-3 .product,
            .snap-sidebar-cart__columns-3 .snap-sidebar-cart__related-product {
                width: calc(33.333% - 10px) !important;
                flex: 0 0 calc(33.333% - 10px) !important;
            }
            
            .snap-sidebar-cart__columns-4 .product,
            .snap-sidebar-cart__columns-4 .snap-sidebar-cart__related-product {
                width: calc(25% - 10px) !important;
                flex: 0 0 calc(25% - 10px) !important;
            }
        ";
        
        wp_add_inline_style('snap-sidebar-cart-unified', $custom_css . $preloader_css . $columns_fix_css);
    }

    /**
     * Registrar los scripts y estilos para el área pública.
     *
     * @since    1.0.0
     */
    public function enqueue_scripts() {
        // Incluir scripts sólo si WooCommerce está activo
        if (!function_exists('WC')) {
            return;
        }
        
        // Forzar recarga eliminando la caché
        $version = SNAP_SIDEBAR_CART_VERSION . '.' . time();
        
        // Desregistrar completamente todos los scripts para evitar conflictos
        $scripts_to_deregister = array(
            'snap-sidebar-cart-public',
            'snap-sidebar-cart-ajax-handler',
            'snap-sidebar-cart-direct-fix',
            'snap-sidebar-cart-buttons-fix',
            'snap-sidebar-cart-slider-nav-fix',
            'snap-sidebar-cart-tabs-fix',
            'snap-sidebar-cart-preloader-fix',
            'snap-sidebar-cart-combined',
            'snap-sidebar-cart-immediate-fix'
        );
        
        foreach ($scripts_to_deregister as $script) {
            if (wp_script_is($script, 'registered')) {
                wp_deregister_script($script);
            }
        }
        
        // Cargar jQuery explícitamente
        wp_enqueue_script('jquery');
        
        // Opciones para el script con todos los parámetros necesarios
        $script_options = array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('snap-sidebar-cart-nonce'),
            'activation_selectors' => $this->options['activation_selectors'],
            'auto_open' => isset($this->options['auto_open']) ? $this->options['auto_open'] : false,
            'new_product_position' => isset($this->options['new_product_position']) ? $this->options['new_product_position'] : 'top',
            // Opciones de preloader
            'preloader' => array(
                'type' => isset($this->options['preloader']['type']) ? $this->options['preloader']['type'] : 'circle',
                'position' => isset($this->options['preloader']['position']) ? $this->options['preloader']['position'] : 'center',
                'size' => isset($this->options['preloader']['size']) ? $this->options['preloader']['size'] : '40px',
                'color' => isset($this->options['preloader']['color']) ? $this->options['preloader']['color'] : '#3498db',
                'color2' => isset($this->options['preloader']['color2']) ? $this->options['preloader']['color2'] : '#e74c3c'
            ),
            // Opciones para animaciones
            'animations' => array(
                'duration' => isset($this->options['animations']['duration']) ? intval($this->options['animations']['duration']) : 300,
                'quantity_update_delay' => isset($this->options['animations']['quantity_update_delay']) ? intval($this->options['animations']['quantity_update_delay']) : 200,
                'enabled' => isset($this->options['animations']['enabled']) ? (bool)$this->options['animations']['enabled'] : true
            ),
            // Opciones para productos relacionados - usar configuración del usuario
            'related' => array(
                'slides_to_scroll' => isset($this->options['related_products']['slides_to_scroll']) ? intval($this->options['related_products']['slides_to_scroll']) : 1,
                'products_per_page' => isset($this->options['related_products']['count']) ? intval($this->options['related_products']['count']) : 7,
                'columns_count' => isset($this->options['related_products']['columns']) ? intval($this->options['related_products']['columns']) : 2,
                'show_last_chance' => isset($this->options['related_products']['show_last_chance']) ? (bool)$this->options['related_products']['show_last_chance'] : true,
                'last_chance_stock_limit' => isset($this->options['related_products']['last_chance_stock_limit']) ? intval($this->options['related_products']['last_chance_stock_limit']) : 5,
                'last_chance_title' => isset($this->options['related_products']['last_chance_title']) ? $this->options['related_products']['last_chance_title'] : __('ÚLTIMA OPORTUNIDAD', 'snap-sidebar-cart'),
                'last_chance_bg_color' => isset($this->options['related_products']['last_chance_bg_color']) ? $this->options['related_products']['last_chance_bg_color'] : '#e74c3c',
                'last_chance_text_color' => isset($this->options['related_products']['last_chance_text_color']) ? $this->options['related_products']['last_chance_text_color'] : '#ffffff',
                'active_tabs' => isset($this->options['related_products']['active_tabs']) ? $this->options['related_products']['active_tabs'] : 'related,cross-sells',
                'custom_tab_label' => isset($this->options['related_products']['custom_tab_label']) ? $this->options['related_products']['custom_tab_label'] : __('Recomendados', 'snap-sidebar-cart'),
                'custom_query' => isset($this->options['related_products']['custom_query']) ? $this->options['related_products']['custom_query'] : ''
            ),
            // Configuración de Swiper - usar configuración del usuario
            'swiper' => array(
                'enabled' => true,
                'slidesPerView' => isset($this->options['related_products']['columns']) ? intval($this->options['related_products']['columns']) : 2,
                'spaceBetween' => 10,
                'slidesPerGroup' => isset($this->options['related_products']['slides_to_scroll']) ? intval($this->options['related_products']['slides_to_scroll']) : 1
            ),
            // Forzar debug a true
            'debug' => true,
            // Slides a desplazar (redundante pero por compatibilidad)
            'slides_to_scroll' => 1
        );
        
        // Cargar estilos principales del carrito
        wp_enqueue_style(
            'snap-sidebar-cart-main',
            SNAP_SIDEBAR_CART_URL . 'assets/css/snap-sidebar-cart.css',
            array(),
            $version
        );
        
        // Cargar el archivo CSS para productos relacionados con alta prioridad
        wp_enqueue_style(
            'snap-sidebar-cart-related-products-fix',
            SNAP_SIDEBAR_CART_URL . 'assets/css/related-products-fix.css',
            array('snap-sidebar-cart-main'),
            $version
        );
        
        // Cargar el archivo CSS completo de corrección
        wp_enqueue_style(
            'snap-sidebar-cart-fix',
            SNAP_SIDEBAR_CART_URL . 'assets/css/snap-sidebar-cart-fix.css',
            array('snap-sidebar-cart-main', 'snap-sidebar-cart-related-products-fix'),
            $version
        );
        
        // Agregar estilos CSS inline para asegurar que se apliquen con la máxima prioridad
        $inline_css = "
            /* Estilos críticos para productos relacionados */
            .snap-sidebar-cart__related-slider {
                display: flex !important;
                overflow-x: auto !important;
                scroll-snap-type: x mandatory !important;
                -webkit-overflow-scrolling: touch !important;
                scrollbar-width: none !important;
                -ms-overflow-style: none !important;
                padding: 5px 0 !important;
            }
            
            .snap-sidebar-cart__related-slider::-webkit-scrollbar {
                display: none !important;
            }
            
            .snap-sidebar-cart__related-slider .product,
            .snap-sidebar-cart__related-slider .snap-sidebar-cart__related-product {
                width: calc(50% - 10px) !important;
                flex: 0 0 calc(50% - 10px) !important;
                min-width: calc(50% - 10px) !important;
                max-width: calc(50% - 10px) !important;
                margin-right: 10px !important;
                scroll-snap-align: start !important;
                box-sizing: border-box !important;
            }
            
            /* Botones de cantidad */
            .snap-sidebar-cart__quantity-up,
            .snap-sidebar-cart__quantity-down,
            .notabutton.quantity-up,
            .notabutton.quantity-down {
                cursor: pointer !important;
                user-select: none !important;
            }
            
            /* Pestañas de productos relacionados */
            .snap-sidebar-cart__related {
                margin-top: 20px !important;
                border-top: 1px solid #f0f0f0 !important;
                padding-top: 15px !important;
            }
            
            .snap-sidebar-cart__related-tabs {
                display: flex !important;
                margin-bottom: 15px !important;
                border-bottom: 1px solid #f0f0f0 !important;
            }
            
            .snap-sidebar-cart__related-tab {
                padding: 8px 12px !important;
                cursor: pointer !important;
                border-bottom: 2px solid transparent !important;
                margin-right: 10px !important;
                font-size: 14px !important;
                font-weight: 600 !important;
            }
            
            .snap-sidebar-cart__related-tab.active {
                border-bottom-color: #333 !important;
            }
            
            .snap-sidebar-cart__related-container {
                display: none !important;
            }
            
            .snap-sidebar-cart__related-container.active {
                display: block !important;
            }
        ";
        
        wp_add_inline_style('snap-sidebar-cart-fix', $inline_css);
        
        // Cargar los scripts originales si estamos en modo desarrollo
        if (defined('SNAP_SIDEBAR_CART_DEV_MODE') && SNAP_SIDEBAR_CART_DEV_MODE) {
            // Cargar scripts originales para mantener compatibilidad
            wp_enqueue_script(
                'snap-sidebar-cart-tabs-fix',
                SNAP_SIDEBAR_CART_URL . 'assets/js/tabs.js',
                array('jquery'),
                $version,
                true
            );
            
            wp_enqueue_script(
                'snap-sidebar-cart-scroll-snap',
                SNAP_SIDEBAR_CART_URL . 'assets/js/scroll-snap.js',
                array('jquery'),
                $version,
                true
            );
            
            wp_enqueue_script(
                'snap-sidebar-cart-quantity-handler',
                SNAP_SIDEBAR_CART_URL . 'assets/js/quantity-handler.js',
                array('jquery'),
                $version,
                true
            );
            
            wp_enqueue_script(
                'snap-sidebar-cart-preloader-fix',
                SNAP_SIDEBAR_CART_URL . 'assets/js/preloader-controller.js',
                array('jquery'),
                $version,
                true
            );
            
            // Localizar todos los scripts originales
            wp_localize_script('snap-sidebar-cart-tabs-fix', 'snap_sidebar_cart_params', $script_options);
            wp_localize_script('snap-sidebar-cart-scroll-snap', 'snap_sidebar_cart_params', $script_options);
            wp_localize_script('snap-sidebar-cart-quantity-handler', 'snap_sidebar_cart_params', $script_options);
            wp_localize_script('snap-sidebar-cart-preloader-fix', 'snap_sidebar_cart_params', $script_options);
        }
        
        // Usar la versión compilada por Webpack
        wp_enqueue_script(
            'snap-sidebar-cart-webpack', 
            SNAP_SIDEBAR_CART_URL . 'assets/js/dist/snap-sidebar-cart.js', 
            array('jquery'), 
            $version, 
            true
        );
        
        // Localizar scripts para la versión Webpack
        wp_localize_script('snap-sidebar-cart-webpack', 'snap_sidebar_cart_params', $script_options);
        
        // Registrar script de administración si estamos en el panel de administración
        if (is_admin()) {
            $admin_js_path = SNAP_SIDEBAR_CART_PATH . 'assets/js/dist/admin.js';
            if (file_exists($admin_js_path)) {
                wp_enqueue_script(
                    'snap-sidebar-cart-admin', 
                    SNAP_SIDEBAR_CART_URL . 'assets/js/dist/admin.js', 
                    array('jquery'), 
                    $version, 
                    true
                );
                wp_localize_script('snap-sidebar-cart-admin', 'snap_sidebar_cart_params', $script_options);
            }
        }
    }

    /**
     * Genera CSS personalizado desde las opciones.
     *
     * @since    1.0.0
     * @return   string    CSS personalizado.
     */
    private function generate_custom_css() {
        if (!isset($this->options['styles']) || !is_array($this->options['styles'])) {
            return '';
        }
        
        $styles = $this->options['styles'];
        $columns = isset($this->options['related_products']['columns']) ? intval($this->options['related_products']['columns']) : 2;
        $column_width = 100 / $columns;
        
        // Opciones del preloader
        $preloader = isset($this->options['preloader']) ? $this->options['preloader'] : array();
        $preloader_type = isset($preloader['type']) ? esc_attr($preloader['type']) : 'circle';
        $preloader_size = isset($preloader['size']) ? esc_attr($preloader['size']) : '40px';
        $preloader_color = isset($preloader['color']) ? esc_attr($preloader['color']) : '#3498db';
        $preloader_color2 = isset($preloader['color2']) ? esc_attr($preloader['color2']) : '#e74c3c';
        $preloader_position = isset($preloader['position']) ? esc_attr($preloader['position']) : 'center';
        
        // Opciones de animaciones
        $animations = isset($this->options['animations']) ? $this->options['animations'] : array();
        $animation_duration = isset($animations['duration']) ? intval($animations['duration']) : 300;
        $quantity_update_delay = isset($animations['quantity_update_delay']) ? intval($animations['quantity_update_delay']) : 200;
        
        // Forzar ancho del sidebar a 540px para pruebas
        $sidebar_width = isset($styles['sidebar_width']) ? $styles['sidebar_width'] : '540px';
        if (empty($sidebar_width) || $sidebar_width === '400px') {
            $sidebar_width = '540px';
        }
        
        $css = "
            :root {
                --animation-duration: " . $animation_duration . "ms;
                --animation-delay: " . $quantity_update_delay . "ms;
                --sidebar-width: " . $sidebar_width . ";
                --sidebar-background: " . esc_attr($styles['sidebar_background'] ?? '#ffffff') . ";
                --header-background: " . esc_attr($styles['header_background'] ?? '#f8f8f8') . ";
                --header-text-color: " . esc_attr($styles['header_text_color'] ?? '#333333') . ";
                --product-text-color: " . esc_attr($styles['product_text_color'] ?? '#333333') . ";
                --button-background: " . esc_attr($styles['button_background'] ?? '#2c6aa0') . ";
                --button-text-color: " . esc_attr($styles['button_text_color'] ?? '#ffffff') . ";
                --border-color: #e5e5e5;
                --remove-color: #e74c3c;
                --highlight-color: #f1c40f;
            }
            
            #" . esc_attr($this->options['container_selector']) . " {
                width: " . $sidebar_width . ";
            }
            
            .snap-sidebar-cart__container {
                width: " . $sidebar_width . " !important;
                max-width: 100%;
            }
            
            /* Estilos personalizados para el preloader */
            .snap-sidebar-cart__loader-spinner {
                width: " . $preloader_size . ";
                height: " . $preloader_size . ";
                position: absolute;
            }
            
            /* Estilos específicos según el tipo de preloader */
            .snap-sidebar-cart__loader-spinner.preloader-circle {
                border: 2px solid rgba(0, 0, 0, 0.1);
                border-top: 2px solid " . $preloader_color . ";
            }
            
            .snap-sidebar-cart__loader-spinner.preloader-square {
                border: 2px solid rgba(0, 0, 0, 0.1);
                border-top: 2px solid " . $preloader_color . ";
            }
            
            .snap-sidebar-cart__loader-spinner.preloader-dots span {
                background-color: " . $preloader_color . ";
            }
            
            .snap-sidebar-cart__loader-spinner.preloader-spinner:before {
                border-top-color: " . $preloader_color . ";
            }
            
            .snap-sidebar-cart__loader-spinner.preloader-spinner:after {
                border-bottom-color: " . $preloader_color2 . ";
            }
            
            /* Posicionamiento del preloader */
            .snap-sidebar-cart__loader-spinner.preloader-position-center {
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
            }
            
            .snap-sidebar-cart__loader-spinner.preloader-position-top-left {
                top: 10px;
                left: 10px;
            }
            
            .snap-sidebar-cart__loader-spinner.preloader-position-top-right {
                top: 10px;
                right: 10px;
            }
            
            .snap-sidebar-cart__loader-spinner.preloader-position-bottom-left {
                bottom: 10px;
                left: 10px;
            }
            
            .snap-sidebar-cart__loader-spinner.preloader-position-bottom-right {
                bottom: 10px;
                right: 10px;
            }
            
            .snap-sidebar-cart {
                width: " . $sidebar_width . " !important;
            }
            
            .snap-sidebar-cart__products {
                background-color: " . esc_attr($styles['products_background'] ?? '#ffffff') . ";
            }
            
            .snap-sidebar-cart__related-section {
                background-color: " . esc_attr($styles['related_section_background'] ?? '#f9f9f9') . ";
            }
            
            .snap-sidebar-cart__footer {
                background-color: " . esc_attr($styles['footer_background'] ?? '#f8f8f8') . ";
            }
            
            .snap-sidebar-cart__header {
                background-color: " . esc_attr($styles['header_background'] ?? '#f8f8f8') . ";
                color: " . esc_attr($styles['header_text_color'] ?? '#333333') . ";
            }
            
            .snap-sidebar-cart__title,
            .snap-sidebar-cart__close {
                color: " . esc_attr($styles['header_text_color'] ?? '#333333') . ";
            }
            
            .snap-sidebar-cart__product-name,
            .snap-sidebar-cart__product-price,
            .snap-sidebar-cart__related-product-title {
                color: " . esc_attr($styles['product_text_color'] ?? '#333333') . ";
            }
            
            .snap-sidebar-cart__button--checkout {
                background-color: " . esc_attr($styles['button_background'] ?? '#2c6aa0') . ";
                color: " . esc_attr($styles['button_text_color'] ?? '#ffffff') . ";
            }
            
            /* Estilos para el encabezado de productos relacionados con navegación */
            .snap-sidebar-cart__related-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
                border-bottom: 1px solid var(--border-color);
            }
            
            .snap-sidebar-cart__related-tabs {
                display: flex;
                flex: 1;
                overflow-x: auto;
                white-space: nowrap;
                scrollbar-width: none; /* Firefox */
                -ms-overflow-style: none; /* IE and Edge */
            }
            
            .snap-sidebar-cart__related-tabs::-webkit-scrollbar {
                display: none; /* Chrome, Safari and Opera */
            }
            
            .snap-sidebar-cart__related-navigation {
                display: flex;
                gap: 5px;
                margin-left: 10px;
            }
            
            .snap-sidebar-cart__slider-nav {
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 1px solid var(--border-color);
                background-color: #f8f8f8;
                color: #333;
                font-size: 18px;
                cursor: pointer;
                border-radius: 3px;
                transition: all 0.2s ease;
            }
            
            .snap-sidebar-cart__slider-nav:hover {
                background-color: var(--button-background);
                color: var(--button-text-color);
            }
            
            .snap-sidebar-cart__slider-nav.disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            
            .snap-sidebar-cart__related-product {
                width: calc(" . $column_width . "% - 20px);
                position: relative;
                overflow: hidden;
                padding: 10px;
                margin: 0 10px 10px 0;
                border: 1px solid var(--border-color);
                border-radius: 4px;
                transition: all 0.2s ease-in-out;
            }
            
            .snap-sidebar-cart__related-product:hover {
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }
            
            /* Estilos para el badge de última oportunidad */
            .snap-sidebar-cart__product-badge.last-chance {
                position: absolute;
                top: 10px;
                right: 10px;
                background-color: " . esc_attr($this->options['related_products']['last_chance_bg_color'] ?? '#e74c3c') . ";
                color: " . esc_attr($this->options['related_products']['last_chance_text_color'] ?? '#ffffff') . ";
                padding: 3px 8px;
                font-size: 12px;
                font-weight: bold;
                border-radius: 3px;
                z-index: 2;
            }
            
            /* Estilos para Swiper.js */
            .snap-sidebar-cart__swiper-container {
                width: 100%;
                position: relative;
                overflow: hidden;
                padding: 5px 0;
            }
            
            .snap-sidebar-cart__slider-track {
                display: flex;
            }
            
            /* Configuración de los botones de navegación en la parte superior derecha */
            .snap-sidebar-cart__related-navigation {
                position: absolute;
                right: 0;
                top: 0;
                display: flex;
                gap: 5px;
            }
            
            .snap-sidebar-cart__slider-nav.swiper-button-prev,
            .snap-sidebar-cart__slider-nav.swiper-button-next {
                position: static;
                width: 28px;
                height: 28px;
                background-color: #f8f8f8;
                border: 1px solid #e5e5e5;
                border-radius: 3px;
                color: #333;
                margin: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
            }
            
            .snap-sidebar-cart__slider-nav.swiper-button-prev:after,
            .snap-sidebar-cart__slider-nav.swiper-button-next:after {
                font-size: 14px;
                font-weight: bold;
            }
            
            .snap-sidebar-cart__slider-nav.swiper-button-disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            
            /* Espacio para los slides */
            .swiper-slide {
                height: auto;
                padding: 0 5px;
            }
            
            /* Estilos para los precios y descuentos */
            .snap-sidebar-cart__related-product-price-container {
                display: flex;
                flex-wrap: wrap;
                align-items: center;
                margin-top: 8px;
                font-weight: 500;
            }
            
            .snap-sidebar-cart__related-product-regular-price {
                text-decoration: line-through;
                color: #999;
                margin-right: 8px;
                font-size: 0.9em;
            }
            
            .snap-sidebar-cart__related-product-price {
                color: #000;
                font-weight: bold;
                margin-right: 8px;
            }
            
            .snap-sidebar-cart__related-product-discount {
                background-color: #e74c3c;
                color: white;
                padding: 2px 6px;
                border-radius: 3px;
                font-size: 0.8em;
                font-weight: bold;
            }
            
            .snap-sidebar-cart__related-product-title {
                font-size: 0.95em;
                font-weight: 500;
                margin: 10px 0 5px;
                line-height: 1.3;
                color: #333;
            }
            
            /* Corregir estilos de inputs */
            .quantity.buttoned-input {
                display: flex;
                align-items: center;
                border: none;
                overflow: hidden;
            }
            
            .cart-item__quantity-input {
                width: 30px;
                text-align: center;
                border: none !important;
                box-shadow: none !important;
                padding: 2px 0;
                font-size: 14px;
                -moz-appearance: textfield;
                background: transparent !important;
            }
            
            .cart-item__quantity-input:focus {
                outline: none !important;
                border: none !important;
                box-shadow: none !important;
            }
            
            .cart-item__quantity-input::-webkit-outer-spin-button,
            .cart-item__quantity-input::-webkit-inner-spin-button {
                -webkit-appearance: none;
                margin: 0;
            }
            
            /* Animaciones para nuevos productos */
            .snap-sidebar-cart__product.new-item {
                animation: fadeIn var(--animation-duration) ease-out;
            }
            
            /* Animación para cambio de cantidad */
            .cart-item__quantity-input.quantity-updated {
                animation: quantityUpdated var(--animation-duration) ease-out;
            }
            
            /* Animación para productos que se eliminan */
            .snap-sidebar-cart__product.removing {
                animation: fadeOut var(--animation-duration) ease-out;
            }
            
            /* Animación para el hover de productos relacionados */
            .snap-sidebar-cart__related-product .product-gallery-image {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                opacity: 0;
                transition: opacity 0.3s ease-in-out;
                z-index: 1;
            }
            
            .snap-sidebar-cart__related-product:hover .product-gallery-image {
                opacity: 1;
            }
            
            /* Keyframes para las animaciones */
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            @keyframes fadeOut {
                from { opacity: 1; transform: translateY(0); }
                to { opacity: 0; transform: translateY(20px); }
            }
            
            @keyframes quantityUpdated {
                0% { background-color: rgba(" . $this->hex2rgb($preloader_color) . ", 0.1); }
                50% { background-color: rgba(" . $this->hex2rgb($preloader_color) . ", 0.3); }
                100% { background-color: transparent; }
            }
        ";
        
        return $css;
    }

    /**
     * Genera los estilos CSS específicos para el preloader.
     *
     * @since    1.1.2
     * @return   string    CSS personalizado para el preloader.
     */
    private function generate_preloader_css() {
        // Opciones del preloader
        $preloader = isset($this->options['preloader']) ? $this->options['preloader'] : array();
        $preloader_type = isset($preloader['type']) ? esc_attr($preloader['type']) : 'circle';
        $preloader_size = isset($preloader['size']) ? esc_attr($preloader['size']) : '40px';
        $preloader_color = isset($preloader['color']) ? esc_attr($preloader['color']) : '#3498db';
        $preloader_color2 = isset($preloader['color2']) ? esc_attr($preloader['color2']) : '#e74c3c';
        $preloader_position = isset($preloader['position']) ? esc_attr($preloader['position']) : 'center';
        
        // CSS para el preloader con mayor especificidad para asegurar que se aplique
        $css = "
            /* Preloader de Snap Sidebar Cart (Version: " . SNAP_SIDEBAR_CART_VERSION . ") */
            :root {
                --preloader-size: {$preloader_size} !important;
                --preloader-color: {$preloader_color} !important;
                --preloader-color2: {$preloader_color2} !important;
            }
            
            /* Preloader personalizado */
            html body .snap-sidebar-cart .snap-sidebar-cart__loader-spinner,
            html body #" . esc_attr($this->options['container_selector']) . " .snap-sidebar-cart__loader-spinner {
                width: {$preloader_size} !important;
                height: {$preloader_size} !important;
            }
            
            html body .snap-sidebar-cart .snap-sidebar-cart__loader-spinner.preloader-circle,
            html body #" . esc_attr($this->options['container_selector']) . " .snap-sidebar-cart__loader-spinner.preloader-circle {
                border: 2px solid rgba(0, 0, 0, 0.1) !important;
                border-top: 2px solid {$preloader_color} !important;
            }
            
            html body .snap-sidebar-cart .snap-sidebar-cart__loader-spinner.preloader-square,
            html body #" . esc_attr($this->options['container_selector']) . " .snap-sidebar-cart__loader-spinner.preloader-square {
                border: 2px solid rgba(0, 0, 0, 0.1) !important;
                border-top: 2px solid {$preloader_color} !important;
            }
            
            html body .snap-sidebar-cart .snap-sidebar-cart__loader-spinner.preloader-dots span,
            html body #" . esc_attr($this->options['container_selector']) . " .snap-sidebar-cart__loader-spinner.preloader-dots span {
                background-color: {$preloader_color} !important;
            }
            
            html body .snap-sidebar-cart .snap-sidebar-cart__loader-spinner.preloader-spinner:before,
            html body #" . esc_attr($this->options['container_selector']) . " .snap-sidebar-cart__loader-spinner.preloader-spinner:before {
                border-top-color: {$preloader_color} !important;
            }
            
            html body .snap-sidebar-cart .snap-sidebar-cart__loader-spinner.preloader-spinner:after,
            html body #" . esc_attr($this->options['container_selector']) . " .snap-sidebar-cart__loader-spinner.preloader-spinner:after {
                border-bottom-color: {$preloader_color2} !important;
            }
            
            /* Asegurar que el loader de producto esté visible cuando se aplique */
            html body .snap-sidebar-cart .snap-sidebar-cart__product-loader,
            html body #" . esc_attr($this->options['container_selector']) . " .snap-sidebar-cart__product-loader {
                position: absolute !important;
                top: 0 !important;
                left: 0 !important;
                width: 100% !important;
                height: 100% !important;
                background-color: rgba(255, 255, 255, 0.8) !important;
                display: none !important;
                z-index: 10 !important;
                justify-content: center !important;
                align-items: center !important;
            }
            
            html body .snap-sidebar-cart .snap-sidebar-cart__product-loader[style*='display: flex'],
            html body #" . esc_attr($this->options['container_selector']) . " .snap-sidebar-cart__product-loader[style*='display: flex'] {
                display: flex !important;
            }
        ";
        
        return $css;
    }

    /**
     * Convierte un color hexadecimal a formato RGB.
     * 
     * @since    1.0.6
     * @param    string    $hex    El color en formato hexadecimal.
     * @return   string            El color en formato RGB (valores de 0-255).
     */
    private function hex2rgb($hex) {
        $hex = str_replace('#', '', $hex);
        
        if(strlen($hex) == 3) {
            $r = hexdec(substr($hex, 0, 1).substr($hex, 0, 1));
            $g = hexdec(substr($hex, 1, 1).substr($hex, 1, 1));
            $b = hexdec(substr($hex, 2, 1).substr($hex, 2, 1));
        } else {
            $r = hexdec(substr($hex, 0, 2));
            $g = hexdec(substr($hex, 2, 2));
            $b = hexdec(substr($hex, 4, 2));
        }
        
        return $r . ',' . $g . ',' . $b;
    }

    /**
     * Renderiza el carrito lateral en el footer.
     *
     * @since    1.0.0
     */
    public function render_sidebar_cart() {
        // Solo renderizar en páginas de WooCommerce
        if (!is_woocommerce() && !is_cart() && !is_checkout() && !is_product() && !is_shop()) {
            return;
        }
        
        // Asegurarse de que WooCommerce está activo y el carrito está disponible
        if (!function_exists('WC') || !WC()->cart) {
            return;
        }
        
        include_once SNAP_SIDEBAR_CART_PATH . 'public/partials/snap-sidebar-cart-public-display.php';
    }
}
