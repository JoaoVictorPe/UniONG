const API_URL = '/api';

function showOfflineOverlay(show) {
    const overlay = document.getElementById('offline-overlay');
    if (overlay) overlay.style.display = show ? 'flex' : 'none';
}

async function fetchWithRetry(url, options = {}, retries = 999) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, options);
            
            // Check if the response is valid JSON. Cloudflare, Render, or Express crash dumps will send HTML text.
            const contentType = response.headers.get("content-type");
            if (!response.ok || !contentType || contentType.indexOf("application/json") === -1) {
                throw new Error('Servidor retornou HTML, 404, 502 ou erro fatal do Back-end');
            }
            
            showOfflineOverlay(false);
            return await response.json();
        } catch (error) {
            console.warn(`Tentativa de conexão ${i+1} falhou. Link caiu ou servidor em boot. Reconectando em 3s...`, error);
            showOfflineOverlay(true);
            await new Promise(res => setTimeout(res, 3000));
        }
    }
    throw new Error('Falha permanente na rede');
}

async function fetchOngs() {
    try {
        return await fetchWithRetry(`${API_URL}/ongs`);
    } catch (e) { return []; }
}

async function fetchNearbyOngs(lat, lng) {
    try {
        return await fetchWithRetry(`${API_URL}/ongs/nearby?lat=${lat}&lon=${lng}`);
    } catch (error) {
        console.error('Erro de API remota:', error);
        return { source: 'error', data: [] };
    }
}

async function simulateDonationApi(id, amount) {
    try {
        return await fetchWithRetry(`${API_URL}/donate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id, amount })
        });
    } catch (error) {
        console.error('Erro na doação:', error);
        return { success: false };
    }
}

async function fetchOngById(id) {
    try {
        return await fetchWithRetry(`${API_URL}/ongs/${id}`);
    } catch (error) {
        console.error('Erro ao buscar ONG por ID:', error);
        return null;
    }
}
