<?php
require_once 'config.php';

$db = Database::getInstance()->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

/**
 * GET - Buscar posts mais quentes
 */
if ($method === 'GET') {
    try {
        $limit = intval($_GET['limit'] ?? 10);
        $userLat = isset($_GET['lat']) ? floatval($_GET['lat']) : null;
        $userLng = isset($_GET['lng']) ? floatval($_GET['lng']) : null;

        // Usar a view hot_posts que já calcula o hotness score
        $sql = "SELECT * FROM hot_posts LIMIT ?";

        $stmt = $db->prepare($sql);
        $stmt->execute([$limit]);
        $hotPosts = $stmt->fetchAll();

        // Processar posts
        foreach ($hotPosts as &$post) {
            $post['time_ago'] = timeAgo($post['created_at']);
            $post['hotness_score'] = round(floatval($post['hotness_score']), 2);
            $post['vote_count'] = intval($post['vote_count']);
            $post['view_count'] = intval($post['view_count']);
            $post['true_votes'] = intval($post['true_votes']);
            $post['false_votes'] = intval($post['false_votes']);
            $post['exag_votes'] = intval($post['exag_votes']);

            // Calcular distância se coordenadas fornecidas
            if ($userLat !== null && $userLng !== null) {
                $post['distance'] = round(calculateDistance(
                    $userLat,
                    $userLng,
                    $post['latitude'],
                    $post['longitude']
                ), 2);
            }
        }

        successResponse($hotPosts);

    } catch (Exception $e) {
        error_log("Erro ao buscar posts quentes: " . $e->getMessage());
        errorResponse('Erro ao buscar posts quentes', 500);
    }
}

/**
 * POST - Registrar visualização de post
 */
if ($method === 'POST') {
    try {
        $input = json_decode(file_get_contents('php://input'), true);

        $postId = intval($input['post_id'] ?? 0);
        $userHash = getUserHash();

        if ($postId <= 0) {
            errorResponse('ID do post inválido');
        }

        // Verificar se post existe
        $stmt = $db->prepare("SELECT id FROM posts WHERE id = ?");
        $stmt->execute([$postId]);
        if (!$stmt->fetch()) {
            errorResponse('Post não encontrado', 404);
        }

        // Registrar visualização (permite múltiplas views do mesmo usuário)
        $sql = "INSERT INTO post_views (post_id, user_hash) VALUES (?, ?)";
        $stmt = $db->prepare($sql);
        $stmt->execute([$postId, $userHash]);

        successResponse([], 'Visualização registrada');

    } catch (Exception $e) {
        error_log("Erro ao registrar visualização: " . $e->getMessage());
        errorResponse('Erro ao registrar visualização', 500);
    }
}

errorResponse('Método não suportado', 405);
?>
