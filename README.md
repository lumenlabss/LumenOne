# RubixOne

| :exclamation: **RubixOne est en cours de développement** : certaines fonctionnalités peuvent être instables ou incomplètes. Son utilisation en environnement de production est fortement déconseillée pour le moment. |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |

**RubixOne** est une alternative gratuite et open source à Plesk, conçue pour simplifier la gestion d'hébergement web (sites, domaines, bases de données, FTP, e-mails, etc.) à travers une interface moderne, intuitive et légère. Développé en **Node.js**, RubixOne vise à offrir une solution performante et extensible pour les développeurs et administrateurs système.

---

## :sparkles: Fonctionnalités principales (en cours de développement)

- :control_knobs: **Interface web** simple, responsive et moderne
- :globe_with_meridians: **Gestion des domaines** & sous-domaines
- :file_folder: **Gestion des fichiers** (via SFTP/WebFTP)
- :dolphin: **Gestion des bases de données** (MySQL/MariaDB)
- :outbox_tray: **Gestion des comptes FTP**
- :e_mail: **Gestion des e-mails** (optionnelle)
- :whale: **Intégration Docker** (facultative pour l'isolation des services)
- :closed_lock_with_key: **Certificats SSL Let's Encrypt**
- :jigsaw: **Système de modules/extensions** pour personnalisation
- :arrows_counterclockwise: **API REST** pour automatisation et intégration

---

## :rocket: Installation

### Prérequis

- **Node.js** (version 18 ou supérieure)
- **npm** ou **yarn**
- **Base de données SQLite** (par défaut)
- Serveur Linux ou Windows (recommandé : Linux)

### Étapes d'installation

1. Clonez le dépôt :

   ```bash
   git clone https://github.com/RubixLTS/RubixOne.git
   cd RubixOne
   ```

2. Installez les dépendances :

   ```bash
   npm install
   ```

3. Configurez le fichier `config/config.json` :

   ```json
   {
     "hostname": "localhost",
     "port": 3000,
     "name": "RubixOne",
     "version": "bêta 0.0.1"
   }
   ```

4. Lancez le serveur :

   ```bash
   node rubixone.js
   ```

5. Accédez à l'interface web :
   ```
   http://localhost:3000
   ```

---

## :page_facing_up: Licence

RubixOne est distribué sous licence **MIT**. Vous êtes libre de l’utiliser, le modifier et le distribuer.

---

## :handshake: Contribuer

Les contributions sont les bienvenues ! Voici comment vous pouvez contribuer :

1. Forkez le projet
2. Créez une branche (`git checkout -b feature/nom-de-la-fonctionnalité`)
3. Commitez vos changements (`git commit -am 'Ajoute une nouvelle fonctionnalité'`)
4. Pushez vos modifications (`git push origin feature/nom-de-la-fonctionnalité`)
5. Ouvrez une Pull Request

---

## :white_check_mark: ToDo List

Project réalisé à : ⁓4%

### Core

- [ ] Authentification utilisateur (connexion, déconnexion, sessions)
- [x] Système de rôles (admin, utilisateur)
- [ ] Tableau de bord pour la gestion des services (web, FTP, bases de données)
- [ ] Système de logs utilisateurs/actions (audit)

### Web

- [ ] Interface d’accueil avec résumé des services
- [ ] Gestion des domaines et sous-domaines
- [ ] Gestionnaire de fichiers intégré (upload, suppression, édition)
- [ ] Interface pour la gestion des bases de données (création, suppression, accès)

### Backend

- [ ] API REST (utilisateurs, domaines, fichiers, bases de données)
- [ ] Sécurité (rate limiting, gestion des tokens JWT, protection CSRF)
- [ ] Support multi-serveur pour la scalabilité
- [x] Réorganisation du code en modules (`src`)

### Modules

- [ ] Certificats SSL Let's Encrypt (génération et renouvellement automatiques)
- [ ] Webmail intégré (Rainloop, Roundcube)
- [ ] Installation d'applications (WordPress, Joomla, etc.)
- [ ] Monitoring des ressources (CPU, RAM, stockage)

### Bonus

- [ ] Documentation complète (installation, API, développement)
- [ ] Interface mobile-friendly
- [ ] Thème claire
- [ ] Système de notifications (e-mails, alertes)

---

## :speech_balloon: Communauté

Rejoignez la communauté RubixOne pour poser vos questions, signaler des bugs ou proposer des idées :

- [GitHub Issues](https://github.com/votre-utilisateur/RubixOne/issues)
- [Discord](https://discord.gg/ty92ffCYUC)

---

## :tada: Remerciements

Merci à tous les contributeurs et utilisateurs qui soutiennent le projet RubixOne !
