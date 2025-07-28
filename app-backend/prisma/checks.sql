-- Fichier: /prisma/checks.sql
-- Ce script ajoute des contraintes complexes que Prisma ne peut pas définir nativement.

-- Assure l'intégrité de la relation polymorphe dans la table Partie.
-- NOTE: Les valeurs 'P', 'M', 'I' correspondent à 'Physique', 'Morale', 'Inconnue'
-- Assure que nous sommes bien dans la bonne base de données
USE ComplaintDev;
GO

-- Ajoute la contrainte si elle n'existe pas
IF NOT EXISTS (
  SELECT 1 FROM sys.check_constraints
  WHERE name = 'CK_Partie_Polymorph'
)
BEGIN
ALTER TABLE dbo.Partie ADD CONSTRAINT CK_Partie_Polymorph
    CHECK (
        (TypePersonne = 'P' AND IdPersonnePhysique IS NOT NULL AND IdPersonneMorale IS NULL) OR
        (TypePersonne = 'M' AND IdPersonneMorale   IS NOT NULL AND IdPersonnePhysique IS NULL) OR
        (TypePersonne = 'I' AND IdPersonnePhysique IS NULL AND IdPersonneMorale IS NULL)
        );
PRINT 'Contrainte CK_Partie_Polymorph créée.';
END
GO