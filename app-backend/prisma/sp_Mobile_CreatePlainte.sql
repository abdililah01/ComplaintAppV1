-- Fichier: /app-backend/prisma/sp_Mobile_CreatePlainte.sql
-- Description: Crée une plainte complète à partir des données soumises par l'application mobile.
--              Toute la logique est encapsulée dans une transaction pour garantir l'atomicité.

-- Contexte: Base de données applicative
USE ComplaintDev;
GO

-- Crée la procédure si elle n'existe pas, pour rendre le script ré-exécutable (idempotent)
IF OBJECT_ID('dbo.sp_Mobile_CreatePlainte', 'P') IS NULL
BEGIN
EXEC('CREATE PROCEDURE dbo.sp_Mobile_CreatePlainte AS BEGIN SET NOCOUNT ON; END');
END
GO

-- Modifie la procédure pour définir sa logique complète
ALTER PROCEDURE dbo.sp_Mobile_CreatePlainte
    -- =================================================================
    -- Paramètres d'entrée (toutes les données validées envoyées par l'API)
    -- =================================================================

    -- Infos du Plaignant (type PersonnePhysique ou PersonneMorale)
    @PlaignantTypePersonne CHAR(1), -- 'P' pour Physique, 'M' pour Morale
    @PlaignantNom NVARCHAR(600),
    @PlaignantPrenom NVARCHAR(600) = NULL,
    @PlaignantCIN NVARCHAR(100) = NULL,
    @PlaignantIdPays INT,
    @PlaignantIdVille INT,
    @PlaignantIdSituationResidence INT,
    @PlaignantIdProfession INT,
    @PlaignantSexe CHAR(1) = NULL,
    @PlaignantAdresse NVARCHAR(1998),
    @PlaignantTelephone VARCHAR(30),
    @PlaignantEmail VARCHAR(200),
    @PlaignantNomCommercial NVARCHAR(600) = NULL,
    @PlaignantNumeroRC NVARCHAR(100) = NULL,

    -- Infos du Défendeur (type PersonnePhysique, PersonneMorale ou Inconnue)
    @DefendeurTypePersonne CHAR(1), -- 'P', 'M', ou 'I' pour Inconnue
    @DefendeurNom NVARCHAR(600) = NULL,
    @DefendeurNomCommercial NVARCHAR(600) = NULL,

    -- Infos de la Plainte
    @ResumePlainte NVARCHAR(MAX),
    @SessionId NVARCHAR(500)
    AS
BEGIN
    -- Empêche le renvoi des messages "X rows affected" pour ne pas perturber l'API
    SET NOCOUNT ON;

    -- Déclare les variables pour stocker les IDs générés au cours de la transaction
    DECLARE @IdPersonnePhysiquePlaignant BIGINT = NULL;
    DECLARE @IdPersonneMoralePlaignant BIGINT = NULL;
    DECLARE @IdPartiePlaignant BIGINT;

    DECLARE @IdPersonnePhysiqueDefendeur BIGINT = NULL;
    DECLARE @IdPersonneMoraleDefendeur BIGINT = NULL;
    DECLARE @IdPartieDefendeur BIGINT;

    DECLARE @IdPlainte BIGINT;
    DECLARE @TrackingCode NVARCHAR(100);

    -- Enveloppe toute la logique dans une transaction. Si une erreur se produit, tout est annulé.
BEGIN TRY
BEGIN TRANSACTION;

        -- =================================================================
        -- ÉTAPE 1: Créer le Plaignant
        -- =================================================================
        IF @PlaignantTypePersonne = 'P'
BEGIN
INSERT INTO dbo.PersonnePhysique (Nom, Prenom, CIN, IdPays, IdVille, IdSituationResidence, IdProfession, Sexe, AdressePrimaire, SessionId)
VALUES (@PlaignantNom, @PlaignantPrenom, @PlaignantCIN, @PlaignantIdPays, @PlaignantIdVille, @PlaignantIdSituationResidence, @PlaignantIdProfession, @PlaignantSexe, @PlaignantAdresse, @SessionId);
SET @IdPersonnePhysiquePlaignant = SCOPE_IDENTITY();
END
ELSE IF @PlaignantTypePersonne = 'M'
BEGIN
INSERT INTO dbo.PersonneMorale (NomCommercial, NumeroRC, SessionId)
VALUES (@PlaignantNomCommercial, @PlaignantNumeroRC, @SessionId);
SET @IdPersonneMoralePlaignant = SCOPE_IDENTITY();
END

