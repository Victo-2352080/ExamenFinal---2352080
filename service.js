import express from 'express';
import router from './Src/routes/api.route.js';

const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', router);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
