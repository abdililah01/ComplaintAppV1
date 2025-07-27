-- C:\ComplaintAppV1\init-users.sql

DECLARE @db_exists bit =
  CASE WHEN EXISTS (SELECT 1 FROM sys.databases WHERE name = N'ComplaintDev') THEN 1 ELSE 0 END;

IF (@db_exists = 0)
BEGIN
  CREATE DATABASE [ComplaintDev];
END
GO

IF EXISTS (SELECT 1 FROM sys.sql_logins WHERE name = N'mobile_lookup')
  ALTER LOGIN mobile_lookup WITH PASSWORD = N'@Ega1234';
ELSE
  CREATE LOGIN mobile_lookup WITH PASSWORD = N'@Ega1234';
GO

IF EXISTS (SELECT 1 FROM sys.sql_logins WHERE name = N'mobile_service')
  ALTER LOGIN mobile_service WITH PASSWORD = N'Ega12345678';
ELSE
  CREATE LOGIN mobile_service WITH PASSWORD = N'Ega12345678';
GO

USE [ComplaintDev];
GO

IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = N'mobile_lookup')
  CREATE USER mobile_lookup FOR LOGIN mobile_lookup;

IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = N'mobile_service')
  CREATE USER mobile_service FOR LOGIN mobile_service;
GO

IF NOT EXISTS (
  SELECT 1
  FROM sys.database_role_members rm
  JOIN sys.database_principals r ON r.principal_id = rm.role_principal_id AND r.name = N'db_datareader'
  JOIN sys.database_principals u ON u.principal_id = rm.member_principal_id AND u.name = N'mobile_lookup'
)
  ALTER ROLE db_datareader ADD MEMBER mobile_lookup;
GO

IF NOT EXISTS (
  SELECT 1
  FROM sys.database_role_members rm
  JOIN sys.database_principals r ON r.principal_id = rm.role_principal_id AND r.name = N'db_datareader'
  JOIN sys.database_principals u ON u.principal_id = rm.member_principal_id AND u.name = N'mobile_service'
)
  ALTER ROLE db_datareader ADD MEMBER mobile_service;

IF NOT EXISTS (
  SELECT 1
  FROM sys.database_role_members rm
  JOIN sys.database_principals r ON r.principal_id = rm.role_principal_id AND r.name = N'db_datawriter'
  JOIN sys.database_principals u ON u.principal_id = rm.member_principal_id AND u.name = N'mobile_service'
)
  ALTER ROLE db_datawriter ADD MEMBER mobile_service;
GO

PRINT 'Logins, users, roles aligned.';
