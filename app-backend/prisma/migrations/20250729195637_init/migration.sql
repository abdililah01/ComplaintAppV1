BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Pays] (
    [Id] INT NOT NULL IDENTITY(1,1),
    [Nom] NVARCHAR(100) NOT NULL,
    [Code] NVARCHAR(5) NOT NULL,
    [Nom_Fr] NVARCHAR(100),
    [Nationalite] NVARCHAR(60),
    CONSTRAINT [Pays_pkey] PRIMARY KEY CLUSTERED ([Id])
);

-- CreateTable
CREATE TABLE [dbo].[Ville] (
    [Id] INT NOT NULL IDENTITY(1,1),
    [Nom] NVARCHAR(120) NOT NULL,
    [IdPays] INT NOT NULL,
    [CodePostal] NVARCHAR(10),
    [Nom_Fr] NVARCHAR(120),
    CONSTRAINT [Ville_pkey] PRIMARY KEY CLUSTERED ([Id])
);

-- CreateTable
CREATE TABLE [dbo].[SituationResidence] (
    [Id] INT NOT NULL IDENTITY(1,1),
    [Libelle] NVARCHAR(60) NOT NULL,
    CONSTRAINT [SituationResidence_pkey] PRIMARY KEY CLUSTERED ([Id])
);

-- CreateTable
CREATE TABLE [dbo].[Profession] (
    [Id] INT NOT NULL IDENTITY(1,1),
    [Libelle] NVARCHAR(120) NOT NULL,
    CONSTRAINT [Profession_pkey] PRIMARY KEY CLUSTERED ([Id])
);

-- CreateTable
CREATE TABLE [dbo].[Juridiction] (
    [Id] INT NOT NULL IDENTITY(1,1),
    [Nom] NVARCHAR(200) NOT NULL,
    [Affichable] BIT NOT NULL CONSTRAINT [Juridiction_Affichable_df] DEFAULT 1,
    CONSTRAINT [Juridiction_pkey] PRIMARY KEY CLUSTERED ([Id])
);

-- CreateTable
CREATE TABLE [dbo].[ObjetInjustice] (
    [IdObjetInjustice] INT NOT NULL IDENTITY(1,1),
    [Libelle] NVARCHAR(120) NOT NULL,
    CONSTRAINT [ObjetInjustice_pkey] PRIMARY KEY CLUSTERED ([IdObjetInjustice])
);

-- CreateTable
CREATE TABLE [dbo].[PersonnePhysique] (
    [Id] INT NOT NULL IDENTITY(1,1),
    [Nom] NVARCHAR(100) NOT NULL,
    [Prenom] NVARCHAR(100) NOT NULL,
    [CIN] NVARCHAR(50) NOT NULL,
    [DateNaissance] DATETIME2,
    [Sexe] CHAR(1),
    [IdSituationResidence] INT NOT NULL,
    [IdProfession] INT,
    [IdPays] INT NOT NULL,
    [IdVille] INT NOT NULL,
    [AdressePrimaire] NVARCHAR(255) NOT NULL,
    [IsCultive] BIT CONSTRAINT [PersonnePhysique_IsCultive_df] DEFAULT 0,
    [SessionId] NVARCHAR(500),
    CONSTRAINT [PersonnePhysique_pkey] PRIMARY KEY CLUSTERED ([Id])
);

-- CreateTable
CREATE TABLE [dbo].[PersonneMorale] (
    [Id] INT NOT NULL IDENTITY(1,1),
    [NomCommercial] NVARCHAR(200) NOT NULL,
    [NumeroRC] NVARCHAR(50) NOT NULL,
    [IdJuridiction] INT,
    [NomRepresentantLegal] NVARCHAR(120),
    [PrenomRepresentantLegal] NVARCHAR(120),
    [EnseigneSociale] NVARCHAR(200),
    [SessionId] NVARCHAR(500),
    CONSTRAINT [PersonneMorale_pkey] PRIMARY KEY CLUSTERED ([Id])
);

-- CreateTable
CREATE TABLE [dbo].[Partie] (
    [Id] INT NOT NULL IDENTITY(1,1),
    [TypePersonne] CHAR(1) NOT NULL,
    [Telephone] VARCHAR(30),
    [Email] VARCHAR(200),
    [IdPersonnePhysique] INT,
    [IdPersonneMorale] INT,
    [IsInconnu] BIT NOT NULL CONSTRAINT [Partie_IsInconnu_df] DEFAULT 0,
    [SessionId] NVARCHAR(500),
    CONSTRAINT [Partie_pkey] PRIMARY KEY CLUSTERED ([Id])
);

-- CreateTable
CREATE TABLE [dbo].[plainte] (
    [Id] INT NOT NULL IDENTITY(1,1),
    [DatePlainte] DATETIME NOT NULL CONSTRAINT [plainte_DatePlainte_df] DEFAULT CURRENT_TIMESTAMP,
    [IdObjetInjustice] INT NOT NULL,
    [IdJuridiction] INT NOT NULL,
    [CodeSuivi] CHAR(12) NOT NULL,
    [ResumePlainte] NVARCHAR(1000) NOT NULL,
    [SessionId] NVARCHAR(500),
    CONSTRAINT [plainte_pkey] PRIMARY KEY CLUSTERED ([Id]),
    CONSTRAINT [plainte_CodeSuivi_key] UNIQUE NONCLUSTERED ([CodeSuivi])
);

