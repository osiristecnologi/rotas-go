document.addEventListener('DOMContentLoaded', () => {
    // --- Configurações ---
    mapboxgl.accessToken = 'pk.eyJ1IjoibGVvbmFyZG8tZmFyaWFzIiwiYSI6ImNtb3ExdjYzejA1dDkycXByeGprNmp5NnkifQ.a6DviekaVOcZm8k-kqAfpQ'; // Token Público

    // --- Elementos ---
    const navItems = document.querySelectorAll('.nav-item');
    const screens = document.querySelectorAll('.screen');
    const pixKeyElement = document.getElementById('pixKey');
    const adForm = document.getElementById('adForm');
    const photosInput = document.getElementById('photos');
    const photoError = document.getElementById('photo-error');

    // --- Navegação SPA ---
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetId = item.getAttribute('data-target');
            
            // Esconder todas as telas
            screens.forEach(s => s.classList.remove('active'));
            screens.forEach(s => s.style.display = 'none');

            // Mostrar tela alvo
            const targetScreen = document.getElementById(targetId);
            if (targetScreen) {
                targetScreen.style.display = 'block';
                targetScreen.classList.add('active');
            }

            // Se for a tela Premium, carregar dados
            if (targetId === 'screen-premium') {
                fetchPixKey();
            }
        });
    });

    // --- Carregar Chave PIX ---
    async function fetchPixKey() {
        try {
            const res = await fetch('/api/config/pix');
            const data = await res.json();
            if (data.pixKey) {
                pixKeyElement.textContent = data.pixKey;
            } else {
                pixKeyElement.textContent = "Erro ao carregar.";
            }
        } catch (error) {
            console.error("Erro ao buscar PIX", error);
            pixKeyElement.textContent = "Indisponível.";
        }
    }

    // --- Copiar PIX ---
    document.getElementById('btn-copy-pix').addEventListener('click', () => {
        const key = pixKeyElement.textContent;
        if (key && key !== "Carregando...") {
            navigator.clipboard.writeText(key).then(() => {
                alert("Chave copiada!");
            });
        }
    });

    // --- Solicitar Premium ---
    document.getElementById('btn-request-premium').addEventListener('click', async () => {
        const btn = document.getElementById('btn-request-premium');
        btn.textContent = "Enviando...";
        btn.disabled = true;

        try {
            // Simulação de envio do token JWT no header
            const token = localStorage.getItem('token'); // Assumindo que o usuário está logado
            
            const res = await fetch('/api/premium/request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await res.json();
            if (data.success) {
                alert(data.message);
            } else {
                alert("Erro: " + data.error);
            }
        } catch (error) {
            alert("Erro de conexão");
        } finally {
            btn.textContent = "Já fiz o pagamento";
            btn.disabled = false;
        }
    });

    // --- Validação Frontend do Upload ---
    photosInput.addEventListener('change', () => {
        const files = photosInput.files;
        if (files.length > 2) {
            photoError.textContent = "Limite excedido. Máximo de 2 fotos para upload.";
            photosInput.value = ""; // Limpa seleção
        } else {
            photoError.textContent = "";
        }
    });

    // --- Envio de Anúncio (Multipart) ---
    adForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (photosInput.files.length > 2) {
            alert("Corrija o número de fotos antes de enviar.");
            return;
        }

        const formData = new FormData(adForm);
        const btnSubmit = document.getElementById('btn-submit-ad');
        
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/ads/create', {
                method: 'POST',
                headers: {
                    // Não defina Content-Type aqui, o navegador define automaticamente com o boundary para FormData
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await res.json();
            if (res.ok) {
                alert("Sucesso!");
                adForm.reset();
            } else {
                alert("Erro: " + data.error);
            }
        } catch (error) {
            alert("Erro ao conectar com servidor");
        }
    });

    // --- Botão Fechar Premium ---
    document.getElementById('btn-close-premium').addEventListener('click', () => {
        document.getElementById('screen-premium').style.display = 'none';
        // Voltar para home ou anterior
        document.getElementById('screen-home').style.display = 'block';
    });
});
