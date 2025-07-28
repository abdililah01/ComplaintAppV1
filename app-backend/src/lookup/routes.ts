// Fichier: /app-backend/src/lookup/routes.ts (Logique métier pour les villes ajoutée)

import { Router, Request, Response } from 'express';
import prisma from '../common/prisma';

const router = Router();

interface LookupItem {
  id: number;
  label: string;
}

/**
 * Helper function pour gérer la logique de langue et de formatage du nom.
 */
const getLabel = (lang: string, nom: string, nomFr: string | null | undefined): string => {
  if (!nom.includes(' -- ')) {
    return nomFr || nom;
  }
  const [latinName, arabicName] = nom.split(' -- ');
  return lang === 'ar' ? (arabicName || latinName) : (nomFr || latinName);
};

// --- ROUTES ---

// 1. GET /pays
router.get('/pays', async (req: Request, res: Response) => {
  const lang = req.query.lang === 'ar' ? 'ar' : 'lat';
  try {
    const pays = await prisma.pays.findMany({ orderBy: { Nom: 'asc' } });
    const data: LookupItem[] = pays.map(p => ({
      id: p.Id,
      label: getLabel(lang, p.Nom, p.Nom_Fr),
    }));
    res.set('Cache-Control', 'public, max-age=86400').json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve countries' });
  }
});

// 2. GET /villes (LOGIQUE MÉTIER MISE À JOUR)
router.get('/villes', async (req: Request, res: Response) => {
  const lang = req.query.lang === 'ar' ? 'ar' : 'lat';
  const idPays = parseInt(req.query.idPays as string, 10);

  if (isNaN(idPays)) {
    return res.status(400).json({ error: 'idPays parameter is required and must be a number.' });
  }

  try {
    // CORRECTION: Logique métier spécifique au Maroc (ID = 1)
    if (idPays !== 1) {
      // Pour tout pays autre que le Maroc, on renvoie une liste spéciale
      const notAvailableLabel = getLabel(lang, 'UNKNOWN -- المدن غير متوفرة', 'Villes non disponibles');
      return res.json([{ id: 0, label: notAvailableLabel }]);
    }

    // Si c'est le Maroc, on continue normalement
    const villes = await prisma.ville.findMany({
      where: { IdPays: idPays },
      orderBy: { Nom: 'asc' },
    });
    const data: LookupItem[] = villes.map(v => ({
      id: v.Id,
      label: getLabel(lang, v.Nom, v.Nom_Fr),
    }));
    res.set('Cache-Control', 'public, max-age=3600').json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve cities' });
  }
});

// 3. GET /juridictions
router.get('/juridictions', async (req: Request, res: Response) => {
  try {
    const juridictions = await prisma.juridiction.findMany({
      where: { Affichable: true },
      orderBy: { Nom: 'asc' },
    });
    const data: LookupItem[] = juridictions.map(j => ({
      id: j.Id,
      label: j.Nom,
    }));
    res.set('Cache-Control', 'public, max-age=86400').json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve jurisdictions' });
  }
});

// 4. GET /objets
router.get('/objets', async (req: Request, res: Response) => {
  try {
    const objets = await prisma.objetInjustice.findMany({
      orderBy: { Libelle: 'asc' },
    });
    const data: LookupItem[] = objets.map(o => ({
      id: o.IdObjetInjustice,
      label: o.Libelle,
    }));
    res.set('Cache-Control', 'public, max-age=86400').json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve complaint objects' });
  }
});

// 5. GET /professions
router.get('/professions', async (req: Request, res: Response) => {
  try {
    const professions = await prisma.profession.findMany({
      orderBy: { Libelle: 'asc' },
    });
    const data: LookupItem[] = professions.map(p => ({
      id: p.Id,
      label: p.Libelle,
    }));
    res.set('Cache-Control', 'public, max-age=86400').json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve professions' });
  }
});

// 6. GET /situations-residence
router.get('/situations-residence', async (req: Request, res: Response) => {
  try {
    const situations = await prisma.situationResidence.findMany({
      orderBy: { Libelle: 'asc' },
    });
    const data: LookupItem[] = situations.map(s => ({
      id: s.Id,
      label: s.Libelle,
    }));
    res.set('Cache-Control', 'public, max-age=86400').json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve residence situations' });
  }
});

export default router;