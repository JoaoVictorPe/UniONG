const express = require('express');
const cors = require('cors');
const path = require('path');
const { ongs } = require('./backend/data');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'frontend')));

app.get('/api/ongs', (req, res) => {
    res.json(ongs);
});

app.get('/api/ongs/nearby', async (req, res) => {
    const { lat, lon } = req.query;
    if (!lat || !lon) {
        return res.status(400).json({ error: 'Latitude e longitude são obrigatórios' });
    }

    try {
        const radius = 30000; // 30km radius
        const overpassQuery = `
            [out:json];
            (
              node["office"="ngo"](around:${radius},${lat},${lon});
              node["amenity"="social_facility"](around:${radius},${lat},${lon});
            );
            out 10;
        `;
        
        const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`);
        const data = await response.json();

        if (data && data.elements && data.elements.length > 0) {
            const defaultImages = [
                'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&h=400&fit=crop',
                'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&h=400&fit=crop',
                'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&h=400&fit=crop',
                'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&h=400&fit=crop',
                'https://images.unsplash.com/photo-1516307365426-bea591f05011?w=600&h=400&fit=crop'
            ];

            const nearbyOngs = data.elements.map((el, index) => {
                const name = el.tags?.name || 'ONG Acolhimento Social';
                const id = parseInt(el.id);
                
                const ong = {
                    id: id,
                    name: name,
                    description: `Esta é uma instituição real localizada próxima a você. A instituição "${name}" atua na comunidade oferecendo suporte e serviços sociais. Detalhes específicos podem variar, mas seu apoio transforma vidas. (Dados fornecidos publicamente pelo OpenStreetMap).`,
                    goal: Math.floor(Math.random() * 20000) + 5000,
                    raised: Math.floor(Math.random() * 5000),
                    location: `Lat: ${el.lat?.toFixed(3)}, Lon: ${el.lon?.toFixed(3)}`,
                    image: defaultImages[index % defaultImages.length]
                };
                
                if (!ongs.find(o => o.id === ong.id)) {
                    ongs.push(ong);
                }
                
                return ong;
            });
            
            return res.json(nearbyOngs);
        } else {
            return res.json(ongs.slice(0, 6)); // Retorna as padrão se não achar
        }
    } catch (error) {
        console.error('Erro na Overpass API:', error);
        return res.json(ongs.slice(0, 6)); // Fallback seguro
    }
});

app.get('/api/ongs/:id', (req, res) => {
    const ong = ongs.find(o => o.id === parseInt(req.params.id));
    if (ong) {
        res.json(ong);
    } else {
        res.status(404).json({ error: 'ONG not found' });
    }
});

app.post('/api/donate', (req, res) => {
    const { id, amount } = req.body;
    const ong = ongs.find(o => o.id === parseInt(id));
    
    if (!ong) {
        return res.status(404).json({ error: 'ONG not found' });
    }
    
    ong.raised += parseFloat(amount);
    
    res.json({ success: true, message: 'Doação simulada com sucesso!', newTotal: ong.raised });
});

// Fallback padrão para gerenciar as páginas HTML e SPA
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
