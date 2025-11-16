<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

/**
 * POST - Upload de imagem
 */
if ($method === 'POST') {
    try {
        // Verificar se arquivo foi enviado
        if (!isset($_FILES['image'])) {
            errorResponse('Nenhuma imagem enviada');
        }

        $file = $_FILES['image'];

        // Validações
        if ($file['error'] !== UPLOAD_ERR_OK) {
            errorResponse('Erro no upload da imagem');
        }

        // Verificar tipo de arquivo
        $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);

        if (!in_array($mimeType, $allowedTypes)) {
            errorResponse('Tipo de arquivo não permitido. Use JPEG, PNG, GIF ou WebP');
        }

        // Verificar tamanho (max 5MB)
        if ($file['size'] > 5 * 1024 * 1024) {
            errorResponse('Imagem muito grande. Tamanho máximo: 5MB');
        }

        // Criar diretório de uploads se não existir
        $uploadDir = '../uploads/posts/';
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        // Gerar nome único para arquivo
        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $fileName = uniqid() . '_' . time() . '.' . $extension;
        $filePath = $uploadDir . $fileName;

        // Processar e otimizar imagem
        $image = null;
        switch ($mimeType) {
            case 'image/jpeg':
                $image = imagecreatefromjpeg($file['tmp_name']);
                break;
            case 'image/png':
                $image = imagecreatefrompng($file['tmp_name']);
                break;
            case 'image/gif':
                $image = imagecreatefromgif($file['tmp_name']);
                break;
            case 'image/webp':
                $image = imagecreatefromwebp($file['tmp_name']);
                break;
        }

        if (!$image) {
            errorResponse('Erro ao processar imagem');
        }

        // Redimensionar se necessário (max 1200x1200)
        $width = imagesx($image);
        $height = imagesy($image);
        $maxSize = 1200;

        if ($width > $maxSize || $height > $maxSize) {
            $ratio = min($maxSize / $width, $maxSize / $height);
            $newWidth = round($width * $ratio);
            $newHeight = round($height * $ratio);

            $resized = imagecreatetruecolor($newWidth, $newHeight);

            // Preservar transparência para PNG
            if ($mimeType === 'image/png') {
                imagealphablending($resized, false);
                imagesavealpha($resized, true);
            }

            imagecopyresampled($resized, $image, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);
            imagedestroy($image);
            $image = $resized;
        }

        // Salvar imagem otimizada
        switch ($mimeType) {
            case 'image/jpeg':
                imagejpeg($image, $filePath, 85);
                break;
            case 'image/png':
                imagepng($image, $filePath, 8);
                break;
            case 'image/gif':
                imagegif($image, $filePath);
                break;
            case 'image/webp':
                imagewebp($image, $filePath, 85);
                break;
        }

        imagedestroy($image);

        // Retornar caminho relativo
        $imageUrl = 'uploads/posts/' . $fileName;

        successResponse([
            'url' => $imageUrl,
            'filename' => $fileName
        ], 'Imagem enviada com sucesso!');

    } catch (Exception $e) {
        error_log("Erro no upload: " . $e->getMessage());
        errorResponse('Erro ao fazer upload da imagem', 500);
    }
}

/**
 * DELETE - Deletar imagem
 */
if ($method === 'DELETE') {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        $filename = basename($input['filename'] ?? '');

        if (empty($filename)) {
            errorResponse('Nome do arquivo inválido');
        }

        $filePath = '../uploads/posts/' . $filename;

        if (file_exists($filePath)) {
            unlink($filePath);
            successResponse([], 'Imagem deletada com sucesso');
        } else {
            errorResponse('Imagem não encontrada', 404);
        }

    } catch (Exception $e) {
        error_log("Erro ao deletar imagem: " . $e->getMessage());
        errorResponse('Erro ao deletar imagem', 500);
    }
}

errorResponse('Método não suportado', 405);
?>
