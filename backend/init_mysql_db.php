<?php
/**
 * MySQL Database Initialization Script
 * Run this script to create all tables in the MySQL database
 * 
 * Usage: php init_mysql_db.php
 */

require 'config/database.php';

try {
    $db = (new Database())->getConnection();
    $driver = $db->getAttribute(PDO::ATTR_DRIVER_NAME);
    
    echo "Database Driver: $driver\n";
    echo "Initializing database...\n\n";
    
    if ($driver !== 'mysql') {
        echo "Warning: Expected MySQL driver, got $driver. Check your .env configuration.\n";
    }
    
    // Read and execute main schema
    $mainSchema = file_get_contents(__DIR__ . '/schema_mysql.sql');
    $db->exec($mainSchema);
    echo "✓ Main schema (users, clients, invoices, settings, quotations) created.\n";
    
    // Read and execute accounting schema
    $accountingSchema = file_get_contents(__DIR__ . '/schema_accounting_mysql.sql');
    $db->exec($accountingSchema);
    echo "✓ Accounting schema (expenses, tax_settings) created.\n";

    // Seed sample data if tables are empty
    // Expenses
    $expenseCount = $db->query("SELECT COUNT(*) FROM expenses")->fetchColumn();
    if ($expenseCount == 0) {
        $sampleExpenses = [
            ['user_id' => 4, 'merchant' => 'Office Supplies', 'category' => 'Supplies', 'amount' => 120.00, 'expense_date' => date('Y-m-d'), 'description' => 'Stationery and paper'],
            ['user_id' => 4, 'merchant' => 'Software Co', 'category' => 'Software', 'amount' => 250.00, 'expense_date' => date('Y-m-d', strtotime('-3 days')), 'description' => 'Monthly SaaS subscription']
        ];
        $stmt = $db->prepare("INSERT INTO expenses (user_id, merchant, category, amount, expense_date, description) VALUES (:user_id, :merchant, :category, :amount, :expense_date, :description)");
        foreach ($sampleExpenses as $e) {
            $stmt->execute($e);
        }
        echo "✓ Sample expenses inserted.\n";
    }

    // Tax Settings
    $taxCount = $db->query("SELECT COUNT(*) FROM tax_settings")->fetchColumn();
    if ($taxCount == 0) {
        $stmt = $db->prepare("INSERT INTO tax_settings (user_id, tax_rate, filing_status, tax_id_number) VALUES (:user_id, :tax_rate, :filing_status, :tax_id_number)");
        $stmt->execute(['user_id' => 4, 'tax_rate' => 15.00, 'filing_status' => 'single', 'tax_id_number' => 'VAT123456']);
        echo "✓ Sample tax setting inserted.\n";
    }
    
    // Read and execute documents schema
    $documentsSchema = file_get_contents(__DIR__ . '/schema_documents_mysql.sql');
    $db->exec($documentsSchema);
    echo "✓ Documents schema created.\n";
    
    // List all tables
    echo "\n--- Database Tables ---\n";
    $tables = $db->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
    foreach ($tables as $table) {
        $count = $db->query("SELECT COUNT(*) FROM `$table`")->fetchColumn();
        echo "  - $table ($count rows)\n";
    }
    
    echo "\n✅ Database initialized successfully!\n";
    echo "\nConnection Info:\n";
    echo "  Host: " . (getenv('DB_HOST') ?: 'localhost') . "\n";
    echo "  Database: " . (getenv('DB_NAME') ?: 'superlink_invoice') . "\n";
    echo "  User: " . (getenv('DB_USER') ?: 'root') . "\n";
    
} catch (Exception $e) {
    echo "❌ Error initializing database: " . $e->getMessage() . "\n";
    echo "\nMake sure:\n";
    echo "  1. MAMP/MySQL is running\n";
    echo "  2. The database 'superlink_invoice' exists\n";
    echo "  3. Your .env credentials are correct\n";
    exit(1);
}
?>
