<?php
require_once 'config.php';

$db = Database::getInstance()->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

/**
 * GET - Listar posts com filtros
 */
if ($method === 'GET') {
    try {
        // Parâmetros de filtro
        $categories = $_GET['categories'] ?? 'fofoca,alerta,evento,achados';
        $timeFilter = $_GET['time'] ?? 'all';
        $userLat = isset($_GET['lat']) ? floatval($_GET['lat']) : null;
        $userLng = isset($_GET['lng']) ? floatval($_GET['lng']) : null;
        $radius = isset($_GET['radius']) ? floatval($_GET['radius']) : null;

        // Construir query base
        $sql = "SELECT
                    p.id,
                    p.category,
                    p.title,
                    p.description,
                    p.latitude,
                    p.longitude,
                    p.created_at,
                    p.expires_at,
                    COUNT(DISTINCT v.id) as vote_count,
                    SUM(CASE WHEN v.vote_type = 'true' THEN 1 ELSE 0 END) as true_votes,
                    SUM(CASE WHEN v.vote_type = 'false' THEN 1 ELSE 0 END) as false_votes,
                    SUM(CASE WHEN v.vote_type = 'exag' THEN 1 ELSE 0 END) as exag_votes
                FROM posts p
                LEFT JOIN votes v ON p.id = v.post_id
                WHERE p.expires_at > NOW()";

        $params = [];

        // Filtro de categoria
        if ($categories !== 'all') {
            $categoryArray = explode(',', $categories);
            $placeholders = str_repeat('?,', count($categoryArray) - 1) . '?';
            $sql .= " AND p.category IN ($placeholders)";
            $params = array_merge($params, $categoryArray);
        }

        // Filtro de tempo
        if ($timeFilter !== 'all') {
            $hours = match($timeFilter) {
                '24h' => 24,
                '3d' => 72,
                '7d' => 168,
                '30d' => 720,
                default => null
            };

            if ($hours) {
                $sql .= " AND p.created_at >= DATE_SUB(NOW(), INTERVAL ? HOUR)";
                $params[] = $hours;
            }
        }

        $sql .= " GROUP BY p.id ORDER BY p.created_at DESC";

        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $posts = $stmt->fetchAll();

        // Processar posts
        foreach ($posts as &$post) {
            $post['time_ago'] = timeAgo($post['created_at']);
            $post['vote_count'] = intval($post['vote_count']);
            $post['true_votes'] = intval($post['true_votes']);
            $post['false_votes'] = intval($post['false_votes']);
            $post['exag_votes'] = intval($post['exag_votes']);

            // Calcular distância se coordenadas do usuário foram fornecidas
            if ($userLat !== null && $userLng !== null) {
                $post['distance'] = calculateDistance(
                    $userLat,
                    $userLng,
                    $post['latitude'],
                    $post['longitude']
                );
            }
        }

        // Filtro de raio (depois de calcular distâncias)
        if ($radius !== null && $userLat !== null && $userLng !== null) {
            $posts = array_filter($posts, function($post) use ($radius) {
                return $post['distance'] <= $radius;
            });
            $posts = array_values($posts); // Re-indexar array
        }

        successResponse($posts);

    } catch (Exception $e) {
        error_log("Erro ao buscar posts: " . $e->getMessage());
        errorResponse('Erro ao buscar posts', 500);
    }
}

/**
 * POST - Criar novo post
 */
if ($method === 'POST') {
    try {
        $input = json_decode(file_get_contents('php://input'), true);

        // Validar dados
        $category = sanitizeInput($input['category'] ?? '');
        $title = sanitizeInput($input['title'] ?? '');
        $description = sanitizeInput($input['description'] ?? '');
        $latitude = floatval($input['latitude'] ?? 0);
        $longitude = floatval($input['longitude'] ?? 0);

        // Validações
        if (empty($title)) {
            errorResponse('Título é obrigatório');
        }

        if (strlen($title) > 100) {
            errorResponse('Título deve ter no máximo 100 caracteres');
        }

        if (empty($description)) {
            errorResponse('Descrição é obrigatória');
        }

        if (strlen($description) > 500) {
            errorResponse('Descrição deve ter no máximo 500 caracteres');
        }

        if (!isValidCategory($category)) {
            errorResponse('Categoria inválida');
        }

        if (!isValidCoordinate($latitude, $longitude)) {
            errorResponse('Coordenadas inválidas');
        }

        // Inserir post
        $sql = "INSERT INTO posts (category, title, description, latitude, longitude)
                VALUES (?, ?, ?, ?, ?)";

        $stmt = $db->prepare($sql);
        $stmt->execute([$category, $title, $description, $latitude, $longitude]);

        $postId = $db->lastInsertId();

        // Buscar post criado
        $stmt = $db->prepare("SELECT * FROM posts WHERE id = ?");
        $stmt->execute([$postId]);
        $post = $stmt->fetch();

        successResponse($post, 'Post criado com sucesso!');

    } catch (Exception $e) {
        error_log("Erro ao criar post: " . $e->getMessage());
        errorResponse('Erro ao criar post', 500);
    }
}

/**
 * DELETE - Deletar post (opcional, para administração)
 */
if ($method === 'DELETE') {
    try {
        $postId = intval($_GET['id'] ?? 0);

        if ($postId <= 0) {
            errorResponse('ID inválido');
        }

        $stmt = $db->prepare("DELETE FROM posts WHERE id = ?");
        $stmt->execute([$postId]);

        if ($stmt->rowCount() === 0) {
            errorResponse('Post não encontrado', 404);
        }

        successResponse([], 'Post deletado com sucesso');

    } catch (Exception $e) {
        error_log("Erro ao deletar post: " . $e->getMessage());
        errorResponse('Erro ao deletar post', 500);
    }
}

// Método não suportado
errorResponse('Método não suportado', 405);
?>
