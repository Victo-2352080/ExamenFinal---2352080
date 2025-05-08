import pkg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
    host: process.env.PG_HOST,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
    port: process.env.PG_PORT,
    max: process.env.PG_CONNECTION_LIMIT || 10
});

pool.connect((err, client, release) => {
    if (err) {
        console.error('Erreur de connexion à la base de données :', err.stack);
    } else {
        console.log('Connexion à la base');
        release();
    }
});

export default pool;
