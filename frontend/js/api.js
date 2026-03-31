const API_URL = '/api';

async function fetchOngs() {
    try {
        const response = await fetch(`${API_URL}/ongs`);
        if (!response.ok) throw new Error('Falha ao buscar ONGs');
        return await response.json();
    } catch (error) {
        console.error('Erro:', error);
        return [];
    }
}

async function fetchNearbyOngs(lat, lng) {
    try {
        const response = await fetch(`${API_URL}/ongs/nearby?lat=${lat}&lon=${lng}`);
        if (!response.ok) throw new Error('Falha ao buscar ONGs próximas');
        return await response.json();
    } catch (error) {
        console.error('Erro:', error);
        return [];
    }
}

async function fetchOngById(id) {
    try {
        const response = await fetch(`${API_URL}/ongs/${id}`);
        if (!response.ok) throw new Error('ONG não encontrada');
        return await response.json();
    } catch (error) {
        console.error('Erro:', error);
        return null;
    }
}

async function simulateDonationApi(id, amount) {
    try {
        const response = await fetch(`${API_URL}/donate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id, amount })
        });
        return await response.json();
    } catch (error) {
        console.error('Erro na doação:', error);
        return { success: false };
    }
}
