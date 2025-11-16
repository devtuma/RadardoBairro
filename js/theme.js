/**
 * Gerenciador de Tema (Claro/Escuro)
 */

const ThemeManager = {
    currentTheme: 'light',

    /**
     * Inicializar tema
     */
    init() {
        // Carregar tema salvo ou usar preferência do sistema
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        this.currentTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
        this.applyTheme(this.currentTheme);

        // Event listener para o botão de toggle
        document.getElementById('btnThemeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Detectar mudanças na preferência do sistema
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                this.applyTheme(e.matches ? 'dark' : 'light');
            }
        });

        console.log('🎨 Tema inicializado:', this.currentTheme);
    },

    /**
     * Alternar tema
     */
    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(this.currentTheme);
        localStorage.setItem('theme', this.currentTheme);
        console.log('🎨 Tema alterado para:', this.currentTheme);
    },

    /**
     * Aplicar tema
     */
    applyTheme(theme) {
        const html = document.documentElement;
        const icon = document.querySelector('#btnThemeToggle i');

        if (theme === 'dark') {
            html.setAttribute('data-theme', 'dark');
            icon.className = 'fas fa-sun';
            console.log('🌙 Modo escuro ativado');
        } else {
            html.setAttribute('data-theme', 'light');
            icon.className = 'fas fa-moon';
            console.log('☀️ Modo claro ativado');
        }

        this.currentTheme = theme;
    },

    /**
     * Obter tema atual
     */
    getTheme() {
        return this.currentTheme;
    }
};
