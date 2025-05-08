import db from '../config/db.js';

const ajouterUtilisateur = (prenom, nom, courriel, mot_de_passe, cle_api) => {
    const query = `
        INSERT INTO utilisateur (prenom, nom, courriel, password, cle_api)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING cle_api;
    `;
    const valeurs = [prenom, nom, courriel, mot_de_passe, cle_api];

    return new Promise((resolve, reject) => {
        db.query(query, valeurs)
            .then(result => {
                resolve(result.rows[0]);
            })
            .catch(error => {
                reject(error);
            });
    });
};

const RechercherUtilisateurCourriel = (courriel) => {
    const query = `
        SELECT cle_api, password FROM utilisateur WHERE courriel = $1;
    `;
    const valeurs = [courriel];

    return new Promise((resolve, reject) => {
        db.query(query, valeurs)
            .then(result => resolve(result))
            .catch(error => reject(error));
    });
};

const mettreAJourCleApi = async (courriel, nouvelleCle) => {
    const query = `
        UPDATE utilisateur 
        SET cle_api = $1 
        WHERE courriel = $2 
        RETURNING cle_api;
    `;

    const valeurs = [nouvelleCle, courriel];

    return new Promise((resolve, reject) => {
        db.query(query, valeurs)
            .then(result => resolve(result))
            .catch(error => reject(error));
    });
};

const RechercherParCleApi = async (cle_api) => {
    const query = 'SELECT * FROM utilisateur WHERE cle_api = $1';
    const valeurs = [cle_api];
    return new Promise((resolve, reject) => {
        db.query(query, valeurs)
            .then(result => resolve(result))
            .catch(error => reject(error));
    });
};

const ajouterTache = (utilisateur_id, titre, description, date_echeance) => {
    const query = `
        INSERT INTO taches (utilisateur_id, titre, description, date_debut, date_echeance, complete)
        VALUES ($1, $2, $3, CURRENT_DATE, $4, false)
        RETURNING *;
    `;
    const values = [utilisateur_id, titre, description, date_echeance];

    return new Promise((resolve, reject) => {
        db.query(query, values)
            .then(result => resolve(result))
            .catch(error => reject(error));
    });
};

const getTaches = (utilisateur_id, toutes) => {
    const query = toutes
        ? `SELECT * FROM taches WHERE utilisateur_id = $1 ORDER BY date_echeance ASC;`
        : `SELECT * FROM taches WHERE utilisateur_id = $1 AND complete = false ORDER BY date_echeance ASC;`;

    const values = [utilisateur_id];

    return new Promise((resolve, reject) => {
        db.query(query, values)
            .then(result => resolve(result))
            .catch(error => reject(error));
    });
};

const modifierStatutTache = (id, complete) => {
    const query = `
        UPDATE taches
        SET complete = $1
        WHERE id = $2
        RETURNING *;
    `;
    const values = [complete, id];

    return new Promise((resolve, reject) => {
        db.query(query, values)
            .then(result => resolve(result))
            .catch(error => reject(error));
    });
};

const supprimerTache = (id) => {
    const query = `DELETE FROM taches WHERE id = $1;`;
    const values = [id];

    return new Promise((resolve, reject) => {
        db.query(query, values)
            .then(result => resolve(result))
            .catch(error => reject(error));
    });
};

const ajouterSousTache = (tache_id, titre) => {
    const query = `
        INSERT INTO sous_taches (tache_id, titre, complete)
        VALUES ($1, $2, false)
        RETURNING *;
    `;
    const values = [tache_id, titre];

    return new Promise((resolve, reject) => {
        db.query(query, values)
            .then(result => resolve(result))
            .catch(error => reject(error));
    });
};

const getSousTaches = (tache_id) => {
    const query = `SELECT * FROM sous_taches WHERE tache_id = $1 ORDER BY id ASC;`;
    const values = [tache_id];

    return new Promise((resolve, reject) => {
        db.query(query, values)
            .then(result => resolve(result))
            .catch(error => reject(error));
    });
};

const modifierStatutSousTache = (id, complete) => {
    const query = `
        UPDATE sous_taches
        SET complete = $1
        WHERE id = $2
        RETURNING *;
    `;
    const values = [complete, id];

    return new Promise((resolve, reject) => {
        db.query(query, values)
            .then(result => resolve(result))
            .catch(error => reject(error));
    });
};

const supprimerSousTache = (id) => {
    const query = `DELETE FROM sous_taches WHERE id = $1;`;
    const values = [id];

    return new Promise((resolve, reject) => {
        db.query(query, values)
            .then(result => resolve(result))
            .catch(error => reject(error));
    });
};
  

export default {
    ajouterUtilisateur,
    RechercherUtilisateurCourriel,
    mettreAJourCleApi,
    RechercherParCleApi,
    ajouterTache,
    getTaches,
    modifierStatutTache,
    supprimerTache,
    ajouterSousTache,
    getSousTaches,
    modifierStatutSousTache,
    supprimerSousTache,
};