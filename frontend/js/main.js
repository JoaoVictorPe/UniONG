document.addEventListener('DOMContentLoaded', async () => {
    const grid = document.getElementById('campaign-grid');
    if (!grid) return; // Not on home page

    grid.innerHTML = '<p class="text-center" style="grid-column: 1 / -1;">Carregando campanhas...</p>';

    const ongs = await fetchOngs();

    if (ongs.length === 0) {
        grid.innerHTML = '<p class="text-center" style="grid-column: 1 / -1;">Nenhuma campanha encontrada no momento.</p>';
        return;
    }

    grid.innerHTML = '';
    
    ongs.forEach(ong => {
        const progressPercentage = Math.min((ong.raised / ong.goal) * 100, 100).toFixed(1);
        
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <img src="${ong.image}" alt="${ong.name}" class="card-img" onerror="this.src='https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&h=400&fit=crop'">
            <div class="card-content">
                <h4 class="card-title">${ong.name}</h4>
                <p class="card-desc">${ong.description.substring(0, 100)}...</p>
                <div class="progress-container">
                    <div class="progress-labels">
                        <span>Arrecadado: R$ ${ong.raised.toLocaleString('pt-BR')}</span>
                        <span>Meta: R$ ${ong.goal.toLocaleString('pt-BR')}</span>
                    </div>
                    <div class="progress-bar-bg">
                        <div class="progress-bar-fill" style="width: ${progressPercentage}%"></div>
                    </div>
                </div>
                <div class="card-action">
                    <a href="/campaign.html?id=${ong.id}" class="btn btn-primary">Apoiar Causa</a>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
});
