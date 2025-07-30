USE ComplaintDev;
GO

IF OBJECT_ID(N'dbo.sp_Mobile_CreatePlainte','P') IS NOT NULL
DROP PROCEDURE dbo.sp_Mobile_CreatePlainte;
GO

CREATE PROCEDURE dbo.sp_Mobile_CreatePlainte
    @PlaignantTypePersonne         CHAR(1),
    @PlaignantNom                  NVARCHAR(600),
    @PlaignantPrenom               NVARCHAR(600)  = NULL,
    @PlaignantCIN                  NVARCHAR(100)  = NULL,
    @PlaignantIdPays               INT,
    @PlaignantIdVille              INT,
    @PlaignantIdSituationResidence INT,
    @PlaignantIdProfession         INT,
    @PlaignantSexe                 CHAR(1)        = NULL,
    @PlaignantAdresse              NVARCHAR(1998) = NULL,
    @PlaignantTelephone            VARCHAR(30)    = NULL,
    @PlaignantEmail                NVARCHAR(200)  = NULL,
    @PlaignantNomCommercial        NVARCHAR(600)  = NULL,
    @PlaignantNumeroRC             NVARCHAR(100)  = NULL,
    @DefendeurTypePersonne         CHAR(1),
    @DefendeurNom                  NVARCHAR(600)  = NULL,
    @DefendeurNomCommercial        NVARCHAR(600)  = NULL,
    @IdObjetInjustice              INT,
    @IdJuridiction                 INT,
    @ResumePlainte                 NVARCHAR(MAX),
    @SessionId                     NVARCHAR(500)
AS
BEGIN
    SET NOCOUNT ON;
    IF @PlaignantTypePersonne NOT IN ('P','M')
       OR @DefendeurTypePersonne NOT IN ('P','M','I')
BEGIN
        RAISERROR(N'TypePersonne invalide',16,1);
        RETURN;
END

BEGIN TRY
BEGIN TRAN;

        DECLARE @IdPersPhysPlaignant BIGINT = NULL,
                @IdPersMorPlaignant  BIGINT = NULL,
                @IdPartiePlaignant   BIGINT;

        IF @PlaignantTypePersonne = 'P'
BEGIN
            INSERT dbo.PersonnePhysique
                (Nom,Prenom,CIN,IdPays,IdVille,IdSituationResidence,
                 IdProfession,Sexe,AdressePrimaire,SessionId)
            VALUES
                (@PlaignantNom,@PlaignantPrenom,@PlaignantCIN,
                 @PlaignantIdPays,@PlaignantIdVille,@PlaignantIdSituationResidence,
                 @PlaignantIdProfession,@PlaignantSexe,@PlaignantAdresse,@SessionId);

            SET @IdPersPhysPlaignant = SCOPE_IDENTITY();
END
ELSE
BEGIN
            INSERT dbo.PersonneMorale
                (NomCommercial,NumeroRC,IdJuridiction,SessionId)
            VALUES
                (@PlaignantNomCommercial,@PlaignantNumeroRC,@IdJuridiction,@SessionId);

            SET @IdPersMorPlaignant = SCOPE_IDENTITY();
END

        INSERT dbo.Partie
            (TypePersonne,Telephone,Email,
             IdPersonnePhysique,IdPersonneMorale,
             IsInconnu,SessionId)
        VALUES
            (@PlaignantTypePersonne,@PlaignantTelephone,@PlaignantEmail,
             @IdPersPhysPlaignant,@IdPersMorPlaignant,0,@SessionId);

        SET @IdPartiePlaignant = SCOPE_IDENTITY();


        DECLARE @IdPartieDefendeur   BIGINT,
                @IdPersPhysDefendeur BIGINT = NULL,
                @IdPersMorDefendeur  BIGINT = NULL;

        IF @DefendeurTypePersonne = 'I'
BEGIN
            INSERT dbo.Partie(TypePersonne,IsInconnu,SessionId)
            VALUES('I',1,@SessionId);

            SET @IdPartieDefendeur = SCOPE_IDENTITY();
END
ELSE IF @DefendeurTypePersonne = 'P'
BEGIN
            INSERT dbo.PersonnePhysique(Nom,SessionId)
            VALUES(@DefendeurNom,@SessionId);
            SET @IdPersPhysDefendeur = SCOPE_IDENTITY();

            INSERT dbo.Partie(TypePersonne,IdPersonnePhysique,IsInconnu,SessionId)
            VALUES('P',@IdPersPhysDefendeur,0,@SessionId);

            SET @IdPartieDefendeur = SCOPE_IDENTITY();
END
ELSE
BEGIN
            INSERT dbo.PersonneMorale(NomCommercial,IdJuridiction,SessionId)
            VALUES(@DefendeurNomCommercial,@IdJuridiction,@SessionId);
            SET @IdPersMorDefendeur = SCOPE_IDENTITY();

            INSERT dbo.Partie(TypePersonne,IdPersonneMorale,IsInconnu,SessionId)
            VALUES('M',@IdPersMorDefendeur,0,@SessionId);

            SET @IdPartieDefendeur = SCOPE_IDENTITY();
END


        DECLARE @TrackingCode CHAR(12) =
            LEFT(UPPER(REPLACE(CONVERT(NVARCHAR(36), NEWID()), '-', '')), 12);

        DECLARE @tmpPlainte TABLE(NewId BIGINT);

        INSERT dbo.plainte
            (DatePlainte,IdObjetInjustice,IdJuridiction,
             ResumePlainte,CodeSuivi,SessionId)
        OUTPUT inserted.Id INTO @tmpPlainte(NewId)
        VALUES
            (GETDATE(),@IdObjetInjustice,@IdJuridiction,
             @ResumePlainte,@TrackingCode,@SessionId);

        DECLARE @IdPlainte BIGINT = (SELECT TOP 1 NewId FROM @tmpPlainte);


        INSERT dbo.RolePartiePlainte(IdPartie,IdPlainte,IdRolePlainte)
        VALUES
            (@IdPartiePlaignant,@IdPlainte,1),
            (@IdPartieDefendeur,@IdPlainte,2);

COMMIT;


SELECT
    @IdPlainte   AS IdPlainte,
    @TrackingCode AS TrackingCode;
END TRY
BEGIN CATCH
IF @@TRANCOUNT > 0 ROLLBACK;
        THROW;
END CATCH
END
GO
