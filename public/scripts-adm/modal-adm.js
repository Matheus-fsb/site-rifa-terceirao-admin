import config from './config.js';
import { createAuthHeaders } from './createHeader.js';
// Elementos principais
const numberGridArray = document.getElementById('number-grid');
const modal_escolha = document.getElementById('modal-escolha');
const modal_cadastro_novo = document.getElementById('modal-cadastro-novo');
const modal_cadastro_existente = document.getElementById('modal-cadastro-existente');
const modal_base = document.getElementById('modal-base');
const modal = document.getElementById('number-modal');
const closeModal = document.getElementById('close-modal');

// Função para exibir o modal de escolha
function handleUnpurchasedNumber(event, numberId, isAlteration = false) {
    modal_escolha.classList.remove('hidden');
    modal.classList.remove('hidden');
    document.body.classList.add('blur');

    const cadastroNovo = document.getElementById('cadastrarNovo');
    const cadastroExistente = document.getElementById('cadastrarExistente');

    cadastroNovo.addEventListener('click', () => {
        showNewRegistrationModal(event, numberId, isAlteration);
    });

    cadastroExistente.addEventListener('click', () => {
        showExistingRegistrationModal(event, numberId, isAlteration);
    });
}

// Função para tratar números já comprados
async function handlePurchasedNumber(event) {
    const modalText = document.getElementById('modal-text');
    const modalName = document.getElementById('modal-name');
    const modalTel = document.getElementById('modal-tel');
    const alterBuyer = document.getElementById('alter-buyer');
    const deleteBuyer = document.getElementById('delete-buyer');

    const numberId = event.target.getAttribute('data-id');

    modalText.textContent = `Número selecionado: ${event.target.textContent}`;

    try {
        const response = await fetch(`${config.base_url}/numbers/${numberId}`);
        const data = await response.json();

        if (response.ok) {
            modal.classList.remove('hidden');
            modal_base.classList.remove('hidden');
            document.body.classList.add('blur');

            if (data.buyer) {
                modalName.textContent = data.buyer.name;
                modalTel.textContent = `****${data.buyer.telephone.slice(-4)}`;
            } else {
                modalName.textContent = 'Não disponível';
                modalTel.textContent = 'Não disponível';
            }

            // Atualiza o atributo data-id do botão Alterar Comprador
            alterBuyer.setAttribute('data-id', numberId);
            deleteBuyer.setAttribute('data-id', numberId);
        } else {
            modalName.textContent = 'Erro';
            modalTel.textContent = 'Erro';
        }
    } catch (error) {
        console.error('Erro ao buscar os dados do número:', error);
        modalName.textContent = 'Erro ao buscar dados';
        modalTel.textContent = 'Erro ao buscar dados';
    }
}

// Função para exibir o modal de cadastro novo
function showNewRegistrationModal(event, numberId, isAlteration = false) {
    const modalText2 = document.getElementById('modal-text-2');
    modalText2.textContent = `Número selecionado: ${event.target.textContent}`;

    modal_cadastro_novo.classList.remove('hidden');
    modal_escolha.classList.add('hidden');

    const form_completo = document.getElementById('form-completo');
    form_completo.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email-novo').value,
            telephone: document.getElementById('telephone').value,
        };

        try {
            const response = await fetch(`${config.base_url}/buyers`, {
                method: 'POST',
                headers: createAuthHeaders(),
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            if (response.ok) {
                const buyerId = data.buyer.id;
                const updateResponse = await fetch(`${config.base_url}/numbers/${numberId}`, {
                    method: 'PATCH',
                    headers: createAuthHeaders(),
                    body: JSON.stringify({ buyerId }),
                });

                const updateData = await updateResponse.json();
                if (updateResponse.ok) {
                    alert(
                        isAlteration
                            ? 'Comprador atualizado com sucesso.'
                            : updateData.message
                    );
                    location.reload(); // Recarrega a página
                } else {
                    alert(updateData.message);
                }
            } else {
                alert(data.error);
            }
        } catch (error) {
            alert('Erro ao tentar registrar comprador. Tente novamente.');
        }
    });
}

// Função para exibir o modal de cadastro existente
function showExistingRegistrationModal(event, numberId) {
    const modalText3 = document.getElementById('modal-text-3');
    modalText3.textContent = `Número selecionado: ${event.target.textContent}`;

    modal_escolha.classList.add('hidden');
    modal_cadastro_existente.classList.remove('hidden');

    const form_existente = document.getElementById('form-existente');
    form_existente.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = {
            email: document.getElementById('email-existente').value,
        };

        try {
            const response = await fetch(`${config.base_url}/buyers/${formData.email}`, {
                method: 'GET',
                headers: createAuthHeaders(),
            });

            const buyerData = await response.json();

            if (response.ok) {
                const buyerId = buyerData.id;

                const updateResponse = await fetch(`${config.base_url}/numbers/${numberId}`, {
                    method: 'PATCH',
                    headers: createAuthHeaders(),
                    body: JSON.stringify({ buyerId }),
                });

                const updateData = await updateResponse.json();

                if (updateResponse.ok) {
                    alert(updateData.message);
                    location.reload(); // Recarrega a página
                } else {
                    alert(updateData.message);
                }
            } else {
                alert(buyerData.error);
            }
        } catch (error) {
            alert('Erro ao buscar comprador. Tente novamente mais tarde.');
        }
    });
}

// Listener principal
numberGridArray.addEventListener('click', async (event) => {
    const numberId = event.target.getAttribute('data-id');
    const response = await fetch(`${config.base_url}/numbers/${numberId}`);
    const number = await response.json();

    if (number.buyerId == null) {
        handleUnpurchasedNumber(event, numberId);
    } else {
        handlePurchasedNumber(event);
    }
});

// Listener para alterar comprador
const alterBuyer = document.getElementById('alter-buyer');
alterBuyer.addEventListener('click', async (event) => {
    const numberId = event.target.getAttribute('data-id');

    if (!numberId) {
        alert('Erro ao alterar o comprador: ID do número não encontrado.');
        return;
    }

    handleUnpurchasedNumber(event, numberId, true); // Passa o contexto de alteração
});

// Listener para deletar o comprador
const deleteBuyerButton = document.getElementById('delete-buyer');
deleteBuyerButton.addEventListener('click', async (event) => {
    const numberId = event.target.getAttribute('data-id');

    if (!numberId) {
        alert('Erro ao tentar deletar o comprador: ID do número não encontrado.');
        return;
    }

    const confirmDeletion = confirm('Tem certeza que deseja deletar o comprador?');

    if (confirmDeletion) {
        try {
            const response = await fetch(`${config.base_url}/numbers-null/${numberId}`, {
                method: 'PATCH',
                headers: createAuthHeaders(),
            });

            const data = await response.json();

            if (response.ok) {
                alert('Comprador deletado com sucesso.');
                location.reload(); // Recarrega a página para atualizar os dados
            } else {
                alert(data.message || 'Erro ao tentar deletar o comprador.');
            }
        } catch (error) {
            console.error('Erro ao deletar comprador:', error);
            alert('Erro ao tentar deletar comprador. Tente novamente.');
        }
    }
});

// Fecha o modal ao clicar no botão de fechar
closeModal.addEventListener('click', () => {
    modal.classList.add('hidden');
    modal_base.classList.add('hidden');
    modal_cadastro_novo.classList.add('hidden');
    modal_cadastro_existente.classList.add('hidden');
    modal_escolha.classList.add('hidden');
    document.body.classList.remove('blur');
});
