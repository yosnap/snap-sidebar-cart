<?php
/**
 * Página de diagnóstico para Snap Sidebar Cart.
 * Permite a los usuarios identificar rápidamente problemas comunes.
 */

// Evitar el acceso directo
if (!defined('ABSPATH')) {
    exit;
}

// Comprobar si se solicitó limpiar el log
if (isset($_GET['action']) && $_GET['action'] === 'clear_log' && isset($_GET['nonce'])) {
    if (wp_verify_nonce($_GET['nonce'], 'snap_clear_log')) {
        // Cargar el logger y limpiar el log
        if (!class_exists('Snap_Sidebar_Cart_Logger')) {
            require_once SNAP_SIDEBAR_CART_PATH . 'includes/class-snap-sidebar-cart-logger.php';
        }
        Snap_Sidebar_Cart_Logger::clear();
        
        // Mostrar mensaje de éxito
        add_settings_error(
            'snap_sidebar_cart_diagnostics',
            'snap_log_cleared',
            __('El archivo de log ha sido limpiado correctamente.', 'snap-sidebar-cart'),
            'updated'
        );
    }
}

// Mostrar mensajes de error/éxito
settings_errors('snap_sidebar_cart_diagnostics');

// Obtener las opciones del plugin
$options = get_option('snap_sidebar_cart_options', array());
?>

