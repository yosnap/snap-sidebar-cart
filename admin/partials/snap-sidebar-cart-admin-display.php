<?php
/**
 * Proporciona una vista de área de admin para el plugin
 *
 * @since      1.0.0
 */
?>

<div class="wrap snap-sidebar-cart-admin">
    <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
    
    <?php
    // Verificar si hay un mensaje de guardado
    if (isset($_GET['settings-updated']) && $_GET['settings-updated']) {
        echo '<div class="notice notice-success is-dismissible"><p>' . __('Configuración guardada.', 'snap-sidebar-cart') . '</p></div>';
    }
    
    $active_tab = isset($_GET['tab']) ? $_GET['tab'] : 'general';
    ?>
    
    <h2 class="nav-tab-wrapper">
        <a href="?page=snap-sidebar-cart&tab=general" class="nav-tab <?php echo $active_tab === 'general' ? 'nav-tab-active' : ''; ?>"><?php _e('General', 'snap-sidebar-cart'); ?></a>
        <a href="?page=snap-sidebar-cart&tab=styles" class="nav-tab <?php echo $active_tab === 'styles' ? 'nav-tab-active' : ''; ?>"><?php _e('Estilos', 'snap-sidebar-cart'); ?></a>
        <a href="?page=snap-sidebar-cart&tab=related_products" class="nav-tab <?php echo $active_tab === 'related_products' ? 'nav-tab-active' : ''; ?>"><?php _e('Productos relacionados', 'snap-sidebar-cart'); ?></a>
        <a href="?page=snap-sidebar-cart&tab=shortcodes" class="nav-tab <?php echo $active_tab === 'shortcodes' ? 'nav-tab-active' : ''; ?>"><?php _e('Shortcodes', 'snap-sidebar-cart'); ?></a>
    </h2>
    
    <form method="post" action="options.php">
        <?php 
        settings_fields('snap_sidebar_cart_options_group'); 
        
        // Agregar debug
        error_log('Form de configuración: ' . print_r($_POST, true));
        ?>
        
        <?php if ($active_tab === 'general') : ?>
            <div id="general-settings" class="snap-sidebar-cart-settings-section">
                <h2><?php _e('Configuración básica', 'snap-sidebar-cart'); ?></h2>
                
                <table class="form-table">
                    <tr>
                        <th scope="row">
                            <label for="snap_sidebar_cart_options[title]"><?php _e('Título del carrito', 'snap-sidebar-cart'); ?></label>
                        </th>
                        <td>
                            <input type="text" id="snap_sidebar_cart_options[title]" name="snap_sidebar_cart_options[title]" value="<?php echo esc_attr($this->options['title']); ?>" class="regular-text" />
                        </td>
                    </tr>
                    
                    <tr>
                        <th scope="row">
                            <label for="snap_sidebar_cart_options[container_selector]"><?php _e('Selector del contenedor', 'snap-sidebar-cart'); ?></label>
                        </th>
                        <td>
                            <input type="text" id="snap_sidebar_cart_options[container_selector]" name="snap_sidebar_cart_options[container_selector]" value="<?php echo esc_attr(isset($this->options['container_selector']) ? $this->options['container_selector'] : ''); ?>" class="regular-text" />
                            <p class="description"><?php _e('ID del contenedor donde se mostrará el carrito', 'snap-sidebar-cart'); ?></p>
                        </td>
                    </tr>
                    
                    <tr>
                        <th scope="row">
                            <label for="snap_sidebar_cart_options[activation_selectors]"><?php _e('Selectores de activación', 'snap-sidebar-cart'); ?></label>
                        </th>
                        <td>
                            <input type="text" id="snap_sidebar_cart_options[activation_selectors]" name="snap_sidebar_cart_options[activation_selectors]" value="<?php echo esc_attr(isset($this->options['activation_selectors']) ? $this->options['activation_selectors'] : ''); ?>" class="regular-text" />
                            <p class="description"><?php _e('Selectores CSS (separados por comas) que activarán la apertura del carrito', 'snap-sidebar-cart'); ?></p>
                        </td>
                    </tr>
                    
                    <tr>
                        <th scope="row">
                            <label for="snap_sidebar_cart_options[show_shipping]"><?php _e('Mostrar costo de envío', 'snap-sidebar-cart'); ?></label>
                        </th>
                        <td>
                            <input type="checkbox" id="snap_sidebar_cart_options[show_shipping]" name="snap_sidebar_cart_options[show_shipping]" value="1" <?php checked(1, isset($this->options['show_shipping']) ? $this->options['show_shipping'] : true); ?> />
                        </td>
                    </tr>
                    
                    <tr>
                        <th scope="row">
                            <label for="snap_sidebar_cart_options[auto_open]"><?php _e('Abrir automáticamente al añadir productos', 'snap-sidebar-cart'); ?></label>
                        </th>
                        <td>
                            <input type="checkbox" id="snap_sidebar_cart_options[auto_open]" name="snap_sidebar_cart_options[auto_open]" value="1" <?php checked(1, isset($this->options['auto_open']) ? $this->options['auto_open'] : true); ?> />
                            <p class="description"><?php _e('Si está habilitado, el carrito lateral se abrirá automáticamente cuando se añada un producto al carrito', 'snap-sidebar-cart'); ?></p>
                        </td>
                    </tr>
                </table>
            </div>
        <?php elseif ($active_tab === 'styles') : ?>
            <div id="styles-settings" class="snap-sidebar-cart-settings-section">
                <h2><?php _e('Personalización de estilos', 'snap-sidebar-cart'); ?></h2>
                
                <table class="form-table">
                    <tr>
                        <th scope="row">
                            <label for="snap_sidebar_cart_options[styles][sidebar_width]"><?php _e('Ancho del sidebar', 'snap-sidebar-cart'); ?></label>
                        </th>
                        <td>
                            <input type="text" id="snap_sidebar_cart_options[styles][sidebar_width]" name="snap_sidebar_cart_options[styles][sidebar_width]" value="<?php echo esc_attr($this->options['styles']['sidebar_width']); ?>" class="small-text" />
                            <p class="description"><?php _e('Por ejemplo: 400px', 'snap-sidebar-cart'); ?></p>
                        </td>
                    </tr>
                    
                    <tr>
                        <th scope="row">
                            <label for="snap_sidebar_cart_options[styles][sidebar_background]"><?php _e('Color de fondo del sidebar', 'snap-sidebar-cart'); ?></label>
                        </th>
                        <td>
                            <input type="text" id="snap_sidebar_cart_options[styles][sidebar_background]" name="snap_sidebar_cart_options[styles][sidebar_background]" value="<?php echo esc_attr($this->options['styles']['sidebar_background']); ?>" class="snap-color-picker" />
                        </td>
                    </tr>
                    
                    <tr>
                        <th scope="row">
                            <label for="snap_sidebar_cart_options[styles][header_background]"><?php _e('Color de fondo del encabezado', 'snap-sidebar-cart'); ?></label>
                        </th>
                        <td>
                            <input type="text" id="snap_sidebar_cart_options[styles][header_background]" name="snap_sidebar_cart_options[styles][header_background]" value="<?php echo esc_attr($this->options['styles']['header_background']); ?>" class="snap-color-picker" />
                        </td>
                    </tr>
                    
                    <tr>
                        <th scope="row">
                            <label for="snap_sidebar_cart_options[styles][header_text_color]"><?php _e('Color de texto del encabezado', 'snap-sidebar-cart'); ?></label>
                        </th>
                        <td>
                            <input type="text" id="snap_sidebar_cart_options[styles][header_text_color]" name="snap_sidebar_cart_options[styles][header_text_color]" value="<?php echo esc_attr($this->options['styles']['header_text_color']); ?>" class="snap-color-picker" />
                        </td>
                    </tr>
                    
                    <tr>
                        <th scope="row">
                            <label for="snap_sidebar_cart_options[styles][product_text_color]"><?php _e('Color de texto de productos', 'snap-sidebar-cart'); ?></label>
                        </th>
                        <td>
                            <input type="text" id="snap_sidebar_cart_options[styles][product_text_color]" name="snap_sidebar_cart_options[styles][product_text_color]" value="<?php echo esc_attr($this->options['styles']['product_text_color']); ?>" class="snap-color-picker" />
                        </td>
                    </tr>
                    
                    <tr>
                        <th scope="row">
                            <label for="snap_sidebar_cart_options[styles][button_background]"><?php _e('Color de fondo de botones', 'snap-sidebar-cart'); ?></label>
                        </th>
                        <td>
                            <input type="text" id="snap_sidebar_cart_options[styles][button_background]" name="snap_sidebar_cart_options[styles][button_background]" value="<?php echo esc_attr($this->options['styles']['button_background']); ?>" class="snap-color-picker" />
                        </td>
                    </tr>
                    
                    <tr>
                        <th scope="row">
                            <label for="snap_sidebar_cart_options[styles][button_text_color]"><?php _e('Color de texto de botones', 'snap-sidebar-cart'); ?></label>
                        </th>
                        <td>
                            <input type="text" id="snap_sidebar_cart_options[styles][button_text_color]" name="snap_sidebar_cart_options[styles][button_text_color]" value="<?php echo esc_attr($this->options['styles']['button_text_color']); ?>" class="snap-color-picker" />
                        </td>
                    </tr>
                </table>
            </div>
        <?php elseif ($active_tab === 'related_products') : ?>
            <div id="related-products-settings" class="snap-sidebar-cart-settings-section">
                <h2><?php _e('Configuración de productos relacionados', 'snap-sidebar-cart'); ?></h2>
                
                <table class="form-table">
                    <tr>
                        <th scope="row">
                            <label for="snap_sidebar_cart_options[related_products][show]"><?php _e('Mostrar productos relacionados', 'snap-sidebar-cart'); ?></label>
                        </th>
                        <td>
                            <input type="checkbox" id="snap_sidebar_cart_options[related_products][show]" name="snap_sidebar_cart_options[related_products][show]" value="1" <?php checked(1, isset($this->options['related_products']['show']) ? $this->options['related_products']['show'] : true); ?> />
                        </td>
                    </tr>
                    
                    <tr>
                        <th scope="row">
                            <label for="snap_sidebar_cart_options[related_products][count]"><?php _e('Número de productos', 'snap-sidebar-cart'); ?></label>
                        </th>
                        <td>
                            <input type="number" id="snap_sidebar_cart_options[related_products][count]" name="snap_sidebar_cart_options[related_products][count]" value="<?php echo esc_attr($this->options['related_products']['count']); ?>" class="small-text" min="1" max="12" />
                        </td>
                    </tr>
                    
                    <tr>
                        <th scope="row">
                            <label for="snap_sidebar_cart_options[related_products][columns]"><?php _e('Columnas', 'snap-sidebar-cart'); ?></label>
                        </th>
                        <td>
                            <input type="number" id="snap_sidebar_cart_options[related_products][columns]" name="snap_sidebar_cart_options[related_products][columns]" value="<?php echo esc_attr($this->options['related_products']['columns']); ?>" class="small-text" min="1" max="4" />
                        </td>
                    </tr>
                    
                    <tr>
                        <th scope="row">
                            <label for="snap_sidebar_cart_options[related_products][orderby]"><?php _e('Ordenar por', 'snap-sidebar-cart'); ?></label>
                        </th>
                        <td>
                            <select id="snap_sidebar_cart_options[related_products][orderby]" name="snap_sidebar_cart_options[related_products][orderby]">
                                <option value="rand" <?php selected('rand', $this->options['related_products']['orderby']); ?>><?php _e('Aleatorio', 'snap-sidebar-cart'); ?></option>
                                <option value="price" <?php selected('price', $this->options['related_products']['orderby']); ?>><?php _e('Precio', 'snap-sidebar-cart'); ?></option>
                                <option value="date" <?php selected('date', $this->options['related_products']['orderby']); ?>><?php _e('Fecha', 'snap-sidebar-cart'); ?></option>
                                <option value="popularity" <?php selected('popularity', $this->options['related_products']['orderby']); ?>><?php _e('Popularidad', 'snap-sidebar-cart'); ?></option>
                            </select>
                        </td>
                    </tr>
                </table>
            </div>
        <?php elseif ($active_tab === 'shortcodes') : ?>
            <div id="shortcodes-settings" class="snap-sidebar-cart-settings-section">
                <h2><?php _e('Shortcodes', 'snap-sidebar-cart'); ?></h2>
                
                <table class="form-table">
                    <tr>
                        <th scope="row">
                            <label><?php _e('Botón de apertura del carrito', 'snap-sidebar-cart'); ?></label>
                        </th>
                        <td>
                            <code>[snap_sidebar_cart_button]</code>
                            <p class="description"><?php _e('Puedes usar este shortcode para mostrar un botón que abre el carrito lateral.', 'snap-sidebar-cart'); ?></p>
                        </td>
                    </tr>
                    
                    <tr>
                        <th scope="row">
                            <label><?php _e('Contador de items', 'snap-sidebar-cart'); ?></label>
                        </th>
                        <td>
                            <code>[snap_sidebar_cart_count]</code>
                            <p class="description"><?php _e('Muestra el número de productos en el carrito.', 'snap-sidebar-cart'); ?></p>
                        </td>
                    </tr>
                </table>
            </div>
        <?php endif; ?>
        
        <?php 
        // Debug de las opciones actuales
        error_log('Opciones actuales en el formulario: ' . print_r($this->options, true));
        
        submit_button(__('Guardar cambios', 'snap-sidebar-cart')); 
        ?>
    </form>
</div>
