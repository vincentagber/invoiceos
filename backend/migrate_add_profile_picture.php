<?php
require 'config/database.php';

try {
    $db = (new Database())->getConnection();
    
    // Check if column exists to avoid error
    $check = $db->query("PRAGMA table_info(users)");
    $columns = $check->fetchAll(PDO::FETCH_ASSOC);
    
    $exists = false;
    foreach ($columns as $col) {
        if ($col['name'] === 'profile_picture') {
            $exists = true;
            break;
        }
    }
    
    if (!$exists) {
        $sql = "ALTER TABLE users ADD COLUMN profile_picture TEXT";
        $db->exec($sql);
        echo "Successfully added 'profile_picture' column to 'users' table.\n";
    } else {
        echo "'profile_picture' column already exists.\n";
    }

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
