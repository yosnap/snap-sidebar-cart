<?php
// Script para forzar el guardado de opciones

// Requerir WordPress
require_once '../../../../wp-load.php';

// Verificar si es administrador
if (!current_user_can('manage_options')) {
    wp_die('Acceso denegado');
}

// Opciones de ejemplo
$options = array(
    'title' => 'Carrito de compra',
    'container_selector' => 'sidebar-cart-container',
    'activation_selectors' => '.ti-shopping-cart',
    'show_shipping' => true,
    'auto_open' => true,
    'styles' => array(
        'sidebar_width' => '400px',
        'sidebar_background' => '#ffffff',
        'header_background' => '#f8f8f8',
        'header_text_color' => '#333333',
        'product_text_color' => '#333333',
        'button_background' => '#2c6aa0',
        'button_text_color' => '#ffffff',
    ),
    'related_products' => array(
        'show' => true,
        'count' => 4,
        'columns' => 2,
        'orderby' => 'rand',
    ),
);

// Guardar opciones
$result = update_option('snap_sidebar_cart_options', $options);

// Mostrar resultado
echo '<h1>Resultado del guardado:</h1>';
echo '<p>' . ($result ? 'Opciones guardadas correctamente' : 'Error al guardar opciones') . '</p>';

// Mostrar opciones actuales
echo '<h2>Opciones guardadas:</h2>';
echo '<pre>';
print_r(get_option('snap_sidebar_cart_options'));
echo '</pre>';

// Enlace para volver
echo '<p><a href="' . admin_url('admin.php?page=snap-sidebar-cart') . '">Volver a la configuración</a></p>';
