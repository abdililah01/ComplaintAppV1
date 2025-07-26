# ComplaintAppV1 - Backend

Ce dossier contient le code source du backend de l'application ComplaintAppV1, développé avec Node.js, Express, TypeScript et SQL Server.

## Prérequis

*   [Docker Desktop](https://www.docker.com/products/docker-desktop/)

## Démarrage Rapide

1.  **Configurer l'environnement :**
    Copiez le fichier d'exemple et remplissez les variables dans `.env`.
    ```bash
    cp ./app-backend/.env.example ./app-backend/.env
    ```

2.  **Lancer tous les services :**
    Depuis la racine du projet, lancez Docker Compose.
    ```bash
    docker compose up --build -d
    ```

3.  **Validation :**
    Après environ une minute, vérifiez que tous les conteneurs sont en cours d'exécution et que `sqlserver-dev` est `Healthy`.
    ```bash
    docker ps
    ```
    L'API est maintenant accessible à l'adresse [http://localhost:3001/healthz](http://localhost:3001/healthz).