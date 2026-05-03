document.addEventListener('DOMContentLoaded', () => {

    // --- Configurações ---
    mapboxgl.accessToken = 'pk.eyJ1IjoibGVvbmFyZG8tZmFyaWFzIiwiYSI6ImNtb3ExdjYzejA1dDkycXByeGprNmp5NnkifQ.a6DviekaVOcZm8k-kqAfpQ';


    // --- Inicializar mapa ---
    if (document.getElementById('map')) {

        new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/streets-v12',
            center: [-47.8825, -15.7942],
            zoom: 13
        });

    }


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

            screens.forEach(screen => {
                screen.classList.remove('active');
                screen.style.display = 'none';
            });

            const targetScreen =
                document.getElementById(targetId);

            if (targetScreen) {

                targetScreen.style.display = 'block';
                targetScreen.classList.add('active');

            }

            if (targetId === 'screen-premium') {
                fetchPixKey();
            }

        });

    });


    // --- Carregar chave PIX ---
    async function fetchPixKey() {

        if (!pixKeyElement) return;

        try {

            const res =
                await fetch('/api/config/pix');

            const data =
                await res.json();

            if (data.pixKey) {

                pixKeyElement.textContent =
                    data.pixKey;

            } else {

                pixKeyElement.textContent =
                    "Erro ao carregar.";

            }

        } catch (error) {

            console.error(error);

            pixKeyElement.textContent =
                "Indisponível.";

        }

    }


    // --- Copiar PIX ---
    const copyPixBtn =
        document.getElementById('btn-copy-pix');

    if (copyPixBtn) {

        copyPixBtn.addEventListener('click', () => {

            const key =
                pixKeyElement.textContent;

            if (
                key &&
                key !== "Carregando..."
            ) {

                navigator.clipboard
                    .writeText(key)
                    .then(() => {

                        alert("Chave copiada!");

                    });

            }

        });

    }


    // --- Solicitar premium ---
    const premiumBtn =
        document.getElementById(
            'btn-request-premium'
        );

    if (premiumBtn) {

        premiumBtn.addEventListener(
            'click',
            async () => {

                premiumBtn.textContent =
                    "Enviando...";

                premiumBtn.disabled =
                    true;

                try {

                    const token =
                        localStorage.getItem(
                            'token'
                        );

                    const res =
                        await fetch(
                            '/api/premium/request',
                            {
                                method: 'POST',

                                headers: {
                                    'Content-Type':
                                        'application/json',

                                    'Authorization':
                                        `Bearer ${token}`
                                }
                            }
                        );

                    const data =
                        await res.json();

                    if (data.success) {

                        alert(
                            data.message
                        );

                    } else {

                        alert(
                            "Erro: " +
                            data.error
                        );

                    }

                } catch (error) {

                    alert(
                        "Erro de conexão"
                    );

                } finally {

                    premiumBtn.textContent =
                        "Já fiz o pagamento";

                    premiumBtn.disabled =
                        false;

                }

            }
        );

    }


    // --- Validação upload ---
    if (photosInput) {

        photosInput.addEventListener(
            'change',
            () => {

                const files =
                    photosInput.files;

                if (
                    files.length > 2
                ) {

                    if (
                        photoError
                    ) {

                        photoError.textContent =
                            "Limite excedido. Máximo 2 fotos.";

                    }

                    photosInput.value =
                        "";

                } else {

                    if (
                        photoError
                    ) {

                        photoError.textContent =
                            "";

                    }

                }

            }
        );

    }


    // --- Enviar anúncio ---
    if (adForm) {

        adForm.addEventListener(
            'submit',
            async (e) => {

                e.preventDefault();

                if (
                    photosInput &&
                    photosInput.files.length > 2
                ) {

                    alert(
                        "Corrija as fotos."
                    );

                    return;

                }

                const formData =
                    new FormData(
                        adForm
                    );

                try {

                    const token =
                        localStorage.getItem(
                            'token'
                        );

                    const res =
                        await fetch(
                            '/api/ads/create',
                            {
                                method: 'POST',

                                headers: {
                                    'Authorization':
                                        `Bearer ${token}`
                                },

                                body:
                                    formData
                            }
                        );

                    const data =
                        await res.json();

                    if (
                        res.ok
                    ) {

                        alert(
                            "Sucesso!"
                        );

                        adForm.reset();

                    } else {

                        alert(
                            "Erro: " +
                            data.error
                        );

                    }

                } catch (error) {

                    alert(
                        "Erro ao conectar"
                    );

                }

            }
        );

    }


    // --- Fechar premium ---
    const closePremiumBtn =
        document.getElementById(
            'btn-close-premium'
        );

    if (closePremiumBtn) {

        closePremiumBtn.addEventListener(
            'click',
            () => {

                const premium =
                    document.getElementById(
                        'screen-premium'
                    );

                const home =
                    document.getElementById(
                        'screen-home'
                    );

                if (premium) {

                    premium.style.display =
                        'none';

                    premium.classList.remove(
                        'active'
                    );

                }

                if (home) {

                    home.style.display =
                        'block';

                    home.classList.add(
                        'active'
                    );

                }

            }
        );

    }

});
