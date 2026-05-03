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


// Upload temporário
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,

    limits: {
        files: 5,
        fileSize: 5 * 1024 * 1024
    }
});


// Middleware JWT
const verifyToken = (
    req,
    res,
    next
) => {

    const authHeader =
        req.header(
            'Authorization'
        );


    // CORREÇÃO 1
    if (
        !authHeader ||
        !authHeader.startsWith(
            'Bearer '
        )
    ) {

        return res
            .status(401)
            .json({
                error:
                    'Acesso negado'
            });

    }


    const token =
        authHeader
            .split(' ')[1];


    try {

        const verified =
            jwt.verify(
                token,
                process.env
                    .JWT_SECRET
            );

        req.user =
            verified;

        next();

    } catch (err) {

        return res
            .status(400)
            .json({
                error:
                    'Token inválido'
            });

    }

};



// Simulação de moderação
async function moderateImages(
    files
) {

    // CORREÇÃO 3
    // Aqui entrará sua API real

    if (
        !process.env
            .MODERATION_KEY
    ) {

        return true;

    }


    // Por enquanto aprova.
    // Substitua pela chamada real
    // PicPurify etc.

    return true;

}



// Middleware upload
const validateUpload =
    async (
        req,
        res,
        next
    ) => {

        const files =
            req.files;


        // CORREÇÃO 2
        const userPlan =
            req.user.plan ||
            'free';


        if (
            !files ||
            files.length === 0
        ) {

            return res
                .status(400)
                .json({
                    error:
                        'Nenhuma imagem enviada'
                });

        }


        const allowedTypes = [

            'image/jpeg',

            'image/png',

            'image/webp'

        ];


        for (
            let file
            of files
        ) {

            if (
                !allowedTypes
                    .includes(
                        file
                            .mimetype
                    )
            ) {

                return res
                    .status(
                        400
                    )
                    .json({
                        error:
                            'Formato de imagem inválido'
                    });

            }

        }


        if (
            userPlan ===
                'free' &&
            files.length > 2
        ) {

            return res
                .status(
                    403
                )
                .json({
                    error:
                        'Plano Grátis: máximo de 2 fotos.'
                });

        }


        if (
            userPlan ===
                'premium' &&
            files.length > 5
        ) {

            return res
                .status(
                    403
                )
                .json({
                    error:
                        'Plano Premium: máximo de 5 fotos.'
                });

        }


        // CORREÇÃO 3
        const approved =
            await moderateImages(
                files
            );

        if (
            !approved
        ) {

            return res
                .status(
                    403
                )
                .json({
                    error:
                        'Imagem bloqueada por moderação.'
                });

        }


        next();

    };



// ROTAS


// PIX
app.get(
    '/api/config/pix',
    (
        req,
        res
    ) => {

        res.json({

            pixKey:
                process
                    .env
                    .PIX_KEY ||

                "Chave não configurada"

        });

    }
);



// Premium
app.post(
    '/api/premium/request',

    verifyToken,

    (
        req,
        res
    ) => {

        res.json({

            success:
                true,

            message:
                "Solicitação enviada. Aguarde aprovação do admin."

        });

    }
);



// Criar anúncio
app.post(

    '/api/ads/create',

    verifyToken,

    upload.array(
        'photos',
        5
    ),

    validateUpload,

    (
        req,
        res
    ) => {

        res.json({

            success:
                true,

            message:
                "Anúncio criado com sucesso!"

        });

    }

);



// SPA
app.get(
    '*',

    (
        req,
        res
    ) => {

        res.sendFile(

            path.join(

                __dirname,

                'public',

                'index.html'

            )

        );

    }
);



const PORT =
    process.env.PORT ||
    3000;


app.listen(
    PORT,

    () =>

        console.log(

            `Servidor rodando na porta ${PORT}`

        )
);