<div class="wrap">
    <h1><?php _e('Diagnóstico de Snap Sidebar Cart', 'snap-sidebar-cart'); ?></h1>
    
    <p><?php _e('Esta página muestra información de diagnóstico para ayudar a solucionar problemas con el plugin.', 'snap-sidebar-cart'); ?></p>
    
    <h2><?php _e('Configuración Actual', 'snap-sidebar-cart'); ?></h2>
    
    <table class="widefat" style="margin-top: 10px;">
        <thead>
            <tr>
                <th><?php _e('Opción', 'snap-sidebar-cart'); ?></th>
                <th><?php _e('Valor', 'snap-sidebar-cart'); ?></th>
                <th><?php _e('Recomendación', 'snap-sidebar-cart'); ?></th>
            </tr>
        </thead>
        <tbody>
            <!-- Apertura automática -->
            <tr>
                <td><?php _e('Apertura automática', 'snap-sidebar-cart'); ?></td>
                <td>
                    <?php 
                    echo isset($options['auto_open']) && $options['auto_open'] ? 
                        '<span style="color: green;">' . __('Habilitada', 'snap-sidebar-cart') . '</span>' : 
                        '<span style="color: red;">' . __('Deshabilitada', 'snap-sidebar-cart') . '</span>';
                    ?>
                </td>
                <td>
                    <?php
                    if (!isset($options['auto_open']) || !$options['auto_open']) {
                        _e('Para abrir automáticamente el carrito al añadir productos, habilite esta opción en la configuración.', 'snap-sidebar-cart');
                    } else {
                        _e('Configuración óptima.', 'snap-sidebar-cart');
                    }
                    ?>
                </td>
            </tr>
            
            <!-- Posición de nuevos productos -->
            <tr>
                <td><?php _e('Posición de nuevos productos', 'snap-sidebar-cart'); ?></td>
                <td>
                    <?php
                    // Comprobar primero en animations.new_product_position, luego en new_product_position
                    $position = '';
                    if (isset($options['animations']['new_product_position'])) {
                        $position = $options['animations']['new_product_position'];
                    } elseif (isset($options['new_product_position'])) {
                        $position = $options['new_product_position'];
                    }
                    
                    echo $position == 'top' ? 
                        __('Al inicio de la lista', 'snap-sidebar-cart') : 
                        __('Al final de la lista', 'snap-sidebar-cart');
                    ?>
                </td>
                <td>
                    <?php _e('Seleccione la posición según sus preferencias. Puede cambiarlo en la pestaña "Configuración de Animaciones".', 'snap-sidebar-cart'); ?>
                </td>
            </tr>
            
            <!-- Selectores de activación -->
            <tr>
                <td><?php _e('Selectores de activación', 'snap-sidebar-cart'); ?></td>
                <td><?php echo isset($options['activation_selectors']) ? esc_html($options['activation_selectors']) : __('No configurado', 'snap-sidebar-cart'); ?></td>
                <td>
                    <?php 
                    if (!isset($options['activation_selectors']) || empty($options['activation_selectors'])) {
                        _e('Configure los selectores para los elementos que activarán el carrito al hacer clic.', 'snap-sidebar-cart');
                    } else {
                        $has_add_to_cart = strpos($options['activation_selectors'], 'add_to_cart_button') !== false;
                        if (!$has_add_to_cart) {
                            _e('Se recomienda incluir el selector ".add_to_cart_button" para activar el carrito al hacer clic en los botones de añadir al carrito.', 'snap-sidebar-cart');
                        } else {
                            _e('Configuración óptima.', 'snap-sidebar-cart');
                        }
                    }
                    ?>
                </td>
            </tr>
            
            <!-- Animaciones -->
            <tr>
                <td><?php _e('Duración de animaciones', 'snap-sidebar-cart'); ?></td>
                <td>
                    <?php 
                    echo isset($options['animations']['duration']) ? 
                        esc_html($options['animations']['duration']) . ' ms' : 
                        '300 ms (por defecto)';
                    ?>
                </td>
                <td>
                    <?php 
                    if (isset($options['animations']['duration']) && $options['animations']['duration'] > 1000) {
                        _e('La duración es mayor a 1000ms, lo que puede hacer que las animaciones se sientan lentas. Se recomienda un valor entre 200ms y 800ms.', 'snap-sidebar-cart');
                    } else {
                        _e('Configuración óptima.', 'snap-sidebar-cart');
                    }
                    ?>
                </td>
            </tr>
        </tbody>
    </table>
    
    <h2><?php _e('Comprobaciones de Compatibilidad', 'snap-sidebar-cart'); ?></h2>
    
    <table class="widefat" style="margin-top: 10px;">
        <thead>
            <tr>
                <th><?php _e('Componente', 'snap-sidebar-cart'); ?></th>
                <th><?php _e('Estado', 'snap-sidebar-cart'); ?></th>
                <th><?php _e('Recomendación', 'snap-sidebar-cart'); ?></th>
            </tr>
        </thead>
        <tbody>
            <!-- WooCommerce -->
            <tr>
                <td><?php _e('WooCommerce', 'snap-sidebar-cart'); ?></td>
                <td>
                    <?php 
                    if (class_exists('WooCommerce')) {
                        $wc_version = WC()->version;
                        echo '<span style="color: green;">' . __('Activo', 'snap-sidebar-cart') . ' (v' . $wc_version . ')</span>';
                    } else {
                        echo '<span style="color: red;">' . __('No activo', 'snap-sidebar-cart') . '</span>';
                    }
                    ?>
                </td>
                <td>
                    <?php
                    if (!class_exists('WooCommerce')) {
                        _e('WooCommerce es necesario para que el plugin funcione correctamente.', 'snap-sidebar-cart');
                    } else {
                        if (version_compare(WC()->version, '4.0', '<')) {
                            _e('Se recomienda actualizar a WooCommerce 4.0 o superior para asegurar la compatibilidad completa.', 'snap-sidebar-cart');
                        } else {
                            _e('Versión de WooCommerce compatible.', 'snap-sidebar-cart');
                        }
                    }
                    ?>
                </td>
            </tr>
            
            <!-- jQuery -->
            <tr>
                <td><?php _e('jQuery', 'snap-sidebar-cart'); ?></td>
                <td>
                    <?php
                    global $wp_scripts;
                    $jquery_version = $wp_scripts->registered['jquery']->ver;
                    echo '<span style="color: green;">' . __('Activo', 'snap-sidebar-cart') . ' (v' . $jquery_version . ')</span>';
                    ?>
                </td>
                <td>
                    <?php 
                    if (version_compare($jquery_version, '1.12.4', '<')) {
                        _e('Se recomienda actualizar a jQuery 1.12.4 o superior.', 'snap-sidebar-cart');
                    } else {
                        _e('Versión de jQuery compatible.', 'snap-sidebar-cart');
                    }
                    ?>
                </td>
            </tr>
            
            <!-- Tema -->
            <tr>
                <td><?php _e('Tema', 'snap-sidebar-cart'); ?></td>
                <td>
                    <?php 
                    $theme = wp_get_theme();
                    echo esc_html($theme->get('Name')) . ' (v' . esc_html($theme->get('Version')) . ')';
                    ?>
                </td>
                <td>
                    <?php 
                    // Temas conocidos con buena compatibilidad
                    $compatible_themes = array('Storefront', 'Astra', 'OceanWP', 'GeneratePress', 'Flatsome');
                    if (in_array($theme->get('Name'), $compatible_themes)) {
                        _e('Tema compatible confirmado.', 'snap-sidebar-cart');
                    } else {
                        _e('Tema no verificado oficialmente. Si experimenta problemas, puede ser necesario realizar ajustes CSS personalizados.', 'snap-sidebar-cart');
                    }
                    ?>
                </td>
            </tr>
            
            <!-- Caché -->
            <tr>
                <td><?php _e('Plugins de caché', 'snap-sidebar-cart'); ?></td>
                <td>
                    <?php 
                    $cache_plugins = array(
                        'WP Super Cache' => 'wp-super-cache/wp-cache.php',
                        'W3 Total Cache' => 'w3-total-cache/w3-total-cache.php',
                        'WP Rocket' => 'wp-rocket/wp-rocket.php',
                        'LiteSpeed Cache' => 'litespeed-cache/litespeed-cache.php',
                        'Autoptimize' => 'autoptimize/autoptimize.php'
                    );
                    
                    $active_cache = array();
                    foreach ($cache_plugins as $name => $path) {
                        if (is_plugin_active($path)) {
                            $active_cache[] = $name;
                        }
                    }
                    
                    if (empty($active_cache)) {
                        echo '<span>' . __('No detectados', 'snap-sidebar-cart') . '</span>';
                    } else {
                        echo '<span>' . implode(', ', $active_cache) . '</span>';
                    }
                    ?>
                </td>
                <td>
                    <?php 
                    if (!empty($active_cache)) {
                        _e('Si experimenta problemas, intente excluir los archivos JS del plugin de la caché o purgar la caché después de guardar los cambios.', 'snap-sidebar-cart');
                    } else {
                        _e('Sin conflictos potenciales.', 'snap-sidebar-cart');
                    }
                    ?>
                </td>
            </tr>
        </tbody>
    </table>
    
    <h2><?php _e('Archivos y Rutas', 'snap-sidebar-cart'); ?></h2>
    
    <table class="widefat" style="margin-top: 10px;">
        <tr>
            <td><?php _e('Ruta del plugin', 'snap-sidebar-cart'); ?></td>
            <td><?php echo SNAP_SIDEBAR_CART_PATH; ?></td>
        </tr>
        <tr>
            <td><?php _e('URL del plugin', 'snap-sidebar-cart'); ?></td>
            <td><?php echo SNAP_SIDEBAR_CART_URL; ?></td>
        </tr>
        <tr>
            <td><?php _e('Versión del plugin', 'snap-sidebar-cart'); ?></td>
            <td><?php echo SNAP_SIDEBAR_CART_VERSION; ?></td>
        </tr>
        <tr>
            <td><?php _e('Archivo de log', 'snap-sidebar-cart'); ?></td>
            <td>
                <?php 
                $log_file = SNAP_SIDEBAR_CART_PATH . 'logs/debug.log';
                if (file_exists($log_file)) {
                    echo esc_html($log_file) . ' (' . size_format(filesize($log_file)) . ')';
                    echo ' <a href="' . esc_url(admin_url('admin.php?page=snap-sidebar-cart-diagnostics&action=clear_log&nonce=' . wp_create_nonce('snap_clear_log'))) . '" class="button button-small">' . __('Limpiar log', 'snap-sidebar-cart') . '</a>';
                } else {
                    echo esc_html($log_file) . ' ' . __('(no existe)', 'snap-sidebar-cart');
                }
                ?>
            </td>
        </tr>
    </table>
    
    <h2><?php _e('Solución de Problemas Comunes', 'snap-sidebar-cart'); ?></h2>
    
    <div class="postbox">
        <div class="inside">
            <h3><?php _e('El carrito no se abre automáticamente al añadir productos', 'snap-sidebar-cart'); ?></h3>
            <ol>
                <li><?php _e('Asegúrese de que la opción "Abrir automáticamente al añadir productos" esté habilitada en la configuración.', 'snap-sidebar-cart'); ?></li>
                <li><?php _e('Verifique si hay errores de JavaScript en la consola del navegador (F12 > Consola).', 'snap-sidebar-cart'); ?></li>
                <li><?php _e('Asegúrese de que no haya conflictos con otros plugins que modifiquen el comportamiento del carrito.', 'snap-sidebar-cart'); ?></li>
                <li><?php _e('Pruebe a desactivar temporalmente plugins de caché y optimización.', 'snap-sidebar-cart'); ?></li>
            </ol>
            
            <h3><?php _e('Los productos no se añaden en la posición configurada', 'snap-sidebar-cart'); ?></h3>
            <ol>
                <li><?php _e('Verifique que ha seleccionado la posición deseada en la pestaña "Configuración de Animaciones".', 'snap-sidebar-cart'); ?></li>
                <li><?php _e('Limpie la caché del navegador y de cualquier plugin de caché para asegurar que se carguen los archivos JS más recientes.', 'snap-sidebar-cart'); ?></li>
                <li><?php _e('Si el problema persiste, intente purgar todas las cachés y reiniciar su navegador.', 'snap-sidebar-cart'); ?></li>
            </ol>
            
            <h3><?php _e('Las animaciones no funcionan correctamente', 'snap-sidebar-cart'); ?></h3>
            <ol>
                <li><?php _e('Asegúrese de que jQuery esté cargado correctamente en su sitio.', 'snap-sidebar-cart'); ?></li>
                <li><?php _e('Verifique si hay conflictos con otros plugins que también modifican las animaciones o el carrito.', 'snap-sidebar-cart'); ?></li>
                <li><?php _e('Intente ajustar la duración de las animaciones a un valor más bajo (200-500ms) para que sean más fluidas.', 'snap-sidebar-cart'); ?></li>
            </ol>
            
            <h3><?php _e('El preloader no aparece o tiene un estilo incorrecto', 'snap-sidebar-cart'); ?></h3>
            <ol>
                <li><?php _e('Verifique la configuración del preloader en la pestaña correspondiente.', 'snap-sidebar-cart'); ?></li>
                <li><?php _e('Asegúrese de que no haya conflictos de CSS con su tema que puedan estar ocultando el preloader.', 'snap-sidebar-cart'); ?></li>
                <li><?php _e('Intente cambiar el tipo de preloader a otro estilo para ver si funciona correctamente.', 'snap-sidebar-cart'); ?></li>
            </ol>
            
            <h3><?php _e('Productos duplicados en el carrito', 'snap-sidebar-cart'); ?></h3>
            <ol>
                <li><?php _e('Si ve productos duplicados, esto puede ser un problema con la configuración de WooCommerce.', 'snap-sidebar-cart'); ?></li>
                <li><?php _e('Pruebe a vaciar completamente su carrito y añadir productos nuevamente.', 'snap-sidebar-cart'); ?></li>
                <li><?php _e('Verifique si tiene otros plugins que modifiquen el comportamiento del carrito y puedan estar causando conflictos.', 'snap-sidebar-cart'); ?></li>
            </ol>
        </div>
    </div>
    
    <h2><?php _e('Últimas entradas del log', 'snap-sidebar-cart'); ?></h2>
    
    <?php
    $log_file = SNAP_SIDEBAR_CART_PATH . 'logs/debug.log';
    if (file_exists($log_file)) {
        $log_content = file_get_contents($log_file);
        $log_lines = explode("\n", $log_content);
        
        // Mostrar solo las últimas 50 líneas
        $log_lines = array_slice($log_lines, -50);
        
        echo '<div class="log-viewer" style="background: #f1f1f1; padding: 10px; max-height: 400px; overflow: auto; font-family: monospace; font-size: 12px;">';
        
        if (empty($log_lines) || (count($log_lines) === 1 && empty($log_lines[0]))) {
            echo '<p>' . __('El archivo de log está vacío.', 'snap-sidebar-cart') . '</p>';
        } else {
            foreach ($log_lines as $line) {
                // Aplicar colores según el nivel de log
                $line_class = '';
                if (strpos($line, '[ERROR]') !== false) {
                    $line_class = 'color: red;';
                } elseif (strpos($line, '[WARN]') !== false) {
                    $line_class = 'color: orange;';
                } elseif (strpos($line, '[INFO]') !== false) {
                    $line_class = 'color: blue;';
                } elseif (strpos($line, '[DEBUG]') !== false) {
                    $line_class = 'color: gray;';
                }
                
                echo '<div style="' . $line_class . '">' . esc_html($line) . '</div>';
            }
        }
        
        echo '</div>';
    } else {
        echo '<p>' . __('No hay archivo de log disponible.', 'snap-sidebar-cart') . '</p>';
    }
    ?>
    
    <div class="postbox" style="margin-top: 20px;">
        <div class="inside">
            <h3><?php _e('Información para soporte', 'snap-sidebar-cart'); ?></h3>
            <p><?php _e('Si continúa experimentando problemas, contacte al desarrollador del plugin y proporcione la siguiente información:', 'snap-sidebar-cart'); ?></p>
            <ul>
                <li><?php _e('Capturas de pantalla de esta página de diagnóstico.', 'snap-sidebar-cart'); ?></li>
                <li><?php _e('Cualquier error que aparezca en la consola del navegador (F12 > Consola).', 'snap-sidebar-cart'); ?></li>
                <li><?php _e('Capturas de pantalla que muestren el problema que está experimentando.', 'snap-sidebar-cart'); ?></li>
                <li><?php _e('Detalles de los pasos que ha seguido para intentar solucionar el problema.', 'snap-sidebar-cart'); ?></li>
            </ul>
        </div>
    </div>
</div>
