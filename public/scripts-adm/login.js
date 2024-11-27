import config from './config.js';
// Função para verificar a validade do token
function isTokenValid() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        return false;
    }

    // Decodificar o token (assumindo que seja JWT) e verificar a data de expiração
    const payload = JSON.parse(atob(token.split('.')[1])); // Decodifica o payload do JWT
    const expiry = payload.exp * 1000; // O 'exp' é em segundos, converta para milissegundos
    const currentTime = Date.now();

    // Se o token expirou ou não existe, retorna falso
    return expiry > currentTime;
}

// Mostrar o modal de login quando a página carregar, se o token não for válido
window.onload = function () {
    if (!isTokenValid()) {
        document.getElementById('login-modal').classList.remove('hidden');
    }
};

// Função para deslogar o usuário
function logout() {
    // Remover o token do localStorage
    localStorage.removeItem('authToken');

    // Exibir o modal de login novamente
    document.getElementById('login-modal').classList.remove('hidden');
}

// Adicionar o evento de clique no botão de deslogar
document.getElementById('deslogar').addEventListener('click', logout);

const form_login = document.getElementById('login-form');
form_login.addEventListener('submit', async (event) => {
    event.preventDefault();  // Evitar o envio padrão do formulário

    // Coletar dados do formulário
    const formData = {
        username: document.getElementById('username').value,
        password: document.getElementById('password').value,
    };

    try {
        // Enviar dados para o servidor
        const response = await fetch(`${config.base_url}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (response.ok) {
            // Armazenar o token no localStorage
            localStorage.setItem('authToken', data.token);

            // Fechar o modal de login
            document.getElementById('login-modal').classList.add('hidden');
        } else {
            // Se o login falhar, exibir uma mensagem de erro
            alert(data.message || 'Login falhou. Tente novamente.');
        }

    } catch (error) {
        console.error('Erro ao realizar login:', error);
        alert('Erro ao se comunicar com o servidor. Tente novamente mais tarde.');
    }
});
