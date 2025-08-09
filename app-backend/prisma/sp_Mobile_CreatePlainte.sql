-- file: database/sp_Mobile_CreatePlainte.sql
USE ComplaintDev;
GO

IF OBJECT_ID(N'dbo.sp_Mobile_CreatePlainte','P') IS NOT NULL
    DROP PROCEDURE dbo.sp_Mobile_CreatePlainte;
GO

/* ==========================================================================
   Create one plainte, its plaignant & défendeur, and return Id + code suivi
   ======================================================================== */
CREATE PROCEDURE dbo.sp_Mobile_CreatePlainte
    /* ─── PLAIGNANT ─────────────────────────────────────────────────────── */
    @PlaignantTypePersonne          CHAR(1),
    @PlaignantNom                   NVARCHAR(600),
    @PlaignantPrenom                NVARCHAR(600)   = NULL,
    @PlaignantCIN                   NVARCHAR(100)   = NULL,
    @PlaignantIdPays                INT,
    @PlaignantIdVille               INT,
    @PlaignantIdSituationResidence  INT,
    @PlaignantIdProfession          INT,
    @PlaignantSexe                  CHAR(1)         = NULL,
    @PlaignantAdresse               NVARCHAR(1998)  = NULL,
    @PlaignantTelephone             VARCHAR(30)     = NULL,
    @PlaignantEmail                 NVARCHAR(200)   = NULL,

    @PlaignantNomCommercial         NVARCHAR(600)   = NULL,  -- required when 'M'
    @PlaignantNumeroRC              NVARCHAR(100)   = NULL,  -- optional
    @PlaignantSiegeSocial           NVARCHAR(1000)  = NULL,  -- REQUIRED when 'M' (mapped to PersonneMorale.EnseigneSociale)
    @PlaignantNomRepresentantLegal  NVARCHAR(600)   = NULL,  -- REQUIRED when 'M'

    /* ─── DÉFENDEUR ─────────────────────────────────────────────────────── */
    @DefendeurTypePersonne          CHAR(1),
    @DefendeurNom                   NVARCHAR(600)   = NULL,
    @DefendeurNomCommercial         NVARCHAR(600)   = NULL,  -- required when 'M'
    @DefendeurNumeroRC              NVARCHAR(100)   = NULL,  -- optional

    /* ─── PLAINTE ───────────────────────────────────────────────────────── */
    @IdObjetInjustice               INT,
    @IdJuridiction                  INT,
    @ResumePlainte                  NVARCHAR(MAX),

    /* ─── MISC ──────────────────────────────────────────────────────────── */
    @SessionId                      NVARCHAR(500)
