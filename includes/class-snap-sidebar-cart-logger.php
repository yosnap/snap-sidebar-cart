<?php
/**
 * Clase para el registro de eventos y depuración.
 *
 * @since      1.2.3
 */
class Snap_Sidebar_Cart_Logger {

    /**
     * Nombre del archivo de registro.
     *
     * @since    1.2.3
     * @access   private
     * @var      string    $log_file    Ruta al archivo de registro.
     */
    private static $log_file;

    /**
     * Inicializa el sistema de registro.
     *
     * @since    1.2.3
     */
    public static function init() {
        self::$log_file = SNAP_SIDEBAR_CART_PATH . 'logs/debug.log';
        
        // Asegurarse de que el directorio de logs existe
        if (!file_exists(dirname(self::$log_file))) {
            mkdir(dirname(self::$log_file), 0755, true);
        }
        
        // Limpiar el archivo de log si es muy grande (más de 1MB)
        if (file_exists(self::$log_file) && filesize(self::$log_file) > 1048576) {
            // Guardar una copia antes de limpiar
            copy(self::$log_file, self::$log_file . '.' . date('Y-m-d-H-i-s') . '.bak');
            // Truncar el archivo
            file_put_contents(self::$log_file, "=== Log reiniciado " . date('Y-m-d H:i:s') . " ===\n");
        }
    }

    /**
     * Registra un mensaje en el archivo de log.
     *
     * @since    1.2.3
     * @param    string    $message    Mensaje a registrar.
     * @param    string    $level      Nivel de log (info, warn, error, debug).
     */
    public static function log($message, $level = 'info') {
        if (!self::$log_file) {
            self::init();
        }
        
        $timestamp = date('Y-m-d H:i:s');
        $level_upper = strtoupper($level);
        
        // Obtener la función que llamó
        $trace = debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS, 2);
        $caller = isset($trace[1]['function']) ? $trace[1]['function'] : 'unknown';
        $class = isset($trace[1]['class']) ? $trace[1]['class'] : '';
        
        // Formatear el mensaje
        $formatted_message = "[$timestamp] [$level_upper] ";
        if ($class) {
            $formatted_message .= "[$class::$caller] ";
        } else {
            $formatted_message .= "[$caller] ";
        }
        $formatted_message .= $message . "\n";
        
        // Escribir al archivo
        file_put_contents(self::$log_file, $formatted_message, FILE_APPEND);
    }

    /**
     * Registra un mensaje de nivel info.
     *
     * @since    1.2.3
     * @param    string    $message    Mensaje a registrar.
     */
    public static function info($message) {
        self::log($message, 'info');
    }

    /**
     * Registra un mensaje de nivel warning.
     *
     * @since    1.2.3
     * @param    string    $message    Mensaje a registrar.
     */
    public static function warn($message) {
        self::log($message, 'warn');
    }

    /**
     * Registra un mensaje de nivel error.
     *
     * @since    1.2.3
     * @param    string    $message    Mensaje a registrar.
     */
    public static function error($message) {
        self::log($message, 'error');
    }

    /**
     * Registra un mensaje de nivel debug.
     *
     * @since    1.2.3
     * @param    string    $message    Mensaje a registrar.
     */
    public static function debug($message) {
        self::log($message, 'debug');
    }

    /**
     * Registra un objeto o array en formato JSON.
     *
     * @since    1.2.3
     * @param    mixed     $data       Datos a registrar.
     * @param    string    $label      Etiqueta para los datos.
     * @param    string    $level      Nivel de log (info, warn, error, debug).
     */
    public static function logData($data, $label = 'Data', $level = 'debug') {
        $json = json_encode($data, JSON_PRETTY_PRINT);
        self::log("$label: $json", $level);
    }

    /**
     * Limpia el archivo de log.
     *
     * @since    1.2.3
     */
    public static function clear() {
        if (!self::$log_file) {
            self::init();
        }
        
        // Guardar una copia antes de limpiar
        if (file_exists(self::$log_file)) {
            copy(self::$log_file, self::$log_file . '.' . date('Y-m-d-H-i-s') . '.bak');
        }
        
        // Truncar el archivo
        file_put_contents(self::$log_file, "=== Log limpiado " . date('Y-m-d H:i:s') . " ===\n");
    }
}
