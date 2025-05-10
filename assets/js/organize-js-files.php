<?php
/**
 * Script para organizar los archivos JavaScript del plugin Snap Sidebar Cart
 * 
 * Este script mueve los archivos JavaScript obsoletos a una carpeta legacy-files
 * para mantener el directorio principal limpio.
 */

// Archivos que se mantendrán en el directorio principal
$keep_files = array(
    'snap-sidebar-cart-public.js',
    'snap-sidebar-cart-unified.js',
    'snap-sidebar-cart-admin.js',
    'organize-js-files.php',
    'README.md',
    'OBSOLETE_FILES.md',
    'script-config.json'
);

// Directorio base
$base_dir = __DIR__;
$legacy_dir = $base_dir . '/legacy-files';

// Asegurarse de que el directorio legacy existe
if (!file_exists($legacy_dir)) {
    mkdir($legacy_dir, 0755, true);
}

// Obtener todos los archivos JavaScript del directorio
$files = glob($base_dir . '/*.js');

// Mover archivos obsoletos a la carpeta legacy
foreach ($files as $file) {
    $filename = basename($file);
    
    // Si el archivo no está en la lista de archivos a mantener, moverlo a legacy
    if (!in_array($filename, $keep_files)) {
        $destination = $legacy_dir . '/' . $filename;
        
        // Copiar el archivo a legacy
        if (copy($file, $destination)) {
            // Eliminar el archivo original
            unlink($file);
            echo "Archivo movido: $filename\n";
        } else {
            echo "Error al mover el archivo: $filename\n";
        }
    }
}

// Mover también los archivos de la carpeta handlers si existe
$handlers_dir = $base_dir . '/handlers';
if (file_exists($handlers_dir) && is_dir($handlers_dir)) {
    $legacy_handlers_dir = $legacy_dir . '/handlers';
    
    // Crear directorio legacy/handlers si no existe
    if (!file_exists($legacy_handlers_dir)) {
        mkdir($legacy_handlers_dir, 0755, true);
    }
    
    // Obtener todos los archivos de la carpeta handlers
    $handler_files = glob($handlers_dir . '/*.js');
    
    // Mover archivos de handlers a legacy/handlers
    foreach ($handler_files as $file) {
        $filename = basename($file);
        $destination = $legacy_handlers_dir . '/' . $filename;
        
        // Copiar el archivo a legacy/handlers
        if (copy($file, $destination)) {
            // Eliminar el archivo original
            unlink($file);
            echo "Archivo de handlers movido: $filename\n";
        } else {
            echo "Error al mover el archivo de handlers: $filename\n";
        }
    }
    
    // Eliminar el directorio handlers si está vacío
    $remaining_files = glob($handlers_dir . '/*');
    if (empty($remaining_files)) {
        rmdir($handlers_dir);
        echo "Directorio handlers eliminado\n";
    }
}

echo "Proceso completado.\n";