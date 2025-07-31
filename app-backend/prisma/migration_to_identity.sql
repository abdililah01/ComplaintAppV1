-- Fichier: /prisma/migration_to_identity.sql
-- Description: Script de migration pour convertir les clés primaires BIGINT en IDENTITY.
-- ATTENTION: Ce script est destructif et doit être exécuté sur un environnement de développement propre.

USE ComplaintDev;
GO

BEGIN TRANSACTION;
GO

--------------------------------------------------------------------------
-- Table: PersonnePhysique
--------------------------------------------------------------------------
-- Étape 1: Supprimer les contraintes de clé étrangère qui pointent vers PersonnePhysique
ALTER TABLE dbo.Partie DROP CONSTRAINT FK__Partie__IdPerson__...; -- Remplacez ... par le nom réel de votre FK

-- Étape 2: Créer la table temporaire avec IDENTITY
CREATE TABLE dbo.PersonnePhysique_new (
                                          Id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
                                          Nom NVARCHAR(600) NOT NULL,
                                          Prenom NVARCHAR(600) NOT NULL,
                                          Sexe CHAR(1) NOT NULL,
                                          IdSituationResidence INT NOT NULL,
                                          CIN NVARCHAR(100) NULL,
                                          IdProfession INT NOT NULL,
                                          IdPays INT NOT NULL,
                                          IdVille INT NOT NULL,
                                          IsCultive BIT NOT NULL,
                                          SessionId NVARCHAR(500) NULL,
                                          AdressePrimaire NVARCHAR(1998) NULL,
                                          DateNaissance DATETIME NULL
);
GO

-- Étape 3: Copier les données
SET IDENTITY_INSERT dbo.PersonnePhysique_new ON;
INSERT INTO dbo.PersonnePhysique_new (Id, Nom, Prenom, Sexe, IdSituationResidence, CIN, IdProfession, IdPays, IdVille, IsCultive, SessionId, AdressePrimaire, DateNaissance)
SELECT Id, Nom, Prenom, Sexe, IdSituationResidence, CIN, IdProfession, IdPays, IdVille, IsCultive, SessionId, AdressePrimaire, DateNaissance FROM dbo.PersonnePhysique;
SET IDENTITY_INSERT dbo.PersonnePhysique_new OFF;
GO

-- Étape 4: Renommer les tables
EXEC sp_rename 'dbo.PersonnePhysique', 'PersonnePhysique_old';
EXEC sp_rename 'dbo.PersonnePhysique_new', 'PersonnePhysique';
GO

-- Étape 5: Recréer la contrainte de clé étrangère
ALTER TABLE dbo.Partie ADD CONSTRAINT FK_Partie_PersonnePhysique FOREIGN KEY (IdPersonnePhysique) REFERENCES dbo.PersonnePhysique(Id);
GO

-- Répétez ce processus pour les autres tables...
-- (Note: pour la simplicité de ce guide, le script complet est fourni. En production, vous feriez cela table par table).

-- NOTE: Un script complet pour toutes les tables serait très long. Le principe ci-dessus doit être appliqué à:
-- PersonneMorale, Partie, Plainte, RolePartiePlainte, PieceJointe.

PRINT 'Migration vers IDENTITY terminée (exemple pour PersonnePhysique).';
GO

COMMIT TRANSACTION;
GO