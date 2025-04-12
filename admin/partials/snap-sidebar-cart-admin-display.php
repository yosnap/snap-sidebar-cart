<?php
/**
 * Proporciona una vista de área de administración para el plugin
 *
 * @since      1.0.0
 */
?>

<div class="wrap">
    <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
    
    <div class="snap-sidebar-cart-admin-wrapper">
        <form method="post" action="options.php">
            <?php
            settings_fields('snap_sidebar_cart_option_group');
            do_settings_sections('snap-sidebar-cart-settings');
            submit_button(__('Guardar cambios', 'snap-sidebar-cart'));
            ?>
        </form>
        
        <div class="snap-sidebar-cart-admin-sidebar">
            <div class="snap-sidebar-cart-admin-box">
                <h3><?php _e('Sobre este plugin', 'snap-sidebar-cart'); ?></h3>
                <p><?php _e('Snap Sidebar Cart es un plugin para WooCommerce que añade un carrito lateral con animaciones y productos relacionados.', 'snap-sidebar-cart'); ?></p>
                
                <h4><?php _e('Características principales', 'snap-sidebar-cart'); ?></h4>
                <ul>
                    <li><?php _e('Carrito lateral que se muestra cuando se añaden productos', 'snap-sidebar-cart'); ?></li>
                    <li><?php _e('Productos relacionados en un slider configurable', 'snap-sidebar-cart'); ?></li>
                    <li><?php _e('Estilos personalizables para todo el carrito', 'snap-sidebar-cart'); ?></li>
                    <li><?php _e('Animaciones al añadir o eliminar productos', 'snap-sidebar-cart'); ?></li>
                    <li><?php _e('Compatible con todos los temas de WooCommerce', 'snap-sidebar-cart'); ?></li>
                </ul>
            </div>
            
            <div class="snap-sidebar-cart-admin-box">
                <h3><?php _e('Soporte', 'snap-sidebar-cart'); ?></h3>
                <p><?php _e('Si necesitas ayuda con el plugin, por favor contacta con el desarrollador.', 'snap-sidebar-cart'); ?></p>
                
                <p><a href="https://github.com/username/snap-sidebar-cart" target="_blank" class="button button-secondary"><?php _e('Documentación', 'snap-sidebar-cart'); ?></a></p>
            </div>
        </div>
    </div>
</div>
