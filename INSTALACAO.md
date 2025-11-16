# 📱 Radar do Bairro - Guia Completo de Instalação

## 📋 Índice
1. [Requisitos do Sistema](#requisitos)
2. [Estrutura de Arquivos](#estrutura)
3. [Configuração do Banco de Dados](#banco)
4. [Configuração do Servidor](#servidor)
5. [Upload dos Arquivos](#upload)
6. [Configuração Final](#configuracao)
7. [Testes Completos](#testes)
8. [Solução de Problemas](#troubleshooting)
9. [Manutenção](#manutencao)

---

## 🖥️ 1. Requisitos do Sistema {#requisitos}

### Servidor (Hostinger)
- ✅ PHP 7.4+ (recomendado: PHP 8.0+)
- ✅ MySQL 5.7+ ou MariaDB 10.3+
- ✅ Apache com mod_rewrite
- ✅ HTTPS (SSL/TLS)
- ✅ PHP Extensions:
  - pdo_mysql
  - gd (processamento de imagens)
  - fileinfo
  - json
  - mbstring

### Navegadores Suportados
- Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- Mobile: iOS Safari 14+, Chrome Mobile 90+

---

## 📁 2. Estrutura de Arquivos {#estrutura}

```
RadardoBairro/
├── index.html              # Página principal
├── manifest.json           # PWA config
├── sw.js                   # Service Worker
├── icon.png               # Ícone do app
├── api/                   # Backend PHP
│   ├── config.php
│   ├── posts.php
│   ├── votes.php
│   ├── chat.php
│   ├── notifications.php
│   ├── hot-posts.php
│   ├── post-comments.php
│   ├── reports.php
│   ├── upload.php
│   └── stats.php
├── css/style.css
├── js/
│   ├── config.js
│   ├── storage.js
│   ├── theme.js
│   ├── api.js
│   ├── map.js
│   ├── posts.js
│   ├── chat.js
│   ├── notifications.js
│   ├── stats.js
│   └── app.js
├── database/
│   ├── migration-hostinger.sql
│   └── migration-add-images.sql
└── uploads/posts/         # Criar este diretório
```

---

## 🗄️ 3. Configuração do Banco de Dados {#banco}

### Passo 1: Criar Banco no Hostinger

1. **Acesse hPanel:** https://hpanel.hostinger.com
2. **MySQL Databases** → Create Database
   ```
   Nome: u758469769_radarbairro
   ```
3. **Criar Usuário:**
   ```
   User: u758469769_admin
   Pass: Life0852new!   (ou sua senha segura)
   ```
   ⚠️ **ANOTE ESTAS CREDENCIAIS!**

4. **Associar usuário ao banco:**
   - Selecione usuário + banco
   - All Privileges → Add

### Passo 2: Executar Schema

1. **phpMyAdmin** → Selecione o banco
2. **Aba SQL** → Cole conteúdo de:
   ```
   database/migration-hostinger.sql
   ```
3. **Executar (Go)**
4. Repita com:
   ```
   database/migration-add-images.sql
   ```

### Passo 3: Verificar Tabelas

Devem existir:
```
✓ posts
✓ votes
✓ chat_messages
✓ post_comments
✓ reports
```

---

## 🌐 4. Configuração do Servidor {#servidor}

### Passo 1: Editar api/config.php

```php
// Linha 9-12
define('DB_HOST', 'localhost');
define('DB_NAME', 'u758469769_radarbairro');  // SEU BANCO
define('DB_USER', 'u758469769_admin');        // SEU USUÁRIO
define('DB_PASS', 'Life0852new!');            // SUA SENHA
```

### Passo 2: Coordenadas em js/config.js

```javascript
// Linha 9-11
DEFAULT_LAT: -23.5505,  // Sua latitude
DEFAULT_LNG: -46.6333,  // Sua longitude
DEFAULT_ZOOM: 15,
```

**Como obter:** Google Maps → Clique direito → Copiar coordenadas

### Passo 3: PHP Configuration (hPanel)

1. **Advanced** → **PHP Configuration**
2. Versão: 8.0+
3. Extensions ativas:
   - gd ✓
   - fileinfo ✓
   - pdo_mysql ✓
4. Limites:
   - upload_max_filesize: 10M
   - post_max_size: 10M

### Passo 4: Criar Diretório de Uploads

**Via File Manager:**
```
public_html/
└── uploads/
    └── posts/
```

**Permissões:** 755

---

## 📤 5. Upload dos Arquivos {#upload}

### Método 1: File Manager (Recomendado)

1. hPanel → Files → File Manager
2. Navegue: public_html/
3. Upload → Selecione TODOS os arquivos
4. Aguarde conclusão

### Método 2: FTP (FileZilla)

```
Host: ftp.comprafacilagora.com
User: (ver hPanel → FTP Accounts)
Pass: (ver hPanel → FTP Accounts)
Port: 21
```

Upload para: /public_html/

---

## ⚙️ 6. Configuração Final {#configuracao}

### Teste de Conexão com Banco

Crie temporariamente: `test-db.php`

```php
<?php
$pdo = new PDO("mysql:host=localhost;dbname=u758469769_radarbairro", 
               "u758469769_admin", "Life0852new!");
echo "✅ Conexão OK!";
?>
```

Acesse: https://comprafacilagora.com/test-db.php

⚠️ **DELETE após teste!**

### Configurar HTTPS

1. hPanel → Advanced → SSL/TLS
2. Install SSL (Let's Encrypt grátis)
3. Aguarde ativação (até 24h)

### Force HTTPS (.htaccess)

```apache
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

---

## 🧪 7. Testes Completos {#testes}

### ✅ Checklist Essencial

#### 1. Carregamento
```
□ Página carrega
□ Mapa aparece
□ Console sem erros (F12)
```

#### 2. Criar Post
```
□ Clicar "+ Novo Post"
□ Modal abre
□ Clicar no mapa
□ Console mostra:
   >>> ENABLE LOCATION SELECTION <<<
   >>> MAP CLICK DETECTED <<<
   >>> SET TEMP LOCATION <<<
   >>> LOCATION SET SUCCESSFULLY <<<
□ Marcador verde aparece
□ Formulário mostra "Localização selecionada"
□ Preencher e publicar
□ Post aparece no mapa
```

#### 3. Upload de Imagem
```
□ "Adicionar Foto"
□ Selecionar imagem (max 5MB)
□ Preview aparece
□ Publicar
□ Imagem nos detalhes do post
```

#### 4. Votação
```
□ Abrir post
□ Clicar "Verdadeiro"
□ Toast: "Voto registrado!"
□ Contador aumenta
```

#### 5. Comentários
```
□ Digitar comentário
□ Enviar
□ Aparece na lista
□ Contador atualiza
```

#### 6. Chat
```
□ Enviar mensagem
□ Aparece na lista
□ Distância e horário corretos
```

#### 7. Estatísticas
```
□ Clicar ícone gráfico (header)
□ Modal abre
□ Dados aparecem
□ Top 5 posts visíveis
```

#### 8. Modo Escuro/Claro
```
□ Clicar lua/sol
□ Tema muda
□ Recarregar página
□ Tema persiste
```

#### 9. Compartilhamento
```
□ Abrir post
□ Clicar WhatsApp
□ Janela abre
□ Copiar link funciona
```

#### 10. PWA (Mobile)
```
□ Chrome mostra "Adicionar à tela"
□ Instalar
□ Ícone na tela inicial
□ Abre em tela cheia
```

---

## 🔧 8. Solução de Problemas {#troubleshooting}

### Página em Branco

**Solução:**
```php
// Adicione em api/config.php (linha 2)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Verifique logs: hPanel → Error Logs
```

### Erro de Banco de Dados

**Verifique:**
```
1. Credenciais em api/config.php
2. Usuário tem permissões
3. Banco existe e tem tabelas
```

### Mapa Não Aparece

**Soluções:**
```javascript
// F12 → Console
// Procure erros de Leaflet
// Verifique coordenadas em js/config.js
// Latitude: -90 a 90
// Longitude: -180 a 180
```

### Clique no Mapa Não Funciona

**Debug:**
```javascript
// 1. F12 → Console
// 2. Clicar "+ Novo Post"
// Deve ver: >>> ENABLE LOCATION SELECTION <<<

// 3. Clicar no mapa
// Deve ver: >>> MAP CLICK DETECTED <<<

// Se não vê logs:
// - Ctrl+F5 (recarregar forçado)
// - Limpar cache
// - Verificar se js/map.js carregou
```

### Upload de Imagens Falha

**Verificar:**
```bash
1. Diretório existe: uploads/posts/
2. Permissões: 755
3. PHP limites: upload_max_filesize = 10M
4. Extensão GD ativa
```

### Posts Não Aparecem

**Debug:**
```sql
-- No phpMyAdmin:
SELECT * FROM posts WHERE expires_at > NOW();

-- Se vazio: criar post de teste
-- Verificar filtros (todas categorias marcadas?)
```

### Chat Erro 429

**Normal!** Rate limiting funcionando.
- Aguarde 3 segundos entre mensagens

### Service Worker Não Registra

**Soluções:**
```
1. Requer HTTPS (ou localhost)
2. Verificar path em js/app.js linha 172
3. Chrome DevTools → Application → Service Workers → Unregister all
```

---

## 🔄 9. Manutenção {#manutencao}

### Backup Mensal

```bash
# Banco de dados
mysqldump -u usuario -p banco > backup.sql

# Arquivos
tar -czf backup.tar.gz public_html/
```

### Limpeza Mensal

```sql
-- Deletar posts expirados (7+ dias)
DELETE FROM posts 
WHERE expires_at < DATE_SUB(NOW(), INTERVAL 7 DAY);

-- Deletar chat antigo (24h+)
DELETE FROM chat_messages 
WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 DAY);
```

### Monitoramento

```sql
-- Posts por dia (últimos 30 dias)
SELECT DATE(created_at) as data, COUNT(*) as posts
FROM posts
GROUP BY DATE(created_at)
ORDER BY data DESC
LIMIT 30;

-- Usuários únicos (30 dias)
SELECT COUNT(DISTINCT user_hash) as usuarios
FROM posts
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY);
```

---

## 🎯 Resumo Rápido (5 Minutos)

```bash
1. Criar banco MySQL (hPanel)
2. Executar migration-hostinger.sql (phpMyAdmin)
3. Executar migration-add-images.sql
4. Editar api/config.php (credenciais)
5. Editar js/config.js (coordenadas)
6. Upload arquivos → public_html/
7. Criar uploads/posts/ (755)
8. Ativar SSL
9. Testar: criar post
10. Instalar PWA (mobile)
```

**Tempo: 30-60 minutos**

---

## 📞 Comandos Úteis

```bash
# Testar sintaxe PHP
php -l api/config.php

# Ver logs em tempo real
tail -f error_log

# Verificar permissões
ls -la uploads/
```

---

## ✅ Checklist Pré-Produção

```
□ Banco configurado
□ Tabelas criadas
□ Triggers ativos
□ Credenciais corretas
□ uploads/ criado (755)
□ SSL ativado
□ Service Worker OK
□ Testes passando
□ Backup configurado
```

---

**Bom desenvolvimento! 🚀**

*Versão 2.0 - 2025*
