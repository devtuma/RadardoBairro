<?php
require_once 'config.php';

$db = Database::getInstance()->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

/**
 * POST - Reportar um item (post, comentário ou mensagem de chat)
 */
if ($method === 'POST') {
    try {
        $input = json_decode(file_get_contents('php://input'), true);

        $reportType = sanitizeInput($input['report_type'] ?? '');
        $itemId = intval($input['item_id'] ?? 0);
        $reason = sanitizeInput($input['reason'] ?? '');
        $userHash = getUserHash();

        // Validações
        if (!in_array($reportType, ['post', 'comment', 'chat_message'])) {
            errorResponse('Tipo de report inválido. Use: post, comment ou chat_message');
        }

        if ($itemId <= 0) {
            errorResponse('ID do item inválido');
        }

        if (!in_array($reason, ['spam', 'offensive', 'inappropriate', 'fake', 'other'])) {
            errorResponse('Motivo inválido');
        }

        // Verificar se o item existe
        if ($reportType === 'post') {
            $stmt = $db->prepare("SELECT id FROM posts WHERE id = ?");
        } elseif ($reportType === 'comment') {
            $stmt = $db->prepare("SELECT id FROM post_comments WHERE id = ?");
        } else {
            $stmt = $db->prepare("SELECT id FROM chat_messages WHERE id = ?");
        }

        $stmt->execute([$itemId]);
        if (!$stmt->fetch()) {
            errorResponse('Item não encontrado', 404);
        }

        // Inserir report (se já existir, ignora devido ao UNIQUE constraint)
        $sql = "INSERT INTO reports (report_type, item_id, reason, user_hash)
                VALUES (?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE created_at = created_at"; // Não atualiza se já existe

        $stmt = $db->prepare($sql);
        $stmt->execute([$reportType, $itemId, $reason, $userHash]);

        // Verificar quantos reports o item tem
        $stmt = $db->prepare("
            SELECT COUNT(DISTINCT user_hash) as count
            FROM reports
            WHERE report_type = ? AND item_id = ?
        ");
        $stmt->execute([$reportType, $itemId]);
        $reportData = $stmt->fetch();
        $reportCount = intval($reportData['count']);

        $message = 'Denúncia registrada. ';

        if ($reportCount >= 5) {
            $message .= 'O item foi removido automaticamente por múltiplas denúncias.';
        } else {
            $message .= sprintf('Total de denúncias: %d/5', $reportCount);
        }

        successResponse(['report_count' => $reportCount], $message);

    } catch (Exception $e) {
        error_log("Erro ao registrar denúncia: " . $e->getMessage());
        errorResponse('Erro ao registrar denúncia', 500);
    }
}

/**
 * GET - Obter número de reports de um item
 */
if ($method === 'GET') {
    try {
        $reportType = sanitizeInput($_GET['report_type'] ?? '');
        $itemId = intval($_GET['item_id'] ?? 0);

        if (!in_array($reportType, ['post', 'comment', 'chat_message'])) {
            errorResponse('Tipo de report inválido');
        }

        if ($itemId <= 0) {
            errorResponse('ID do item inválido');
        }

        // Buscar contagem de reports
        $stmt = $db->prepare("
            SELECT COUNT(DISTINCT user_hash) as count
            FROM reports
            WHERE report_type = ? AND item_id = ?
        ");
        $stmt->execute([$reportType, $itemId]);
        $reportData = $stmt->fetch();

        // Verificar se usuário atual já reportou
        $userHash = getUserHash();
        $stmt = $db->prepare("
            SELECT id FROM reports
            WHERE report_type = ? AND item_id = ? AND user_hash = ?
        ");
        $stmt->execute([$reportType, $itemId, $userHash]);
        $userReported = $stmt->fetch() !== false;

        $response = [
            'report_count' => intval($reportData['count']),
            'user_reported' => $userReported
        ];

        successResponse($response);

    } catch (Exception $e) {
        error_log("Erro ao buscar reports: " . $e->getMessage());
        errorResponse('Erro ao buscar reports', 500);
    }
}

errorResponse('Método não suportado', 405);
?>
