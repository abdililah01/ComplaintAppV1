BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Pays] (
    [Id] INT NOT NULL,
    [Nom] NVARCHAR(100) NOT NULL,
    [Code] NVARCHAR(5) NOT NULL,
    [Nom_Fr] NVARCHAR(100),
    [Nationalite] NVARCHAR(60),
    CONSTRAINT [Pays_pkey] PRIMARY KEY CLUSTERED ([Id])
);

-- CreateTable
CREATE TABLE [dbo].[Ville] (
    [Id] INT NOT NULL,
    [Nom] NVARCHAR(120) NOT NULL,
    [IdPays] INT NOT NULL,
    [CodePostal] NVARCHAR(10),
    [Nom_Fr] NVARCHAR(120),
    CONSTRAINT [Ville_pkey] PRIMARY KEY CLUSTERED ([Id])
);

-- CreateTable
CREATE TABLE [dbo].[SituationResidence] (
    [Id] INT NOT NULL,
    [Libelle] NVARCHAR(60) NOT NULL,
    CONSTRAINT [SituationResidence_pkey] PRIMARY KEY CLUSTERED ([Id])
);

-- CreateTable
CREATE TABLE [dbo].[Profession] (
    [Id] INT NOT NULL,
    [Libelle] NVARCHAR(120) NOT NULL,
    CONSTRAINT [Profession_pkey] PRIMARY KEY CLUSTERED ([Id])
);

-- CreateTable
CREATE TABLE [dbo].[Juridiction] (
    [Id] INT NOT NULL,
    [Nom] NVARCHAR(255) NOT NULL,
    [Affichable] BIT,
    CONSTRAINT [Juridiction_pkey] PRIMARY KEY CLUSTERED ([Id])
);

-- CreateTable
CREATE TABLE [dbo].[ObjetInjustice] (
    [IdObjetInjustice] INT NOT NULL,
    [Libelle] NVARCHAR(120) NOT NULL,
    CONSTRAINT [ObjetInjustice_pkey] PRIMARY KEY CLUSTERED ([IdObjetInjustice])
);

-- CreateTable
CREATE TABLE [dbo].[PersonnePhysique] (
    [IdPersonnePhysique] INT NOT NULL,
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
    [IsCultive] BIT,
    [SessionId] NVARCHAR(510),
    CONSTRAINT [PersonnePhysique_pkey] PRIMARY KEY CLUSTERED ([IdPersonnePhysique])
);

-- CreateTable
CREATE TABLE [dbo].[PersonneMorale] (
    [IdPersonneMorale] INT NOT NULL,
    [NomCommercial] NVARCHAR(200) NOT NULL,
    [NumeroRC] NVARCHAR(50) NOT NULL,
    [IdJuridiction] INT,
    [NomRepresentantLegal] NVARCHAR(120),
    [PrenomRepresentantLegal] NVARCHAR(120),
    [EnseigneSociale] NVARCHAR(200),
    [SessionId] NVARCHAR(510),
    CONSTRAINT [PersonneMorale_pkey] PRIMARY KEY CLUSTERED ([IdPersonneMorale])
);

-- CreateTable
CREATE TABLE [dbo].[Partie] (
    [IdPartie] INT NOT NULL,
    [TypePersonne] NVARCHAR(15) NOT NULL,
    [Telephone] NVARCHAR(50),
    [Email] NVARCHAR(120),
    [IdPersonnePhysique] INT,
    [IdPersonneMorale] INT,
    [IsInconnu] BIT,
    [SessionId] NVARCHAR(510),
    CONSTRAINT [Partie_pkey] PRIMARY KEY CLUSTERED ([IdPartie])
);

-- CreateTable
CREATE TABLE [dbo].[Plainte] (
    [IdPlainte] INT NOT NULL,
    [DatePlainte] DATETIME NOT NULL,
    [IdObjetInjustice] INT NOT NULL,
    [IdJuridiction] INT NOT NULL,
    [CodeSuivi] CHAR(12) NOT NULL,
    [ResumePlainte] NVARCHAR(1000) NOT NULL,
    [NumeroPlainte] INT,
    [AnneePlainte] INT,
    [SessionId] NVARCHAR(510),
    CONSTRAINT [Plainte_pkey] PRIMARY KEY CLUSTERED ([IdPlainte]),
    CONSTRAINT [Plainte_CodeSuivi_key] UNIQUE NONCLUSTERED ([CodeSuivi])
);

-- CreateTable
CREATE TABLE [dbo].[RolePlainte] (
    [IdRolePlainte] INT NOT NULL,
    [Libelle] NVARCHAR(60) NOT NULL,
    CONSTRAINT [RolePlainte_pkey] PRIMARY KEY CLUSTERED ([IdRolePlainte])
);

