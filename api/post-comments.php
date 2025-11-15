<?php
require_once 'config.php';

$db = Database::getInstance()->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

/**
 * GET - Buscar comentários de um post
 */
if ($method === 'GET') {
    try {
        $postId = intval($_GET['post_id'] ?? 0);
        $limit = intval($_GET['limit'] ?? 100);

        if ($postId <= 0) {
            errorResponse('ID do post inválido');
        }

        // Verificar se o post existe e não está expirado
        $stmt = $db->prepare("SELECT id FROM posts WHERE id = ? AND expires_at > NOW()");
        $stmt->execute([$postId]);
        if (!$stmt->fetch()) {
            errorResponse('Post não encontrado ou expirado', 404);
        }

        // Buscar comentários
        $sql = "SELECT
                    id,
                    message,
                    created_at
                FROM post_comments
                WHERE post_id = ?
                ORDER BY created_at ASC
                LIMIT ?";

        $stmt = $db->prepare($sql);
        $stmt->execute([$postId, $limit]);
        $comments = $stmt->fetchAll();

        // Processar comentários
        foreach ($comments as &$comment) {
            $comment['time_ago'] = timeAgo($comment['created_at']);
        }

        $response = [
            'comments' => $comments,
            'count' => count($comments)
        ];

        successResponse($response);

    } catch (Exception $e) {
        error_log("Erro ao buscar comentários: " . $e->getMessage());
        errorResponse('Erro ao buscar comentários', 500);
    }
}

/**
 * POST - Adicionar comentário a um post
 */
if ($method === 'POST') {
    try {
        $input = json_decode(file_get_contents('php://input'), true);

        $postId = intval($input['post_id'] ?? 0);
        $message = sanitizeInput($input['message'] ?? '');
        $userHash = getUserHash();

        // Validações
        if ($postId <= 0) {
            errorResponse('ID do post inválido');
        }

        if (empty($message)) {
            errorResponse('Mensagem não pode estar vazia');
        }

        if (strlen($message) > 500) {
            errorResponse('Mensagem deve ter no máximo 500 caracteres');
        }

        // Verificar se o post existe e não está expirado
        $stmt = $db->prepare("SELECT id FROM posts WHERE id = ? AND expires_at > NOW()");
        $stmt->execute([$postId]);
        if (!$stmt->fetch()) {
            errorResponse('Post não encontrado ou expirado', 404);
        }

        // Rate limiting: verificar se usuário enviou comentário nos últimos 5 segundos
        $stmt = $db->prepare("
            SELECT id FROM post_comments
            WHERE user_hash = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 5 SECOND)
        ");
        $stmt->execute([$userHash]);

        if ($stmt->fetch()) {
            errorResponse('Aguarde alguns segundos antes de comentar novamente', 429);
        }

        // Inserir comentário
        $sql = "INSERT INTO post_comments (post_id, message, user_hash)
                VALUES (?, ?, ?)";

        $stmt = $db->prepare($sql);
        $stmt->execute([$postId, $message, $userHash]);

        $commentId = $db->lastInsertId();

        // Buscar comentário criado
        $stmt = $db->prepare("SELECT id, message, created_at FROM post_comments WHERE id = ?");
        $stmt->execute([$commentId]);
        $newComment = $stmt->fetch();
        $newComment['time_ago'] = timeAgo($newComment['created_at']);

        // Retornar também a contagem atualizada
        $stmt = $db->prepare("SELECT COUNT(*) as count FROM post_comments WHERE post_id = ?");
        $stmt->execute([$postId]);
        $countData = $stmt->fetch();

        $response = [
            'comment' => $newComment,
            'total_comments' => intval($countData['count'])
        ];

        successResponse($response, 'Comentário enviado!');

    } catch (Exception $e) {
        error_log("Erro ao enviar comentário: " . $e->getMessage());
        errorResponse('Erro ao enviar comentário', 500);
    }
}

/**
 * DELETE - Deletar comentário (opcional, para moderação)
 */
if ($method === 'DELETE') {
    try {
        $commentId = intval($_GET['id'] ?? 0);

        if ($commentId <= 0) {
            errorResponse('ID inválido');
        }

        $stmt = $db->prepare("DELETE FROM post_comments WHERE id = ?");
        $stmt->execute([$commentId]);

        if ($stmt->rowCount() === 0) {
            errorResponse('Comentário não encontrado', 404);
        }

        successResponse([], 'Comentário deletado com sucesso');

    } catch (Exception $e) {
        error_log("Erro ao deletar comentário: " . $e->getMessage());
        errorResponse('Erro ao deletar comentário', 500);
    }
}

errorResponse('Método não suportado', 405);
?>
