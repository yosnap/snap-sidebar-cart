<?php
/**
 * Script para añadir aviso de obsolescencia a archivos JavaScript obsoletos
 */

// Lista de archivos obsoletos
$obsolete_files = [
    'ajax-update-handler.js',
    'buttons-direct-fix.js',
    'close-button-test.js',
    'close-sidebar-fix.js',
    'cors-handler.js',
    'direct-close-fix.js',
    'direct-fix.js',
    'direct-remove-button-fix.js',
    'frontend.js',
    'immediate-fix.js',
    'last-unit-handler.js',
    'preloader-controller.js',
    'preloader-fix.js',
    'quantity-preloader.js',
    'remove-button-fix-enhanced.js',
    'remove-button-fix-simple.js',
    'remove-button-fix.js',
    'simple-preloader.js',
    'slider-nav-fix.js',
    'snap-sidebar-cart-combined.js',
    'snap-sidebar-cart-debug.js',
    'snap-sidebar-cart-main.js',
    'stock-and-remove-handler.js',
    'swiper-init.js',
    'tabs-fix.js',
    'tabs-loader.js'
];

// Aviso de obsolescencia
$obsolete_notice = <<<'EOT'
/**
 * ARCHIVO OBSOLETO - NO UTILIZAR
 * 
 * Este archivo ya no se utiliza en el plugin Snap Sidebar Cart.
 * La funcionalidad ha sido migrada a los siguientes archivos consolidados:
 * 
 * - snap-sidebar-cart-core.js: Funcionalidad principal del carrito
 * - snap-sidebar-cart-ajax.js: Controlador de peticiones AJAX
 * - quantity-handler-unified.js: Manejador unificado de cantidades
 * 
 * Por favor, no modifiques este archivo. Si necesitas realizar cambios,
 * hazlo en los archivos consolidados mencionados anteriormente.
 */

EOT;

// Directorio base
$base_dir = dirname(__FILE__);

// Procesar cada archivo
foreach ($obsolete_files as $file) {
    $file_path = $base_dir . '/' . $file;
    
    if (file_exists($file_path)) {
        // Leer el contenido actual
        $content = file_get_contents($file_path);
        
        // Comprobar si ya tiene el aviso
        if (strpos($content, 'ARCHIVO OBSOLETO') === false) {
            // Añadir el aviso al principio del archivo
            $new_content = $obsolete_notice . $content;
            
            // Guardar el archivo
            file_put_contents($file_path, $new_content);
            
            echo "Aviso añadido a: $file\n";
        } else {
            echo "El archivo ya tiene el aviso: $file\n";
        }
    } else {
        echo "Archivo no encontrado: $file\n";
    }
}

echo "Proceso completado.\n";