-- CreateTable
CREATE TABLE [dbo].[RolePlainte] (
    [Id] INT NOT NULL IDENTITY(1,1),
    [Libelle] NVARCHAR(60) NOT NULL,
    CONSTRAINT [RolePlainte_pkey] PRIMARY KEY CLUSTERED ([Id])
);

-- CreateTable
CREATE TABLE [dbo].[RolePartiePlainte] (
    [Id] INT NOT NULL IDENTITY(1,1),
    [IdPartie] INT NOT NULL,
    [IdPlainte] INT NOT NULL,
    [IdRolePlainte] INT NOT NULL,
    CONSTRAINT [RolePartiePlainte_pkey] PRIMARY KEY CLUSTERED ([Id])
);

-- CreateTable
CREATE TABLE [dbo].[PieceJointe] (
    [Id] INT NOT NULL IDENTITY(1,1),
    [Contenu] VARBINARY(max),
    [IdPlainte] INT NOT NULL,
    [extensionPJ] NVARCHAR(100),
    [TypePieceJointe] NVARCHAR(60),
    [SessionId] VARCHAR(500),
    CONSTRAINT [PieceJointe_pkey] PRIMARY KEY CLUSTERED ([Id])
);

-- CreateTable
CREATE TABLE [dbo].[CodeSMS] (
    [IdCode] INT NOT NULL IDENTITY(1,1),
    [IdPlainte] INT NOT NULL,
    [NumeroTel] NVARCHAR(510),
    [Tentative] INT,
    [DateEnvoiCode] DATETIME2,
    [Valide] NVARCHAR(510),
    [Code] NVARCHAR(12),
    CONSTRAINT [CodeSMS_pkey] PRIMARY KEY CLUSTERED ([IdCode])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Ville_IdPays_idx] ON [dbo].[Ville]([IdPays]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [PersonnePhysique_IdPays_idx] ON [dbo].[PersonnePhysique]([IdPays]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [PersonnePhysique_IdVille_idx] ON [dbo].[PersonnePhysique]([IdVille]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [PersonneMorale_IdJuridiction_idx] ON [dbo].[PersonneMorale]([IdJuridiction]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [plainte_IdObjetInjustice_idx] ON [dbo].[plainte]([IdObjetInjustice]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [plainte_IdJuridiction_idx] ON [dbo].[plainte]([IdJuridiction]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [PieceJointe_IdPlainte_idx] ON [dbo].[PieceJointe]([IdPlainte]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [CodeSMS_IdPlainte_idx] ON [dbo].[CodeSMS]([IdPlainte]);

-- AddForeignKey
ALTER TABLE [dbo].[Ville] ADD CONSTRAINT [Ville_IdPays_fkey] FOREIGN KEY ([IdPays]) REFERENCES [dbo].[Pays]([Id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[PersonnePhysique] ADD CONSTRAINT [PersonnePhysique_IdPays_fkey] FOREIGN KEY ([IdPays]) REFERENCES [dbo].[Pays]([Id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[PersonnePhysique] ADD CONSTRAINT [PersonnePhysique_IdProfession_fkey] FOREIGN KEY ([IdProfession]) REFERENCES [dbo].[Profession]([Id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[PersonnePhysique] ADD CONSTRAINT [PersonnePhysique_IdSituationResidence_fkey] FOREIGN KEY ([IdSituationResidence]) REFERENCES [dbo].[SituationResidence]([Id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[PersonnePhysique] ADD CONSTRAINT [PersonnePhysique_IdVille_fkey] FOREIGN KEY ([IdVille]) REFERENCES [dbo].[Ville]([Id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[PersonneMorale] ADD CONSTRAINT [PersonneMorale_IdJuridiction_fkey] FOREIGN KEY ([IdJuridiction]) REFERENCES [dbo].[Juridiction]([Id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Partie] ADD CONSTRAINT [Partie_IdPersonnePhysique_fkey] FOREIGN KEY ([IdPersonnePhysique]) REFERENCES [dbo].[PersonnePhysique]([Id]) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Partie] ADD CONSTRAINT [Partie_IdPersonneMorale_fkey] FOREIGN KEY ([IdPersonneMorale]) REFERENCES [dbo].[PersonneMorale]([Id]) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[plainte] ADD CONSTRAINT [plainte_IdObjetInjustice_fkey] FOREIGN KEY ([IdObjetInjustice]) REFERENCES [dbo].[ObjetInjustice]([IdObjetInjustice]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[plainte] ADD CONSTRAINT [plainte_IdJuridiction_fkey] FOREIGN KEY ([IdJuridiction]) REFERENCES [dbo].[Juridiction]([Id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[RolePartiePlainte] ADD CONSTRAINT [RolePartiePlainte_IdPartie_fkey] FOREIGN KEY ([IdPartie]) REFERENCES [dbo].[Partie]([Id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[RolePartiePlainte] ADD CONSTRAINT [RolePartiePlainte_IdPlainte_fkey] FOREIGN KEY ([IdPlainte]) REFERENCES [dbo].[plainte]([Id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[RolePartiePlainte] ADD CONSTRAINT [RolePartiePlainte_IdRolePlainte_fkey] FOREIGN KEY ([IdRolePlainte]) REFERENCES [dbo].[RolePlainte]([Id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[PieceJointe] ADD CONSTRAINT [PieceJointe_IdPlainte_fkey] FOREIGN KEY ([IdPlainte]) REFERENCES [dbo].[plainte]([Id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[CodeSMS] ADD CONSTRAINT [CodeSMS_IdPlainte_fkey] FOREIGN KEY ([IdPlainte]) REFERENCES [dbo].[plainte]([Id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
