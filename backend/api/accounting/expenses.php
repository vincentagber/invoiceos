<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../../config/database.php';
require_once '../../classes/JwtHandler.php';

$db = (new Database())->getConnection();
$jwt = new JwtHandler();

// Authenticate
$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
$token = str_replace('Bearer ', '', $authHeader);
$userData = $jwt->validateToken($token);

if (!$userData) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit();
}

$user_id = $userData->data->id;

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Get all expenses for user
    // Updated column name from 'date' to 'expense_date' for MySQL compatibility
    try {
        $stmt = $db->prepare("SELECT * FROM expenses WHERE user_id = :user_id ORDER BY expense_date DESC");
        $stmt->bindParam(":user_id", $user_id);
        $stmt->execute();
        $expenses = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode(["status" => "success", "data" => $expenses]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Add new expense
    $data = json_decode(file_get_contents("php://input"));
    
    if (empty($data->merchant) || empty($data->amount) || empty($data->category) || empty($data->date)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Incomplete data"]);
        exit();
    }
    
    try {
        // Updated column name from 'date' to 'expense_date' for MySQL compatibility
        $sql = "INSERT INTO expenses (user_id, merchant, category, amount, expense_date, description, receipt_url) 
                VALUES (:user_id, :merchant, :category, :amount, :expense_date, :description, :receipt_url)";
        
        $stmt = $db->prepare($sql);
        $stmt->bindParam(":user_id", $user_id);
        $stmt->bindParam(":merchant", $data->merchant);
        $stmt->bindParam(":category", $data->category);
        $stmt->bindParam(":amount", $data->amount);
        $stmt->bindParam(":expense_date", $data->date);
        $stmt->bindParam(":description", $data->description);
        $stmt->bindParam(":receipt_url", $data->receipt_url);
        
        if ($stmt->execute()) {
            echo json_encode(["status" => "success", "message" => "Expense added"]);
        } else {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Database error"]);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
}
?>
