<?php
// backend/api/dashboard/stats.php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../../config/database.php';
require_once '../../classes/AuthMiddleware.php';

$database = new Database();
$db = $database->getConnection();

$auth = new AuthMiddleware($db, getallheaders());
$userData = $auth->isValid();

if ($userData) {
    // Total Clients
    $totalClientsQuery = "SELECT COUNT(*) as count FROM clients WHERE user_id = :user_id";
    $stmt = $db->prepare($totalClientsQuery);
    $stmt->bindParam(":user_id", $userData->id);
    $stmt->execute();
    $totalClients = $stmt->fetch(PDO::FETCH_ASSOC)['count'];

    // Total Invoices
    $totalInvoicesQuery = "SELECT COUNT(*) as count FROM invoices WHERE user_id = :user_id";
    $stmt = $db->prepare($totalInvoicesQuery);
    $stmt->bindParam(":user_id", $userData->id);
    $stmt->execute();
    $totalInvoices = $stmt->fetch(PDO::FETCH_ASSOC)['count'];

    // Total Revenue (Paid Invoices)
    $revenueQuery = "SELECT SUM(total) as total FROM invoices WHERE user_id = :user_id AND status = 'paid'";
    $stmt = $db->prepare($revenueQuery);
    $stmt->bindParam(":user_id", $userData->id);
    $stmt->execute();
    $totalRevenue = $stmt->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;
    
    // Outstanding (Sent/Overdue)
    $outstandingQuery = "SELECT SUM(total) as total FROM invoices WHERE user_id = :user_id AND status IN ('sent', 'overdue')";
    $stmt = $db->prepare($outstandingQuery);
    $stmt->bindParam(":user_id", $userData->id);
    $stmt->execute();
    $totalOutstanding = $stmt->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;
    
    // Recent Invoices (Last 5)
    $recentQuery = "SELECT i.invoice_number, i.total, i.status, c.name as client_name 
                    FROM invoices i 
                    JOIN clients c ON i.client_id = c.id 
                    WHERE i.user_id = :user_id 
                    ORDER BY i.created_at DESC LIMIT 5";
    $stmt = $db->prepare($recentQuery);
    $stmt->bindParam(":user_id", $userData->id);
    $stmt->execute();
    $recentInvoices = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "total_clients" => $totalClients,
        "total_invoices" => $totalInvoices,
        "total_revenue" => $totalRevenue,
        "total_outstanding" => $totalOutstanding,
        "recent_invoices" => $recentInvoices
    ]);

} else {
    http_response_code(401);
    echo json_encode(["message" => "Unauthorized."]);
}
?>
