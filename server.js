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
