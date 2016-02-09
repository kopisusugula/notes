---
layout: post
title: 17 plugins VIM pour le développeur Ruby
date: 2016-02-05 15:00
category: vim
permalink: /17-plugins-vim-pour-le-developpeur-ruby/
image: /uploads/2016-02-05-17-plugins-vim-pour-le-developpeur-ruby/vim-test.gif
---

VIM est un éditeur de texte très puissant et très apprécié de la communauté des Rubyistes. En revanche, par défaut, il peut lui manquer certaines fonctionnalités indispensables. Heureusement il est possible d'installer des plugins pour combler nos besoins.

Dans cet article vous découvrirez 17 plugins qui pourront vous faire gagner du temps et rendre l'utilisation de VIM plus agréable.

## vim-plug

Pour gérer mes plugins j'ai utilisé [pathogen](https://github.com/tpope/vim-pathogen) puis je suis passé à [Vundle](https://github.com/VundleVim/Vundle.vim) et récemment je suis tombé sur [vim-plug](https://github.com/junegunn/vim-plug).

Les deux principaux avantages de vim-plug sont:

- l'installation et la mise à jour des plugins en parallèle: plus rapide
- la possibilité de charger les plugins à la demande: VIM démarre plus vite

Pour vous donner une idée, l'installation de mes 16 plugins prend 4,18 secondes et leur mise à jour prend 1,92 seconde.

Pour la configuration, vim-plug ressemble beaucoup à Vundle mais avec des options en plus:

```viml
call plug#begin('~/.vim/plugged')

" Raccourci, équivalent à https://github.com/tpope/vim-rails
Plug 'tpope/vim-rails'

" L'URL complète est aussi acceptée
Plug 'https://github.com/tpope/vim-rails.git'

" Gestion des dépendances: ultisnips dépend de vim-snippets
Plug 'SirVer/ultisnips' | Plug 'honza/vim-snippets'

" Chargement à la demande
Plug 'scrooloose/nerdtree', { 'on':  'NERDTreeToggle' }
Plug 'tpope/vim-rails', { 'for': 'ruby' }

call plug#end()
```

