---
layout: post
title: Les variables en CSS
date: 2016-02-12 22:00
category: css
permalink: /les-variables-en-css/
image: /uploads/2016-02-13-les-variables-en-css/support.png
---

Jusqu'à présent il était impossible de déclarer des variables en CSS. Pour contrer ce problème, on pouvait utiliser des préprocesseurs comme [Sass](http://sass-lang.com/) ou [less](http://lesscss.org/). Les variables "natives" commencent à peine à faire leur apparition et nous allons voir comment les utiliser.

## Syntaxe

Déclaration d'une variable:

```css
:root {
  --bg-color: #333;
  --font-size: 2em;
}
```

Utilisation d'une varible:

```css
body {
  background-color: var(--bg-color);
  font-size: var(--font-size);
}
```

## Héritage des variables

Les variables n'échappent pas à l'héritage en cascade. Voici un petit exemple:

```html
<div class="a">
  Texte 1
  <div class="b">
    <div class="c">Texte 2</div>
  </div>
</div>
```

```css
:root {
  --font-color: red;
}

.a {
  color: var(--font-color);
}

.b {
  --font-color: blue;
}

.c {
  color: var(--font-color);
}
```

- **Texte 1** sera en **rouge**: il prend la couleur définie dans `:root`
- **Texte 2** sera en **bleu**: une nouvelle couleur à écrasé la précédente dans `.b`, `.c` est à l'intérieur de `.b` donc il hérite de ce changement

## Support

À l'heure actuelle, [le support](http://caniuse.com/#feat=css-variables) est très minimal. Il est déconseillé d'utiliser les variables CSS dans un environnement de production.

![Support variables CSS](/uploads/2016-02-13-les-variables-en-css/support.png)

## Conclusion

Les variables CSS [sont encore à l'état de "Draft"](https://drafts.csswg.org/css-variables/). C'est-à-dire que la syntaxe et le comportement ne sont pas encore figés et sont susceptibles de changer. D'ailleurs, la syntaxe présentée dans cet article est une nouvelle version, **l'ancienne** ressemblait à:

```css
:root {
  var-bg: #333;
}

h1 {
  color: var(bg);
}
```
