---
layout: post
title: Un moteur de recherche pour Jekyll avec Algolia
date: 2016-02-03 09:00
category: jekyll
permalink: /un-moteur-de-recherche-pour-jekyll-avec-algolia/
image: /uploads/2016-02-03-un-moteur-de-recherche-pour-jekyll-avec-algolia/algolia.png
---

[Jekyll](https://jekyllrb.com/) étant un générateur de sites statiques, il n'offre pas de moteur de recherche intégré comme le fait Wordpress par exemple. Néanmoins, il existe plusieurs solutions pour ajouter un moteur de recherche sur un blog Jekyll.

Ce blog est basé sur Jekyll et je profite de l'ajout d'un moteur de recherche pour en faire un article. Vous pouvez donc voir une démonstration de ce que l'on va créer sur la page d'accueil de ce blog.

## Prérequis

- Jekyll version `2.5` au minimum

## Créer un compte sur Algolia

Allez sur [Algolia.com](https://www.algolia.com/) et créez-vous un compte. Il est possible d'avoir un compte gratuit mais le nombre de requêtes et de données sera limité. De plus, avec un comtpe gratuit vous devrez apposer le [logo d'Algolia](https://www.algolia.com/powered-by-algolia.zip) sur votre site.

![Algolia plans](/uploads/2016-02-03-un-moteur-de-recherche-pour-jekyll-avec-algolia/plans.png)

Pour ce blog j'utilise le plan "Hacker", mais à vous de choisir celui qui convient à vos besoins.

Une fois votre compte crée, vous aurez besoin de [créer un "index"](https://www.algolia.com/explorer). Pour faire simple, c'est l'endroit où seront stockées vos données et où les recherches seront effectuées.

![Algolia index](/uploads/2016-02-03-un-moteur-de-recherche-pour-jekyll-avec-algolia/index.png)

## Installation

Pour envoyer le contenu de votre blog dans Algolia, il faudra utiliser le plugin [algoliasearch-jekyll](https://github.com/algolia/algoliasearch-jekyll).

Dans votre `Gemfile`, ajoutez le plugin dans le groupe `jekyll_plugins`:

```ruby
group :jekyll_plugins do
  gem 'algoliasearch-jekyll', '~> 0.6.0'
end
```

Puis, exécutez `bundle install` pour installer les dépendances.

Ensuite, vous devrez ajouter le plugin dans votre `_config.yml`:

```yaml
gems:
  - algoliasearch-jekyll
```

Pour vérifier que tout est bien installé:

```shell
$ bundle exec jekyll help | grep algolia
algolia     Keep your content in sync with your Algolia index
```

## Configuration

Vous aurez ensuite besoin de votre _Application ID_ et votre _Admin API Key_. Vous les trouverez dans la page [Credentials](https://www.algolia.com/licensing).

![Credentials](/uploads/2016-02-03-un-moteur-de-recherche-pour-jekyll-avec-algolia/credentials.png)

Ajoutez ceci dans votre `_config.yml`:

```yaml
algolia:
  application_id: 'votre_application_id'
  index_name:     'votre_index'
  record_css_selector: 'p,ul'
```

Dans mon cas, ça sera:

```yaml
algolia:
  application_id: '2MO0TDI0YD'
  index_name:     'notes'
  record_css_selector: 'p,ul'
```

`record_css_selector` sert à dire au plugin d'indexer aussi le contenu des `<ul>` de vos articles. Par défaut seuls les `<p>` sont indexés. Plus de détails dans [la documentation du plugin](https://github.com/algolia/algoliasearch-jekyll#record_css_selector).

## Envoyer les données dans Algolia

C'est à ce moment que vous aurez besoin de l'_Admin API Key_, il ne faut surtout pas la versionner dans Git. En effet, n'importe qui pourrait utiliser votre compte Algolia avec les droits d'administrateur. Cette clé devra être stockée dans une variable d'environnement nommée `ALGOLIA_API_KEY`.

À chaque fois que vous créez ou modifiez un article de votre blog, vous devrez exécuter cette commande pour envoyer son contenu dans votre index Algolia:

```shell
ALGOLIA_API_KEY='votre_cle_admin' jekyll algolia push
```

Résultat:

```shell
$ ALGOLIA_API_KEY='votre_cle_admin' jekyll algolia push
Configuration file: /Users/jd/Workspace/notes/_config.yml
  Indexing 91 items
Indexing of 91 items in notes done.
```

J'ai "91 items" alors que j'ai seulement 4 articles. En réalité, le plugin découpe les articles en plusieurs parties grâce au `record_css_selector`.

Par défaut, le plugin envoie aussi le contenu des [pages statiques](http://jekyllrb.com/docs/pages/) de votre blog.

Vous pouvez ensuite voir le contenu de votre index dans [l'explorateur d'Algolia](https://www.algolia.com/explorer#?index=notes&tab=explorer):

![Algolia explorateur](/uploads/2016-02-03-un-moteur-de-recherche-pour-jekyll-avec-algolia/explorer.png)

Comme vous pouvez le constater, les données du _Front Matter_ sont aussi indexées.

## Ajouter le formulaire de recherche

Pour le HTML, nous allons simplement utiliser un `input`:

```html
<input type="text" autocomplete="off" name="query" id="query" placeholder="rechercher..." />
```

Pour la partie recherche, à chaque caractère entré dans l'`input`, nous allons envoyer une requête à l'API puis afficher le résultat dans la console:

```javascript
var applicationId = '2MO0TDI0YD';
var searchKey = 'f3a8898b2f25bc5f6f5c08e4856c3792'; // Clé publique, qui permet uniquement de rechercher
var client = algoliasearch(applicationId, searchKey);
var index = client.initIndex('notes');
var query = document.getElementById('query');

var onQueryChange = function() {
  var query = query.value;
  performSearch(query);
};

var performSearch = function(query) {
  index.search(query, {facets: '*', facetFilters: ['type:document']}, handleResults);
};

var handleResults = function(err, content) {
  if (err) {
    console.error(err);
    return;
  }

  displayResults(content);
};

var displayResults = function() {
  console.log(content);
};

query.onkeyup = onQueryChange;
```

Le `{facets: '*', facetFilters: ['type:document']}` permet de rechercher uniquement dans les articles et pas dans les pages statiques indexées.

Je vous invite à consulter la [documentation d'Algolia sur le client Javascript](https://www.algolia.com/doc/javascript).

Résultat:

![Algolia search](/uploads/2016-02-03-un-moteur-de-recherche-pour-jekyll-avec-algolia/search.gif)

Le contenu d'une réponse:

![Algolia results json](/uploads/2016-02-03-un-moteur-de-recherche-pour-jekyll-avec-algolia/json_result.png)

## Afficher les résultats

L'affichage des résultats dépendra beaucoup de votre thème Jekyll. Ce qui va suivre sera donc à adapter en fonction de votre propre structure HTML.

Pour faire simple, pour chaque élément dans le tableau `hits` du JSON renvoyé, il faudra afficher le HTML correspondant.

Afin de nous simplifier la tâche, nous pouvons utiliser un moteur de templates. J'ai choisi d'utiliser celui de [lodash](https://lodash.com/docs#template), il a l'avantage d'être très léger et amplement suffisant pour notre cas d'utilisation.

Son fonctionnement est très simple:

```javascript
var compiled = _.template('<h1>hello <%= user %>!</h1>');
compiled({ 'user': 'fred' });
// → '<h1>hello fred!</h1>'
```

Sur la page d'accueil de ce blog, les articles sont représentés de la manière suivante:

```liquid
{% raw %}{% for post in site.posts %}
  <li class="post-list__item {% if post.path contains '_drafts' %}post-list__item--faded{% endif %}">
    <div class="post-list__category">
      <a href="{{ post.url | prepend: site.baseurl }}">
        <img src="/assets/img/categories/{{ post.category }}.png" alt="{{ post.category }}" class="post-list__icon" />
      </a>
    </div>
    <div class="post-list__details">
      <h2 class="post-list__title">
        <a class="post-list__link" href="{{ post.url | prepend: site.baseurl }}">{{ post.title }}</a>
      </h2>
      <span class="post-list__meta">{{ post.date | date: "%d/%m/%Y" }}</span>
    </div>
  </li>
{% endfor %}{% endraw %}
```

Nous devons transformer ce code en _template lodash_, en utilisant les `hits`:

```erb
<% _.forEach(hits, function(hit) { %>
  <li class="post-list__item">
    <div class="post-list__category">
      <a href="<%= hit.url %>">
        <img src="/assets/img/categories/<%= hit.category %>.png" alt="<%= hit.category %>" class="post-list__icon" />
      </a>
    </div>
    <div class="post-list__details">
      <h2 class="post-list__title">
        <a class="post-list__link" href="<%= hit.url %>"><%= hit.title %></a>
      </h2>
      <span class="post-list__meta"><%= hit.date %></span>
    </div>
  </li>
<% }); %>
```

Nous pouvons maintenant mettre à jour la fonction `displayResults`:

```javascript
var postList = document.getElementById('post-list');

var displayResults = function(content) {
  var compiled = _.template('<% _.forEach(hits, function(hit) { %><li class="post-list__item"><div class="post-list__category"><a href="<%= hit.url %>"><img src="/assets/img/categories/<%= hit.category %>.png" alt="<%= hit.category %>" class="post-list__icon" /></a></div><div class="post-list__details"><h2 class="post-list__title"><a class="post-list__link" href="<%= hit.url %>"><%= hit.title %></a></h2><span class="post-list__meta"><%= hit.date %></span></div></li><% }); %>');
  postList.innerHTML = compiled({ 'hits': content.hits });
};
```

Notre moteur de recherche est alors fonctionnel:

![Algolia instant results](/uploads/2016-02-03-un-moteur-de-recherche-pour-jekyll-avec-algolia/basic.gif)

Comme vous pouvez le constater sur le _.gif_, les dates ne s'affichent pas correctement. Nous allons tout simplement les remplacer dans la prochaine section.

## Surligner les occurrences

Nous allons remplacer les dates par l'extrait de l'article et surligner les occurrences du mot recherché grâce au [highlighting](https://www.algolia.com/doc/javascript#highlighting).

Dans chaque élément du `hits` de la réponse, il y a un objet nommé `_highlightResult`. Cet objet contient le texte et le titre avec la classe `algolia__result-highlight` autour de chaque occurrence du mot recherché.

![Algolia highlightResult](/uploads/2016-02-03-un-moteur-de-recherche-pour-jekyll-avec-algolia/highlightResult.png)

Il suffit de changer notre template pour utiliser `_highlightResult`:

```erb
<% _.forEach(hits, function(hit) { %>
  <li class="post-list__item">
    <div class="post-list__category">
      <a href="<%= hit.url %>">
        <img src="/assets/img/categories/<%= hit.category %>.png" alt="<%= hit.category %>" class="post-list__icon" />
      </a>
    </div>
    <div class="post-list__details">
      <h2 class="post-list__title">
        <a class="post-list__link" href="<%= hit.url %>"><%= hit._highlightResult.title.value %></a>
      </h2>
      <span class="post-list__meta"><%= hit._highlightResult.text.value %></span>
    </div>
  </li>
<% }); %>
```

Il faut également styliser `algolia__result-highlight`:

```css
.algolia__result-highlight {
  background-color: #ff6;
}
```

Résultat:

![Algolia highlight](/uploads/2016-02-03-un-moteur-de-recherche-pour-jekyll-avec-algolia/highlight.gif)

## Indexer les articles automatiquement

Il est contraignant de faire un `jekyll algolia push` à chaque modification ou création d'un article. Pour cela vous pouvez configurer un outil d'intégration continue qui le fera à votre place à chaque déploiement.

Ici je vais utiliser [Travis CI](https://travis-ci.org/) et je vais partir du principe que vous hébérgez votre blog sur [Github Pages](https://pages.github.com/).

Créez un fichier `.travis.yml` à la racine de votre blog:

```yaml
language: ruby
cache: bundler
branches:
  only:
    - gh-pages
script:
  - bundle exec jekyll algolia push
rvm:
 - 2.2
```

Ajoutez également cette ligne dans votre `_config.yml` pour éviter que les dépendences du `Gemfile` installées par Travis CI soient prises en compte par Jekyll:

```yaml
exclude: ["vendor"]
```

Enfin, vous devez ajouter votre `ALGOLIA_API_KEY` dans les variables d'environnement de Travis:

![Travis](/uploads/2016-02-03-un-moteur-de-recherche-pour-jekyll-avec-algolia/travis.png)

J'ai aussi décoché "Build Pull Request", pour éviter que le contenu soit réindexé après une _pull request_.

Dès qu'un _push_ sera fait sur la branche `gh-pages`, Travis CI sera notifié et `bundle exec jekyll algolia push` sera exécuté.

Vous trouverez plus de détails sur cette technique dans [la documentation du plugin](https://github.com/algolia/algoliasearch-jekyll#github-pages).

## Conclusion

Nous avons vu la manière la plus simple d'utiliser Algolia pour un blog Jekyll.

Le plugin [`algoliasearch-jekyll`](https://github.com/algolia/algoliasearch-jekyll) comporte d'autres possibilités de configuration que nous n'avons pas abordé dans cet article.

C'est la même chose pour Algolia, tout couvrir ne serait pas possible dans un article, de plus [la documenation est très bien détaillée](https://www.algolia.com/doc/javascript).

Vous pouvez voir [le code sur Github](https://github.com/jordandanielewski/notes) si vous voulez voir l'implémentation complète d'Algolia sur ce blog.