INSERT INTO dbo.Partie (TypePersonne, IdPersonnePhysique, IdPersonneMorale, Telephone, Email, IsInconnu, SessionId)
VALUES (@PlaignantTypePersonne, @IdPersonnePhysiquePlaignant, @IdPersonneMoralePlaignant, @PlaignantTelephone, @PlaignantEmail, 0, @SessionId);
SET @IdPartiePlaignant = SCOPE_IDENTITY();

        -- =================================================================
        -- ÉTAPE 2: Créer le Défendeur
        -- =================================================================
        IF @DefendeurTypePersonne = 'I'
BEGIN
INSERT INTO dbo.Partie (TypePersonne, IsInconnu, SessionId) VALUES ('I', 1, @SessionId);
SET @IdPartieDefendeur = SCOPE_IDENTITY();
END
ELSE
BEGIN
            -- Pour l'instant, nous ne créons qu'une "Partie" simple pour le défendeur connu,
            -- sans créer l'entité PersonnePhysique/Morale complète.
            -- C'est un choix de conception qui peut être étendu plus tard.
            IF @DefendeurTypePersonne = 'P'
BEGIN
                -- On pourrait insérer dans PersonnePhysique ici si nécessaire
INSERT INTO dbo.Partie (TypePersonne, IsInconnu, SessionId) VALUES ('P', 0, @SessionId);
SET @IdPartieDefendeur = SCOPE_IDENTITY();
END
ELSE IF @DefendeurTypePersonne = 'M'
BEGIN
                -- On pourrait insérer dans PersonneMorale ici si nécessaire
INSERT INTO dbo.Partie (TypePersonne, IsInconnu, SessionId) VALUES ('M', 0, @SessionId);
SET @IdPartieDefendeur = SCOPE_IDENTITY();
END
END

        -- =================================================================
        -- ÉTAPE 3: Créer la Plainte
        -- =================================================================
        -- Générer un code de suivi unique et lisible
        SET @TrackingCode = UPPER(SUBSTRING(REPLACE(NEWID(), '-', ''), 1, 12));

        -- Insère la plainte avec les valeurs par défaut pour IdObjetInjustice et IdJuridiction
        -- comme spécifié dans la documentation.
INSERT INTO dbo.plainte (DatePlainte, IdObjetInjustice, IdJuridiction, ResumePlainte, CodeSuivi, SessionId)
VALUES (
           GETDATE(),
           99, -- Règle Métier: ID pour "Non spécifié"
           1,  -- Règle Métier: ID pour "Plate-forme Dépôt Mobile"
           @ResumePlainte,
           @TrackingCode,
           @SessionId
       );
SET @IdPlainte = SCOPE_IDENTITY();

        -- =================================================================
        -- ÉTAPE 4: Lier les Rôles
        -- =================================================================
        -- Lier les parties à la plainte avec leurs rôles (supposons IdRolePlainte 1=Plaignant, 2=Défendeur)
INSERT INTO dbo.RolePartiePlainte (IdPartie, IdPlainte, IdRolePlainte)
VALUES (@IdPartiePlaignant, @IdPlainte, 1);

INSERT INTO dbo.RolePartiePlainte (IdPartie, IdPlainte, IdRolePlainte)
VALUES (@IdPartieDefendeur, @IdPlainte, 2);

-- Valide la transaction si toutes les étapes ont réussi
COMMIT TRANSACTION;

-- =================================================================
-- ÉTAPE 5: Renvoyer le Résultat
-- =================================================================
-- Renvoie l'ID de la plainte et le code de suivi à l'API pour qu'elle puisse les retourner au client.
SELECT
    @IdPlainte AS IdPlainte,
    @TrackingCode AS TrackingCode;

END TRY
BEGIN CATCH
        -- En cas d'erreur à n'importe quelle étape, annule toutes les opérations
IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        -- Propage l'erreur pour que l'API puisse la recevoir et la logger
        THROW;
END CATCH;
END;
GO

PRINT 'Procédure sp_Mobile_CreatePlainte créée/mise à jour avec succès.';
GO