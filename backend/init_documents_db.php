<?php
require_once __DIR__ . '/config/database.php';
// require 'vendor/autoload.php'; // Commented out as we might not need it for simple DB init if Database class is self-contained

$database = new Database();
$db = $database->getConnection();

// Helper to determine driver
$driver = $db->getAttribute(PDO::ATTR_DRIVER_NAME);

try {
    // Read schema
    $sql = file_get_contents(__DIR__ . '/schema_documents.sql');
    
    // Adjust for SQLite if running locally and strictly using SQLite syntax
    if ($driver == 'sqlite') {
        $sql = str_replace('SERIAL PRIMARY KEY', 'INTEGER PRIMARY KEY AUTOINCREMENT', $sql);
        $sql = str_replace('TIMESTAMP WITH TIME ZONE', 'DATETIME', $sql);
    }
    
    // Execute
    $db->exec($sql);
    echo "Documents table created successfully using $driver driver.\n";
    
} catch(PDOException $e) {
    echo "Error creating table: " . $e->getMessage() . "\n";
}
?>
