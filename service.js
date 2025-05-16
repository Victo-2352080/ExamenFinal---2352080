import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import router from './Src/routes/api.route.js';

import fs from 'fs';
const swaggerDocument = JSON.parse(fs.readFileSync('./src/config/documentation.json', 'utf8'));
const swaggerOptions = {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: "ExamenFinal-2352080"
};

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', router);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, swaggerOptions));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
