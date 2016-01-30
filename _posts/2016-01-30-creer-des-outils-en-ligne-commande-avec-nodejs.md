---
layout: post
title: Créer des outils en ligne de commande avec NodeJS
date: 2016-01-30 21:30
category: nodejs
permalink: /creer-des-outils-en-ligne-commande-avec-nodejs/
image: /uploads/2016-01-30-creer-des-outils-en-ligne-commande-avec-nodejs/blessed-contrib.gif
---

NodeJS permet de créer facilement et rapidement des outils en ligne de commande (CLI). On peut d'ailleurs constater que beaucoup d'outils utilisent NodeJS: [yeoman](https://github.com/yeoman/yo), [browserify](https://www.npmjs.com/package/browserify), [grunt](https://github.com/gruntjs/grunt), [gulp](https://github.com/gulpjs/gulp), [bower](https://github.com/bower/bower), [less](https://github.com/less/less.js) et même [NPM](https://github.com/npm/npm).

Vous n'êtes pas obligés de créer un outil qui sera aussi connu ou complexe que ceux-là. Vous pouvez créer un outil simple qui va automatiser une tâche et vous faire gagner du temps.

Dans cet article nous allons aborder les bases de la création de ces outils ainsi que découvrir quelques modules qui pourront vous simplifier certaines tâches.

## Préparation

Dans un nouveau dossier, exécutez `npm init` afin de générer un `package.json`.

Étant donné que notre projet n'a pas vocation à être utilisé dans un projet NodeJS, mais plutôt à être utilisé comme un outil en ligne de commade, nous devons y apporter quelques modifications:

- nous pouvons supprimer l'entrée `"main"`, en effet celle-ci est utilisée si on veut utiliser notre package en tant que module: `var module = require('module')`, ce qui n'est pas notre cas.
- ajouter `"preferGlobal": true`, de cette manière un avertissement sera affiché si on installe le module sans l'option `--global`.
- ajouter l'entrée `"bin": {"nom-de-commande": "fichier.js"}`. Lors de l'installation de notre package, la commande `nom-de-commande` sera installée et exécutera le fichier `fichier.js`. Vous pouvez ajouter d'autres couples "commande/fichier" dans `"bin"`.

**package.json**

```json
{
  "name": "nom-de-commande",
  "version": "1.0.0",
  "description": "",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "Jordan Danielewski",
  "license": "ISC",
  "bin": {
    "nom-de-commande": "fichier.js"
  },
  "preferGlobal": true
}
```

**fichier.js**

```javascript
#!/usr/bin/env node

console.log('Hello World');
```

Le [shebang](https://fr.wikipedia.org/wiki/Shebang) est obligatoire pour dire au shell comment exécuter le script.

## Installation

Exécutez `npm link`. NPM va créer un lien symbolique global vers votre dossier. Cela produira le même effet que si vous aviez publié votre package sur NPM et ue vous aviez fait un `npm install nom-de-commande --global`.

Résultat:

```bash
$ npm link
npm WARN EPACKAGEJSON nom-de-commande@1.0.0 No description
npm WARN EPACKAGEJSON nom-de-commande@1.0.0 No repository field.
/Users/jd/.nvm/versions/node/v5.4.1/bin/nom-de-commande -> /Users/jd/.nvm/versions/node/v5.4.1/lib/node_modules/nom-de-commande/fichier.js
/Users/jd/.nvm/versions/node/v5.4.1/lib/node_modules/nom-de-commande -> /Users/jd/Workspace/nom-de-commande

$ nom-de-commande
Hello World
```

Vous n'avez pas besoin de refaire un `npm link` si vous modifiez vos scripts. Par contre vous devrez relancer cette commande si:

- vous renommez ou déplacez votre dossier
- vous renommez `fichier.js`
- vous ajoutez une autre commande dans le `"bin"`

Vous pouvez aussi faire un `npm install --global`, par contre vous devrez le refaire à chaque modification de vos fichiers. Ceci est dû au fait que NPM va copier les fichiers plutôt que de faire un lien symbolique.

## Récupération des arguments

Une manière simple de récupérer les arguments est d'utiliser `process.argv`.

`process.argv` renvoie un tableau dont les deux premiers éléments sont le chemin vers `node` et le chemin vers notre commande `nom-de-commande`. Les éléments suivants seront les arguments passés à notre commande. Le premier argument est donc `process.argv[2]`.

```bash
$ nom-de-commande one two
[ '/Users/jd/.nvm/versions/node/v5.4.1/bin/node',
  '/Users/jd/.nvm/versions/node/v5.4.1/bin/nom-de-commande',
  'one',
  'two' ]
```

Utiliser directement `process.argv` pose plusieurs problèmes:

- les arguments ne sont pas nommés, difficile de savoir à quoi correspondent les arguments quand on tape la commande
- l'ordre est important, il n'est pas possible d'inverser deux arguments
- on ne pourrait pas rendre le premier argument facultatif

Pour contrer ces problèmes vous pouvez utiliser [minimist](https://www.npmjs.com/package/minimist) ou [commander](https://www.npmjs.com/package/commander).

Avec [minimist](https://www.npmjs.com/package/minimist),

```bash
$ nom-de-commande -x 3 -y 4 -n5 -abc --beep=boop foo bar baz
```

retournerait un objet du type:

```javascript
{ _: [ 'foo', 'bar', 'baz' ],
  x: 3,
  y: 4,
  n: 5,
  a: true,
  b: true,
  c: true,
  beep: 'boop' }
```

C'est quand même beaucoup plus pratique que de s'amuser à parser un tableau !

[commander](https://www.npmjs.com/package/commander) permet également de:

- générer un `--help` automatiquement
- caster des arguments de manière plus poussée
- contrôler les valeurs des arguments grâce à des expressions régulières
- passer un nombre d'arguments variable comme pour `rm -rf foo bar`, on aurait `["foo", "bar"]`

## Les codes de sortie

Dans l'environnement UNIX, un programme qui échoue doit toujours renvoyer une valeur supérieure à `0`. Un programme qui se termine par un succès doit renvoyer `0`.

Vous devez donc utiliser `process.exit(1)` en cas d'échec et `process.exit(0)` en cas de succès.

## Les _pipes_

Les _pipes_ ou plutôt les `|`, sont l'un des éléments qui rendent la ligne de commande très puissante. En effet, ils permettent d'envoyer la sortie d'un programme vers l'entrée d'un autre, et d'en enchaîner plusieurs de suite.

Actuellement, que se passe t-il si on envoie des informations en entrée via un _pipe_ ?

**fichier.js**

```javascript
#!/usr/bin/env node

// Nothing
```

```bash
$ echo "foo" | nom-de-commande
```

Il ne se passe rien car on ne fait rien avec l'information passée par le `|`. Nous devons écouter le flux d'entrée standard et traiter ce que l'on reçoit.

**fichier.js**

```javascript
#!/usr/bin/env node

process.stdin.setEncoding('utf8');

process.stdin.on('readable', () => {
  var chunk = process.stdin.read();
  if (chunk !== null) {
    process.stdout.write(chunk);
  }
});

process.stdin.on('end', () => {
  // No more data
});
```

Réessayons:

```bash
$ echo "foo" | nom-de-commande
foo
```

Pour les versions de NodeJS antérieures à 0.10, l'API est légèrement différente:

```javascript
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(data) {
  process.stdout.write(data);
});
```

Vous trouverez plus d'informations dans [la documentation de `process.stdin`](https://nodejs.org/api/process.html#process_process_stdin).

Nous venons de voir comment traiter l'information que l'on envoie sur l'entrée (`stdin`). Nous n'avons pas besoin de faire quoi que ce soit pour traiter l'information en sortie (`stdout`), à part envoyer de l'information sur la sortie.

**fichier.js**

```javascript
#!/usr/bin/env node

console.log('Hello world'); // ou process.stdout.write('Hello world\n');
```

```bash
$ nom-de-commande | grep -o 'world'
world
```

## Appeler d'autres commandes

Vous pouvez appeler n'importe quelle autre commande grâce aux processus fils ou _child process_.

```javascript
#!/usr/bin/env node

var exec = require('child_process').exec;

var child = exec('ls -la', function(err, stdout, stderr) {
  console.log(stdout);
});
```

Résultat:

```bash
$ nom-de-commande
total 16
drwxr-xr-x   5 jd  staff  170 Jan 28 22:31 .
drwxr-xr-x  29 jd  staff  986 Jan 28 22:29 ..
-rwxr-xr-x   1 jd  staff  149 Jan 29 11:10 fichier.js
drwxr-xr-x   2 jd  staff   68 Jan 28 22:33 node_modules
-rw-r--r--   1 jd  staff  283 Jan 28 22:36 package.json
```

En revanche il faut faire attention car ce n'est pas forcément toujours portable. La création de processus sur Linux, OSX ou Windows peut être très différente, et les commandes à appeler également.

Vous trouverez plus d'informations dans [la documentation](https://nodejs.org/api/child_process.html).

## Des couleurs dans la console

Si vous voulez ajouter des couleurs de ce que vous affichez, vous pouvez utiliser [chalk](https://github.com/chalk/chalk).

![Chalk](/uploads/2016-01-30-creer-des-outils-en-ligne-commande-avec-nodejs/chalk.png)

L'utilisation est très simple:

```javascript
const chalk = require('chalk');

console.log(chalk.blue('Hello world!'));
```

Ce module permet également de styliser le texte: gras, italique, souligné, couleur de fond...

## Demander des informations de manière interactive

Au lieu de passer des arguments à votre commande, vous pouvez demander des informations de manière interactive.

Vous pouvez par exemple vous servir de [Inquirer](https://github.com/SBoudrias/Inquirer.js) qui est utilisé par [Yeoman](http://yeoman.io/):

![Inquirer](/uploads/2016-01-30-creer-des-outils-en-ligne-commande-avec-nodejs/inquirer.gif)

## Des fenêtres dans la console

Comment est-ce possible ? [Blessed](https://github.com/chjj/blessed) est une implémentation en Javascript de [Ncurses](https://fr.wikipedia.org/wiki/Ncurses). Pour faire simple, ce package utilise les caractères de texte pour simuler des interfaces graphiques.

![Blessed](/uploads/2016-01-30-creer-des-outils-en-ligne-commande-avec-nodejs/blessed.gif)

Pour vous donner une idée de ce qui est faisable avec Blessed, vous pouvez regarder du côté de [Slap](https://github.com/slap-editor/slap) qui est une reproduction de [Sublime Text](http://www.sublimetext.com/):

![Slap](/uploads/2016-01-30-creer-des-outils-en-ligne-commande-avec-nodejs/slap.png)

Vous pouvez également vous aider de [blessed-contrib](https://github.com/yaronn/blessed-contrib), un module qui va vous permettre de faire des dashboards, pour un résultat assez impresionant:

![Blessed-contrib](/uploads/2016-01-30-creer-des-outils-en-ligne-commande-avec-nodejs/blessed-contrib.gif)

## Conclusion

L'écosystème de NodeJS est si vaste qu'il serait impossible de couvrir tous les packages ici. Vous trouverez [une liste de packages utiles pour la création d'outils en ligne de commande sur Github](https://github.com/sindresorhus/awesome-nodejs#command-line-utilities). Vous y trouverez des packages qui permettent d'afficher [des barres de progression](https://github.com/tj/node-progress), [des graphiques](https://github.com/jstrace/chart) ou même [d'envoyer des statistiques à Google Analytics sur l'utilisation de votre outil](https://github.com/yeoman/insight).
