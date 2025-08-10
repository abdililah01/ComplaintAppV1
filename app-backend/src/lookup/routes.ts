import { Router, Request, Response } from 'express';
import prisma from '../common/prisma';

const router = Router();

/* Shared DTO ------------------------------------------------------------- */
interface LookupItem {
  id: number | string;           // string for /sexe, number for the rest
  label: string;
}

/* Helper : pick Arabic vs. Latin half ----------------------------------- */
function getLabel(lang: 'ar' | 'lat', nom: string, nomFr?: string | null): string {
  if (!nom.includes(' -- ')) return nomFr ?? nom;
  const [latinName, arabicName] = nom.split(' -- ');
  return lang === 'ar' ? arabicName || latinName : nomFr || latinName;
}

/* ───────────── Pays ───────────────────────────────────────────────────── */
router.get('/pays', async (req: Request, res: Response) => {
  const lang: 'ar' | 'lat' = req.query.lang === 'ar' ? 'ar' : 'lat';

  try {
    const pays = await prisma.pays.findMany({ orderBy: { Nom: 'asc' } });
    const data: LookupItem[] = pays.map(p => ({
      id: p.Id,
      label: getLabel(lang, p.Nom, p.Nom_Fr),
    }));
    res.set('Cache-Control', 'public, max-age=86400').json(data);
  } catch {
    res.status(500).json({ error: 'Failed to retrieve countries' });
  }
});

/* ───────────── Villes ─────────────────────────────────────────────────── */
router.get('/villes', async (req, res) => {
  const lang: 'ar' | 'lat' = req.query.lang === 'ar' ? 'ar' : 'lat';
  const idPays = Number.parseInt(req.query.idPays as string, 10);

  if (Number.isNaN(idPays)) {
    res.status(400).json({ error: 'idPays parameter is required and must be a number.' });
    return;
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
    res.set('Cache-Control', 'public, max-age=3600').json(data);
  } catch {
    res.status(500).json({ error: 'Failed to retrieve cities' });
  }
});

/* ───────────── Juridictions ───────────────────────────────────────────── */
router.get('/juridictions', async (_req, res) => {
  try {
    const juris = await prisma.juridiction.findMany({
      where: { Affichable: true },
      orderBy: { Nom: 'asc' },
    });
    const data: LookupItem[] = juris.map(j => ({ id: j.Id, label: j.Nom }));
    res.set('Cache-Control', 'public, max-age=86400').json(data);
  } catch {
    res.status(500).json({ error: 'Failed to retrieve jurisdictions' });
  }
});

/* ───────────── Objets d’injustice ─────────────────────────────────────── */
router.get('/objets', async (_req, res) => {
  try {
    const objets = await prisma.objetInjustice.findMany({ orderBy: { Libelle: 'asc' } });
    const data: LookupItem[] = objets.map(o => ({ id: o.IdObjetInjustice, label: o.Libelle }));
    res.set('Cache-Control', 'public, max-age=86400').json(data);
  } catch {
    res.status(500).json({ error: 'Failed to retrieve complaint objects' });
  }
});

/* ───────────── Professions ────────────────────────────────────────────── */
router.get('/professions', async (_req, res) => {
  try {
    const profs = await prisma.profession.findMany({ orderBy: { Libelle: 'asc' } });
    const data: LookupItem[] = profs.map(p => ({ id: p.Id, label: p.Libelle }));
    res.set('Cache-Control', 'public, max-age=86400').json(data);
  } catch {
    res.status(500).json({ error: 'Failed to retrieve professions' });
  }
});

/* ───────────── Situations de résidence ───────────────────────────────── */
router.get('/situations-residence', async (_req, res) => {
  try {
    const situations = await prisma.situationResidence.findMany({ orderBy: { Libelle: 'asc' } });
    const data: LookupItem[] = situations.map(s => ({ id: s.Id, label: s.Libelle }));
    res.set('Cache-Control', 'public, max-age=86400').json(data);
  } catch {
    res.status(500).json({ error: 'Failed to retrieve residence situations' });
  }
});

/* ───────────── Sexe (static) ──────────────────────────────────────────── */
router.get('/sexe', (_req, res) => {
  const data: LookupItem[] = [
    { id: 'M', label: 'ذكر' },
    { id: 'F', label: 'أنثى' },
  ];
  /* long-term immutable cache – this list never changes */
  res.set('Cache-Control', 'public, max-age=31536000, immutable').json(data);
});

export default router;
