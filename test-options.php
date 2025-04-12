<?php
// Script de prueba para verificar el guardado de opciones

// Requerir WordPress
require_once dirname(dirname(dirname(dirname(__FILE__)))) . '/wp-load.php';

// Verificar si estamos guardando opciones
if (isset($_POST['test_save'])) {
    // Crear array de opciones
    $options = array(
        'title' => 'Título de prueba',
        'container_selector' => 'test-selector',
        'activation_selectors' => '.test-class',
        'show_shipping' => true,
        'auto_open' => true
    );
    
    // Guardar opciones
    update_option('snap_sidebar_cart_options', $options);
    echo '<p style="color:green;">Opciones guardadas correctamente</p>';
}

// Obtener opciones actuales
$saved_options = get_option('snap_sidebar_cart_options', array());

echo '<h2>Opciones actuales guardadas en la base de datos:</h2>';
echo '<pre>';
print_r($saved_options);
echo '</pre>';

// Formulario de prueba
echo '<form method="post">';
echo '<input type="submit" name="test_save" value="Guardar opciones de prueba">';
echo '</form>';
