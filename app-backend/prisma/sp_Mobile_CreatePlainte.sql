CREATE OR ALTER PROCEDURE dbo.sp_Mobile_CreatePlainte
    /* ─── PLAIGNANT ─────────────────────────────────────────────────────── */
    @PlaignantTypePersonne          CHAR(1),
    @PlaignantNom                   NVARCHAR(600)       = NULL,
    @PlaignantPrenom                NVARCHAR(600)       = NULL,
    @PlaignantCIN                   NVARCHAR(100)       = NULL,
    @PlaignantIdPays                INT,
    @PlaignantIdVille               INT,
    @PlaignantIdSituationResidence  INT                 = NULL,
    @PlaignantIdProfession          INT                 = NULL,
    @PlaignantSexe                  CHAR(1)             = NULL,
    @PlaignantAdresse               NVARCHAR(1998)      = NULL, -- table limit 255
    @PlaignantTelephone             VARCHAR(30)         = NULL,
    @PlaignantEmail                 NVARCHAR(200)       = NULL,

    @PlaignantNomCommercial         NVARCHAR(600)       = NULL,  -- table limit 200
    @PlaignantNumeroRC              NVARCHAR(100)       = NULL,  -- table limit 50, NOT NULL
    @PlaignantSiegeSocial           NVARCHAR(1000)      = NULL,  -- table limit 200
    @PlaignantNomRepresentantLegal  NVARCHAR(600)       = NULL,  -- table limit 120

    /* ─── DÉFENDEUR ─────────────────────────────────────────────────────── */
    @DefendeurTypePersonne          CHAR(1),
    @DefendeurNom                   NVARCHAR(600)       = NULL,  -- table limit 100
    @DefendeurNomCommercial         NVARCHAR(600)       = NULL,  -- table limit 200
    @DefendeurNumeroRC              NVARCHAR(100)       = NULL,  -- table limit 50 (fallback)

    /* ─── PLAINTE ───────────────────────────────────────────────────────── */
    @IdObjetInjustice               INT,
    @IdJuridiction                  INT,
    @ResumePlainte                  NVARCHAR(MAX),

    /* ─── MISC ──────────────────────────────────────────────────────────── */
    @SessionId                      NVARCHAR(500)       = NULL
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

    /* Normalization/truncation to table limits ---------------------------- */
    DECLARE
      @PlaignantNomFinal                  NVARCHAR(100)  = LEFT(NULLIF(LTRIM(RTRIM(@PlaignantNom)),N''),100),
      @PlaignantPrenomFinal               NVARCHAR(100)  = LEFT(NULLIF(LTRIM(RTRIM(@PlaignantPrenom)),N''),100),
      @PlaignantCINFinal                  NVARCHAR(50)   = LEFT(COALESCE(NULLIF(LTRIM(RTRIM(@PlaignantCIN)),N''),N'-'),50),
      @AdressePlaignantFinal              NVARCHAR(255)  = LEFT(COALESCE(NULLIF(LTRIM(RTRIM(@PlaignantAdresse)),N''), N'-'), 255),
      @EmailPlaignantFinal                VARCHAR(200)   = CONVERT(VARCHAR(200), NULLIF(LTRIM(RTRIM(@PlaignantEmail)),N'')),

      @NomCommercialPlaignantFinal        NVARCHAR(200)  = LEFT(NULLIF(LTRIM(RTRIM(@PlaignantNomCommercial)),N''),200),
      @NumeroRCPlaignantFinal             NVARCHAR(50)   = LEFT(COALESCE(NULLIF(LTRIM(RTRIM(@PlaignantNumeroRC)),N''),N'N/A'),50),
      @SiegeSocialPlaignantFinal          NVARCHAR(200)  = LEFT(NULLIF(LTRIM(RTRIM(@PlaignantSiegeSocial)),N''),200),
      @NomRepLegalPlaignantFinal          NVARCHAR(120)  = LEFT(NULLIF(LTRIM(RTRIM(@PlaignantNomRepresentantLegal)),N''),120),

      @DefendeurNomFinal                  NVARCHAR(100)  = LEFT(NULLIF(LTRIM(RTRIM(@DefendeurNom)),N''),100),
      @DefendeurNomCommercialFinal        NVARCHAR(200)  = LEFT(NULLIF(LTRIM(RTRIM(@DefendeurNomCommercial)),N''),200),
      @DefendeurNumeroRCFinal             NVARCHAR(50)   = LEFT(COALESCE(NULLIF(LTRIM(RTRIM(@DefendeurNumeroRC)),N''),N'N/A'),50);

    /* Business rules (server-side validation) ----------------------------- */
    IF @PlaignantTypePersonne = 'M'
    BEGIN
        IF @NomCommercialPlaignantFinal IS NULL
        BEGIN RAISERROR(N'NomCommercial requis pour plaignant personne morale',16,1); RETURN; END
        IF @SiegeSocialPlaignantFinal IS NULL
        BEGIN RAISERROR(N'SiegeSocial requis pour plaignant personne morale',16,1); RETURN; END
        IF @NomRepLegalPlaignantFinal IS NULL
        BEGIN RAISERROR(N'Représentant légal requis pour plaignant personne morale',16,1); RETURN; END
    END

    IF @DefendeurTypePersonne = 'M'
    BEGIN
        IF @DefendeurNomCommercialFinal IS NULL
        BEGIN RAISERROR(N'NomCommercial requis pour défendeur personne morale',16,1); RETURN; END
        -- NumeroRC optional (fallback applied)
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
            VALUES (@PlaignantNomFinal, @PlaignantPrenomFinal, @PlaignantCINFinal,
                    @PlaignantIdPays, @PlaignantIdVille, @PlaignantIdSituationResidence,
                    @PlaignantIdProfession, @PlaignantSexe,
                    @AdressePlaignantFinal, @SessionId);

            SET @IdPersPhysPlaignant = SCOPE_IDENTITY();
        END
        ELSE
        BEGIN
            INSERT dbo.PersonneMorale
                   (NomCommercial, NumeroRC, IdJuridiction,
                    NomRepresentantLegal, EnseigneSociale, SessionId)
            VALUES (@NomCommercialPlaignantFinal, @NumeroRCPlaignantFinal, @IdJuridiction,
                    @NomRepLegalPlaignantFinal, @SiegeSocialPlaignantFinal, @SessionId);

            SET @IdPersMorPlaignant = SCOPE_IDENTITY();
        END

        INSERT dbo.Partie
               (TypePersonne, Telephone, Email,
                IdPersonnePhysique, IdPersonneMorale,
                IsInconnu, SessionId)
        VALUES (@PlaignantTypePersonne, @PlaignantTelephone, @EmailPlaignantFinal,
                @IdPersPhysPlaignant, @IdPersMorPlaignant,
                0, @SessionId);

        SET @IdPartiePlaignant = SCOPE_IDENTITY();


        /* =================================================================
           2) DÉFENDEUR
           ================================================================= */
        DECLARE @IdPartieDefendeur   BIGINT,
                @IdPersPhysDefendeur BIGINT = NULL,
                @IdPersMorDefendeur  BIGINT = NULL;

        IF @DefendeurTypePersonne = 'I'
        BEGIN
            INSERT dbo.Partie (TypePersonne, IsInconnu, SessionId)
            VALUES ('I', 1, @SessionId);

            SET @IdPartieDefendeur = SCOPE_IDENTITY();
        END
        ELSE IF @DefendeurTypePersonne = 'P'
        BEGIN
            INSERT dbo.PersonnePhysique
                   (Nom, Prenom, CIN,
                    IdPays, IdVille, IdSituationResidence,
                    IdProfession, Sexe, AdressePrimaire, SessionId)
            VALUES (@DefendeurNomFinal, N'-', N'-',
                    1, 1, 1,
                    NULL, NULL, N'-',
                    @SessionId);

            SET @IdPersPhysDefendeur = SCOPE_IDENTITY();

            INSERT dbo.Partie (TypePersonne, IdPersonnePhysique, IsInconnu, SessionId)
            VALUES ('P', @IdPersPhysDefendeur, 0, @SessionId);

            SET @IdPartieDefendeur = SCOPE_IDENTITY();
        END
        ELSE
        BEGIN
            INSERT dbo.PersonneMorale (NomCommercial, NumeroRC, IdJuridiction, SessionId)
            VALUES (@DefendeurNomCommercialFinal, @DefendeurNumeroRCFinal, @IdJuridiction, @SessionId);

            SET @IdPersMorDefendeur = SCOPE_IDENTITY();

            INSERT dbo.Partie (TypePersonne, IdPersonneMorale, IsInconnu, SessionId)
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

        SELECT complaintId = @IdPlainte,
               trackingCode = @TrackingCode;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK;
        THROW;
    END CATCH
END
GO
