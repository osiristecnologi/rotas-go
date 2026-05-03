require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();

// Segurança básica
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configuração de Upload (Temporário)
// Nota: Em produção, use armazenamento em nuvem (S3/Cloudinary).
const storage = multer.memoryStorage(); 
const upload = multer({ 
    storage: storage,
    limits: { files: 5, fileSize: 5 * 1024 * 1024 } // Máximo 5 arquivos, 5MB cada
});

// Middleware de Autenticação (Simulado para o exemplo)
const verifyToken = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ error: 'Acesso negado' });

    try {
        // Verifique a assinatura JWT real aqui
        const verified = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);
        req.user = verified; // Deve conter { id, plan: 'free' | 'premium' }
        next();
    } catch (err) {
        res.status(400).json({ error: 'Token inválido' });
    }
};

// Middleware de Validação de Upload (Lógica de Segurança Real)
const validateUpload = (req, res, next) => {
    const files = req.files;
    const userPlan = req.user.plan; // 'free' ou 'premium'

    if (!files || files.length === 0) {
        return res.status(400).json({ error: 'Nenhuma imagem enviada' });
    }

    // Verificar MIME Types
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    for (let file of files) {
        if (!allowedTypes.includes(file.mimetype)) {
            return res.status(400).json({ error: 'Formato de imagem inválido' });
        }
    }

    // Verificar Limites por Plano
    if (userPlan === 'free' && files.length > 2) {
        return res.status(403).json({ error: 'Plano Grátis: máximo de 2 fotos.' });
    }
    if (userPlan === 'premium' && files.length > 5) {
        return res.status(403).json({ error: 'Plano Premium: máximo de 5 fotos.' });
    }

    next();
};

// --- ROTAS ---

// 1. Configuração Pública (PIX Key)
app.get('/api/config/pix', (req, res) => {
    res.json({
        pixKey: process.env.PIX_KEY || "Chave não configurada"
    });
});

// 2. Solicitação Premium
app.post('/api/premium/request', verifyToken, (req, res) => {
    // Lógica: Registrar no banco de dados o pedido de upgrade
    // Status inicial: 'pending'
    res.json({ 
        success: true, 
        message: "Solicitação enviada. Aguarde aprovação do admin." 
    });
});

// 3. Upload de Anúncio (Protegido)
app.post('/api/ads/create', verifyToken, upload.array('photos', 5), validateUpload, (req, res) => {
    // Se passou pelo validateUpload, está seguro.
    // Salvar dados no banco aqui...
    res.json({ success: true, message: "Anúncio criado com sucesso!" });
});

// Fallback para SPA
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
