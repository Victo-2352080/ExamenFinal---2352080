DROP TABLE IF EXISTS public.sous_taches;
DROP TABLE IF EXISTS public.taches;
DROP TABLE IF EXISTS public.utilisateur;



CREATE TABLE utilisateur (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(30),
    prenom VARCHAR(30),
    courriel VARCHAR(255),
    cle_api VARCHAR(32),
    password VARCHAR(100)
);

CREATE TABLE taches (
    id SERIAL PRIMARY KEY,
    utilisateur_id INT,
    titre VARCHAR(100),
    description VARCHAR(500),
    date_debut DATE,
    date_echeance DATE,
    complete BOOLEAN,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateur(id)
    
);

CREATE TABLE sous_taches (
    id SERIAL PRIMARY KEY,
    tache_id INT,
    titre VARCHAR(100),
    complete BOOLEAN,
    FOREIGN KEY (tache_id) REFERENCES taches(id)
);