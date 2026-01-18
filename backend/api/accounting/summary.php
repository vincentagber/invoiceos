<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
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

try {
    // 1. Calculate Gross Revenue (Paid Invoices)
    // NOTE: In a real app we might convert currency. Assuming USD for now.
    $stmt = $db->prepare("SELECT SUM(total) as gross_revenue FROM invoices WHERE user_id = :user_id AND status = 'paid'");
    $stmt->bindParam(":user_id", $user_id);
    $stmt->execute();
    $revenue_result = $stmt->fetch(PDO::FETCH_ASSOC);
    $gross_revenue = floatval($revenue_result['gross_revenue'] ?? 0);

    // 2. Calculate Total Expenses
    $stmt = $db->prepare("SELECT SUM(amount) as total_expenses FROM expenses WHERE user_id = :user_id");
    $stmt->bindParam(":user_id", $user_id);
    $stmt->execute();
    $expense_result = $stmt->fetch(PDO::FETCH_ASSOC);
    $total_expenses = floatval($expense_result['total_expenses'] ?? 0);

    // 3. Outstanding Revenue (Unpaid Invoices) - Optional statistic
    $stmt = $db->prepare("SELECT SUM(total) as outstanding FROM invoices WHERE user_id = :user_id AND status != 'paid' AND status != 'draft' AND status != 'cancelled'");
    $stmt->bindParam(":user_id", $user_id);
    $stmt->execute();
    $outstanding_result = $stmt->fetch(PDO::FETCH_ASSOC);
    $outstanding_revenue = floatval($outstanding_result['outstanding'] ?? 0);

    // 4. Net Profit
    $net_profit = $gross_revenue - $total_expenses;
    $profit_margin = $gross_revenue > 0 ? ($net_profit / $gross_revenue) * 100 : 0;

    // 5. Recent Activity (combined) - Optional, maybe for later

    // 6. Tax Details (Nigerian Tax Act 2025 Logic)
    // Get Tax Settings (used for filing status mainly)
    $stmt = $db->prepare("SELECT * FROM tax_settings WHERE user_id = :user_id");
    $stmt->bindParam(":user_id", $user_id);
    $stmt->execute();
    $tax_settings = $stmt->fetch(PDO::FETCH_ASSOC);

    // Default Variables
    $cit_rate = 0;
    $dev_levy_rate = 0;
    $tax_category = "Small Company (Exempt)";

    // Turnover Threshold for Small Company is N100,000,000
    if ($gross_revenue > 100000000) {
        $cit_rate = 30.0; // 30% for Large Company
        $dev_levy_rate = 4.0; // 4% Development Levy
        $tax_category = "Large Company";
    }

    // Calculate Liability
    // Tax is calculated on Assessable Profit (~Net Profit). If Net Profit < 0, Tax is 0.
    $assessable_profit = max(0, $net_profit);
    
    $cit_amount = $assessable_profit * ($cit_rate / 100);
    $dev_levy_amount = $assessable_profit * ($dev_levy_rate / 100);
    
    $estimated_tax_owed = $cit_amount + $dev_levy_amount;

    $response = [
        "status" => "success",
        "data" => [
            "gross_revenue" => $gross_revenue,
            "total_expenses" => $total_expenses,
            "net_profit" => $net_profit,
            "profit_margin" => round($profit_margin, 2),
            "outstanding_revenue" => $outstanding_revenue,
            "tax_projection" => [
                "estimated_tax_owed" => round($estimated_tax_owed, 2),
                "tax_rate" => $cit_rate,
                "dev_levy_rate" => $dev_levy_rate,
                "dev_levy_amount" => round($dev_levy_amount, 2),
                "cit_amount" => round($cit_amount, 2),
                "tax_category" => $tax_category,
                "filing_status" => $tax_settings['filing_status'] ?? 'Company (CIT)'
            ]
        ]
    ];

    echo json_encode($response);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
