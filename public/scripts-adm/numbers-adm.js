import config from './config.js';
import { createAuthHeaders } from './createHeader.js';
const grid = document.getElementById('number-grid');

// Função para carregar os números da API
async function loadNumbers() {
    try {
        const response = await fetch(`${config.base_url}/numbers`); // A URL do seu backend
        if (!response.ok) {
            throw new Error('Falha ao carregar os números');
        }
        const numbersList = await response.json();

        // Ordena os números pelo atributo 'number'
        numbersList.sort((a, b) => a.number - b.number);

        // Limpa o grid antes de adicionar novos números (caso já existam)
        grid.innerHTML = '';

        // Adiciona os números à grid
        numbersList.forEach(number => {
            const numberDiv = document.createElement('div');
            
            numberDiv.classList.add('number');
            numberDiv.textContent = number.number; // Exibe o número
            numberDiv.setAttribute('data-id', number.number); // Adiciona o ID do número como atributo

            // Aplica a classe com base no estado do buyerId
            if (number.buyerId !== null) {
                numberDiv.classList.add('buyer-assigned');
            } else {
                numberDiv.classList.add('unassigned');
            }

            grid.appendChild(numberDiv);
        });
    } catch (error) {
        console.error('Erro ao carregar os números:', error);
        // Exibir uma mensagem amigável ao usuário
        grid.innerHTML = '<p>Erro ao carregar os números. Tente novamente mais tarde.</p>';
    }
}

// Carregar os números assim que a página carregar
loadNumbers();
