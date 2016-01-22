---
layout: post
title: Détecter la perte de connexion Internet en Javascript
date: 2016-01-19 21:30
category: javascript
permalink: /detecter-perte-connexion-internet-javascript/
---

Lorsque l'on développe une [SPA](https://fr.wikipedia.org/wiki/Application_web_monopage), il peut être utile de vérifier en permanence que l'utilisateur soit bien connecté à Internet. En effet, si l'utilisateur perd sa connexion il aura l'impression que votre application ne fonctionne pas correctement. Il faut donc le prévenir qu'il a un problème de connexion.

C'est ce que Gmail fait par exemple:

![Gmail hors-ligne](/uploads/2016-01-19-detecter-perte-connexion-internet-javascript/gmail.png)

## navigator.onLine

La propriété `navigator.onLine` renvoie un booléen qui dépend de l'état de la connexion de l'utilisateur.

```javascript
if(navigator.onLine) {
  // Connecté
} else {
  // Non connecté
}
```

## Événements

Vérifier une seule fois la valeur de `navigator.onLine` présente un interêt limité si on veut afficher un message dès lors que la connexion est perdue.

L'objet `window` est doté de deux événements: `online` et `offline`, il suffit alors de les écouter pour être prévenu instantanément d'un changement:

```javascript
window.addEventListener('online', function() {
	console.log('Connecté');
});

window.addEventListener('offline', function() {
	console.log('Déconnecté');
});
```

## Un exemple

Coupez votre wifi/box, ou passez en mode avion si vous êtes sur mobile:

<p data-height="268" data-theme-id="0" data-slug-hash="vLWxZx" data-default-tab="result" data-user="jordandanielewski" class='codepen'>See the Pen <a href='http://codepen.io/jordandanielewski/pen/vLWxZx/'>Check Internet Connection</a> by Jordan Danielewski (<a href='http://codepen.io/jordandanielewski'>@jordandanielewski</a>) on <a href='http://codepen.io'>CodePen</a>.</p>
<script async src="//assets.codepen.io/assets/embed/ei.js"></script>

## Support

À l'heure où j'écris cet article, la [majorité des navigateurs](http://caniuse.com/#feat=online-status) supportent cette fonctionnalité:

![Support navigateurs navigator.onLine](/uploads/2016-01-19-detecter-perte-connexion-internet-javascript/browser-support.png)

## Conclusion

Les utilités peuvent être multiples:

- pour une application collaborative en temps réel: on peut notifier les autres utilisateurs que leur collègue a été déconnecté
- au moment de la déconnexion, on peut sauvegarder les changements qui vont être faits par l'utilisateur en utilisant `localStorage` et les envoyer sur le serveur distant une fois qu'il revient en ligne
- empêcher l'utilisateur d'envoyer un message dans un tchat s'il est déconnecté
- dans une application mobile hybride, vous pouvez prévenir l'utilisateur qu'il ne pourra pas correctement profiter de toutes les fonctionnalités s'il n'est pas connecté
