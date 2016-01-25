---
layout: post
title: Créer une extension Chrome qui remplace la page de nouvel onglet
date: 2016-01-25 02:30
category: chrome
permalink: /creer-une-extension-chrome-qui-remplace-la-page-de-nouvel-onglet/
---

Dans cet article nous allons voir comment créer une extension Chrome de type "_Override Pages_". Ce type d'extension permet de remplacer la page de nouvel onglet, la page des favoris ou encore la page de l'historique.

Ces extensions permettent de remplacer qu'une seule page à la fois. Vous ne pouvez pas remplacer la page de nouvel onglet et la page de favoris en même temps, il faudrait créer deux extensions.

## Le fichier _Manifest_

Dans un dossier, créez un fichier appelé `manifest.json`. Ce fichier permet de décrire votre extension à Chrome, il contient plusieurs informations:

- le nom
- la description
- le nom de l'auteur
- la version
- le nom de l'icône
- les permissions requises
- [et beaucoup d'autres](https://developer.chrome.com/extensions/manifest)

Commencez par faire un fichier basique qui permettra de tester votre extension dès maintenant:

```json
{
  "manifest_version": 2,
  "name": "Mon nouvel onglet",
  "description": "Remplace la page de nouvel onglet",
  "author": "Jordan Danielewski",
  "version": "0.0.1"
}
```

`manifest_version` permet à Chrome de savoir quel format de _Manifest_ est utilisé par votre extension. Depuis Chrome 18, il faut obligatoirement utiliser la version `2`. Vous trouverez plus d'informations dans la [documentation de `manifest_version`](https://developer.chrome.com/extensions/manifestVersion).

## Installer votre extension

Pour utiliser une extension qui n'est pas publiée sur le _Chrome Web Store_ il faut passer Chrome en "Mode développeur".

Allez dans la page "Extensions" de Chrome située à l'adresse `chrome://extensions` et cochez la case "Mode développeur":

![Chrome développeur](/uploads/2016-01-25-creer-une-extension-chrome-qui-remplace-la-page-de-nouvel-onglet/chrome-developpeur.png)

Pour installer votre extension, cliquez sur "Charger l'extension non empaquetée...", puis sélectionnez le dossier qui contient le `manifest.json`.

Votre extension apparaît alors dans la liste:

![Extension custom](/uploads/2016-01-25-creer-une-extension-chrome-qui-remplace-la-page-de-nouvel-onglet/extension-custom.png)

Pour l'instant l'extension ne fait rien du tout, même si on ouvre un nouvel onglet. Nous allons corriger cela.

## Création de la page

Dans le même dossier qui contient le `manifest.json`, créez un fichier `newtab.html`. Vous pouvez le nommer comme vous voulez, contrairement au _Manifest_.

Ce fichier correspondra à une page HTML classique, comme si vous feriez une page de site web.

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Mon nouvel onglet</title>
  </head>
  <body>
    <h1>Mon nouvel onglet</h1>
  </body>
</html>
```

Vous devez également signaler à Chrome qu'il doit utiliser ce fichier, cela se passe dans le _Manifest_ grâce à la clé `chrome_url_overrides`:

```json
{
  "manifest_version": 2,
  "name": "Mon nouvel onglet",
  "description": "Remplace la page de nouvel onglet",
  "author": "Jordan Danielewski",
  "version": "0.0.1",
  "chrome_url_overrides": {
    "newtab": "newtab.html"
  }
}
```

Il est possible de remplacer la clé `newtab` par `bookmarks` si vous voulez remplacer la page des favoris ou par `history` si vous voulez remplacer la page de l'historique.

Actualisez le plugin:

![Actualiser](/uploads/2016-01-25-creer-une-extension-chrome-qui-remplace-la-page-de-nouvel-onglet/actualiser.png)

Puis ouvrez un nouvel onglet:

![Premier résultat](/uploads/2016-01-25-creer-une-extension-chrome-qui-remplace-la-page-de-nouvel-onglet/premier-resultat.png)

## Customiser la page

La page est un peu triste, pour améliorer cela il suffit de styliser la page avec du CSS, comme pour une page web classique.

Il est même possible de la rendre dynamique en y attachant un fichier Javascript.

Pour l'exemple, nous utiliserons l'API de [Giphy](http://giphy.com/) pour afficher un `.gif` au hasard à chaque ouverture d'un nouvel onglet.

Pour récupérer un `.gif` au hasard, il faudra appeler l'url `http://api.giphy.com/v1/gifs/random?api_key=dc6zaTOxFJmzC&tag=cat`. Un JSON qui contient les informations du `.gif` vous sera alors renvoyé:

```json
{
  "data": {
    "type": "gif",
    "id": "WoCxkkpiweO6Q",
    "url": "http:\/\/giphy.com\/gifs\/cat-lazy-chilling-WoCxkkpiweO6Q",
    "image_original_url": "http:\/\/media3.giphy.com\/media\/WoCxkkpiweO6Q\/giphy.gif",
    "image_url": "http:\/\/media3.giphy.com\/media\/WoCxkkpiweO6Q\/giphy.gif",
    "image_mp4_url": "http:\/\/media3.giphy.com\/media\/WoCxkkpiweO6Q\/giphy.mp4",
    "image_frames": "76",
    "image_width": "400",
    "image_height": "237",
    "fixed_height_downsampled_url": "http:\/\/media3.giphy.com\/media\/WoCxkkpiweO6Q\/200_d.gif",
    "fixed_height_downsampled_width": "338",
    "fixed_height_downsampled_height": "200",
    "fixed_width_downsampled_url": "http:\/\/media3.giphy.com\/media\/WoCxkkpiweO6Q\/200w_d.gif",
    "fixed_width_downsampled_width": "200",
    "fixed_width_downsampled_height": "119",
    "fixed_height_small_url": "http:\/\/media3.giphy.com\/media\/WoCxkkpiweO6Q\/100.gif",
    "fixed_height_small_still_url": "http:\/\/media3.giphy.com\/media\/WoCxkkpiweO6Q\/100_s.gif",
    "fixed_height_small_width": "169",
    "fixed_height_small_height": "100",
    "fixed_width_small_url": "http:\/\/media3.giphy.com\/media\/WoCxkkpiweO6Q\/100w.gif",
    "fixed_width_small_still_url": "http:\/\/media3.giphy.com\/media\/WoCxkkpiweO6Q\/100w_s.gif",
    "fixed_width_small_width": "100",
    "fixed_width_small_height": "59",
    "username": "",
    "caption": ""
  },
  "meta": {
    "status": 200,
    "msg": "OK"
  }
}
```

La clé d'API `dc6zaTOxFJmzC` est publique. Elle doit être utilisée uniquement lors du développement. Si vous voulez une clé pour un environnement de production ou si vous voulez publier votre extension, il faudra contacter Giphy pour avoir votre propre clé. Vous trouverez tous les détails [dans la documentation de l'API](https://github.com/giphy/GiphyAPI).

Créez `newtab.js` et `newtab.css` dans votre dossier, puis incluez-les dans votre `newtab.html`.

### newtab.html

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <link rel="stylesheet" href="newtab.css" />
    <title>Mon nouvel onglet</title>
  </head>
  <body>
    <script src="newtab.js"></script>
  </body>
</html>
```

### newtab.css

```css
body {
  background-size: cover;
}
```

### newtab.js

```javascript
fetch('http://api.giphy.com/v1/gifs/random?api_key=dc6zaTOxFJmzC&tag=cat', {
	method: 'get'
}).then(function(response) {
  return response.json();
}).then(function(json) {
  document.body.style.backgroundImage = `url('${json.data.image_url}')`;
}).catch(function(err) {
	console.log('Error:', err);
});
```

J'ai utilisé la méthode [fetch](https://fetch.spec.whatwg.org/) ainsi que les [template strings](https://developers.google.com/web/updates/2015/01/ES6-Template-Strings) d'ECMAScript 6.

## Résultat

Un nouveau `.gif` en plein écran à chaque fois que vous ouvrez un nouvel onglet !

![Premier résultat](/uploads/2016-01-25-creer-une-extension-chrome-qui-remplace-la-page-de-nouvel-onglet/cat.gif)

## Conclusion

Ce type d'extension est relativement simple à réaliser mais les possibilités sont quasiment illimitées. Pour aller plus loin, il est possible d'utiliser les [API Chrome](https://developer.chrome.com/extensions/api_index), on pourrait alors par exemple:

- accéder à la liste des sites les plus visités
- accéder à la liste des sites favoris
- stocker les préférences de l'utilisateur après lui avoir demandé quel type de `.gif` afficher s'il n'aime pas les chats
- [et plus encore](https://developer.chrome.com/extensions/api_index)

Évidemment, pour utiliser ce genre d'API, il vous faut la permission de l'utilisateur. En fonction de l'API que vous voudrez utiliser, il faudra [préciser le type de permission requise dans le _Manifest_](https://developer.chrome.com/extensions/declare_permissions).
