document.addEventListener('DOMContentLoaded', async () => {
    const grid = document.getElementById('campaign-grid');
    if (!grid) return; // Not on home page

    // 1. Tentar ler do sessionStorage para load instantâneo (Optimistic UI)
    const cachedData = sessionStorage.getItem('uniOngs');
    let ongs = cachedData ? JSON.parse(cachedData).data : [];
    let isMock = cachedData ? JSON.parse(cachedData).isMock : true;

    // Função de renderização rápida
    const render = (showLoading = false) => {
        if (ongs.length === 0 && !showLoading) {
            grid.innerHTML = '<p class="text-center" style="grid-column: 1 / -1;">Nenhuma campanha encontrada no momento.</p>';
            return;
        }

        grid.innerHTML = '';

        if (showLoading) {
            const banner = document.createElement('div');
            banner.style.gridColumn = '1 / -1';
            banner.style.padding = '10px';
            banner.style.textAlign = 'center';
            banner.style.color = 'var(--text-main)';
            banner.style.backgroundColor = 'rgba(255, 215, 0, 0.1)';
            banner.style.border = '1px solid var(--primary)';
            banner.style.borderRadius = '8px';
            banner.style.marginBottom = '20px';
            banner.innerHTML = '🌐 Exibindo campanhas globais. Verificando GPS para encontrar ONGs na sua região...';
            grid.appendChild(banner);
        } else if (isMock) {
            const warningParams = document.createElement('div');
            warningParams.style.gridColumn = '1 / -1';
            warningParams.style.marginBottom = '30px';
            warningParams.style.padding = '15px';
            warningParams.style.backgroundColor = 'rgba(255, 68, 68, 0.1)';
            warningParams.style.border = '1px solid #ff4444';
            warningParams.style.borderRadius = '8px';
            warningParams.style.textAlign = 'center';
            warningParams.innerHTML = '<strong style="color: #ff4444; font-size: 1.1rem;">⚠️ Aviso de Portfólio</strong><br><span style="color: var(--text-main); font-size: 0.95rem;">Exibindo <strong>campanhas da base local</strong>. GPS bloqueado ou sem alcance.</span>';
            grid.appendChild(warningParams);
        }

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
                        <a href="./campaign.html?id=${ong.id}" class="btn btn-primary">Apoiar Causa</a>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });
    };

    // 2. Se não temos cache, buscar as padrões de imediato ou esperar o retorno para não deixar a tela vazia
    if (ongs.length === 0) {
        ongs = await fetchOngs();
        render(true); // renderiza ongs padrão com banner de "Buscando geo..."
    } else {
        render(false); // renderiza com dados do cache
    }

    // 3. Efetuar a geolocalização asincronamente se "isMock", ou se precisamos de dados hiper realistas
    if ("geolocation" in navigator && isMock) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            try {
                const nearbyResult = await fetchNearbyOngs(position.coords.latitude, position.coords.longitude);
                if (nearbyResult && nearbyResult.data && nearbyResult.data.length > 0) {
                    ongs = nearbyResult.data;
                    isMock = nearbyResult.source !== 'real';
                    
                    // Salvar no storage
                    sessionStorage.setItem('uniOngs', JSON.stringify({ data: ongs, isMock: isMock }));
                    
                    // Re-render
                    render(false);
                }
            } catch (e) {
                console.warn('Falha na API de ONGs próximas', e);
                render(false); // remove banner alertando mock novamente se precisar
            }
        }, (error) => {
            console.warn("Geolocalização negada ou falhou.", error);
            render(false); // apenas remove a barra indicadora e mantém mocks
        }, { timeout: 10000 });
    }
});
