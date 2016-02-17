---
layout: post
title: Les WebSockets avec Ruby On Rails et ActionCable
date: 2016-02-17 15:00
category: ruby
permalink: /les-websockets-avec-ruby-on-rails-et-actioncable/
image: /uploads/2016-02-17-les-websockets-avec-ruby-on-rails-et-actioncable/status-console.gif
---

[ActionCable](https://github.com/rails/rails/tree/master/actioncable) est certainement la nouveauté la plus importante de Rails 5. ActionCable va vous permettre d'utiliser facilement les WebSockets dans votre application afin de faire une communication bidirectionnelle entre le client et le serveur.

Utiliser les sockets était déjà possible en utilisant par exemple [faye](http://faye.jcoglan.com/ruby.html) mais ActionCable apporte une interface plus haut niveau qui nécessite moins de configuration, que ce soit côté serveur ou côté client.

## Installation de Rails 5

Nous allons utiliser la version "Beta 2" sortie le 1er février 2016.

```shell
$ gem install rails -v 5.0.0.beta2
```

Si vous avez plusieurs versions de Rails, pour éxécuter une version spécifique:

```
$ rails _numero-de-version_ -v
```

par exemple:

```
$ rails _5.0.0.beta2_ -v
Rails 5.0.0.beta2
```

![Rails 5](/uploads/2016-02-17-les-websockets-avec-ruby-on-rails-et-actioncable/rails5.png)

Vous devrez également installer [Redis](http://redis.io/) car ActionCable utilise le système [Pub/Sub](http://redis.io/topics/pubsub) de Redis.

## Création du projet

```shell
$ rails _5.0.0.beta2_ new actioncable-exemple
$ cd actioncable-exemple
```

Créez un contrôleur et sa vue:

_app/controllers/home_controller.rb_

```ruby
class HomeController < ApplicationController
  def show
  end
end
```

_views/home/show.html.erb_

```erb
<h1>ActionCable</h1>
```

Puis, dans _config/routes.rb_:

```ruby
Rails.application.routes.draw do
  root 'home#show'
end
```

## Activer ActionCable

Par défaut, ActionCable n'est pas activé. Pour l'activer il suffit de décommenter quelques lignes:

_config/routes.rb_

```ruby
Rails.application.routes.draw do
  root 'home#show'
  mount ActionCable.server => '/cable'
end
```

_assets/javascripts/cable.coffee_

```coffeescript
@App ||= {}
App.cable = ActionCable.createConsumer()
```

## Création d'un _channel_

La première chose à faire sera de créer un _channel_ grâce à un nouveau générateur. Un channel est un flux de données. On peut s'y abonner pour écouter les événements ou y diffuser des événements (_broadcast_).

Créez un _channel_ qui comportera une action `notify`:

```shell
$ rails generate channel notifications notify
```

Vous pouvez ajouter autant d'actions que vous voulez et les nommer comme vous voulez.

Deux fichiers sont alors générés:

_app/channels/notifications_channel.rb_

```ruby
# Be sure to restart your server when you modify this file. Action Cable runs in an EventMachine loop that does not support auto reloading.
class NotificationsChannel < ApplicationCable::Channel
  def subscribed
    # stream_from "some_channel"
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end

  def notify
  end
end
```

_app/assets/javascripts/channels/notifications.coffee_

```coffeescript
App.notifications = App.cable.subscriptions.create "NotificationsChannel",
  connected: ->
    # Called when the subscription is ready for use on the server

  disconnected: ->
    # Called when the subscription has been terminated by the server

  received: (data) ->
    # Called when there's incoming data on the websocket for this channel

  notify: ->
    @perform 'notify'
```

Tout d'abord, le premier fichier (_app/channels/notifications_channel.rb_) est la partie côté serveur du _channel_. Deux _callbacks_ sont ajoutés automatiquement: `subscribed` et `unsubscribed`. Le premier sera appelé quand un client va s'abonner au _channel_, le second sera appelé quand le client va se désabonner. Nous avons également notre unique action: `notify`.

Décommentez la ligne dans `subscribed` pour que l'écoute des événements débute quand le client s'abonne (c'est ici qu'ActionCable utilise Redis):

```ruby
def subscribed
  stream_from "notifications"
end
```

Le deuxième fichier géneré est la partie client du _channel_ (_app/assets/javascripts/channels/notifications.coffee_). Il comporte 4 méthodes:

- `connected`: appelée quand la connection au socket a été effectuée.
- `disconnected`: appelée quand le serveur ferme la connexion.
- `received`: appelée quand des données sont émises dans le _channel_.
- `notify`: l'action que nous avons crée, quand on appellera cette méthode côté client, le `notify` de `NotificationsChannel` côté serveur sera appelé. La "magie" de Rails.

## Tester notre cable

Lancez votre serveur, puis ouvrez votre navigateur avec une console et entrez:

```javascript
App.notifications.notify()
```

![ActionCable](/uploads/2016-02-17-les-websockets-avec-ruby-on-rails-et-actioncable/first-test.png)

Rien de spécial ne se passe dans la console du navigateur, par contre si vous regardez dans la console de Rails, vous trouverez:

```shell
NotificationsChannel#notify
```

Cela signifie que la méthode `notify` de `NotificationsChannel` a été appelée. Vous pourriez penser qu'un appel Ajax aurait suffit pour arriver à ce résultat. Détrompez-vous, cela ne s'arrête pas là. Tout l'interêt des sockets est que l'on peut également faire l'inverse: le serveur peut envoyer des messages aux clients.

Changez votre méthode `notify`:

```ruby
def notify(data)
  ActionCable.server.broadcast 'notifications', message: data['message']
end
```

`ActionCable.server.broadcast` prend deux paramètres:

- Le nom du _stream_ dans lequel envoyer le message.
- Un _hash_ de données que l'on veut envoyer et qui sera sérialisé. Vous êtes libre de choisir le contenu de votre _hash_.

_(vous devrez relancer le serveur à chaque fois que vous modifiez un channel)_

Et côté client:

```coffeescript
received: (data) ->
  console.log data['message']

notify: (message) ->
  @perform 'notify', message: message
```

Maintenant dans la console de votre navigateur:

```javascript
App.notifications.notify("bonjour")
```

![ActionCable](/uploads/2016-02-17-les-websockets-avec-ruby-on-rails-et-actioncable/second-test.png)

Le message a fait un aller/retour:

- `App.notifications.notify('bonjour')` va exécuter `@perform 'notify', message: 'bonjour'`.
- `NotificationsChannel#notify` sera alors appelé avec `message: 'bonjour'` en paramètre.
- `ActionCable.server.broadcast` envoie un message qui contient `message: data['message']` dans le _channel_ "notifications".
- Pour tous les abonnés du _channel_, la méthode `received` se déclenche.
- "Bonjour" est alors affiché dans la console de tous les clients abonnés, y compris celui qui a envoyé le message.

Essayons avec plusieurs clients:

![Multi](/uploads/2016-02-17-les-websockets-avec-ruby-on-rails-et-actioncable/multi.png)

Ici, nous avons fait au plus simple et utilisé qu'un seul _stream_ pour toutes les notifications. En revanche, dans une application réelle, on pourrait par exemple _scoper_ les _streams_ en fonction de l'ID de l'utilisateur pour éviter que tous les utilisateurs reçoivent les notifications de tout le monde:

```ruby
def subscribed
  stream_from "users:#{current_user.id}:notifications"
end
```

De cette manière, quand le client va s'abonner au _channel_ `NotificationsChannel`, il recevra uniquement ses propres notifications.

## ActionCable et ActiveRecord

ActionCable devient vraiment puissant quand on l'associe avec nos objets ActiveRecord. Par exemple, on peut notifier les clients quand un objet ActiveRecord est crée et sauvegardé dans la base de données.

Nous allons prendre l'exemple d'une liste de statuts dans le même esprit que Twitter ou n'importe quel réseau social.

Pour faire simple et rapide, nous n'allons pas faire de gestion des utilisateurs. On aura uniquement la liste des statuts et un formulaire pour poster un statut.

Créez le modèle (_app/models/status.rb_):

```shell
$ rails generate model status content:text
```

Le contrôleur (_app/controllers/statuses_controller.rb_):

```ruby
class StatusesController < ApplicationController
  def index
    @statuses = Status.order('created_at DESC')
  end

  def new
    @status = Status.new
  end

  def create
    @status = Status.new(status_params)

    if @status.save
       redirect_to statuses_path
    else
      render :new
    end
  end

  private
    def status_params
      params.require(:status).permit(:content)
    end
end
```

La vue qui liste les statuts (_app/views/statuses/index.html.erb_):

```erb
<h1>Statuts</h1>

<div id="statuses">
  <%= render @statuses %>  
</div>
```

Le formulaire pour poster un statut (_app/views/statuses/new.html.erb_):

```erb
<%= form_for(@status) do |f| %>
  <%= f.label :content %>
  <%= f.text_area :content %>
  <%= f.submit %>
<% end %>
```

Un _partial_ qui représente un statut (_app/views/statuses/_status.html.erb_):

```erb
<div class="status">
  <i><%= time_ago_in_words(status.created_at) %></i>
  <%= status.content %>
</div>
```

Créez aussi un nouveau _channel_ pour les statuts:

```
$ rails generate channel statuses
```

_app/channels/statuses_channel.rb_

```ruby
class StatusesChannel < ApplicationCable::Channel
  def subscribed
    stream_from "statuses"
  end

  def unsubscribed
  end
end
```

_app/assets/javascripts/channels/statuses.coffee_

```coffeescript
App.statuses = App.cable.subscriptions.create "StatusesChannel",
  connected: ->

  disconnected: ->

  received: (data) ->
    console.log data['status']
```

Enfin, ajoutez un hook `after_create_commit` dans le modèle `Status`:

```ruby
class Status < ApplicationRecord
  after_create_commit { ActionCable.server.broadcast 'statuses', status: content }
end
```

Une fois qu'un statut a été crée et sauvegardé dans la base de données, un événement qui contient le contenu du statut sera émis dans le _channel_ `statuses`. Le statut s'affichera alors dans la console de tous les clients.

![Status console](/uploads/2016-02-17-les-websockets-avec-ruby-on-rails-et-actioncable/status-console.gif)

Afficher ce statut dans la console n'a pas grand interêt, nous allons maintenant voir comment l'insérer dans le DOM de la page.

Une des autres nouveautés de Rails 5 est [`ApplicationController.renderer`](http://edgeapi.rubyonrails.org/classes/ActionController/Renderer.html). Grâce à ça il sera possible de _render_ des templates en dehors des contrôleurs.

Plutôt que d'envoyer le contenu du statut dans le _stream_ comme nous l'avons fait, nous pouvons envoyer le _partial_ qui représente ce statut. Les clients pourront alors l'insérer dans le DOM.

Modifiez votre modèle:

```ruby
class Status < ApplicationRecord
  after_create_commit { ActionCable.server.broadcast 'statuses', status: render_status }

  private

    def render_status
      ApplicationController.renderer.render(partial: 'statuses/status', locals: { status: self })
    end
end
```

Et le côté client (_app/assets/javascripts/channels/statuses.coffee_):

```coffeescript
App.statuses = App.cable.subscriptions.create "StatusesChannel",
  connected: ->

  disconnected: ->

  received: (data) ->
    $('#statuses').prepend(data['status'])
```

![Status render](/uploads/2016-02-17-les-websockets-avec-ruby-on-rails-et-actioncable/status-render.gif)

Plutôt que d'utiliser `ApplicationController.renderer` dans les modèles, [David Heinemeier Hansson](https://twitter.com/dhh) suggère d'utilser des _jobs_. En effet, `ApplicationController.renderer` concerne les vues: ça n'a pas vraiment sa place dans un modèle. De même pour émettre des événements dans un _channel_, mieux vaut le faire dans un _job_ pour respecter le principe de _separation of concerns_.

```shell
$ rails generate job statuses
```

_app/jobs/statuses_job.rb_

```ruby
class StatusesJob < ApplicationJob
  queue_as :default

  def perform(status)
    ActionCable.server.broadcast 'statuses', status: render_status(status)
  end

  private

    def render_status(status)
      ApplicationController.renderer.render(partial: 'statuses/status', locals: { status: status })
    end
end
```

Adaptez le modèle en conséquence:

```ruby
class Status < ApplicationRecord
  after_create_commit { StatusesJob.perform_later self }
end
```

Cela ne change rien au résultat, mais le code est mieux organisé.

## Conclusion

Cet article est inspiré de [la vidéo de présentation d'ActionCable](https://www.youtube.com/watch?v=n0WUjGkDFS0) par [David Heinemeier Hansson](https://twitter.com/dhh), que je vous suggère de regarder.

Rails 5 n'est pas encore sorti en version finale, ce qui signifie qu'il peut y avoir des changements d'ici là. Cela reste peu probable mais il vaut mieux regarder régulièrement la documentation pour vous tenir informé des éventuels modifications.



## Resources

- [https://www.youtube.com/watch?v=n0WUjGkDFS0](Resources)
- [http://hectorperezarenas.com/2015/12/26/rails-5-tutorial-how-to-create-a-chat-with-action-cable/](http://hectorperezarenas.com/2015/12/26/rails-5-tutorial-how-to-create-a-chat-with-action-cable/)
- [http://weblog.rubyonrails.org/2015/12/18/Rails-5-0-beta1/](http://weblog.rubyonrails.org/2015/12/18/Rails-5-0-beta1/)
- [https://github.com/rails/rails/tree/master/actioncable](https://github.com/rails/rails/tree/master/actioncable)
- [http://www.sitepoint.com/action-cable-and-websockets-an-in-depth-tutorial/](http://www.sitepoint.com/action-cable-and-websockets-an-in-depth-tutorial/)
- [https://gorails.com/episodes/deploy-actioncable-and-rails-5](https://gorails.com/episodes/deploy-actioncable-and-rails-5)
- [https://gist.github.com/davidpaulhunt/9bc21bbf792cb3565315](https://gist.github.com/davidpaulhunt/9bc21bbf792cb3565315)
