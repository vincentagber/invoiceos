<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../../config/database.php';
include_once '../../classes/AuthMiddleware.php';

$database = new Database();
$db = $database->getConnection();

$auth = new AuthMiddleware($db, getallheaders());
$user = $auth->isValid();

if (!$user) {
    http_response_code(401);
    echo json_encode(["message" => "Unauthorized."]);
    exit();
}

$quotation_id = isset($_GET['id']) ? $_GET['id'] : null;

if ($quotation_id) {
    // Fetch single quotation details
    $query = "SELECT q.*, c.name as client_name, c.email as client_email, c.address as client_address 
              FROM quotations q 
              LEFT JOIN clients c ON q.client_id = c.id
              WHERE q.id = :id AND q.user_id = :user_id";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $quotation_id);
    $stmt->bindParam(':user_id', $user->id);
    $stmt->execute();

    $quotation = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($quotation) {
        // Fetch items
        $item_query = "SELECT * FROM quotation_items WHERE quotation_id = :quotation_id";
        $item_stmt = $db->prepare($item_query);
        $item_stmt->bindParam(':quotation_id', $quotation_id);
        $item_stmt->execute();
        $items = $item_stmt->fetchAll(PDO::FETCH_ASSOC);

        $quotation['items'] = $items;
        
        echo json_encode($quotation);
    } else {
        http_response_code(404);
        echo json_encode(["message" => "Quotation not found."]);
    }

} else {
    // Fetch all quotations for user
    $query = "SELECT q.*, c.name as client_name 
              FROM quotations q 
              LEFT JOIN clients c ON q.client_id = c.id
              WHERE q.user_id = :user_id 
              ORDER BY q.created_at DESC";

    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $user->id);
    $stmt->execute();

    $quotations = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($quotations);
}
