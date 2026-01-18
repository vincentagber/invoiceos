<?php
// backend/config/database.php

class Database {
    private $dbConnection = null;

    public function __construct() {
        $this->loadEnv();
        
        $driver = getenv('DB_DRIVER') ?: 'mysql'; // Default to MySQL
        $host = getenv('DB_HOST') ?: 'localhost';
        $port = getenv('DB_PORT') ?: '3306';
        $dbname = getenv('DB_NAME') ?: 'superlink_invoice';
        $user = getenv('DB_USER') ?: 'root';
        $password = getenv('DB_PASSWORD') ?: 'root';
        $charset = getenv('DB_CHARSET') ?: 'utf8mb4';

        try {
            switch ($driver) {
                case 'mysql':
                    // MySQL Connection (MAMP/Local)
                    $dsn = "mysql:host=$host;port=$port;dbname=$dbname;charset=$charset";
                    $this->dbConnection = new PDO($dsn, $user, $password, [
                        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                        PDO::ATTR_EMULATE_PREPARES => false,
                        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES $charset"
                    ]);
                    break;
                    
                case 'pgsql':
                    // PostgreSQL Connection (Supabase/Production)
                    $dsn = "pgsql:host=$host;port=$port;dbname=$dbname";
                    $this->dbConnection = new PDO($dsn, $user, $password, [
                        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
                    ]);
                    break;
                    
                case 'sqlite':
                    // SQLite Connection (Fallback)
                    $dbPath = __DIR__ . '/../db.sqlite';
                    $this->dbConnection = new PDO('sqlite:' . $dbPath, null, null, [
                        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
                    ]);
                    $this->dbConnection->exec("PRAGMA foreign_keys = ON;");
                    break;
                    
                default:
                    throw new Exception("Unsupported database driver: $driver");
            }
        } catch (PDOException $e) {
            error_log("Database connection failed: " . $e->getMessage());
            throw new Exception("Database connection failed: " . $e->getMessage());
        }
    }

    private function loadEnv() {
        $envFile = __DIR__ . '/../.env';
        if (file_exists($envFile)) {
            $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            foreach ($lines as $line) {
                if (strpos(trim($line), '#') === 0) continue;
                if (strpos($line, '=') === false) continue;
                list($key, $value) = explode('=', $line, 2);
                $key = trim($key);
                $value = trim($value);
                if (!array_key_exists($key, $_SERVER) && !array_key_exists($key, $_ENV)) {
                    putenv(sprintf('%s=%s', $key, $value));
                    $_ENV[$key] = $value;
                    $_SERVER[$key] = $value;
                }
            }
        }
    }

    public function getConnection() {
        return $this->dbConnection;
    }
    
    /**
     * Get the database driver name
     */
    public function getDriverName() {
        return $this->dbConnection->getAttribute(PDO::ATTR_DRIVER_NAME);
    }
}

if (!function_exists('getallheaders')) {
    function getallheaders() {
        $headers = [];
        foreach ($_SERVER as $name => $value) {
            if (substr($name, 0, 5) == 'HTTP_') {
                $headers[str_replace(' ', '-', ucwords(str_replace('_', ' ', strtolower(substr($name, 5)))))] = $value;
            }
        }
        return $headers;
    }
}
?>
