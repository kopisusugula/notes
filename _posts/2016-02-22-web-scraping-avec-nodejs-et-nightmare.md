---
layout: post
title: Web Scraping avec NodeJS et Nightmare
date: 2016-02-22 21:00
category: nodejs
permalink: /web-scraping-avec-nodejs-et-nightmare/
image: /uploads/2016-02-22-web-scraping-avec-nodejs-et-nightmare/google.gif
---

[Nightmare](https://github.com/segmentio/nightmare) est une bibliothèque qui permet d'automatiser la plupart des tâches que l'on fait dans un navigateur: charger et recharger une page, cliquer sur des liens ou des boutons, remplir des formulaires, modifier ou supprimer des cookies, faire une capture d'écran...

Nightmare est basé sur [Electron](http://electron.atom.io/), plus rapide et plus moderne que [PhantomJS](http://phantomjs.org/). On peut l'utiliser pour faire des tests d'intégration ou alors pour extraire des informations d'une page: le [web scraping](https://fr.wikipedia.org/wiki/Web_scraping).

## Pourquoi Nightmare ?

Nightmare est capable d'exécuter le Javascript présent dans les pages web. De nos jours, scraper une page sans exécuter le Javascript pourrait conduire à un résultat incomplet ou néant.

Le gros avantage de Nightmare est sa syntaxe très haut niveau qui lui apporte une grande lisibilité. Il suffit de comparer la syntaxe de PhantomJS avec celle de Nightmare.

PhantomJS:

```javascript
phantom.create(function (ph) {
  ph.createPage(function (page) {
    page.open('http://yahoo.com', function (status) {
      page.evaluate(function () {
        var el =
          document.querySelector('input[title="Search"]');
        el.value = 'github nightmare';
      }, function (result) {
        page.evaluate(function () {
          var el = document.querySelector('.searchsubmit');
          var event = document.createEvent('MouseEvent');
          event.initEvent('click', true, false);
          el.dispatchEvent(event);
        }, function (result) {
          ph.exit();
        });
      });
    });
  });
});
```

Nightmare:

```javascript
yield Nightmare()
  .goto('http://yahoo.com')
  .type('input[title="Search"]', 'github nightmare')
  .click('.searchsubmit');
```

## Installation

Tout d'abord créez un nouveau projet NodeJS:

```shell
$ mkdir scraping
$ npm init
```

Puis installez Nightmare. Nous allons également utiliser [vo](https://github.com/lapwinglabs/vo) pour gérer les [itérateurs et les générateurs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators).

```shell
$ npm install nightmare vo --save
```

Dans cet article, j'ai utilisé la version 2.1.6 de Nightmare.

## Utilisation basique

Pour commencer, nous allons faire un script qui va récupérer le prix d'une location sur Airbnb.

![Airbnb](/uploads/2016-02-22-web-scraping-avec-nodejs-et-nightmare/airbnb-room.png)

```javascript
var run = function*() {
  var nightmare = Nightmare({ show: true });
  var link = yield nightmare
    .goto('https://www.airbnb.fr/rooms/5181954')
    .evaluate(function() {
      return document.getElementsByClassName('book-it__price-amount')[0].innerText;
    });
  yield nightmare.end();
  return link;
};

vo(run)(function(err, result) {
  if (err) throw err;
  console.log(result);
});
```

```shell
$ node index
17€
```

- On commence tout d'abord par créer une instance de Nightmare: `Nightmare({ show: true })`. Le `show: true` sert à afficher la fenêtre du navigateur pour voir en temps réel le déroulement du script. Cela est surtout utile pour débugger les scripts. La liste complète des options possibles est disponible dans la [documentation d'Electron](https://github.com/atom/electron/blob/master/docs/api/browser-window.md#new-browserwindowoptions).
- On spécifie un _user-agent_ avec `.useragent()`, certains sites peuvent vous bloquer l'accès sinon. L'idéal serait même de [le changer de manière aléatoire](http://www.useragentstring.com/pages/useragentstring.php).
- On charge la page avec `.goto('https://www.airbnb.fr/rooms/5181954')`.
- Avec `evaluate` on peut exécuter du code dans le contexte de la page. On récupère ici le texte dans le premier élément qui a la classe `.book-it__price-amount`. Vous pouvez utiliser tout ce qui est présent dans la page, par exemple si le site utilise jQuery, vous pouvez faire: `return $('#header').text();`.
- Puis on affiche le résultat dans la console: `console.log(result);`.

## Faire une capture d'écran

La capture d'écran est le moyen le plus simple d'extraire de l'information. Cela peut être très utile si vous voulez historiser l'affichage d'un site web.

Pour faire une capture d'écran il suffit d'utiliser la méthode [`.screenshot()`](https://github.com/segmentio/nightmare#screenshotpath-clip).

```javascript
var Nightmare = require('nightmare');
var vo = require('vo');

var run = function*() {
  var nightmare = Nightmare({ show: true })
    .useragent('Opera/9.80 (Windows NT 6.0) Presto/2.12.388 Version/12.14');
  var link = yield nightmare
    .goto('https://www.airbnb.fr/')
    .screenshot('screenshot.png');
  yield nightmare.end();
  return link;
};

vo(run)(function(err, result) {
  if (err) throw err;
  console.log('Ok');
});
```

Résultat:

![screenshot](/uploads/2016-02-22-web-scraping-avec-nodejs-et-nightmare/screenshot.png)

Comme vous pouvez le constater la résolution n'est pas optimale. Pour cela nous pouvons utiliser [`.viewport(width, height)`](https://github.com/segmentio/nightmare#viewportwidth-height) juste après l'initialisation de Nightmare: `Nightmare({ show: true }).viewport(1280, 720);`. Cette méthode doit impérativement être appelée avant `.goto()`.

Résultat:

![screenshot](/uploads/2016-02-22-web-scraping-avec-nodejs-et-nightmare/screenshot-full.png)

Vous pouvez également générer un PDF avec `.pdf('screenshot.pdf');`. En revanche, le rendu PDF n'est pas très satisfaisant par rapport au PNG.

## Utilisation des formulaires

Pour utiliser les formulaires, nous allons faire un script qui va effectuer une recherche sur Google et afficher le titre du premier résultat.

```javascript
var Nightmare = require('nightmare');
var vo = require('vo');

var run = function*() {
  var nightmare = Nightmare({ show: true })
    .useragent('Opera/9.80 (Windows NT 6.0) Presto/2.12.388 Version/12.14');
  var link = yield nightmare
    .goto('https://www.google.fr/')
    .type('#lst-ib', 'restaurant lille')
    .click('input[name="btnK"]')
    .wait('#ires')
    .evaluate(function () {
      return document.getElementsByClassName('r')[0].innerText;
    });
  yield nightmare.end();
  return link;
};

vo(run)(function(err, result) {
  if (err) throw err;
  console.log(result);
});
```

- On tape "restaurant lille" dans l'_input_ avec l'ID `#lst-ib` grâce à `.type('#lst-ib', 'restaurant lille')`. Ici, j'ai utilisé l'ID mais il est possible d'utiliser n'importe quel sélecteur CSS: `input[name="q"]` fonctionne également pour Google.
- On clique sur le bouton "Recherche Google": `.click('input[name="btnK"]')`.
- On attend jusqu'à ce que l'élément `#res` soit présent dans la page: `.wait('#res')`. C'est le bloc qui contient les résultats de la recherche: ![res](/uploads/2016-02-22-web-scraping-avec-nodejs-et-nightmare/res.png)
- Avec `evaluate` on récupère le texte du premier élément qui a la classe `.r`.
- Puis on affiche le résultat dans la console: `console.log(result);`.

![Google](/uploads/2016-02-22-web-scraping-avec-nodejs-et-nightmare/google.gif)

## Authentification via un formulaire

Nightmare est capable de gérer les cookies, vous pouvez donc vous connecter via des formulaires pour accéder à des pages protégées par une authentification.

Vous pouvez par exemple récupérer le solde de votre compte PayPal:

![Paypal](/uploads/2016-02-22-web-scraping-avec-nodejs-et-nightmare/paypal.png)

```javascript
var Nightmare = require('nightmare');
var vo = require('vo');

var run = function*() {
  var nightmare = Nightmare({ show: true });
  var link = yield nightmare
    .goto('https://www.paypal.com/signin/?country.x=FR&locale.x=fr_FR')
    .type('#email', 'VOTRE EMAIL')
    .type('#password', 'VOTRE MOT DE PASSE')
    .click('#btnLogin')
    .wait('.nemo_logoutBtn')
    .evaluate(function() {
      return document.getElementsByClassName('balanceNumeral')[0].innerText;
    });
  yield nightmare.end();
  return link;
};

vo(run)(function(err, result) {
  if (err) throw err;
  console.log(result);
});
```

```shell
$ node index
0,00 EUR
Disponible
```

- Le formulaire de connexion est situé à l'adresse: [https://www.paypal.com/signin/?country.x=FR&locale.x=fr_FR](https://www.paypal.com/signin/?country.x=FR&locale.x=fr_FR).
- On entre l'email client dans l'input `#email`.
- On entre le mot de passe dans l'input `#password`.
- On clique sur le bouton "Connexion" qui a la classe `#btnLogin`.
- On attend jusqu'à ce que le lien "Déconnexion" apparaisse: `.nemo_logoutBtn`. Si ce lien est présent cela signifie que l'on est forcément connecté.
- Nous sommes directement sur la page qui contient notre solde. On peut le récupérer avec: `document.getElementsByClassName('balanceNumeral')[0].innerText`.

En terme de sécurité, il faut faire attention avec les identifiants en clair dans les scripts.

## Daydream

[Daydream](https://chrome.google.com/webstore/detail/daydream/oajnmbophdhdobfpalhkfgahchpcoali) est une extension Chrome qui permet de générer des scripts Nightmare de manière automatique.

Une fois lancé, Daydream va "écouter" vos clics, ce que vous tapez dans les formulaires et les pages que vous visitez, puis générer le Javascript correspondant.

![Daydream](/uploads/2016-02-22-web-scraping-avec-nodejs-et-nightmare/daydream.png)

## Conclusion

Nightmare permet de _scraper_ de l'information très rapidement et simplement grâce à sa syntaxe intuitive. En revanche, le désavantage du _scraping_ est la dépendance forte à la structure HTML. Si le site change sa strucutre vous devrez changer vos scripts. L'idéal est de privilégier les API et d'utiliser le _scraping_ en dernier recours.
