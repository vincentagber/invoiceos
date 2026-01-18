<?php
require 'config/database.php';

try {
    $db = (new Database())->getConnection();
    
    // Read the new schema file
    $sql = file_get_contents(__DIR__ . '/schema_accounting.sql');
    
    // Execute
    $db->exec($sql);
    echo "Accounting tables initialized successfully.\n";
    
    // Verify
    $driver = $db->getAttribute(PDO::ATTR_DRIVER_NAME);
    $tables = [];

    if ($driver === 'sqlite') {
        $tables = $db->query("SELECT name FROM sqlite_master WHERE type='table'")->fetchAll(PDO::FETCH_COLUMN);
    } elseif ($driver === 'pgsql') {
        $tables = $db->query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")->fetchAll(PDO::FETCH_COLUMN);
    }
    
    echo "All Tables: " . implode(", ", $tables) . "\n";
    
} catch (Exception $e) {
    echo "Error initializing accounting database: " . $e->getMessage() . "\n";
}
?>
