// Fichier: /app-backend/src/lookup/routes.ts

import { Router, Request, Response } from 'express';
import prisma from '../common/prisma'; // Notre client Prisma singleton

const router = Router();

// Interface commune pour toutes les réponses de lookup
interface LookupItem {
  id: number;
  label: string;
}

/**
 * Helper function pour parser la langue et le nom
 */
const getLabel = (lang: string, nom: string, nomFr: string | null): string => {
  const [latinName, arabicName] = nom.split(' -- ');
  return lang === 'ar' ? (arabicName || latinName) : (nomFr || latinName);
};

// --- ROUTES ---

// 1. GET /pays
router.get('/pays', async (req: Request, res: Response) => {
  const lang = req.query.lang === 'ar' ? 'ar' : 'lat';
  
  try {
    const pays = await prisma.pays.findMany({
      orderBy: { Nom: 'asc' },
    });
    const data: LookupItem[] = pays.map(p => ({
      id: p.Id,
      label: getLabel(lang, p.Nom, p.Nom_Fr),
    }));
    res.set('Cache-Control', 'public, max-age=86400').json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve countries' });
  }
});

// 2. GET /villes
router.get('/villes', async (req: Request, res: Response) => {
  const lang = req.query.lang === 'ar' ? 'ar' : 'lat';
  const idPays = parseInt(req.query.idPays as string, 10);

  if (isNaN(idPays)) {
    return res.status(400).json({ error: 'idPays parameter is required and must be a number.' });
  }

  try {
    const villes = await prisma.ville.findMany({
      where: { IdPays: idPays },
      orderBy: { Nom: 'asc' },
    });
    const data: LookupItem[] = villes.map(v => ({
      id: v.Id,
      label: getLabel(lang, v.Nom, v.Nom_Fr),
    }));
    res.set('Cache-Control', 'public, max-age=3600').json(data); // Cache plus court car peut changer
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve cities' });
  }
});

// 3. GET /juridictions
router.get('/juridictions', async (req: Request, res: Response) => {
  // Le champ 'Nom' pour Juridiction ne semble pas avoir de format bilingue.
  // Nous retournons donc directement le nom.
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