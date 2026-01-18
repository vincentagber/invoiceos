<?php
require 'config/database.php';

try {
    $db = (new Database())->getConnection();
    $sql = file_get_contents(__DIR__ . '/schema.sql');
    
    // Split by semicolon to execute one by one if needed, or just exec the whole batch
    // PDO::exec supports multiple statements in some drivers, but safer to split slightly or just try.
    // SQLite usually handles batch.
    
    $db->exec($sql);
    echo "Database initialized successfully.\n";
    
    // Check if tables exist
    $driver = $db->getAttribute(PDO::ATTR_DRIVER_NAME);
    $tables = [];

    if ($driver === 'sqlite') {
        $tables = $db->query("SELECT name FROM sqlite_master WHERE type='table'")->fetchAll(PDO::FETCH_COLUMN);
    } elseif ($driver === 'pgsql') {
        $tables = $db->query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")->fetchAll(PDO::FETCH_COLUMN);
    }
    
    echo "Tables: " . implode(", ", $tables) . "\n";
    
} catch (Exception $e) {
    echo "Error initializing database: " . $e->getMessage() . "\n";
}
?>
