let currentOngId = null;

document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const container = document.getElementById('campaign-content');

    if (!id) {
        container.innerHTML = '<div class="container text-center" style="padding: 100px 0;"><h2>Campanha não encontrada.</h2><a href="/" class="btn btn-primary">Voltar para Home</a></div>';
        return;
    }

    currentOngId = id;
    const ong = await fetchOngById(id);

    if (!ong) {
        container.innerHTML = '<div class="container text-center" style="padding: 100px 0;"><h2>Campanha não encontrada.</h2><a href="/" class="btn btn-primary">Voltar para Home</a></div>';
        return;
    }

    const progressPercentage = Math.min((ong.raised / ong.goal) * 100, 100).toFixed(1);

    container.innerHTML = `
        <div class="details-hero text-center">
            <div class="container">
                <h2>${ong.name}</h2>
                <p class="details-meta">📍 ${ong.location}</p>
            </div>
        </div>
        <div class="container details-content">
            <div class="details-info">
                <img src="${ong.image}" alt="${ong.name}" class="details-img" onerror="this.src='https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&h=400&fit=crop'">
                <h3>Sobre a Campanha</h3>
                <p style="margin-top: 15px; font-size: 1.1rem; line-height: 1.8;">${ong.description}</p>
                <p style="margin-top: 15px;">Esta instituição trabalha ativamente para promover mudanças positivas na comunidade. Seu apoio é fundamental para que nossas metas sejam alcançadas e mais vidas sejam impactadas.</p>
            </div>
            <div class="details-donate">
                <h3 style="margin-bottom: 20px; color: var(--primary);">Faça sua Doação</h3>
                
                <div class="progress-container">
                    <div class="progress-labels">
                        <span>Arrecadado: R$ ${ong.raised.toLocaleString('pt-BR')}</span>
                        <span>Meta: R$ ${ong.goal.toLocaleString('pt-BR')}</span>
                    </div>
                    <div class="progress-bar-bg">
                        <div class="progress-bar-fill" style="width: ${progressPercentage}%"></div>
                    </div>
                </div>

                <p style="margin-bottom: 20px; color: var(--text-muted); font-size: 0.9rem;">
                   Qualquer valor faz a diferença. Contribua via PIX de forma rápida e segura.
                </p>

                <button class="btn btn-primary" style="width: 100%; font-size: 1.1rem; padding: 15px;" onclick="openDonationModal()">Doar Agora</button>
            </div>
        </div>
    `;
});

function openDonationModal() {
    document.getElementById('donation-modal').classList.add('active');
    document.getElementById('modal-step-1').style.display = 'flex';
    document.getElementById('modal-step-2').classList.remove('active');
}

function closeModal() {
    document.getElementById('donation-modal').classList.remove('active');
}

function confirmDonation() {
    document.getElementById('modal-step-1').style.display = 'none';
    document.getElementById('modal-step-2').classList.add('active');
}

async function finishSimulation() {
    const amount = document.getElementById('mock-amount').value || 0;
    
    if (amount <= 0) {
        alert("Insira um valor válido para a simulação.");
        return;
    }

    const result = await simulateDonationApi(currentOngId, amount);
    
    if (result && result.success) {
        alert(`Simulação concluída! Novo total arrecadado: R$ ${result.newTotal.toLocaleString('pt-BR')}`);
        location.reload(); // Reload to see new value
    } else {
        alert("Erro ao simular doação.");
    }
}

function copyPix() {
    const pixText = document.getElementById('pix-key').innerText;
    navigator.clipboard.writeText(pixText).then(() => {
        alert('✅ Chave PIX copiada com sucesso para a área de transferência!');
    }).catch(err => {
        alert('❌ Erro ao copiar a chave. Por favor, copie manualmente segurando sobre o texto.');
    });
}