Retrouvez la documentation complète [sur Github](https://github.com/junegunn/vim-plug).

## fzf

[fzf](https://github.com/junegunn/fzf) est un _fuzzy finder_ développé en Go, beaucoup plus rapide que [ctrlp](https://github.com/ctrlpvim/ctrlp.vim).

Pour l'installation:

```shell
git clone --depth 1 https://github.com/junegunn/fzf.git ~/.fzf
~/.fzf/install
```

Et ajoutez ceci dans votre `.vimrc`:

```viml
Plug 'junegunn/fzf', { 'dir': '~/.fzf', 'do': './install --all' }
```

Puis `:PlugInstall` pour installer le plugin. Relancez VIM puis exécutez `:FZF` pour commencer à rechercher dans les fichiers:

![fzf VIM](/uploads/2016-02-05-17-plugins-vim-pour-le-developpeur-ruby/fzf-1.gif)

Le plus simple est d'avoir un _mapping_ du genre:

```viml
nnoremap <Leader>p :FZF<cr>
```

En réalité, fzf n'est pas uniquement un plugin pour VIM, il peut également faire de l'auto-complétion pour bash/zsh ou encore:

![fzf](/uploads/2016-02-05-17-plugins-vim-pour-le-developpeur-ruby/fzf-2.gif)

Retrouvez la documentation complète [sur Github](https://github.com/junegunn/fzf#usage-as-vim-plugin).

## vim-fugitive

Si vous utilisez Git, [Fugitive](https://github.com/tpope/vim-fugitive) est _LE_ plugin qu'il vous faut. Grâce à lui vous n'aurez plus à quitter VIM pour faire des _commits_ ou des _pushs_. Plusieurs commandes seront mises à votre disposition: `:Gstatus`, `:Gcommit`, `:Gmove`, `:Gremove`, `:Glog`...

Un exemple de `:Gdiff`:

![Fugitive diff](/uploads/2016-02-05-17-plugins-vim-pour-le-developpeur-ruby/fugitive-diff.png)

Si vous utilisez Github, `:Gbrowse` ouvrira le fichier courant sur Github dans votre navigateur.

Retrouvez la documentation complète [sur Github](https://github.com/tpope/vim-fugitive).

## Rails.vim

[Rails.vim](https://github.com/tpope/vim-rails) est le plugin essentiel si vous développez avec Ruby On Rails. Ce plugin apporte plusieurs commandes qui permettent de naviguer de manière contextualisée dans un projet.

Pour vous donner une idée:

- dans `users_controller.rb` avec le curseur sur la méthode `show`, `gf` ouvrira `views/users/show.html.xxx`
- dans `user.rb`, `:R` ouvrira `schema.rb` avec le curseur placé au niveau du `create_table "users"`
- dans `user.rb`, `:A` ouvrira `user_spec.rb`
- dans une vue, si vous sélectionnez une portion de code, un `:Rextract {file}` va extraire le code, le placer dans un _partial_ et remplacer ce code par `render '{file}'`
- dans `user.rb` avec le curseur sur `has_many :articles`, `gf` ouvrira `article.rb`
- dans `routes.rb` avec le curseur sur `resources :articles`, `gf` ouvrira `articles_controller.rb`
- `:Rails` qui appelle la commade `rails`
- `:Rgenerate model Article` va générer le moèle Article
- `:Emodel user` ouvrira `user.rb`
- dans `users_controller.rb`, `:Eview index` ouvrira `views/users/index.html.xxx`
- il y a beaucoup [d'autres possibilités](https://github.com/tpope/vim-rails/blob/master/doc/rails.txt)

## vim-endwise

[vim-endwise](https://github.com/tpope/vim-endwise) est un plugin tout simple qui va placer des `end` à votre place:

![VIM endwise](/uploads/2016-02-05-17-plugins-vim-pour-le-developpeur-ruby/endwise.gif)

Ce plugin supporte [d'autres langages](https://github.com/tpope/vim-endwise/blob/master/plugin/endwise.vim) que Ruby.

## vim-test

[vim-test](https://github.com/janko-m/vim-test) va vous permettre de lancer vos tests directement depuis VIM. Concernant Ruby, vim-test supporte RSpec, Minitest et Cucumber.

Ce plugin apporte 5 commandes:

- `:TestNearest`: dans un fichier de test, lance le test le plus proche du curseur
- `:TestFile`: dans un fichier de test, lance tous les tests de ce fichier
- `:TestSuite`: lance la suite de tests complète
- `:TestLast`: lance le dernier test
- `:TestVisit`: ouvre le dernier test lancé

![vim-test](/uploads/2016-02-05-17-plugins-vim-pour-le-developpeur-ruby/vim-test.gif)

## splitjoin.vim

[splitjoin.vim](https://github.com/AndrewRadev/splitjoin.vim) permet de passer d'une déclaration sur une ligne à une déclaration multi-lignes avec `gS`, et de faire l'inverse avec `gJ`.

Par exemple en Ruby, passer de:

```ruby
puts "ok" if true
```

à:

```ruby
if true
  puts "ok"
end
```

et inversement.

![VIM splitjoin](/uploads/2016-02-05-17-plugins-vim-pour-le-developpeur-ruby/splitjoin.gif)

Plusieurs langages sont supportés:

>This currently works for:
- Various constructs in Ruby and Eruby
- Various constructs in Coffeescript
- Various constructs in Perl
- Various constructs in Python
- PHP arrays
- Javascript object literals and functions
- Tags in HTML/XML
- CSS, SCSS, LESS style declarations.
- YAML arrays and maps
- Lua functions and tables
- Go structs
- Vimscript line continuations
- TeX blocks
- C if clauses and function calls
- Do-blocks in Elixir

## vim-easy-align

[vim-easy-align](https://github.com/junegunn/vim-easy-align) permet d'aligner rapidement des blocs de texte. Les raccourcis peuvent faire peur au premier abord, mais une fois habitué il est difficile de s'en passer.

![VIM vim-easy-align](/uploads/2016-02-05-17-plugins-vim-pour-le-developpeur-ruby/easy-align-1.gif)

![VIM vim-easy-align](/uploads/2016-02-05-17-plugins-vim-pour-le-developpeur-ruby/easy-align-2.gif)

## vim-capybara

[vim-capybara](https://github.com/asux/vim-capybara) est une collection de _snippets_ pour écrire des tests avec Capybara.

Je ne conseille pas forcément d'utiliser ce plugin tel quel, car il est peu probable qu'il réponde exactement à vos besoins. Les _snippets_ répondent surtout aux besoins de celui qui les a crées. Par contre n'hésitez pas à vous en inspirer pour créer vos propres _snippets_.

## vim-commentary

[Commentary](https://github.com/tpope/vim-commentary) permet de commenter et décommenter des blocs de code très rapidement. Vous sélectionnez la portion de code à commenter et vous tapez `gc`.

Commentary utilisera l'extension du fichier pour déterminer comment commenter le code. Si votre langage n'est pas supporté, vous pouvez spécifier le format dans votre `.vimrc`:

```viml
au FileType ocaml setlocal commentstring=(*\  %s\ *)
```

## syntastic

[Syntastic](https://github.com/scrooloose/syntastic) permet de détecter les erreurs de syntaxe dans votre code. Il supporte la plupart des langages:

> ActionScript, Ada, Ansible configurations, API Blueprint, AppleScript, AsciiDoc, ASM, BEMHTML, Bro, Bourne shell, C, C++, C#, Cabal, Chef, CoffeeScript, Coco, Coq, CSS, Cucumber, CUDA, D, Dart, DocBook, Dockerfile, Dust, Elixir, Erlang, eRuby, Fortran, Gentoo metadata, GLSL, Go, Haml, Haskell, Haxe, Handlebars, HSS, HTML, Jade, Java, JavaScript, JSON, JSX, LESS, Lex, Limbo, LISP, LLVM intermediate language, Lua, Markdown, MATLAB, Mercury, NASM, Nix, Objective-C, Objective-C++, OCaml, Perl, Perl POD, PHP, gettext Portable Object, OS X and iOS property lists, Puppet, Python, QML, R, Racket, Relax NG, reStructuredText, RPM spec, Ruby, SASS/SCSS, Scala, Slim, SML, Sphinx, SQL, Stylus, Tcl, TeX, Texinfo, Twig, TypeScript, Vala, Verilog, VHDL, VimL, xHtml, XML, XSLT, XQuery, YACC, YAML, z80, Zope page templates, and zsh

![VIM syntastic](/uploads/2016-02-05-17-plugins-vim-pour-le-developpeur-ruby/syntastic.png)

Ce plugin comporte beaucoup d'options et celles par défaut ne sont pas forcément appropriées si vous installez ce plugin pour la première fois. Pour cela il est conseillé d'ajouter cette configuration basique dans votre `.vimrc`:

```viml
set statusline+=%#warningmsg#
set statusline+=%{SyntasticStatuslineFlag()}
set statusline+=%*

let g:syntastic_always_populate_loc_list = 1
let g:syntastic_auto_loc_list = 1
let g:syntastic_check_on_open = 1
let g:syntastic_check_on_wq = 0
```

## vim-vinegar

[vim-vinegar](https://github.com/tpope/vim-vinegar) peut être vu comme une alternative à [NERDTree](https://github.com/scrooloose/nerdtree).

Un simple `-` permet d'ouvrir l'arborescence et de naviguer dedans:

![VIM syntastic](/uploads/2016-02-05-17-plugins-vim-pour-le-developpeur-ruby/vinegar.gif)

## vim-multiple-cursors

J'utilise aussi _Sublime Text_ ou _Atom_ et j'ai pris l'habitude les curseurs multiples. Heureusement il existe [vim-multiple-cursors](https://github.com/terryma/vim-multiple-cursors) qui permet d'obtenir un comportement similaire:

![VIM multiple cursors](/uploads/2016-02-05-17-plugins-vim-pour-le-developpeur-ruby/vim-multiple-cursors-1.gif)

![VIM multiple cursors](/uploads/2016-02-05-17-plugins-vim-pour-le-developpeur-ruby/vim-multiple-cursors-2.gif)

## vim-dispatch

Si vous faites un `:grep` ou si vous lancez vos tests depuis VIM, vous ne pourrez pas utiliser VIM tant que ce processus n'est pas fini.

Grâce à [vim-dispatch](https://github.com/tpope/vim-dispatch) vous pouvez lancer des processus de manière asynchrone en continuant à éditer vos fichiers. Par exemple: `:Dispatch bundle install` ou `:Dispatch rspec`.

Ce plugin est surtout intéressant si vous utilisez [tmux](https://tmux.github.io/): dispatch exécutera le processus dans un nouveau _split_. Sinon le plugin fonctionne également avec iTerm, screen ou en mode _headless_.

Vous pouvez voir [une vidéo de démonstration du plugin par Tim Pope, son créateur](https://vimeo.com/63116209).

## auto-pairs

[auto-pairs](https://github.com/jiangmiao/auto-pairs) permet d'insérer ou de supprimer automatiquement les paires de `{ }`, `( )`, `" "`, `' '`, `` ` ` `` et `[ ]`.

Par exemple:

```
input: [
output: [|]
```

```
input: foo[<BS>]
output: foo
```

```
input: {|} (press <CR> at |)
output: {
  |
}
```

```
input: {|} (press <SPACE> at |)
output: { | }
```

## vim-eunuch

[eunuch](https://github.com/tpope/vim-eunuch) ajoute plusieurs commandes qui permettent de manipuler les fichiers "à la UNIX". Vous aurez par exemple `:Rename` qui permet de renommer un fichier sans avoir à le fermer. `:Find` qui lance la commande `find`, de même pour `:Locate`, `:Chmod` ou encore `:Mkdir`.

Une autre commande très pratique: `:SudoWrite`. Lorsque vous modifiez un fichier sur lequel vous n'avez pas les droits, vous obtiendrez une erreur au moment de vouloir l'enregistrer. En utilisant cette commande, le mot de passe _sudo_ vous sera demandé et la sauvegarde du fichier sera effectuée sans risque de perdre vos modifications.

Retrouvez [la liste complète des commandes sur Github](https://github.com/tpope/vim-eunuch#eunuchvim).

## vim-mundo

[vim-mundo](https://github.com/simnalamburt/vim-mundo) qui est un _fork_ de [gundo.vim](https://github.com/sjl/gundo.vim) permet de conserver une trace de vos modifications automatiquement. Cela peut être très utile même si vous utilisez Git.

La fonctionnalité qui permet de sauvegarder les modifications automatiquement est présente de base dans VIM avec la commande `:undolist`, mais ce plugin la rend plus simple d'utilisation.

Vous devrez d'abord créer un dossier `~/.vim/undo` et ajouter ceci dans votre `.vimrc`:

```viml
" Enable persistent undo so that undo history persists across vim sessions
set undofile
set undodir=~/.vim/undo
```

Puis `:GundoShow` pour ouvrir mundo:

![VIM Mundo](/uploads/2016-02-05-17-plugins-vim-pour-le-developpeur-ruby/mundo.gif)

Vous trouverez la documentation complète sur le site du projet initial: [Gundo](http://sjl.bitbucket.org/gundo.vim/).
