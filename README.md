# Liste de naissance · Géraldine & Jonathan

Application web de liste de naissance — les proches consultent la liste, réservent un article, et les parents sont notifiés par email.

---

## Fonctionnalités

**Côté visiteurs**
- Parcourir la liste par catégorie (Chambre, Bain, Repas, Jeux, Vêtements…)
- Réserver un article en laissant son prénom et un message optionnel
- Lien direct vers la boutique pour chaque article

**Côté administration**
- Interface protégée par mot de passe (cookie httpOnly, rate limiting)
- Ajouter, modifier, supprimer et réordonner les articles
- Annuler une réservation
- Marquer un article comme acheté
- Export CSV de la liste complète

**Notifications**
- Email automatique envoyé à Géraldine & Jonathan à chaque réservation

---

## Stack

| Outil | Usage |
|---|---|
| [Next.js 16](https://nextjs.org) | Framework (App Router) |
| [Firebase Firestore](https://firebase.google.com) | Base de données temps réel |
| [Resend](https://resend.com) | Envoi d'emails transactionnels |
| [Tailwind CSS v4](https://tailwindcss.com) | Styles utilitaires |
| [Lucide React](https://lucide.dev) | Icônes |

---

## Installation

```bash
git clone https://github.com/TON_USER/liste-naissance.git
cd liste-naissance
npm install
```

Crée un fichier `.env.local` à la racine :

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Admin
ADMIN_PASSWORD=

# Resend (optionnel — notifications email)
RESEND_API_KEY=
NOTIFY_EMAIL=
```

Lance le serveur de développement :

```bash
npm run dev
```

L'app est accessible sur [http://localhost:3000](http://localhost:3000).

---

## Configuration Firebase

### Firestore

Dans la console Firebase, crée une base Firestore avec les règles suivantes :

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /items/{itemId} {
      // Lecture publique
      allow read: if true;
      // Réservation publique (champs limités)
      allow update: if request.resource.data.diff(resource.data).affectedKeys()
                       .hasOnly(['reserved', 'reservedBy', 'reservedMessage']);
      // Création et suppression réservées à l'admin
      allow create, delete: if request.auth != null;
    }
  }
}
```

---

## Déploiement (Vercel)

1. Pousse le projet sur GitHub
2. Importe le repo sur [vercel.com](https://vercel.com)
3. Dans **Settings → Environment Variables**, ajoute toutes les variables du `.env.local`
4. Redéploie — chaque `git push` sur `main` déclenchera ensuite un déploiement automatique

---

## Structure du projet

```
├── app/
│   ├── page.tsx              # Liste publique
│   ├── admin/
│   │   ├── page.tsx          # Interface d'administration
│   │   └── login/page.tsx    # Page de connexion
│   └── api/
│       ├── admin/login/      # Auth + rate limiting
│       ├── admin/logout/     # Déconnexion
│       └── notify/           # Envoi d'email (Resend)
├── components/
│   ├── ItemCard.tsx          # Carte article
│   └── ReserveModal.tsx      # Modal de réservation
├── lib/
│   ├── firebase.ts           # Initialisation Firebase
│   ├── items.ts              # CRUD Firestore
│   └── types.ts              # Types TypeScript
└── middleware.ts             # Protection des routes /admin
```
