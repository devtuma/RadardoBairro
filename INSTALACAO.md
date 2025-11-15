# 🚀 Guia Rápido de Instalação - Hostinger

Este guia mostra passo a passo como instalar o **Radar do Bairro** na Hostinger.

## 📋 Pré-requisitos

- Conta na Hostinger (plano com PHP e MySQL)
- Acesso ao painel de controle (hPanel)
- Cliente FTP (FileZilla, WinSCP) OU usar o Gerenciador de Arquivos da Hostinger

## 🔧 Instalação em 5 Passos

### Passo 1: Fazer Upload dos Arquivos

#### Opção A: Usando Gerenciador de Arquivos (mais fácil)

1. Acesse o **hPanel** da Hostinger
2. Vá em **Arquivos** → **Gerenciador de Arquivos**
3. Navegue até a pasta `public_html`
4. Clique em **Upload**
5. Faça upload de todos os arquivos do projeto

#### Opção B: Usando FTP

1. Baixe o [FileZilla](https://filezilla-project.org/)
2. Configure conexão FTP:
   - **Host**: ftp.seudominio.com
   - **Usuário**: seu usuário FTP
   - **Senha**: sua senha FTP
   - **Porta**: 21
3. Conecte e faça upload dos arquivos para `public_html`

### Passo 2: Criar Banco de Dados MySQL

1. No **hPanel**, vá em **Banco de dados** → **MySQL**
2. Clique em **Criar novo banco de dados**
3. Preencha:
   - **Nome do banco**: `radar_do_bairro` (ou outro nome)
   - **Usuário**: crie um novo usuário
   - **Senha**: crie uma senha forte
4. Clique em **Criar**
5. **Anote**: Nome do banco, usuário e senha

### Passo 3: Importar Estrutura do Banco

1. No hPanel, clique em **Gerenciar** no banco criado
2. Isso abrirá o **phpMyAdmin**
3. Selecione seu banco de dados na esquerda
4. Clique na aba **SQL**
5. Abra o arquivo `database/schema.sql` no seu computador
6. **Copie todo o conteúdo** do arquivo
7. **Cole** no campo SQL do phpMyAdmin
8. Clique em **Executar**

✅ Pronto! As tabelas foram criadas.

### Passo 4: Configurar Conexão com Banco

1. No Gerenciador de Arquivos, navegue até `api/config.php`
2. Clique com botão direito → **Editar**
3. Altere as linhas:

```php
define('DB_HOST', 'localhost');          // Deixe como localhost
define('DB_NAME', 'u123456_radar');      // ALTERE: nome do seu banco
define('DB_USER', 'u123456_user');       // ALTERE: usuário do banco
define('DB_PASS', 'SuaSenha123');        // ALTERE: senha do banco
```

4. Clique em **Salvar**

> **Dica**: Na Hostinger, o nome do banco geralmente é `u[ID]_nomedobanco`

### Passo 5: Configurar Localização Inicial (Opcional)

1. Edite o arquivo `js/config.js`
2. Altere as coordenadas para sua cidade:

```javascript
// Exemplo: Rio de Janeiro
DEFAULT_LAT: -22.9068,
DEFAULT_LNG: -43.1729,
```

Use [este site](https://www.latlong.net/) para descobrir coordenadas da sua cidade.

3. Salve o arquivo

## ✅ Testar a Instalação

1. Acesse `http://seudominio.com`
2. Você deve ver o mapa carregado
3. Permita acesso à localização quando solicitado
4. Teste criar um novo post clicando em **+ Novo Post**

## 🐛 Problemas Comuns

### Erro: "Erro ao conectar com o banco de dados"

**Solução**: Verifique se as credenciais em `api/config.php` estão corretas.

```php
// Certifique-se de usar as credenciais corretas
define('DB_HOST', 'localhost');  // Geralmente é localhost
define('DB_NAME', 'nome_exato_do_banco');
define('DB_USER', 'nome_exato_do_usuario');
define('DB_PASS', 'senha_exata');
```

### Erro 500 - Internal Server Error

**Possíveis causas**:

1. **Permissões de arquivo**: No Gerenciador de Arquivos, clique com botão direito na pasta `api` → **Permissões** → Defina como `755`

2. **Erros de sintaxe PHP**: Verifique os logs de erro:
   - hPanel → **Avançado** → **Logs de Erro**

### Mapa não aparece

**Solução**:

1. Limpe o cache do navegador (Ctrl + Shift + Delete)
2. Verifique se os arquivos JavaScript foram carregados corretamente
3. Abra o Console do navegador (F12) e veja se há erros

### GPS não funciona

**Solução**:

1. **Configure HTTPS**: No hPanel → **Avançado** → **SSL** → Instale SSL gratuito
2. Ative o redirecionamento HTTPS no `.htaccess` (descomente as linhas):

```apache
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

### Posts não aparecem

**Solução**:

1. Abra o Console do navegador (F12)
2. Vá na aba **Network**
3. Tente criar um post
4. Veja se há erros nas requisições à API
5. Verifique se `api/posts.php` está retornando JSON

**Teste a API diretamente**:
- Acesse: `http://seudominio.com/api/posts.php`
- Deve retornar JSON com a lista de posts

## 🔐 Segurança - Produção

Antes de colocar em produção, faça:

### 1. Remover dados de exemplo

Edite `database/schema.sql` e **remova** as linhas:

```sql
-- Apague estas linhas antes de importar em produção
INSERT INTO posts (category, title, description, latitude, longitude) VALUES
...
INSERT INTO votes (post_id, vote_type, user_hash) VALUES
...
```

### 2. Configurar permissões

```bash
# No SSH (se tiver acesso):
chmod 755 api/
chmod 644 api/*.php
```

### 3. Habilitar HTTPS

1. No hPanel → **SSL** → Instale certificado gratuito
2. Force HTTPS no `.htaccess` (já configurado)

### 4. Desabilitar display de erros

Em `api/config.php`, adicione no início:

```php
// Desabilitar exibição de erros em produção
error_reporting(0);
ini_set('display_errors', '0');

// Mas mantenha log de erros
ini_set('log_errors', '1');
ini_set('error_log', '/caminho/para/logs/php_errors.log');
```

## 📊 Monitoramento

### Verificar se está tudo funcionando:

1. **Teste criar post**: Crie um post de teste
2. **Teste votação**: Vote em um post
3. **Teste chat**: Envie uma mensagem
4. **Teste filtros**: Filtre por categoria
5. **Teste notificações**: Aguarde alguns minutos

### Logs úteis:

- **Logs de Erro PHP**: hPanel → Avançado → Logs de Erro
- **Logs de Acesso**: hPanel → Avançado → Logs de Acesso
- **Console do navegador**: F12 → Console

## 🎉 Pronto!

Seu **Radar do Bairro** está instalado e funcionando!

### Próximos passos:

- Compartilhe com sua comunidade
- Personalize cores e textos
- Adicione mais funcionalidades
- Monitore o uso

## 💡 Dicas de Personalização

### Alterar cores

Edite `css/style.css`:

```css
:root {
    --primary-color: #6366f1;  /* Cor principal */
    --secondary-color: #8b5cf6; /* Cor secundária */
}
```

### Alterar nome do app

Edite `index.html`:

```html
<title>Seu Nome Aqui</title>
<h1>Seu Nome Aqui</h1>
```

### Adicionar Google Analytics

Adicione antes de `</head>` no `index.html`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

## 🆘 Precisa de Ajuda?

- 📚 Leia o [README.md](README.md) completo
- 🐛 Reporte problemas no GitHub
- 💬 Consulte a documentação da [Hostinger](https://support.hostinger.com/pt-BR/)

---

**Boa sorte com seu projeto! 🚀**
