import modelsApi from "../models/api.models.js";
import bcrypt from "bcrypt";
import crypto from "crypto";

// function verifier cle api

const validerCleApi = async (cleApi) => {
    if (!cleApi) return false;

    const result = await modelsApi.RechercherParCleApi(cleApi);
    return result.rows.length > 0 ? result.rows[0] : false;
};

// routes qui non pas besoin de Cle API

const AjouterUtilisateur = async (req, res) => {
    const { prenom, nom, courriel, mot_de_passe } = req.body;

    if (!prenom || !nom || !courriel || !mot_de_passe) {
        return res.status(400).json({ message: "Tous les champs sont requis." });
    }

    try{
        //Genere cle api et mot de passe hasher
        const mdp_hashed = await bcrypt.hash(mot_de_passe, 10);
        const cle_api = crypto.randomBytes(30).toString('hex');

        //cree dans la bd
        const utilisateur = await modelsApi.ajouterUtilisateur(prenom, nom, courriel, mdp_hashed, cle_api);

        res.status(201).json({
            message: "Utilisateur ajouté succelement",
            cle_api: utilisateur.cle_api
        });
    } catch (err) {
        console.error("Erreur d'ajout:", err);
        res.status(500).json({ message: "Erreur serveur", erreur: err.message });
    }
};

const CleApiUtilisateur = async (req, res) => {
    const { courriel, mot_de_passe} = req.body;

    if (!courriel || !mot_de_passe) return res.status(400).json({message:"tu doit mettre un couriel et un mot de passe"});

    try{
        const result = await modelsApi.RechercherUtilisateurCourriel(courriel);

        if (result.rows.length === 0 || !result) {
            return res.status(404).json({ message: "Aucun Utilisateur trouver" });
        }

        const utilisateur = result.rows[0];

        const mdpValide = await bcrypt.compare(mot_de_passe, utilisateur.password);
        if (!mdpValide) {
            return res.status(401).json({ message: "Mot de passe invalide." });
        }
        res.status(200).json({
            message: "Clé API existante récupérée.",
            cle_api: utilisateur.cle_api
        });
    } catch (err) {
        console.error("Erreur dans CleApiUtilisateur:", err);
        res.status(500).json({ message: "Erreur serveur", erreur: err.message });
    }
};

const nouvelleCleApi = async (req, res) => {
    const { courriel, mot_de_passe} = req.body;

    if (!courriel || !mot_de_passe) return res.status(400).json({message:"tu doit mettre un couriel et un mot de passe"});

    try{
        const result = await modelsApi.RechercherUtilisateurCourriel(courriel);

        if (result.rows.length === 0 || !result) {
            return res.status(404).json({ message: "Aucun Utilisateur" });
        }

        const utilisateur = result.rows[0];

        const mdpValide = await bcrypt.compare(mot_de_passe, utilisateur.password);
        if (!mdpValide) {
            return res.status(401).json({ message: "Mot de passe pas bon" });
        }

        const new_cle_api = crypto.randomBytes(30).toString('hex');

        await modelsApi.mettreAJourCleApi(courriel, new_cle_api);

        res.status(200).json({
            message: "Nouvelle clé API reussis",
            cle_api: new_cle_api
        });

    } catch (erreur) {
        console.error(erreur);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

//Route besoin de Cle API

const AjouteTaches = async (req, res) => {
    const cleApi = req.headers['cle_api'];
    const utilisateur = await validerCleApi(cleApi);
    if (!utilisateur) {
        return res.status(403).json({ message: "Clé API invalide ou manquante" });
    }

    const { titre, description, date_echeance } = req.body;

    if (!titre || !description || !date_echeance) {
        return res.status(400).json({ message: "Titre, description et date d'échéance sont requis." });
    }

    try {
        const tache = await modelsApi.ajouterTache(utilisateur.id, titre, description, date_echeance);
        res.status(201).json({ message: "Tâche ajoutée avec succès", id: tache.rows[0].id });
    } catch (err) {
        console.error("Erreur ajout tâche:", err);
        res.status(500).json({ message: "Erreur serveur", erreur: err.message });
    }
};


const ChercherTaches = async (req, res) => {
    const cleApi = req.headers['cle_api'];
    const utilisateur = await validerCleApi(cleApi);
    if (!utilisateur) {
        return res.status(403).json({ message: "Clé API invalide ou manquante" });
    }

    const voirToutes = req.query.toutes === 'true';

    try {
        const taches = await modelsApi.getTaches(utilisateur.id, voirToutes);
        res.status(200).json(taches.rows);
    } catch (err) {
        console.error("Erreur lors de la récupération des tâches:", err);
        res.status(500).json({ message: "Erreur serveur", erreur: err.message });
    }
};


const GetTachesId = async (req, res) => {
    const cleApi = req.headers['cle_api'];
    const utilisateur = await validerCleApi(cleApi);
    if (!utilisateur) {
        return res.status(403).json({ message: "Clé API invalide ou manquante" });
    }

    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "ID de tâche requis." });

    try {
        const taches = await modelsApi.getTaches(utilisateur.id, true);
        const tache = taches.rows.find(t => t.id == id);
        if (!tache) {
            return res.status(404).json({ message: "Tâche non trouvée." });
        }
        res.status(200).json(tache);
    } catch (err) {
        console.error("Erreur GetTachesId:", err);
        res.status(500).json({ message: "Erreur serveur", erreur: err.message });
    }
};

