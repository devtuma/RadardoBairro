<?php
require_once 'config.php';

$db = Database::getInstance()->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

/**
 * POST - Adicionar/Atualizar voto
 */
if ($method === 'POST') {
    try {
        $input = json_decode(file_get_contents('php://input'), true);

        $postId = intval($input['post_id'] ?? 0);
        $voteType = sanitizeInput($input['vote_type'] ?? '');
        $userHash = getUserHash();

        // Validações
        if ($postId <= 0) {
            errorResponse('ID do post inválido');
        }

        if (!isValidVoteType($voteType)) {
            errorResponse('Tipo de voto inválido. Use: true, false ou exag');
        }

        // Verificar se o post existe
        $stmt = $db->prepare("SELECT id FROM posts WHERE id = ?");
        $stmt->execute([$postId]);
        if (!$stmt->fetch()) {
            errorResponse('Post não encontrado', 404);
        }

        // Inserir ou atualizar voto (usando REPLACE INTO ou INSERT ... ON DUPLICATE KEY UPDATE)
        $sql = "INSERT INTO votes (post_id, vote_type, user_hash)
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE vote_type = VALUES(vote_type), created_at = CURRENT_TIMESTAMP";

        $stmt = $db->prepare($sql);
        $stmt->execute([$postId, $voteType, $userHash]);

        // Buscar contagem atualizada de votos
        $stmt = $db->prepare("
            SELECT
                SUM(CASE WHEN vote_type = 'true' THEN 1 ELSE 0 END) as true_votes,
                SUM(CASE WHEN vote_type = 'false' THEN 1 ELSE 0 END) as false_votes,
                SUM(CASE WHEN vote_type = 'exag' THEN 1 ELSE 0 END) as exag_votes,
                COUNT(*) as total_votes
            FROM votes
            WHERE post_id = ?
        ");
        $stmt->execute([$postId]);
        $votes = $stmt->fetch();

        successResponse($votes, 'Voto registrado com sucesso!');

    } catch (Exception $e) {
        error_log("Erro ao registrar voto: " . $e->getMessage());
        errorResponse('Erro ao registrar voto', 500);
    }
}

/**
 * GET - Obter votos de um post
 */
if ($method === 'GET') {
    try {
        $postId = intval($_GET['post_id'] ?? 0);

        if ($postId <= 0) {
            errorResponse('ID do post inválido');
        }

        // Buscar contagem de votos
        $stmt = $db->prepare("
            SELECT
                SUM(CASE WHEN vote_type = 'true' THEN 1 ELSE 0 END) as true_votes,
                SUM(CASE WHEN vote_type = 'false' THEN 1 ELSE 0 END) as false_votes,
                SUM(CASE WHEN vote_type = 'exag' THEN 1 ELSE 0 END) as exag_votes,
                COUNT(*) as total_votes
            FROM votes
            WHERE post_id = ?
        ");
        $stmt->execute([$postId]);
        $votes = $stmt->fetch();

        // Verificar se usuário já votou
        $userHash = getUserHash();
        $stmt = $db->prepare("SELECT vote_type FROM votes WHERE post_id = ? AND user_hash = ?");
        $stmt->execute([$postId, $userHash]);
        $userVote = $stmt->fetch();

        $result = [
            'true_votes' => intval($votes['true_votes'] ?? 0),
            'false_votes' => intval($votes['false_votes'] ?? 0),
            'exag_votes' => intval($votes['exag_votes'] ?? 0),
            'total_votes' => intval($votes['total_votes'] ?? 0),
            'user_vote' => $userVote ? $userVote['vote_type'] : null
        ];

        successResponse($result);

    } catch (Exception $e) {
        error_log("Erro ao buscar votos: " . $e->getMessage());
        errorResponse('Erro ao buscar votos', 500);
    }
}

errorResponse('Método não suportado', 405);
?>
