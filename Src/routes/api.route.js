import express from 'express';
import * as ctrl from '../controllers/api.controller.js';

const router = express.Router();

router.post('/utilisateur', ctrl.AjouterUtilisateur)
router.post('/utilisateur/cle', ctrl.nouvelleCleApi)
router.get('/utilisateur/cle', ctrl.CleApiUtilisateur)

router.get('/taches', ctrl.ChercherTaches)
router.get('/taches/:id', ctrl.GetTachesId)

router.post('/taches', ctrl.AjouteTaches)
router.put('/taches/:id', ctrl.ModifierTache)
router.patch('/taches/:id/statut', ctrl.ModifierStatutTache)
router.delete('/taches/:id', ctrl.SupprimerTache)

router.post('/taches/:id/sous-taches', ctrl.addSousTache)
router.put('/sous-taches/:id', ctrl.modifySousTache)
router.patch('/sous-taches/:id/statut', ctrl.modifyStatutSousTache)
router.delete('/sous-taches/:id', ctrl.DeleteSousTache)

export default router;