AS
BEGIN
    SET NOCOUNT ON;

    /* Enum sanity-checks -------------------------------------------------- */
    IF  @PlaignantTypePersonne NOT IN ('P','M')
     OR @DefendeurTypePersonne NOT IN ('P','M','I')
    BEGIN
        RAISERROR(N'TypePersonne invalide',16,1);
        RETURN;
    END

    /* Business rules (server-side validation) ----------------------------- */
    IF @PlaignantTypePersonne = 'M'
    BEGIN
        IF NULLIF(LTRIM(RTRIM(@PlaignantNomCommercial)), N'') IS NULL
        BEGIN
            RAISERROR(N'NomCommercial (التسمية) requis pour le plaignant personne morale',16,1);
            RETURN;
        END
        IF NULLIF(LTRIM(RTRIM(@PlaignantSiegeSocial)), N'') IS NULL
        BEGIN
            RAISERROR(N'SiegeSocial (المقر الإجتماعي) requis pour le plaignant personne morale',16,1);
            RETURN;
        END
        IF NULLIF(LTRIM(RTRIM(@PlaignantNomRepresentantLegal)), N'') IS NULL
        BEGIN
            RAISERROR(N'Nom du représentant légal (الممثل القانوني) requis pour le plaignant personne morale',16,1);
            RETURN;
        END
    END

    IF @DefendeurTypePersonne = 'M'
    BEGIN
        IF NULLIF(LTRIM(RTRIM(@DefendeurNomCommercial)), N'') IS NULL
        BEGIN
            RAISERROR(N'NomCommercial (التسمية) requis pour le défendeur personne morale',16,1);
            RETURN;
        END
        -- NumeroRC optional by business rule
    END

    BEGIN TRY
        BEGIN TRAN;

        /* =================================================================
           1) PLAIGNANT
           ================================================================= */
        DECLARE @IdPersPhysPlaignant BIGINT = NULL,
                @IdPersMorPlaignant  BIGINT = NULL,
                @IdPartiePlaignant   BIGINT;

        IF @PlaignantTypePersonne = 'P'
        BEGIN
            INSERT dbo.PersonnePhysique
                   (Nom, Prenom, CIN,
                    IdPays, IdVille, IdSituationResidence,
                    IdProfession, Sexe, AdressePrimaire, SessionId)
            VALUES (@PlaignantNom, @PlaignantPrenom, @PlaignantCIN,
                    @PlaignantIdPays, @PlaignantIdVille, @PlaignantIdSituationResidence,
                    @PlaignantIdProfession, @PlaignantSexe,
                    @PlaignantAdresse, @SessionId);

            SET @IdPersPhysPlaignant = SCOPE_IDENTITY();
        END
        ELSE
        BEGIN
            /* NumeroRC is NOT NULL in table -> fallback to safe value when missing */
            DECLARE @PlaignantNumeroRCFinal NVARCHAR(100) =
                COALESCE(NULLIF(LTRIM(RTRIM(@PlaignantNumeroRC)),N''), N'N/A');

            INSERT dbo.PersonneMorale
                   (NomCommercial, NumeroRC, IdJuridiction,
                    NomRepresentantLegal, EnseigneSociale, SessionId)
            VALUES (@PlaignantNomCommercial, @PlaignantNumeroRCFinal, @IdJuridiction,
                    @PlaignantNomRepresentantLegal, @PlaignantSiegeSocial, @SessionId);

            SET @IdPersMorPlaignant = SCOPE_IDENTITY();
        END

        INSERT dbo.Partie
               (TypePersonne, Telephone, Email,
                IdPersonnePhysique, IdPersonneMorale,
                IsInconnu, SessionId)
        VALUES (@PlaignantTypePersonne, @PlaignantTelephone, @PlaignantEmail,
                @IdPersPhysPlaignant, @IdPersMorPlaignant,
                0, @SessionId);

        SET @IdPartiePlaignant = SCOPE_IDENTITY();


        /* =================================================================
           2) DÉFENDEUR
           ================================================================= */
        DECLARE @IdPartieDefendeur   BIGINT,
                @IdPersPhysDefendeur BIGINT = NULL,
                @IdPersMorDefendeur  BIGINT = NULL;

        /* I = inconnu ------------------------------------------------------ */
        IF @DefendeurTypePersonne = 'I'
        BEGIN
            INSERT dbo.Partie (TypePersonne, IsInconnu, SessionId)
            VALUES ('I', 1, @SessionId);

            SET @IdPartieDefendeur = SCOPE_IDENTITY();
        END

        /* P = personne physique (fallbacks for NOT NULL cols) -------------- */
        ELSE IF @DefendeurTypePersonne = 'P'
        BEGIN
            INSERT dbo.PersonnePhysique
                   (Nom, Prenom, CIN,
                    IdPays, IdVille, IdSituationResidence,
                    IdProfession, Sexe, AdressePrimaire, SessionId)
            VALUES (@DefendeurNom, N'-', N'-',        -- placeholders
                    1, 1, 1,
                    NULL, NULL, N'-',
                    @SessionId);

            SET @IdPersPhysDefendeur = SCOPE_IDENTITY();

            INSERT dbo.Partie (TypePersonne,
                               IdPersonnePhysique,
                               IsInconnu,
                               SessionId)
            VALUES ('P', @IdPersPhysDefendeur, 0, @SessionId);

            SET @IdPartieDefendeur = SCOPE_IDENTITY();
        END

        /* M = personne morale (NomCommercial required; RC optional) -------- */
        ELSE
        BEGIN
            DECLARE @DefendeurNumeroRCFinal NVARCHAR(100) =
                COALESCE(NULLIF(LTRIM(RTRIM(@DefendeurNumeroRC)),N''), N'N/A');

            INSERT dbo.PersonneMorale
                   (NomCommercial, NumeroRC, IdJuridiction, SessionId)
            VALUES (@DefendeurNomCommercial, @DefendeurNumeroRCFinal, @IdJuridiction, @SessionId);

            SET @IdPersMorDefendeur = SCOPE_IDENTITY();

            INSERT dbo.Partie (TypePersonne,
                               IdPersonneMorale,
                               IsInconnu,
                               SessionId)
            VALUES ('M', @IdPersMorDefendeur, 0, @SessionId);

            SET @IdPartieDefendeur = SCOPE_IDENTITY();
        END


        /* =================================================================
           3) PLAINTE + Roles
           ================================================================= */
        DECLARE @TrackingCode CHAR(12) =
            LEFT(UPPER(REPLACE(CONVERT(NVARCHAR(36),NEWID()),'-','')),12);

        DECLARE @IdPlainte BIGINT;

        INSERT dbo.plainte
               (DatePlainte, IdObjetInjustice, IdJuridiction,
                ResumePlainte, CodeSuivi, SessionId)
        VALUES (GETDATE(), @IdObjetInjustice, @IdJuridiction,
                @ResumePlainte, @TrackingCode, @SessionId);

        SET @IdPlainte = SCOPE_IDENTITY();

        INSERT dbo.RolePartiePlainte (IdPartie, IdPlainte, IdRolePlainte)
        VALUES (@IdPartiePlaignant, @IdPlainte, 1),  -- 1 = plaignant
               (@IdPartieDefendeur, @IdPlainte, 2);  -- 2 = défendeur

        COMMIT;

        /* =================================================================
           4)  Return output
           ================================================================= */
        SELECT @IdPlainte AS IdPlainte,
               @TrackingCode AS TrackingCode;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK;
        THROW;
    END CATCH
END
GO