-- CreateTable
CREATE TABLE [dbo].[RolePartiePlainte] (
    [IdRolePartiePlainte] INT NOT NULL,
    [IdPartie] INT NOT NULL,
    [IdPlainte] INT NOT NULL,
    [IdRolePlainte] INT NOT NULL,
    CONSTRAINT [RolePartiePlainte_pkey] PRIMARY KEY CLUSTERED ([IdRolePartiePlainte])
);

-- CreateTable
CREATE TABLE [dbo].[PieceJointe] (
    [IdPiece] INT NOT NULL,
    [Contenu] VARBINARY(max),
    [IdPlainte] INT NOT NULL,
    [ExtensionPJ] NVARCHAR(12),
    [TypePieceJointe] NVARCHAR(60),
    [SessionId] NVARCHAR(510),
    CONSTRAINT [PieceJointe_pkey] PRIMARY KEY CLUSTERED ([IdPiece])
);

-- CreateTable
CREATE TABLE [dbo].[CodeSMS] (
    [IdCode] INT NOT NULL,
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
CREATE NONCLUSTERED INDEX [Plainte_IdObjetInjustice_idx] ON [dbo].[Plainte]([IdObjetInjustice]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Plainte_IdJuridiction_idx] ON [dbo].[Plainte]([IdJuridiction]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [RolePartiePlainte_IdPlainte_idx] ON [dbo].[RolePartiePlainte]([IdPlainte]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [PieceJointe_IdPlainte_idx] ON [dbo].[PieceJointe]([IdPlainte]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [CodeSMS_IdPlainte_idx] ON [dbo].[CodeSMS]([IdPlainte]);

-- AddForeignKey
ALTER TABLE [dbo].[Ville] ADD CONSTRAINT [Ville_IdPays_fkey] FOREIGN KEY ([IdPays]) REFERENCES [dbo].[Pays]([Id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[PersonnePhysique] ADD CONSTRAINT [PersonnePhysique_IdPays_fkey] FOREIGN KEY ([IdPays]) REFERENCES [dbo].[Pays]([Id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[PersonnePhysique] ADD CONSTRAINT [PersonnePhysique_IdVille_fkey] FOREIGN KEY ([IdVille]) REFERENCES [dbo].[Ville]([Id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[PersonnePhysique] ADD CONSTRAINT [PersonnePhysique_IdSituationResidence_fkey] FOREIGN KEY ([IdSituationResidence]) REFERENCES [dbo].[SituationResidence]([Id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[PersonnePhysique] ADD CONSTRAINT [PersonnePhysique_IdProfession_fkey] FOREIGN KEY ([IdProfession]) REFERENCES [dbo].[Profession]([Id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[PersonneMorale] ADD CONSTRAINT [PersonneMorale_IdJuridiction_fkey] FOREIGN KEY ([IdJuridiction]) REFERENCES [dbo].[Juridiction]([Id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Partie] ADD CONSTRAINT [Partie_IdPersonnePhysique_fkey] FOREIGN KEY ([IdPersonnePhysique]) REFERENCES [dbo].[PersonnePhysique]([IdPersonnePhysique]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Partie] ADD CONSTRAINT [Partie_IdPersonneMorale_fkey] FOREIGN KEY ([IdPersonneMorale]) REFERENCES [dbo].[PersonneMorale]([IdPersonneMorale]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Plainte] ADD CONSTRAINT [Plainte_IdObjetInjustice_fkey] FOREIGN KEY ([IdObjetInjustice]) REFERENCES [dbo].[ObjetInjustice]([IdObjetInjustice]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Plainte] ADD CONSTRAINT [Plainte_IdJuridiction_fkey] FOREIGN KEY ([IdJuridiction]) REFERENCES [dbo].[Juridiction]([Id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[RolePartiePlainte] ADD CONSTRAINT [RolePartiePlainte_IdPartie_fkey] FOREIGN KEY ([IdPartie]) REFERENCES [dbo].[Partie]([IdPartie]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[RolePartiePlainte] ADD CONSTRAINT [RolePartiePlainte_IdPlainte_fkey] FOREIGN KEY ([IdPlainte]) REFERENCES [dbo].[Plainte]([IdPlainte]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[RolePartiePlainte] ADD CONSTRAINT [RolePartiePlainte_IdRolePlainte_fkey] FOREIGN KEY ([IdRolePlainte]) REFERENCES [dbo].[RolePlainte]([IdRolePlainte]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[PieceJointe] ADD CONSTRAINT [PieceJointe_IdPlainte_fkey] FOREIGN KEY ([IdPlainte]) REFERENCES [dbo].[Plainte]([IdPlainte]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[CodeSMS] ADD CONSTRAINT [CodeSMS_IdPlainte_fkey] FOREIGN KEY ([IdPlainte]) REFERENCES [dbo].[Plainte]([IdPlainte]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
