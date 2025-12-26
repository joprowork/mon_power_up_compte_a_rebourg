# ⏱️ Auto Countdown pour Trello

Un Power-Up Trello gratuit qui affiche automatiquement un countdown sur toutes les cartes ayant une date d'échéance.

## ✨ Fonctionnalités

- **Automatique** : Pas besoin de cliquer, le countdown s'affiche dès qu'une carte a une date d'échéance
- **Codes couleur** :
  - 🔴 **Rouge** : En retard
  - 🟠 **Orange** : Moins de 24 heures
  - 🟡 **Jaune** : Moins de 3 jours
  - 🔵 **Bleu** : Plus de 3 jours
- **Mise à jour automatique** : Le countdown se rafraîchit toutes les minutes
- **Vue détaillée** : Affichage complet quand tu ouvres une carte

---

## 🚀 Installation - Méthode 1 : GitHub Pages (Recommandé)

### Étape 1 : Créer un compte GitHub (si pas déjà fait)
1. Va sur [github.com](https://github.com)
2. Clique sur "Sign up" et crée ton compte

### Étape 2 : Créer un nouveau repository
1. Clique sur le bouton **"+"** en haut à droite → **"New repository"**
2. Nom du repository : `trello-auto-countdown`
3. Coche **"Public"**
4. Clique sur **"Create repository"**

### Étape 3 : Uploader les fichiers
1. Sur la page du repository, clique sur **"uploading an existing file"**
2. Glisse-dépose les 4 fichiers :
   - `index.html`
   - `connector.js`
   - `info.html`
   - `styles.css`
3. Clique sur **"Commit changes"**

### Étape 4 : Activer GitHub Pages
1. Va dans **Settings** (onglet en haut)
2. Dans le menu à gauche, clique sur **"Pages"**
3. Sous "Source", sélectionne **"main"** et **"/ (root)"**
4. Clique sur **"Save"**
5. Attends 1-2 minutes, ton URL sera : `https://TON-USERNAME.github.io/trello-auto-countdown/`

### Étape 5 : Ajouter le Power-Up à Trello
1. Va sur [trello.com/power-ups/admin](https://trello.com/power-ups/admin)
2. Clique sur **"Créer un nouveau Power-Up"**
3. Remplis les champs :
   - **Nom** : Auto Countdown
   - **Workspace** : Choisis ton workspace
   - **URL du connecteur iframe** : `https://TON-USERNAME.github.io/trello-auto-countdown/`
4. Clique sur **"Créer"**

### Étape 6 : Activer les capacités
1. Après création, va dans l'onglet **"Capabilities"**
2. Active ces options :
   - ✅ `card-badges`
   - ✅ `card-detail-badges`
   - ✅ `board-buttons`
3. Sauvegarde

### Étape 7 : Ajouter à ton tableau
1. Ouvre ton tableau Trello
2. Clique sur **"Power-Ups"** → **"Ajouter des Power-Ups"**
3. Va dans l'onglet **"Custom"** (ou "Personnalisé")
4. Tu verras "Auto Countdown" - clique sur **"Ajouter"**

---

## 🚀 Installation - Méthode 2 : Netlify (Alternative)

1. Va sur [netlify.com](https://www.netlify.com) et crée un compte
2. Une fois connecté, va dans "Sites"
3. Glisse-dépose le dossier contenant les 4 fichiers
4. Netlify te donnera une URL (ex: `random-name-123.netlify.app`)
5. Utilise cette URL dans Trello (étapes 5-7 ci-dessus)

---

## 🎉 C'est fait !

Maintenant, toutes tes cartes avec une date d'échéance afficheront automatiquement un countdown coloré !

---

## 🔧 Personnalisation

Tu peux modifier `connector.js` pour changer :
- Les seuils de couleur (lignes 35-47)
- Le format d'affichage (lignes 20-30)
- La fréquence de rafraîchissement (lignes 62 et 87)

---

## 📝 Licence

Gratuit et open source. Fais-en ce que tu veux ! 🎁