const ModifierTache = async (req, res) => {
    const cleApi = req.headers['cle_api'];
    const utilisateur = await validerCleApi(cleApi);
    if (!utilisateur) {
        return res.status(403).json({ message: "Clé API invalide ou manquante" });
    }

    const { id } = req.params;
    const { titre, description, date_echeance } = req.body;

    if (!id || !titre || !description || !date_echeance) {
        return res.status(400).json({ message: "Tous les champs sont requis pour modifier une tâche." });
    }

    try {
        const result = await modelsApi.modifierTache(id, utilisateur.id, titre, description, date_echeance);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Tâche non trouvée ou non autorisée." });
        }

        res.status(200).json({ message: "Tâche modifiée", tache: result.rows[0] });
    } catch (err) {
        console.error("Erreur ModifierTache:", err);
        res.status(500).json({ message: "Erreur serveur", erreur: err.message });
    }
};


const ModifierStatutTache = async (req, res) => {
    const cleApi = req.headers['cle_api'];
    const utilisateur = await validerCleApi(cleApi);
    if (!utilisateur) {
        return res.status(403).json({ message: "Clé API invalide ou manquante" });
    }

    const { id } = req.params;
    const { complete } = req.body;
    
    try {
        const result = await modelsApi.modifierStatutTache(id, complete);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Tache non trouvée." });
        }

        res.status(200).json({ message: "Statut mis à jour", tache: result.rows[0] });
    } catch (err) {
        console.error("Erreur ModifierStatutTache:", err);
        res.status(500).json({ message: "Erreur serveur", erreur: err.message });
    }
};

const SupprimerTache = async (req, res) => {
    const cleApi = req.headers['cle_api'];
    const utilisateur = await validerCleApi(cleApi);
    if (!utilisateur) {
        return res.status(403).json({ message: "Cle API invalide ou manquante" });
    }

    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ message: "ID de tache requis." });
    }

    try {
        await modelsApi.supprimerTache(id);
        res.status(200).json({ message: "Tâche supprimée avec succes." });
    } catch (err) {
        console.error("Erreur SupprimerTache:", err);
        res.status(500).json({ message: "Erreur serveur", erreur: err.message });
    }
};


// sous-tache

const addSousTache = async (req, res) => {
    const cleApi = req.headers['cle_api'];
    const utilisateur = await validerCleApi(cleApi);
    if (!utilisateur) {
        return res.status(403).json({ message: "Clé API invalide ou manquante" });
    }

    const id_tache = parseInt(req.params.id);
    const { titre, complete } = req.body;

    if (isNaN(id_tache)) return res.status(400).json({ message: 'ID de tâche invalide' });
    if (!titre || typeof complete !== "boolean")
        return res.status(400).json({ message: 'Titre et état "complete" sont requis' });

    try {
        const sousTacheAjoutee = await modelsApi.ajouterSousTache(id_tache, titre, complete);
        res.status(201).json(sousTacheAjoutee);
    } catch (erreur) {
        console.error(erreur);
        res.status(500).json({ message: 'Erreur lors de l\'ajout de la sous-tâche' });
    }
};

  
const modifySousTache = async (req, res) => {
    const cleApi = req.headers['cle_api'];
    const utilisateur = await validerCleApi(cleApi);
    
    if (!utilisateur) {
        return res.status(403).json({ message: "Clé API invalide ou manquante" });
    }

    const { id } = req.params;
    const { titre, complete } = req.body;

    if (!titre || typeof complete !== "boolean") {
        return res.status(400).json({ message: 'Titre et état "complete" sont requis' });
    }

    try {
        const sousTacheModifiee = await modelsApi.modifierSousTache(id, titre, complete);
        
        if (!sousTacheModifiee) {
            return res.status(404).json({ message: 'Sous-tâche non trouvée' });
        }
        res.json(sousTacheModifiee);
    } catch (erreur) {
        console.error(erreur);
        res.status(500).json({ message: 'Erreur lors de la modification de la sous-tâche' });
    }
};


const modifyStatutSousTache = async (req, res) => {
    const cleApi = req.headers['cle_api'];
    const utilisateur = await validerCleApi(cleApi);
    if (!utilisateur) {
        return res.status(403).json({ message: "Clé API invalide ou manquante" });
    }

    const { id } = req.params;
    const { complete } = req.body;

    if (typeof complete !== "boolean") return res.status(400).json({ message: 'État "complete" requis' });

    try {
        const sousTacheModifiee = await modelsApi.modifierStatutSousTache(id, complete); 
        if (!sousTacheModifiee) return res.status(404).json({ message: 'Sous-tâche non trouvée' });
        res.json(sousTacheModifiee);
    } catch (erreur) {
        console.error(erreur);
        res.status(500).json({ message: 'Erreur lors de la modification du statut de la sous-tâche' });
    }
};

const DeleteSousTache = async (req, res) => {
    const cleApi = req.headers['cle_api'];
    const utilisateur = await validerCleApi(cleApi);
    if (!utilisateur) {
        return res.status(403).json({ message: "Clé API invalide ou manquante" });
    }

    const { id } = req.params;

    try {
        const resultat = await modelsApi.supprimerSousTache(id);
        if (resultat === 0) return res.status(404).json({ message: 'Sous-tâche non trouvée' });
        res.status(204).end();
    } catch (erreur) {
        console.error(erreur);
        res.status(500).json({ message: 'Erreur lors de la suppression de la sous-tâche' });
    }
};



export {
    AjouterUtilisateur,
    CleApiUtilisateur,
    nouvelleCleApi,
    AjouteTaches,
    ChercherTaches,
    GetTachesId,
    ModifierTache,
    ModifierStatutTache,
    SupprimerTache,
    addSousTache,
    modifySousTache,
    modifyStatutSousTache,
    DeleteSousTache
};
