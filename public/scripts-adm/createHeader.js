// Função para obter o token de autenticação
export function getAuthToken() {
    return localStorage.getItem('authToken');
}

// Função para remover o token (logout)
export function logout() {
    localStorage.removeItem('authToken');
    document.getElementById('login-modal').classList.remove('hidden');
}

// Função para criar os cabeçalhos de autenticação
export function createAuthHeaders() {
    const token = getAuthToken();
    if (token) {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        };
    }
    return { 'Content-Type': 'application/json' };
}

window.createAuthHeaders = createAuthHeaders;
window.logout = logout;